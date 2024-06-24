import typing
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
    lines = fix_negative_rho_in_hesse_normal_form(lines) # meter todos os raios positivos, para contas certas

    if lines is None:
        print('>> No lines detected in Hough Transform ?!')

    # k-means
    horiz_lines, vert_lines, lines_center_angle = get_line_clusters_kmeans(lines, Params.kmeans_cluster_n)
    
    horiz_lines = calc_lines_clusters( horiz_lines, vert_lines) # obter linhas horizontais a partir de média de linhas verticais
    vert_lines = calc_lines_clusters( vert_lines, horiz_lines) # obter linhas verticais a partir de média de linhas horizontais

    for i, horiz_line in enumerate(horiz_lines):
        cdst = print_lines(grey_img, np.array([horiz_line]), (0 , i * (255 / 10) + 30, 0))
    
    for i, vert_line in enumerate(vert_lines):
        cdst = print_lines(grey_img, np.array([vert_line]), (0 , 0, i * (255 / 10) + 30))
    # cdst = print_lines(cdst, horiz_lines, Params.color_green)
    # cdst = print_lines(cdst, vert_lines, Params.color_red)
    # cdst = print_points(cdst, intersections, Params.color_blue)

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

    return horiz_lines, vert_lines, (cluster_centers[horiz_label], cluster_centers[vert_label])

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

#obter pontos (x,y) de interseção de retas em formato polar, tirar retas desnecessárias
# na prática só usado entre 
def calc_lines_clusters(lines, perp_lines):

    lines_rhos, lines_thetas = lines.T #transposta

    perp_line_rho, perp_line_theta = np.mean(perp_lines, axis=0) # calcular média ao longo de colunas

    horiz_intersections = get_intersection_points(lines_rhos, lines_thetas, perp_line_rho, perp_line_theta)

    cluster = DBSCAN(eps=Params.line_clusters_eps, min_samples=1).fit(horiz_intersections)
    labels = cluster.labels_

    final_lines = []

    for label in np.unique(labels):
        # criar boolean para label atual
        mask = (labels == label)
        # obter média para cada cluster
        average_rho_theta = np.mean(lines[mask], axis=0)
        final_lines.append(average_rho_theta)

    return np.stack(final_lines)

#Obtain lines intersection points, can be vectorized if args are in array
def get_intersection_points(rho1: np.ndarray, theta1: np.ndarray, rho2: np.ndarray, theta2: np.ndarray) -> typing.Tuple[np.ndarray, np.ndarray]:

    # rho1 = x cos(theta1) + y sin(theta1)
    # rho2 = x cos(theta2) + y sin(theta2)
    cos_t1 = np.cos(theta1)
    cos_t2 = np.cos(theta2)
    sin_t1 = np.sin(theta1)
    sin_t2 = np.sin(theta2)
    x = (sin_t1 * rho2 - sin_t2 * rho1) / (cos_t2 * sin_t1 - cos_t1 * sin_t2)
    y = (cos_t1 * rho2 - cos_t2 * rho1) / (sin_t2 * cos_t1 - sin_t1 * cos_t2)
    return np.stack((x,y), axis=-1) # meter em pares 2 a 2, em vez de listas separadas

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