# Correr default: python3 main.py examples/small_roboflow_test/2f6fb003bb89cd401322a535acb42f65_jpg.rf.91ad9df05bd1f86bab67c8368ae5e4ad.jpg results/

import board_recognition.board_recognition as BoardRecogn
import board_recognition.parameters as BoardRecognParams
import models.squares_recognition as ModelsSquares
import models.pieces_recognition as ModelsPieces
import process_datasets.pieces_datasets as ProcPiecesData
import process_datasets.squares_datasets as ProcSquaresData
import process_datasets.chessred_dataset as ProcChRed
import process_datasets.osf_dataset as ProcOsf
import print_funcs.print_funcs as Prints
import draw_chessboard.draw_funcs as DrawBoard
import sys
import cv2
import time

def get_img():
    photo_path = sys.argv[1]
    orig_img = cv2.imread(photo_path, cv2.IMREAD_COLOR)

    if orig_img is None:
        raise Exception('Error opening image:', photo_path)

    return orig_img

def main():
    try:
        if len(sys.argv) != 2:
            raise Exception("main.py <input_photo_path> <output_folder_path>")
        
        orig_img = get_img()

        start_time = time.time()

        corner_points = BoardRecogn.process_board(orig_img)

        square_imgs = ProcSquaresData.process_squares_img(orig_img, corner_points)

        # Prints.show_squares_grid(square_imgs)

        square_predicts, uncertain_square_predicts = ModelsSquares.interpret_empty_spaces(square_imgs)

        # Prints.print_array_in_chess_format(square_predicts)
        print("Execution time: %s s" % (time.time() - start_time)) # print do tempo decorrido
        
        piece_imgs, occupation_mask = ProcPiecesData.process_pieces_img(orig_img,corner_points, square_predicts)
        piece_predicts, uncertain_piece_predicts = ModelsPieces.interpret_pieces(piece_imgs, occupation_mask)

        print("Execution time: %s s" % (time.time() - start_time)) # print do tempo decorrido

        # print("before:", Prints.print_array_in_chess_format(piece_predicts))

        piece_predicts[uncertain_piece_predicts] = 14
        piece_predicts[uncertain_square_predicts] = 13

        # print("after:", Prints.print_array_in_chess_format(piece_predicts))

        #print result image and points
        # cdst = Prints.print_points(orig_img, corner_points, Prints.color_blue)
        # Prints.show_result(cdst)

        #draw resulting chessboard
        DrawBoard.draw_chessboard(piece_predicts)

    except Exception as e:
        print(e)
    
if __name__ == "__main__":
    main()
    # ProcOsf.process_OSF_dataset_pieces(sys.argv[1],sys.argv[2])
    # ProcChRed.process_ChessReD_dataset_pieces(sys.argv[1],sys.argv[2])

    # ModelsPieces.build_InceptionV3_CNN(sys.argv[1],sys.argv[2])
    # ModelsPieces.build_vanilla_CNN_3_3_3(sys.argv[1],sys.argv[2])

    # ProcCommon.augment_images_in_dataset_dirs(sys.argv[1],sys.argv[2], ProcCommon.augment_image_with_warp,goal_count=27050)
    # ProcCommon.split_train_val_test_data(sys.argv[1],sys.argv[2])