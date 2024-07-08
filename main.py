# Correr default: python3 main.py examples/small_roboflow_test/2f6fb003bb89cd401322a535acb42f65_jpg.rf.91ad9df05bd1f86bab67c8368ae5e4ad.jpg results/

from board_recognition.board_recognition import *
from pieces_recognition.pieces_recognition import *
from process_datasets.process_dataset_images import * 

def get_img():
    photo_path = sys.argv[1]
    orig_img = cv2.imread(photo_path, cv2.IMREAD_COLOR)

    if orig_img is None:
        raise Exception('Error opening image:', photo_path)
        return -1

    return orig_img

def main():
    if len(sys.argv) != 3:
        raise Exception("main.py <input_photo_path> <output_folder_path>")
    
    orig_img = get_img()

    start_time = time.time()

    result_img, corner_points = process_board(orig_img)

    # board_layout = process_empty_spaces(result_img, corner_points)

    print("Execution time: %s s" % (time.time() - start_time)) # print do tempo decorrido

if __name__ == "__main__":

    # main()
    # augment_images_in_dir(sys.argv[1],sys.argv[2])
    split_train_val_test_data(sys.argv[1],sys.argv[2])
    # interpret_empty_spaces(sys.argv[1],sys.argv[2])
