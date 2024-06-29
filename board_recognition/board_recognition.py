import typing
from board_recognition.includes import *
import board_recognition.parameters as Params

def sigmoid_contrast(img, cutoff=0.5, gain=10):
    img_normalized = img / 255.0
    img_transformed = 1 / (1 + np.exp(gain * (cutoff - img_normalized)))
    img_rescaled = (img_transformed * 255).astype(np.uint8)
    return img_rescaled

# vi num github -> supostamente vem de um CannyLines paper?? -> ISTO É MUITO SENSIVEL A VALORES EXTREMOS -> na foto mine/1.jpg, como há peças muito escuras, ignora as telhas??
def cannyPF(img, sigma=0.25):
    med = np.median(img)
    lower = int(max(0, (1.0 - sigma) * med))
    upper = int(min(255, (1.0 + sigma) * med))
    return cv2.Canny(img, lower, upper)

def process_board(orig_img):

    #transform to greyscale
    grey_img = cv2.cvtColor(orig_img, cv2.COLOR_BGR2GRAY)

    # Apply Sigmoid contrast adjustment
    # bilateral_filter_img = sigmoid_contrast(grey_img, cutoff=0.70, gain=7)

    #smooth noise, while keeping edges sharp -> por exemplo texturas de mesas de madeira desaparecem, facilita bastante
    bilateral_filter_img = cv2.bilateralFilter(grey_img, Params.bilat_sample_diameter, 75,75)

    #apply canny edge detection (para usar no proximo passo)
    # explicação deste algoritmo: https://docs.opencv.org/4.x/da/d22/tutorial_py_canny.html#:~:text=Canny%20Edge%20Detection%20in%20OpenCV&text=Fourth%20argument%20is%20aperture_size.,By%20default%20it%20is%203.
    canny_edge_filter_img = cannyPF(bilateral_filter_img, sigma=0.25)

    cdst = cv2.cvtColor(canny_edge_filter_img, cv2.COLOR_GRAY2BGR)

    #apply Hough line Transform
    # explicação deste algoritmo: https://docs.opencv.org/3.4/d9/db0/tutorial_hough_lines.html
    # obter lista de (r,ang) de cada linha obtida
    lines = cv2.HoughLines(
                            canny_edge_filter_img, # input edge image
                            1, # distance resolution in pixels
                            np.pi/ Params.hough_angle_res,
                            Params.hough_min_points_line,
                            np.array([])
                        )
    
    if lines is None:
        print('>> No lines detected in Hough Transform ?!')
        exit(1)
    lines = lines.squeeze() # remover lista a mais que vem de HoughLines
    lines = fix_negative_rho_in_hesse_normal_form(lines) # meter todos os raios positivos, para contas certas

    # k-means
    horiz_lines, vert_lines, lines_center_angle = get_line_clusters_kmeans(lines, Params.kmeans_cluster_n)

    old_horiz_lines = horiz_lines

    horiz_lines = simplify_line_clusters( horiz_lines, vert_lines) # obter linhas horizontais a partir de média de linhas verticais
    vert_lines = simplify_line_clusters( vert_lines, old_horiz_lines) # obter linhas verticais a partir de média de linhas horizontais

    horiz_lines = find_best_lines_sorted(horiz_lines, theta_threshold=Params.sorted_theta_threshold)
    vert_lines = find_best_lines_sorted(vert_lines, theta_threshold=0.1)

    corner_points = find_corner_points(horiz_lines, vert_lines)
    # for i, horiz_line in enumerate(horiz_lines):
    #     cdst = print_lines(orig_img, np.array([horiz_line]), (0 , i * (255 / 10) + 30, 0))
    
    # for i, vert_line in enumerate(vert_lines):
    #     cdst = print_lines(orig_img, np.array([vert_line]), (0 , 0, i * (255 / 10) + 30))

    cdst = print_lines(orig_img, horiz_lines, Params.color_green)
    cdst = print_lines(cdst, vert_lines, Params.color_red)
    cdst = print_points(cdst, corner_points, Params.color_blue)
    
    cdst,homography_matrix = warp_image(cdst, corner_points)#, Params.homography_width, Params.homography_height)

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
def simplify_line_clusters(lines, perp_lines):

    lines_rhos, lines_thetas = lines.T #transposta

    perp_line_rho, perp_line_theta = np.mean(perp_lines, axis=0) # calcular média ao longo de colunas

    horiz_intersections = get_intersection_points(lines_rhos, lines_thetas, perp_line_rho, perp_line_theta)

    cluster = DBSCAN(eps=Params.line_clusters_eps, min_samples=Params.line_clusters_min_samples).fit(horiz_intersections)
    labels = cluster.labels_

    final_lines = []

    for label in np.unique(labels):
        # criar boolean para label atual
        mask = (labels == label)
        # obter média para cada cluster
        average_rho_theta = np.median(lines[mask], axis=0)
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

def find_best_lines_sorted(lines, theta_threshold=0.5, max_lines=9):
    # sort lines by theta
    lines = lines[np.argsort(lines[:, 1])] 

    #find largest sequence of consecutive thetas with (i) theta - (i-1)theta under the threshhold
    # nao podia so filtrar as linhas que n estivessem dentro do threshhold e na fase seguinte via as que tinham melhor espaçamento -> não porque a primeira linha podia logo ser a errada!!
    max_subseq = []
    current_subseq = [lines[0]]
    
    for i in range(1, len(lines)):
        if abs(lines[i][1] - lines[i-1][1]) < theta_threshold:
            current_subseq.append(lines[i])
        else:
            if len(current_subseq) > len(max_subseq):
                max_subseq = current_subseq
            current_subseq = [lines[i]]
    
    if len(current_subseq) > len(max_subseq):
        max_subseq = current_subseq

    largest_subsequence = np.array(max_subseq)

    # if largest subsequence >9 lines
    if len(largest_subsequence) > max_lines:
        grid_lines = fit_linear_model_and_find_grid_lines(largest_subsequence, max_lines)
        return grid_lines
    else:
        return largest_subsequence
    
#função aux para decidir melhores retas numa direção (horizontal ou vertical) para a grelha 
def fit_linear_model_and_find_grid_lines(lines, max_lines):

   # Sort lines by rho
    sorted_lines = lines[lines[:, 0].argsort()]
    
    # Calculate differences between consecutive rho values
    rho_diffs = np.diff(sorted_lines[:, 0])
    
    # Calculate deviations based on max deviation to previous or next line
    max_deviations = np.maximum(np.abs(np.concatenate(([rho_diffs[0]], rho_diffs))),
                                np.abs(np.concatenate((rho_diffs, [rho_diffs[-1]]))))
    
    # Fit deviations to a linear model
    X = np.arange(len(sorted_lines)).reshape(-1, 1)
    model = LinearRegression()
    model.fit(X, max_deviations)
    
    # Predict deviations using the linear model
    deviations_pred = model.predict(X)
    
    # Calculate MSE for each line based on the deviation prediction
    mse = np.square(max_deviations - deviations_pred)
    
    # Iteratively remove lines with highest MSE until max_lines is reached
    indices_to_remove = []
    while len(sorted_lines) - len(indices_to_remove) > max_lines:
        max_mse_index = np.argmax(mse)
        indices_to_remove.append(max_mse_index)
        mse[max_mse_index] = -1  # Set to a low value to ignore in future iterations
    
    # Create a mask to filter out the lines to be removed
    mask = np.ones(len(sorted_lines), dtype=bool)
    mask[indices_to_remove] = False
    
    # Return the filtered lines up to max_lines, sorted by increasing rho
    remaining_lines = sorted_lines[mask]
    return remaining_lines

def find_corner_points(horiz_lines, vert_lines):
    filtered_horiz_lines = horiz_lines[[0,0,-1,-1]] # pegar so ém primeira e última linhas horiz
    filtered_vert_lines = vert_lines[[0,-1,0,-1]]
    horiz_lines_rhos, horiz_lines_thetas = filtered_horiz_lines.T #transposta
    vert_lines_rhos, vert_lines_thetas = filtered_vert_lines.T #transposta

    intersections = get_intersection_points(horiz_lines_rhos, horiz_lines_thetas, vert_lines_rhos, vert_lines_thetas)
    # print(intersections)
    return intersections

def warp_image(img, corner_points, out_width=0, out_height=0):

    if(out_width == 0):
        out_width = out_height = min(img.shape[1],img.shape[0])

    #quanta margem dar à foto
    margin = max(80,(corner_points[2][1] - corner_points[0][1]) / 8 * 3)# meio huerística baseada na altura de cada quadrado do chess
    other_margin = 80 # só a borda de cima é que deve ter peças a sair fora do tabuleiro com a sua altura
    
    pts_dst = np.array([
        [other_margin, margin], # cima - esq
        [out_width - other_margin, margin], # cima-dir
        [other_margin, out_height - other_margin], # baixo-esq
        [out_width - other_margin, out_height - other_margin] # baixo-dir
    ], dtype=float)

    h, status = cv2.findHomography(corner_points, pts_dst)

    im_out = cv2.warpPerspective(img, h, (out_width, out_height)) # use same width and height in dest, as in orig

    return im_out, h

def print_points(img, points, color):
    for x,y in points:
        cv2.circle(img, (int(x),int(y)),radius=5, color=color, thickness=-1)
        cv2.putText(img, f"X:{x}, Y:{y}", (int(x),int(y)), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 1, cv2.LINE_AA)
    return img

def print_lines(img, lines, color):
    if lines is not None:
        for i in range(0, len(lines)):
            rho = lines[i][0]
            theta = lines[i][1]
            a = math.cos(theta)
            b = math.sin(theta)
            x0 = a * rho
            y0 = b * rho
            pt1 = (int(x0 + 2000*(-b)), int(y0 + 2000*(a)))
            pt2 = (int(x0 - 2000*(-b)), int(y0 - 2000*(a)))

            #draw line
            cv2.line(img, pt1, pt2, color, 3, cv2.LINE_AA)

            #draw text
            pt1_text = (int(x0 + 1000*(-b)), int(y0 + 1000*(a)))
            pt2_text = (int(x0 - 1000*(-b)), int(y0 - 1000*(a)))
            text_pos = (int((pt1_text[0] + pt2_text[0]) /2), int((pt1_text[1] + pt2_text[1]) /2) + random.randint(5,50))
            cv2.putText(img, f"r:{rho}, ang:{theta}", text_pos, cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 1, cv2.LINE_AA)
    return img


# !!
# Experencia a tentar meter as retas numa regressao linear, mas n é eficiente e n funciona direito
# def find_best_lines_regression(lines, max_lines=9, theta_threshold=np.pi/18, rho_threshold=20):
#     best_set = []
#     max_lines_in_set = 0
#     best_rho_error = float('inf')
#     best_angle_error = float('inf')

#     def calculate_squared_error(x, y):
#         model = LinearRegression().fit(x.reshape(-1, 1), y)
#         y_pred = model.predict(x.reshape(-1, 1))
#         mse = mean_squared_error(y, y_pred)
#         return mse

#     # Try all combinations of lines up to max_lines
#     for num_lines in range(2, max_lines + 1):
#         for combination in combinations(lines, num_lines):
#             combination = np.array(combination)
#             rhos = combination[:, 0]
#             angles = combination[:, 1]
#             x = np.arange(len(rhos))

#             rho_error = calculate_squared_error(x, rhos)
#             angle_error = calculate_squared_error(x, angles)

#             print("rho", rho_error)
#             print("angle", angle_error)
#             # Check if the errors are within the specified margins
#             if rho_error <= rho_threshold and angle_error <= theta_threshold:
#                 if num_lines > max_lines_in_set or (num_lines == max_lines_in_set and (rho_error < best_rho_error or (rho_error == best_rho_error and angle_error < best_angle_error))):
#                     best_set = combination
#                     max_lines_in_set = num_lines
#                     best_rho_error = rho_error
#                     best_angle_error = angle_error

#     return np.array(best_set)


# def find_best_lines_cluster(lines, eps=0.1, theta_threshold=0.1, rho_threshold=10):
#     """
#     Filters out outlier lines and keeps only the lines that best form a grid pattern.
    
#     Parameters:
#     - lines: np.ndarray, shape (n, 2), array of lines in polar coordinates (rho, theta)
#     - eps: float, maximum distance between samples for them to be considered in the same neighborhood for clustering
#     - theta_threshold: float, maximum standard deviation of angles within a cluster to be considered valid
#     - rho_threshold: float, maximum standard deviation of distances within a cluster to be considered valid
    
#     Returns:
#     - filtered_lines: np.ndarray, shape (m, 2), array of filtered lines in polar coordinates
#     """
    
#     def filter_by_rho(lines):
#         if len(lines) == 0:
#             return lines
#         rhos = lines[:, 0]
#         q1, q3 = np.percentile(rhos, [25, 75])
#         lower_bound = q1 - 1.5 * iqr(rhos)
#         upper_bound = q3 + 1.5 * iqr(rhos)
#         return lines[(rhos >= lower_bound) & (rhos <= upper_bound)]
    
#     def filter_by_cluster(lines, theta_threshold, rho_threshold):
#         if len(lines) == 0:
#             return lines
#         theta_std = np.std(lines[:, 1])
#         rho_std = np.std(lines[:, 0])
#         if theta_std <= theta_threshold and rho_std <= rho_threshold:
#             return lines
#         return np.array([])

#     # Cluster the lines based on theta
#     filtered_lines = np.array([])
#     if len(lines) > 0:
#         theta = lines[:, 1].reshape(-1, 1)
#         db = DBSCAN(eps=eps, min_samples=2).fit(theta)
#         labels = db.labels_
#         for label in set(labels):
#             if label != -1:
#                 cluster = lines[labels == label]
#                 cluster = filter_by_rho(cluster)
#                 cluster = filter_by_cluster(cluster, theta_threshold, rho_threshold)
#                 filtered_lines = np.vstack((filtered_lines, cluster)) if filtered_lines.size else cluster

#     return filtered_lines