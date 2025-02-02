from process_datasets.includes import *
import models.parameters as ModelsParams
import process_datasets.parameters as Params

"""
    Common functions related to processing images to build datasets
"""

def warp_image(img, corner_points, inner_length=400, top_margin=150, other_margin=25):

    bottom_row = top_margin + inner_length
    right_col = inner_length + other_margin
    pts_dst = np.array([
        [other_margin, top_margin], # cima - esq
        [right_col, top_margin], # cima-dir
        [other_margin, bottom_row], # baixo-esq
        [right_col, bottom_row] # baixo-dir
    ], dtype=np.float32)

    H = cv2.getPerspectiveTransform(corner_points, pts_dst)

    im_out = cv2.warpPerspective(img, H, (right_col + other_margin, bottom_row + other_margin))

    return im_out, pts_dst, H

#  ordenar cantos e labels de tabuleiro, para ficar posicionado corretamente com peças na vertical
def reorder_chessboard(corners, piece_labels):
    ordered_corners, top_left_idx = sort_corners2(corners)
    ordered_labels = sort_labels(piece_labels, top_left_idx)
    return ordered_corners, ordered_labels

#dados 4 cantos no formato [[x,y],[x,y],..], ordenar de forma a obter peças na vertical apos warp
#returns:
#  top-left, top-right, bottom-left, bottom-right points ordered
#  idx of top-left
def sort_corners(corners):
    sums = corners.sum(axis=1, keepdims=True) # somar x+y de cada ponto
    min_sum_idx = np.argmin(sums)

    ordered_points = np.empty_like(corners)    #start output array

    ordered_points[0] = corners[min_sum_idx] # canto com menor x+y é cima-esq
    
    start_point = corners[min_sum_idx]
    distances = np.sum((corners-start_point)**2,axis=1)
    max_dist_idx = np.argmax(distances) 
    ordered_points[3] = corners[max_dist_idx] # canto com maior dist a cima-esq será baixo-dir

    idx1, idx2 = [i for i in range(4) if i not in (min_sum_idx, max_dist_idx)] # remaining indices
    if corners[idx1, 1] < corners[idx2, 1]: # dos 2 cantos restantes, o que tiver menor y fica cima-dir (o restante fica em baixo-esq)
            ordered_points[1] = corners[idx1]
            ordered_points[2] = corners[idx2]
    else:
        ordered_points[1] = corners[idx2]
        ordered_points[2] = corners[idx1]

    return ordered_points, min_sum_idx

#alternative to sort corners
#top-left, top-right, bottom-left, bottom-right points ordered
#  idx of top-left
def sort_corners2(corners):

    #sort by increasing y then x
    sorted_indices = np.lexsort((corners[:, 0], corners[:, 1]))
    
    #separate top and bottom
    top_indices = sorted_indices[:2]
    bottom_indices = sorted_indices[2:]
    
    #for each group, less x is first
    top_left_idx, top_right_idx = top_indices[np.argsort(corners[top_indices, 0])]
    bottom_left_idx, bottom_right_idx = bottom_indices[np.argsort(corners[bottom_indices, 0])]
    
    return corners[[top_left_idx, top_right_idx, bottom_left_idx, bottom_right_idx]], top_left_idx

#com base na posição onde cima-esq fica, concluir que rotação do tabuleiro foi realizada e ordenar as labels
def sort_labels(piece_labels, top_left_idx):
    board_2d = np.reshape(piece_labels, (8,8))
    idx_to_rot = [0,1,-1,2] # número de rotações 90º clockwise 

    ordered_labels = np.rot90(board_2d, k=idx_to_rot[top_left_idx])   # apply rotation
    return ordered_labels.flatten() # de volta para 1d array

#aux funcs
def fenToVec(fen):
    pieces =  Params.fen_from_char

    result_vec = np.zeros(64)
    i = 0
    for symbol in fen:
        if(symbol == '/'):
            continue
        elif(symbol.isnumeric()):
            i += int(symbol)
        else:
            result_vec[i] = pieces[symbol]
            i += 1

    return result_vec

def listToVec(pieces_list):
    pieces = Params.fen_from_int

    result_vec = np.zeros(64)
    for piece_obj in pieces_list:
        chess_pos = piece_obj["chessboard_position"]

        # ex: a8 h8 -> primeira linha do tabuleiro, logo 8 * (8 - 8) + 'a' - 'a'
        pos = 8 * (8 - int(chess_pos[1])) + (ord(chess_pos[0]) - ord('a'))

        result_vec[pos] = pieces[str(piece_obj["category_id"])]
    return result_vec

#find portion of ordered list where id is given_id
def find_range(objects, field, given_id):

    image_ids_list = [obj[field] for obj in objects]
    left_index = bisect_left(image_ids_list, given_id)
    right_index = bisect_right(image_ids_list, given_id) - 1
    
    return objects[left_index:right_index + 1]

# augment images 
def augment_images_in_dir(input_dataset_folder, output_augmented_folder, augment_func, num_new_img_per_original=1.):

    input_folder = Path(input_dataset_folder)
    output_folder = Path(output_augmented_folder)
    output_folder.mkdir(parents=True, exist_ok=True)

    image_paths = list(input_folder.glob('*.jpg')) + list(input_folder.glob('*.png')) + list(input_folder.glob('*.jpeg'))

    #do not create augmentations for images that already have them -> only needed for cases where augmentaiton had an error mid way through
    # def needs_augmentation(image_path):
    #     for j in range(num_new_img_per_original):
    #         aug_image_path = output_folder / f'{image_path.stem}_aug_{j}{image_path.suffix}'
    #         if not aug_image_path.exists():
    #             return True # if at least one of the augmentation images is missing, return that it needs augmentation again
    #     return False

    # image_paths = [path for path in image_paths if needs_augmentation(path)]

    with ProcessPoolExecutor(max_workers=10) as executor:
        futures = [
            executor.submit(process_and_save_image, image_path, output_folder, num_new_img_per_original, augment_func)
            for image_path in image_paths
        ]
        for future in  tqdm(as_completed(futures), total=len(futures), desc="Augmenting images"):
            future.result()

def augment_images_in_dataset_dirs(input_dataset_folder, output_folder, augment_func, goal_count=1000):

    input_folder = Path(input_dataset_folder)
    output_folder = Path(output_folder)

    subfolders = [ f.path for f in os.scandir(input_dataset_folder) if f.is_dir() ]

    output_folder.mkdir(parents=True, exist_ok=True)

    with ProcessPoolExecutor(max_workers=8) as executor:

        for subfolder in subfolders:
            input_subfolder = Path(subfolder)
            output_subfolder = output_folder / input_subfolder.parts[-1] # add category subfolder to output path
            output_subfolder.mkdir(parents=True, exist_ok=True)
            image_paths = list(input_subfolder.glob('*.jpg')) + list(input_subfolder.glob('*.png')) + list(input_subfolder.glob('*.jpeg'))

            total_images_num = len(image_paths)

            num_augmented_images_per_original = goal_count / total_images_num

            if (num_augmented_images_per_original <= 1.):
                continue # if already surpassed count, do nothing

            full_augment_rounds = math.floor(num_augmented_images_per_original) - 1
            reminaing_augments_count = goal_count - total_images_num * (full_augment_rounds + 1)

            print("Currently processing: ", input_subfolder.parts[-1], ", initial size: ", total_images_num, ", full augment rounds:", full_augment_rounds, ", remaining_augment_count:", reminaing_augments_count)

            # process floored num_augmented_images_per_original value
            futures = [
                executor.submit(process_and_save_image, image_path, output_subfolder, augment_func, full_augment_rounds, None, "01")
                for image_path in image_paths
            ]
            for future in  tqdm(as_completed(futures), total=len(futures), desc="Augmenting images"):
                future.result()

            # process remaining values
            futures2 = [
                executor.submit(process_and_save_image, image_path, output_subfolder, augment_func, 1, None, "02")
                for image_path in image_paths[:reminaing_augments_count]
            ]
            for future in  tqdm(as_completed(futures2), total=len(futures2), desc="Augmenting images"):
                future.result()

#augment images for files specified in lines of file
def augment_images_in_file(input_folder, file_path, augment_func, image_size=None, num_augmented_images_per_original=1):
    with open(file_path, 'r') as file:
        image_paths_complex = file.read().splitlines() #cada linha é um path

    image_paths = []
    output_paths = []

    for image_path in image_paths_complex:
        split_name = image_path.split("/")
        output_folder = "/".join(split_name[0:-1])
        file_name = split_name[-1]
        image_paths.append(Path(input_folder + ("" if input_folder[-1] == "/" else "/")  + file_name))
        output_paths.append(Path(output_folder))

    # print(image_paths[0], output_paths[0])

    with ProcessPoolExecutor(max_workers=10) as executor:
        futures = [
            executor.submit(process_and_save_image, image_path, output_folder, augment_func, num_augmented_images_per_original, image_size)
            for image_path, output_folder in zip(image_paths, output_paths)
        ]
        for future in  tqdm(as_completed(futures), total=len(futures), desc="Augmenting images"):
            future.result()

#augment de uma só imagem
def process_and_save_image(image_path, output_dir, augment_func, num_augmented_images_per_original=1, image_size=None, distinguishing_substring="01"):
    try:
        image = cv2.imread(str(image_path))

        if image is None:
            print(f"Failed to read image: {image_path}")
            return
        
        if image_size:
            image = cv2.resize(image, (image_size[0], image_size[1]))  # resize image (if needed)

        for j in range(num_augmented_images_per_original):
            
            aug_image = augment_func(image)
            cv2.imwrite(str(output_dir / f'{image_path.stem}_aug{distinguishing_substring}_{j}{image_path.suffix}'), aug_image)
            # print("image path:", image_path, "Image before:", image, "Image after:", aug_image)
        
    except Exception as e:
        traceback.print_exc()

def split_train_val_test_data(input_path, output_path, copy=True):
    
    input_dir = Path(input_path)
    output_dir = Path(output_path)

    classes = [cls.name for cls in input_dir.iterdir() if cls.is_dir()] # nomes de pastas dentro de input_path sao as classes

    train_val_dir = output_dir / 'train_val'
    test_dir = output_dir / 'test'

    #criar paths se n existem
    for dir_path in [train_val_dir, test_dir]:
        for cls in classes:
            (dir_path / cls).mkdir(parents=True, exist_ok=True)

    # repeat spliiting for each class
    with ProcessPoolExecutor(max_workers=10) as executor:
        futures = [
            executor.submit(split_data, cls, input_dir, train_val_dir, test_dir, copy) for cls in classes]

        for future in  tqdm(as_completed(futures), total=len(futures), desc="Processing classes", unit="class"):
            future.result()

#given one class folder, splits the data inside it to train_val and test dirs
def split_data(class_name, input_dir, train_val_dir, test_dir, copy=True):

        class_dir = input_dir / class_name
        images = [img for img in class_dir.glob('*') if img.suffix.lower() in {'.png', '.jpg', '.jpeg'}]

        print("Dataset class: ", class_name, " N_entries: ", len(images))

        # split into train+val and test
        train_val_images, test_images = train_test_split(images, test_size=Params.test_ratio, random_state=123)

        # Copy/Move files
        with ThreadPoolExecutor(max_workers=5) as executor:
            futures = []
            futures.extend([executor.submit(shutil.copy if copy else shutil.move, img, train_val_dir / class_name / img.name) for img in train_val_images])
            futures.extend([executor.submit(shutil.copy if copy else shutil.move, img, test_dir / class_name / img.name) for img in test_images])
            for future in tqdm(as_completed(futures), total=len(futures), desc=f"Processing {class_name}", unit="file"):
                future.result()

# given an image, with empty (black) space to its right/top, find last_X, first_Y where image isn't black
def find_cropped_image_orig_corners(image, threshold=20):

    height, width, _ = image.shape
    
    #mask each pixel as black or not, if rgb > threshold
    non_black_mask = np.any(image > threshold, axis=2)

    #reduce mask to 1d vector, where each bool represents if the entire row is black, find first True
    first_non_black_row = np.argmax(np.any(non_black_mask, axis=1))

    #reduce mask to 1d vector, where each bool represents if the entire column is black, find first False
    first_black_col = np.argmax(~np.any(non_black_mask, axis=0))

    if first_black_col == 0 and [height - 1][0] != False: # exception when whole width is filled
        first_black_col = width - 1

    return first_black_col, first_non_black_row

def turn_blank_space_black(image, last_X, start_Y):
    
    height, width, _ = image.shape

    regular_sized_tile = np.zeros((height,width,3), dtype=image.dtype) # blank image of fixed size, to fit other image into, so output is always equal

    regular_sized_tile[start_Y: ,:last_X] = image[start_Y: ,:last_X] 
    
    return regular_sized_tile
# given an image, with empty (black) space to its right/top, warp it a random amount, maintaing original image size
# threshold represents leway of rgb for the black part, due to brightness, hue, saturation operations ..., instead of 0,0,0
def augment_random_warp(image, orig_last_X, orig_start_Y):
    
    height, width, _ = image.shape

    x_warp = random.randint(- orig_last_X // 4, (width - orig_last_X) // 2)
    y_warp = random.randint((1 - orig_start_Y) // 2, (height - 1 - orig_start_Y) // 4)

    orig_points = np.array([
        [0, orig_start_Y], # cima - esq
        [orig_last_X, orig_start_Y], # cima-dir
        [0, height - 1], # baixo-esq
        [orig_last_X, height - 1] # baixo-dir
    ], dtype=np.float32)

    warped_points = orig_points + np.array([
        [0, y_warp], # cima - esq
        [x_warp, y_warp], # cima-dir
        [0, 0], # baixo-esq
        [x_warp, 0] # baixo-dir
    ], dtype=np.float32)

    H = cv2.getPerspectiveTransform(orig_points, warped_points)

    new_last_X = orig_last_X + x_warp
    new_start_Y = orig_start_Y + y_warp

    warped_img = cv2.warpPerspective(image, H, (width,height))

    return warped_img, new_last_X, new_start_Y

#perform augment operation to image, changing brightness, hue, stauration, noise, without warping..
def augment_image_without_warp(image):
    image, last_X, start_Y = augment_non_warp_image_aux(image)
    image = turn_blank_space_black(image, last_X, start_Y)
    return image

#perform augment operation to image, changing brightness, hue, stauration, noise, inlcuding warp as well..
def augment_image_with_warp(image):
    image, last_X, start_Y = augment_non_warp_image_aux(image)
    image, new_last_X, new_start_Y = augment_random_warp(image, last_X, start_Y)
    image = turn_blank_space_black(image, new_last_X, new_start_Y)
    return image

#aux func to apply augments that aren't warping
def augment_non_warp_image_aux(image):
    last_X, first_Y = find_cropped_image_orig_corners(image)

    base_seed = np.random.randint(0, 2**32 - 1)
    seed = tf.constant([0, base_seed], dtype=tf.int64)
    image = tf.image.stateless_random_brightness(image, max_delta=Params.brightness_max_delta, seed=seed)
    image = tf.image.stateless_random_contrast(image, lower=1-Params.contrast_delta, upper=1+Params.contrast_delta, seed=seed)
    image = tf.image.stateless_random_saturation(image, lower=1-Params.saturation_delta, upper=1+Params.saturation_delta, seed=seed)
    image = tf.image.stateless_random_hue(image, max_delta=Params.hue_max_delta, seed=seed)
    image = tf.image.random_jpeg_quality(image, min_jpeg_quality=100 - Params.noise_max_delta, max_jpeg_quality=100)
    image = image.numpy().astype(np.uint8)

    return image, last_X, first_Y

def inbetween(minv, val, maxv):
    return min(maxv, max(minv, val))