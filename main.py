# Correr default: python3 main.py examples/small_roboflow_test/2f6fb003bb89cd401322a535acb42f65_jpg.rf.91ad9df05bd1f86bab67c8368ae5e4ad.jpg results/

from board_recognition.board_recognition import *
import sys

def get_img():
    photo_path = sys.argv[1]
    orig_img = cv2.imread(photo_path, cv2.IMREAD_COLOR)

    if orig_img is None:
        raise Exception('Error opening image:', photo_path)
        return -1

    return orig_img

def show_result(orig_img, result_img, writeToFile=False):

    #write result image to file
    if (writeToFile):
        out_path = sys.argv[2]
        Path(out_path).mkdir(parents=True, exist_ok=True)
        filename = sys.argv[1].split("/")[-1]
        final_path = out_path + filename
        cv2.imwrite(final_path, result_img)

    #popup window with result
    cv2.imshow('Result Image', result_img)
    cv2.waitKey(0)
    cv2.destroyAllWindows()


def main():
    if len(sys.argv) != 3:
        raise Exception("main.py <input_photo_path> <output_folder_path>")
    orig_img = get_img()
    result_img = process_board(orig_img)
    show_result(orig_img,result_img, writeToFile=True)

if __name__ == "__main__":
    main()