
#bilateral filter
bilat_sample_diameter = 7 # Diameter of each pixel neighborhood that is used during filtering

#canny edge filter
# canny_t_lower = 50 # canny lower threshold
# canny_t_upper = 150 # canny upper threshold
# canny_aperture_size = 3 # acho que n importa nada # size of Sobel kernel used for find image gradients (???)

#hough_transform

hough_angle_res = 720.0 # angle resolution in radians
hough_min_points_line = 50 # min number of votes for valid line (min de pontos a intersetar nas sinuosoidais)
hough_min_line_length = 5 # min allowed length of line
hough_max_line_gap_join= 0 # max allowed gap between line for joining them

#draw hough_lines
hough_lines_color = (0,0,255) # red