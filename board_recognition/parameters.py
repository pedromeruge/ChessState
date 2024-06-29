
#bilateral filter
bilat_sample_diameter = 7 # Diameter of each pixel neighborhood that is used during filtering

#canny edge filter
# canny_t_lower = 50 # canny lower threshold
# canny_t_upper = 150 # canny upper threshold
# canny_aperture_size = 3 # acho que n importa nada # size of Sobel kernel used for find image gradients (???)

#hough_transform

hough_angle_res = 720.0 # angle resolution in radians
hough_min_points_line = 90 # min number of votes for valid line (min de pontos a intersetar nas sinuosoidais)
# -> 80 works good

#kMeans
kmeans_cluster_n = 2

#DBSCAN separate line clusters
line_clusters_eps = 9 # Distância máxima para duas samples diferentes estarem na mesma vizinhança (aka cluster acho)
line_clusters_min_samples = 1 # mínimo de samples para ponto não ser considerado outlier

#find_best_lines 
#Sorted
sorted_theta_threshold = 0.1 # maximo de variação de ângulo de reta entre linhas consecutivas de grelha

#warped image dimensions
homography_width = 700
homography_height = 700

#draw objects
color_red = (0,0,255)
color_green = (0,255,0)
color_blue = (255,0,0)
