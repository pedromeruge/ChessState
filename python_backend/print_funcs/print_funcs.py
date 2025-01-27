from print_funcs.includes import *

#colors
color_red = (0,0,255)
color_green = (0,255,0)
color_blue = (255,0,0)
color_orange = (0,165,255)
color_yellow = (51,255,255)

#print points over image, in given color
def print_points(img, points, color, size=0.5):
    for x,y in points:
        cv2.circle(img, (int(x),int(y)),radius=5, color=color, thickness=-1)
        cv2.putText(img, f"X:{x}, Y:{y}", (int(x),int(y)), cv2.FONT_HERSHEY_SIMPLEX, size, color, 1, cv2.LINE_AA)
    return img

#print lines over image, in given color
# lines are in polar coordinates: (rho, theta)
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

def print_vectors(img, src_points, dst_points, color_vector, color_direction):
    """
    color_vector: vector line color
    color_direction: end point of vector color"""
    if len(src_points) == len(dst_points):

        displacement_vectors = src_points - dst_points

        src_points = np.round(src_points).astype(int)
        dst_points = np.round(dst_points).astype(int)


        for i in range(0, len(src_points)):
            pt1 = (src_points[i][0], src_points[i][1])
            pt2 = (dst_points[i][0], dst_points[i][1])
            cv2.line(img, pt1, pt2, color_vector, 3, cv2.LINE_AA)
            v1,v2 = displacement_vectors[i]
            cv2.putText(img, f"Vector: {v1},{v2}", (int((pt1[0] + pt2[0]) / 2), int((pt1[1] + pt2[1]) / 2)), cv2.FONT_HERSHEY_SIMPLEX, 1, color_vector, 1, cv2.LINE_AA)

        print_points(img, src_points, color_vector, size=1)
        print_points(img, dst_points, color_direction, size=1)

    return img
        
#display image in screen
def show_result(result_img, output_path=""):

    #write result image to file
    if output_path:
        output_path = os.path.expanduser(output_path) # needed if i want to use paths like ~/Desktop
        out_path = Path(output_path)
        out_path.mkdir(parents=True, exist_ok=True)
        
        filename = os.urandom(10).hex() + ".jpg"
        final_path = out_path / filename
        success = cv2.imwrite(str(final_path), result_img)
        if not success:
            print("Failed to write to path", str(final_path))

    #popup window with result
    cv2.imshow('Result Image', result_img)
    cv2.waitKey(0)
    cv2.destroyAllWindows()

def show_squares_grid(chess_squares, output_path=""):

    #write result squares to file
    if output_path:
        output_path = os.path.expanduser(output_path)
        out_path = Path(output_path)
        out_path.mkdir(parents=True, exist_ok=True)

        for i, square in enumerate(chess_squares):
            final_path = out_path / str(i)
            success = cv2.imwrite(str(final_path), square)
            if not success:
                print("Failed to write to path", str(final_path))

    grid_rows = grid_cols = 8
    
    _, axes = plt.subplots(grid_rows, grid_cols, figsize=(8,8))
    axes = axes.flatten()
    
    for idx, img in enumerate(chess_squares):
        if idx >= grid_rows * grid_cols:
            break
        
        #swap images to RGB
        resized_img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        
        # display img
        axes[idx].imshow(resized_img_rgb)
        axes[idx].axis('off')
    
    # Turn off axes for any remaining empty subplots
    for i in range(idx + 1, grid_rows * grid_cols):
        axes[i].axis('off')
    
    plt.tight_layout()
    plt.show()

    print("Square size (WxH):", chess_squares[0].shape[1], "x", chess_squares[0].shape[0])

def print_array_in_chess_format(array):
    print(np.array2string(array.reshape(8,8)))
