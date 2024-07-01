from pieces_recognition.includes import *
import pieces_recognition.parameters as Params
import board_recognition.parameters as BoardParams

#corner_points = [top_left, top_right, bottom_left, bottom_right]
def process_empty_spaces(board_img, corner_points):
    squares_imgs = split_squares(board_img, corner_points)

    show_result(squares_imgs, writeToFile=False)
    
    return squares_imgs

def split_squares(board_img, corner_points):
    squares = []
    jump_size = BoardParams.homography_square_length
    margin = BoardParams.homography_other_margins
    top_left = corner_points[0]

    for y in range(0, 8):
        for x in range(0, 8):
            start_x = int(x * jump_size)
            end_x = int(start_x + jump_size*2)
            start_y = int(top_left[1] - margin + y * jump_size)
            end_y = int(start_y + jump_size*2)

            tiles = board_img[start_y : end_y, start_x : end_x] # cols, rows
            squares.append(tiles)

    return squares

def show_result(chess_squares, writeToFile=False):

    #write result squares to file
    if (writeToFile):
        out_path = sys.argv[2]
        Path(out_path).mkdir(parents=True, exist_ok=True)

        for i, square in enumerate(chess_squares):
            final_path = out_path + "save/" + int(i)
            cv2.imwrite(final_path, square)

    print("Square size (WxH):", chess_squares[0].shape[1], "x", chess_squares[0].shape[0])
    #popup window with first square as example
    cv2.imshow('Result Image', chess_squares[7])
    cv2.waitKey(0)
    cv2.destroyAllWindows()

