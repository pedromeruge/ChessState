
#bilateral filter
bilat_sample_diameter = 7 # Diameter of each pixel neighborhood that is used during filtering

#canny edge filter
# canny_t_lower = 50 # canny lower threshold
# canny_t_upper = 150 # canny upper threshold
# canny_aperture_size = 3 # acho que n importa nada # size of Sobel kernel used for find image gradients (???)

#hough_transform

hough_angle_res = 720.0 # angle resolution in radians
hough_min_points_line = 75 # min number of votes for valid line (min de pontos a intersetar nas sinuosoidais)



#kMeans
kmeans_cluster_n = 2

#separate line clusters
line_clusters_eps = 8
#draw objects
color_red = (0,0,255)
color_green = (0,255,0)
color_blue = (255,0,0)