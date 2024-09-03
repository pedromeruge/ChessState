from numpy import square
from process_datasets.includes import *
import squares_recognition.parameters as SquaresParams
import process_datasets.parameters as Params

"""
    Common functions related to processing images to build datasets
"""

homography_square_length = int(SquaresParams.image_size / 2)  # tamanho de quadrado
homography_inner_length = homography_square_length * 8
homography_top_margin = 150 # tamanho excessivamente grande (50*3), para garantir que não se corta peças altas no fundo do tabuleiro
homography_other_margins = int(homography_square_length / 2)


def warp_image(img, corner_points, inner_length=400, top_margin=150, other_margin=25):

    bottom_row = top_margin + inner_length
    right_col = inner_length + other_margin
    pts_dst = np.array([
        [other_margin, top_margin], # cima - esq
        [right_col, top_margin], # cima-dir
        [other_margin, bottom_row], # baixo-esq
        [right_col, bottom_row] # baixo-dir
    ], dtype=float)

    h, _ = cv2.findHomography(corner_points, pts_dst)

    im_out = cv2.warpPerspective(img, h, (right_col + other_margin, bottom_row + other_margin))

    return im_out, pts_dst, h

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

#criar novas entradas
def augment_images_in_dir(input_dataset_folder, output_augmented_folder, augment_func, num_new_img_per_original=1, max_files_augmented=0):
    input_folder = Path(input_dataset_folder)
    output_folder = Path(output_augmented_folder)
    output_folder.mkdir(parents=True, exist_ok=True)

    image_paths = list(input_folder.glob('*.jpg')) + list(input_folder.glob('*.png')) + list(input_folder.glob('*.jpeg'))

    if (max_files_augmented > 0):
        image_paths = image_paths[:max_files_augmented]

    #do not create augmentations for images that already have them -> only needed for cases where augmentaiton had an error mid way through
    # def needs_augmentation(image_path):
    #     for j in range(num_new_img_per_original):
    #         aug_image_path = output_folder / f'{image_path.stem}_aug_{j}{image_path.suffix}'
    #         if not aug_image_path.exists():
    #             return True # if at least one of the augmentation images is missing, return that it needs augmentation again
    #     return False

    # image_paths = [path for path in image_paths if needs_augmentation(path)]

    # print(image_paths[:1000])

    with ProcessPoolExecutor(max_workers=10) as executor:
        futures = [
            executor.submit(process_and_save_image, image_path, output_folder, augment_func, num_new_img_per_original)
            for image_path in image_paths
        ]
        for future in  tqdm(as_completed(futures), total=len(futures), desc="Augmenting images"):
            future.result()

#augment images for files specified in lines of folder
def augment_images_in_file(input_folder, file_path, augment_func, image_size=None, num_new_img_per_original=1):
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
            executor.submit(process_and_save_image, image_path, output_folder, num_new_img_per_original, augment_func, image_size)
            for image_path, output_folder in zip(image_paths, output_paths)
        ]
        for future in  tqdm(as_completed(futures), total=len(futures), desc="Augmenting images"):
            future.result()

#augment de uma só imagem
def process_and_save_image(image_path, output_dir, num_augmented_images_per_original, augment_func, image_size=None):

    image = cv2.imread(str(image_path))
    if image is None:
        print(f"Failed to read image: {image_path}")
        return
    
    if image_size:
        image = cv2.resize(image, (image_size[0], image_size[1]))  # resize image (if needed)

    for j in range(num_augmented_images_per_original):
        aug_image = augment_func(image)
        cv2.imwrite(str(output_dir / f'{image_path.stem}_aug02_{j}{image_path.suffix}'), aug_image)
        # print("image path:", image_path, "Image before:", image, "Image after:", aug_image)

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

def inbetween(minv, val, maxv):
    return min(maxv, max(minv, val))