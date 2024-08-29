# Correr default: python3 main.py examples/small_roboflow_test/2f6fb003bb89cd401322a535acb42f65_jpg.rf.91ad9df05bd1f86bab67c8368ae5e4ad.jpg results/

import board_recognition.board_recognition as BoardRecogn
import squares_recognition.squares_recognition as SquaresRecogn
import process_datasets.pieces_datasets as ProcPiecesData
import process_datasets.squares_datasets as ProcSquaresData
import process_datasets.chessred_dataset as ProcChRed
import process_datasets.osf_dataset as ProcOsf
import board_recognition.parameters as BoardParams
import print_funcs.print_funcs as Prints
import sys
import cv2
import time

def get_img():
    photo_path = sys.argv[1]
    orig_img = cv2.imread(photo_path, cv2.IMREAD_COLOR)

    if orig_img is None:
        raise Exception('Error opening image:', photo_path)
        return -1

    return orig_img

def print_array_in_chess_format(array):
    i = 0
    while(i < len(array)):
        print(array[i:(i + 8)])
        i += 8
    
def main():
    if len(sys.argv) != 2:
        raise Exception("main.py <input_photo_path> <output_folder_path>")
    
    orig_img = get_img()

    start_time = time.time()

    corner_points = BoardRecogn.process_board(orig_img)

    square_imgs = ProcSquaresData.process_squares_img(orig_img, corner_points)

    # Prints.show_squares_grid(square_imgs)

    predicts = SquaresRecogn.interpret_empty_spaces(square_imgs)

    print("Execution time: %s s" % (time.time() - start_time)) # print do tempo decorrido
    
    print_array_in_chess_format(predicts)

    #print result image and points
    cdst = Prints.print_points(orig_img, corner_points, Prints.color_blue)
    Prints.show_result(cdst)
    
if __name__ == "__main__":
    # main()
    ProcOsf.process_OSF_dataset_pieces(sys.argv[1],sys.argv[2])
    # ProcChRed.process_ChessReD_dataset_pieces(sys.argv[1],sys.argv[2])
    # PiecesRecogn.build_pretrained_CNN(sys.argv[1],sys.argv[2])
    # PiecesRecogn.build_vanilla_CNN(sys.argv[1],sys.argv[2])
    
