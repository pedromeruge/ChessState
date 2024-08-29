from numpy import square
from process_datasets.includes import *
import squares_recognition.parameters as SquaresParams
import process_datasets.parameters as Params
import process_datasets.process_dataset_common as CommonData

"""
    Functions related to creating the squares dataset that contains images from OSF_dataset and Chess_ReD dataset
"""

homography_square_length = int(SquaresParams.image_size / 2)  # tamanho de quadrado
homography_inner_length = homography_square_length * 8
homography_top_margin = 150 # tamanho excessivamente grande (50*3), para garantir que não se corta peças altas no fundo do tabuleiro
homography_other_margins = int(homography_square_length / 2)

#corner_points = [top_left, top_right, bottom_left, bottom_right]
def process_squares_img(board_img, corner_points):

    warped_img, pts_dst, homography_mat = CommonData.warp_image(board_img, corner_points, 
                                     inner_length=homography_inner_length, 
                                     top_margin=homography_top_margin, 
                                     other_margin=homography_other_margins)
    
    #obtain squares images
    squares = []
    jump_size = homography_square_length
    margin = homography_other_margins
    top_left = pts_dst[0]

    for y in range(8):
        for x in range(8):
            start_x = int(x * jump_size)
            end_x = int(start_x + jump_size*2)
            start_y = int(top_left[1] - margin + y * jump_size)
            end_y = int(start_y + jump_size*2)

            tiles = warped_img[start_y : end_y, start_x : end_x] # cols, rows
            squares.append(tiles)

    return np.array(squares)

#obtain dataset of split and separated images of squares in OSF dataset as: occupied,empty
def process_OSF_dataset_squares(input_folder_path, output_folder_path):
    if len(sys.argv) != 3:
        raise Exception("main.py <input_dataset_folder> <output_folder_path>")
    
    input_folder = Path(input_folder_path)
    output_folder = Path(output_folder_path)
    empty_folder = output_folder / 'empty'
    occupied_folder = output_folder / 'occupied'

    empty_folder.mkdir(parents=True, exist_ok=True)
    occupied_folder.mkdir(parents=True, exist_ok=True)

    output_subfolders = [empty_folder, occupied_folder]

    CommonData.split_OSF_dataset(input_folder, output_subfolders, split_board_squares)

#process only photos for corrupted files described in txt (result of running check_img_val.py script)
def process_OSF_dataset_squares_in_txt(input_folder_path, output_folder_path, input_txt):

    input_folder = Path(input_folder_path)

    with open(input_txt,'r') as input_file:
        image_json_paths = dict()

        for line in input_file:
            if not line.startswith("Corrupted image file:"):
                continue
            match = re.search(r"(\/.*\/)(.*?)_\d{1,2}(\.\w+)",line)
            if (match == -1):
                raise Exception("File path not correct")
            # output_folder_path = match.group(1) # ineficiente, mas este script corre poucas vezes
            file_name = match.group(2) + match.group(3) # filename.ext
            image_json_paths[file_name] = (input_folder / file_name, input_folder / (match.group(2) + ".json"))

    output_folder = Path(output_folder_path)
    
    empty_folder = output_folder / 'empty'
    occupied_folder = output_folder / 'occupied'

    empty_folder.mkdir(parents=True, exist_ok=True)
    occupied_folder.mkdir(parents=True, exist_ok=True)

    output_subfolders = [empty_folder, occupied_folder]

    CommonData.split_OSF_dataset(input_folder, output_subfolders, split_board_squares, augment_square_image)
    
def split_board_squares(image_path, board_img, corners, vec_labels, output_subfolders, augment_func):

    squares = process_squares_img(board_img, corners)

    empty_folder, occupied_folder = output_subfolders
    for i, square_photo in enumerate(squares):
        square_photo = augment_func(square_photo) # aplicar modificações às imagens
        output_folder = occupied_folder if vec_labels[i] else empty_folder
        square_photo_path = output_folder / f'{image_path.stem}_{i+1}{image_path.suffix}'
        cv2.imwrite(str(square_photo_path), square_photo)

#perform augment operation to image
def augment_square_image(image):
    base_seed = np.random.randint(0, 2**32 - 1)
    seed = tf.constant([0, base_seed], dtype=tf.int64)
    image = tf.image.stateless_random_flip_left_right(image, seed=seed)
    image = tf.image.stateless_random_brightness(image, max_delta=Params.brightness_max_delta, seed=seed)
    image = tf.image.stateless_random_contrast(image, lower=1-Params.contrast_delta, upper=1+Params.contrast_delta, seed=seed)
    image = tf.image.stateless_random_saturation(image, lower=1-Params.saturation_delta, upper=1+Params.saturation_delta, seed=seed)
    image = tf.image.stateless_random_hue(image, max_delta=Params.hue_max_delta, seed=seed)
    image = tf.image.random_jpeg_quality(image, min_jpeg_quality=100 - Params.noise_max_delta, max_jpeg_quality=100)
    image = image.numpy().astype(np.uint8)
    return image