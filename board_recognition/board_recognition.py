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
    # obter lista de  extremos (xStart,yStart,xEnd,yEnd) de cada linha obtida

    #Versão com HoughLinesP
    linesP = cv2.HoughLinesP(
                            canny_edge_filter_img, # input edge image
                            1, # distance resolution in pixels
                            np.pi/ Params.hough_angle_res,
                            Params.hough_min_points_line,
                            None, # vector to store parameters??
                            Params.hough_min_line_length,
                            Params.hough_max_line_gap_join 
                        )

    if linesP is None:
        print('>> No lines detected in Hough Transform ?!')
    
    for iterLines in range(0, len(linesP)):
        lineValues = linesP[iterLines][0]
        cv2.line(cdst, (lineValues[0], lineValues[1]), (lineValues[2], lineValues[3]), (0,0,255), 2, cv2.LINE_AA)

    #Versão com houghLines
    # lines = cv2.HoughLines(
    #                         canny_edge_filter_img, # input edge image
    #                         1, # distance resolution in pixels
    #                         np.pi/ Params.hough_angle_res,
    #                         Params.hough_min_points_line,
    #                         None, # vector to store parameters??
    #                         0, # valores default
    #                         0 # valores default
    #                     )

    # if lines is None:
    #     print('>> No lines detected in Hough Transform ?!')
    
    # for iterLines in range(0, len(lines)):
    #     rho = lines[iterLines][0][0]
    #     theta = lines[iterLines][0][1]
    #     a = math.cos(theta)
    #     b = math.sin(theta)
    #     x0 = a * rho
    #     y0 = b * rho
    #     pt1 = (int(x0 + 50*(-b)), int(y0 + 50*(a)))
    #     pt2 = (int(x0 - 50*(-b)), int(y0 - 50*(a)))
    #     cv2.line(cdst, pt1, pt2, Params.hough_lines_color, 1, cv2.LINE_AA)

    return cdst
