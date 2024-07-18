# Correr default: python3 main.py examples/small_roboflow_test/2f6fb003bb89cd401322a535acb42f65_jpg.rf.91ad9df05bd1f86bab67c8368ae5e4ad.jpg results/

import board_recognition.board_recognition as BoardRecogn
import pieces_recognition.pieces_recognition as PiecesRecogn
import process_datasets.process_dataset_images as ProcData 
import board_recognition.parameters as BoardParams
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
    while( i < len(array)):
        print(array[i:(i + 8)])
        i += 8
    
def main():
    if len(sys.argv) != 2:
        raise Exception("main.py <input_photo_path> <output_folder_path>")
    
    orig_img = get_img()

    start_time = time.time()

    corner_points = BoardRecogn.process_board(orig_img)

    square_imgs = ProcData.process_squares_img(orig_img, corner_points)

    predicts = PiecesRecogn.interpret_empty_spaces(square_imgs)

    print("Execution time: %s s" % (time.time() - start_time)) # print do tempo decorrido
    
    print_array_in_chess_format(predicts)

    #print result image and points
    cdst = BoardRecogn.print_points(orig_img, corner_points, BoardParams.color_blue)
    BoardRecogn.show_result(cdst, writeToFile=False)
    
if __name__ == "__main__":
    # main()
    ProcData.process_OSF_dataset(sys.argv[1],sys.argv[2])
    # PiecesRecogn.build_ResNet_CNN(sys.argv[1],sys.argv[2])
    # PiecesRecogn.build_vanilla_CNN(sys.argv[1],sys.argv[2])
    
