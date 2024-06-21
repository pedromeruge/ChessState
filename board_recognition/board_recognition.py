from board_recognition.includes import *
import board_recognition.parameters as Params

# vi num github -> supostamente vem de um CannyLines paper??
def cannyPF(img, sigma=0.25):
    med = np.median(img)
    lower = int(max(0, (1.0 - sigma) * med))
    upper = int(min(255, (1.0 + sigma) * med))
    return cv2.Canny(img, lower, upper)

def process_board(orig_img):

    #transform to greyscale
    grey_img = cv2.cvtColor(orig_img, cv2.COLOR_BGR2GRAY)

    #smooth noise, while keeping edges sharp -> por exemplo texturas de mesas de madeira desaparecem, facilita bastante
    bilateral_filter_img = cv2.bilateralFilter(grey_img, Params.bilat_sample_diameter, 75,75)
    
    #apply canny edge detection (para usar no proximo passo)
    # explicação deste algoritmo: https://docs.opencv.org/4.x/da/d22/tutorial_py_canny.html#:~:text=Canny%20Edge%20Detection%20in%20OpenCV&text=Fourth%20argument%20is%20aperture_size.,By%20default%20it%20is%203.
    canny_edge_filter_img = cannyPF(bilateral_filter_img)

    cdst = cv2.cvtColor(canny_edge_filter_img, cv2.COLOR_GRAY2BGR)

    #apply Hough line Transform
    # explicação deste algoritmo: https://docs.opencv.org/3.4/d9/db0/tutorial_hough_lines.html
    # obter lista de (r,ang) de cada linha obtida
    lines = cv2.HoughLines(
                            canny_edge_filter_img, # input edge image
                            1, # distance resolution in pixels
                            np.pi/ Params.hough_angle_res,
                            Params.hough_min_points_line,
                            np.array([]),
                            0,
                            0,
                        )
    
    lines = lines.squeeze() # remover lista a mais que vem de HoughLines
    lines = fix_negative_rho_in_hesse_normal_form(lines)

    if lines is None:
        print('>> No lines detected in Hough Transform ?!')

    # k-means
    horiz_lines, vert_lines = get_line_clusters_kmeans(lines, Params.kmeans_cluster_n)
    
    intersections = calc_lines_intersections(lines)
    # line_clusters = cluster_similar_lines(lines,intersections)

    # for i, cluster in enumerate(line_clusters):
    #     cdst = print_lines(cdst, cluster, (0 , 0, i * (255 / 10)))
    cdst = print_lines(cdst, horiz_lines, Params.color_green)
    cdst = print_lines(cdst, vert_lines, Params.color_red)
    cdst = print_points(cdst, intersections, Params.color_blue)

    return cdst

# obtain separated vertical and horizontal lines with kmeans
# muito sucestível a extremos acho -> daí os maus resultados?
def get_line_clusters_kmeans(lines, clusters=2):
    angles = lines[:,1].reshape(-1,1) # extrair angulo de cada par e depois meter em 2D array de tamanho automaticamente calculado (-1) em que cada lista tem tamanho 1

    kmeans = KMeans(n_clusters=clusters,random_state=0).fit(angles)
    cluster_labels = kmeans.labels_
    cluster_centers = kmeans.cluster_centers_

    calc_orientation = np.abs(cluster_centers - np.pi/2)
    horiz_label = np.argmin(calc_orientation)
    vert_label = 1 - horiz_label
    
    horiz_lines = lines[cluster_labels == horiz_label]
    vert_lines = lines[cluster_labels == vert_label]

    # print("Horiz label: ", horiz_label, " lines: ", horiz_lines)
    # print("Vert label", vert_label, " lines:", vert_lines)

    return horiz_lines, vert_lines

def get_line_clusters_agglomerative(lines, clusters=2):
    angles = lines[:,1]

    #pré-computar distÂncias de ângulos entre cada 2 linhas, para usar em agglomerative clustering
    angle_dist_func = lambda ang1, ang2 : min(abs(ang1 - ang2), 2 * np.pi - abs(ang1 - ang2)) # func de comparação de ângulos
    dist_matrix = squareform(pdist(angles[:, np.newaxis], metric=angle_dist_func)) # angles[:, np.newaxis] -> separada cada ângulo em coluna diferente -> pdist calcula dists entre cada dois elems de diferentes colunas -> squareform transforma em matriz quadrâtica triangular

    #agglomerative clustering
    agglom = AgglomerativeClustering(n_clusters=clusters, metric='precomputed', linkage='average')
    cluster_labels = agglom.fit_predict(dist_matrix)
    
    cluster_means = np.array([np.mean(angles[cluster_labels == i]) for i in range(clusters)])
    horiz_label = np.argmin(np.abs(cluster_means - np.pi/2))
    vert_label = 1 - horiz_label

    horiz_lines = lines[cluster_labels == horiz_label]
    vert_lines = lines[cluster_labels == vert_label]

    return horiz_lines, vert_lines

# a representação polar de linhas permite que haja dois valores de radius,theta que produzem a mesma reta -> rho,theta ou -rho,theta - pi
# para os cálculos darem corretamente ao separar retas em horiz e vertical por angulos, temos de garantir que têm o mesmo raio positivo, para ordenar 
def fix_negative_rho_in_hesse_normal_form(lines: np.ndarray) -> np.ndarray:
    lines = lines.copy()
    neg_rho_mask = lines[..., 0] < 0 # boolean mask para identificar linhas cujo radius é negativo
    lines[neg_rho_mask, 0] = - lines[neg_rho_mask, 0] # nessas linhas, trocar o sinal de radius
    lines[neg_rho_mask, 1] = lines[neg_rho_mask, 1] - np.pi # nessas linhas, fazer angulo - pi
    return lines

#obter pontos (x,y) de interseção de retas em formato polar
def calc_lines_intersections(lines):
    vect_cartesian_lines = polar_to_cartesian_lines_vectorized(lines)
    cartesian_intersect_points = find_intersections_vectorized(vect_cartesian_lines)

    return cartesian_intersect_points

# devolve [[A1 B1 C1],...], tendo que func geometrica de cada func é Ax + By = C
def polar_to_cartesian_lines_vectorized(polar_lines):
    thetas = polar_lines[:, 1]
    rhos = polar_lines[:, 0]
    
    A = np.cos(thetas)
    B = np.sin(thetas)
    C = rhos
    
    return (A,B,C)

def find_intersections_vectorized(cartesian_lines):
    A,B,C = cartesian_lines

    # Create matrices for pairwise computation
    A1, A2 = np.meshgrid(A, A)
    B1, B2 = np.meshgrid(B, B)
    C1, C2 = np.meshgrid(C, C)
    
    # Compute determinants
    det = A1 * B2 - A2 * B1
    
    # Avoid division by zero for parallel lines
    mask = det != 0
    
    x = np.zeros_like(det, dtype=np.float64)
    y = np.zeros_like(det, dtype=np.float64)
    
    x[mask] = (B2[mask] * C1[mask] - B1[mask] * C2[mask]) / det[mask]
    y[mask] = (A1[mask] * C2[mask] - A2[mask] * C1[mask]) / det[mask]
    
    # Mask upper triangle and diagonal to avoid duplicate calculations
    upper_triangle_mask = np.triu(mask, k=1)
    
    intersections = np.column_stack((x[upper_triangle_mask], y[upper_triangle_mask]))
    
    return intersections

def cluster_similar_lines(lines, intersections):
    clusters = DBSCAN(eps=Params.line_clusters_eps, min_samples=8).fit(intersections)
    clusters_labels = clusters.labels_

    line_groups = {}
    for idx, label in enumerate(clusters_labels):
        if label == -1:
            continue  # Ignore noise points
        if label not in line_groups:
            line_groups[label] = []
        line_groups[label].append(lines[idx])
    return line_groups

def print_points(img, points, color):
    for x,y in points:

        cv2.circle(img, (int(x),int(y)),radius=0, color=color, thickness=-1)
    return img

def print_lines(img, lines, color):
    for i in range(0, len(lines)):
        rho = lines[i][0]
        theta = lines[i][1]
        a = math.cos(theta)
        b = math.sin(theta)
        x0 = a * rho
        y0 = b * rho
        pt1 = (int(x0 + 1000*(-b)), int(y0 + 1000*(a)))
        pt2 = (int(x0 - 1000*(-b)), int(y0 - 1000*(a)))
        cv2.line(img, pt1, pt2, color, 2, cv2.LINE_AA)
    return img