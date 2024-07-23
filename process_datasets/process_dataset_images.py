from numpy import square
from process_datasets.includes import *
import pieces_recognition.parameters as PiecesParams
import process_datasets.parameters as Params

#comando:
# python3 main.py /Volumes/BACKUPS/ChessState/OSF_dataset/exemplo/ /Volumes/BACKUPS/ChessState/OSF_dataset/processed/
# python3 main.py /Volumes/BACKUPS/ChessState/OSF_dataset/exemplo/ /Users/peters/Desktop/ChessState/datasets/OSF_dataset/processed/

#corner_points = [top_left, top_right, bottom_left, bottom_right]
def process_squares_img(board_img, corner_points):

    warped_img, pts_dst = warp_image(board_img, corner_points, 
                                     inner_length=PiecesParams.homography_inner_length, 
                                     top_margin=PiecesParams.homography_top_margin, 
                                     other_margin=PiecesParams.homography_other_margins)
    
    squares_imgs = split_squares(warped_img, pts_dst)

    # show_result(squares_imgs, writeToFile=False)
    
    return squares_imgs

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

    return im_out, pts_dst

#warp 2d points defined in np array, given homography matrix
def warp_points(points, homography_matrix):

    # add third col with val 1 to (x,y) coordinates
    points_homogeneous = np.hstack((points, np.ones((points.shape[0], 1))))
    
    # multiply points by matrix
    transformed_points_homogeneous = homography_matrix @ points_homogeneous.T
    
    # remove last row, convert back to cartesian
    transformed_points_cartesian = (transformed_points_homogeneous[:2] / transformed_points_homogeneous[2]).T
    
    return transformed_points_cartesian

def split_squares(board_img, corner_points):
    squares = []
    jump_size = PiecesParams.homography_square_length
    margin = PiecesParams.homography_other_margins
    top_left = corner_points[0]

    for y in range(8):
        for x in range(8):
            start_x = int(x * jump_size)
            end_x = int(start_x + jump_size*2)
            start_y = int(top_left[1] - margin + y * jump_size)
            end_y = int(start_y + jump_size*2)

            tiles = board_img[start_y : end_y, start_x : end_x] # cols, rows
            squares.append(tiles)

    return np.array(squares)

def show_result(chess_squares, writeToFile=False):

    #write result squares to file
    if (writeToFile):
        out_path = sys.argv[2]
        Path(out_path).mkdir(parents=True, exist_ok=True)

        for i, square in enumerate(chess_squares):
            final_path = out_path + "save/" + int(i)
            cv2.imwrite(final_path, square)

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

#iterar por imagens de OSF_dataset
def process_OSF_dataset(input_folder_path, output_folder_path):
    if len(sys.argv) != 3:
        raise Exception("main.py <input_dataset_folder> <output_folder_path>")
    
    input_folder = Path(input_folder_path)
    output_folder = Path(output_folder_path)
    empty_folder = output_folder / 'empty'
    occupied_folder = output_folder / 'occupied'

    empty_folder.mkdir(parents=True, exist_ok=True)
    occupied_folder.mkdir(parents=True, exist_ok=True)

    image_paths = list(input_folder.glob('*.jpg')) + list(input_folder.glob('*.png')) + list(input_folder.glob('*.jpeg'))
    json_paths = {path.stem: input_folder / f'{path.stem}.json' for path in image_paths}  # corresponder cada png a um json 

    with ProcessPoolExecutor(max_workers=10) as executor: # processar diferentes imagens em processos separados (CPU heavy)
        futures = [executor.submit(process_image_osf, image_path, json_paths[image_path.stem], empty_folder, occupied_folder)
                   for image_path in image_paths]

        for future in tqdm(as_completed(futures), total=len(futures), desc="Processing images"): # progress bar para saber quantas fotos já foram processadas
            future.result()  # wait for all tasks to complete

#process only photos for corrupted files described in txt (result of running check_img_val.py script)
def process_OSF_dataset_files_in_txt(input_folder_path, output_folder_path, input_txt):

    input_folder = Path(input_folder_path)

    with open(input_txt,'r') as input_file:
        image_json_paths = dict()

        for line in input_file:
            if not line.startswith("Corrupted image file:"):
                continue
            match = re.search(r"(\/.*\/)(.*?)_\d{1,2}(\.\w+)",line)
            if (match == -1):
                raise Exception("File path not correct")
                continue
            # output_folder_path = match.group(1) # ineficiente, mas este script corre poucas vezes
            file_name = match.group(2) + match.group(3) # filename.ext
            image_json_paths[file_name] = (input_folder / file_name, input_folder / (match.group(2) + ".json"))

    output_folder = Path(output_folder_path)
    
    empty_folder = output_folder / 'empty'
    occupied_folder = output_folder / 'occupied'

    empty_folder.mkdir(parents=True, exist_ok=True)
    occupied_folder.mkdir(parents=True, exist_ok=True)

    with ProcessPoolExecutor(max_workers=10) as executor: # processar diferentes imagens em processos separados (CPU heavy)
        futures = [executor.submit(process_image_osf, image_path, json_path, empty_folder, occupied_folder)
                   for (image_path,json_path) in image_json_paths.values()]

        for future in tqdm(as_completed(futures), total=len(futures), desc="Processing images"): # progress bar para saber quantas fotos já foram processadas
            future.result()  # wait for all tasks to complete

def process_image_osf(image_path, json_path, empty_folder, occupied_folder):
    try :
        with json_path.open('r') as json_file:
            data = json.load(json_file)

        corners = np.array([data["corners"][1], data["corners"][2], data["corners"][0], data["corners"][3]]) # ordenado com base em lado branco e preto
        labels = data["fen"]
        vec_labels = fenToVec(labels)

        corners, vec_labels = reorder_chessboard(corners, vec_labels) #ordenar os cantos para peças ficarem na vertical, e ordenar labels de peças de acordo

        board_img = cv2.imread(image_path, cv2.IMREAD_COLOR)
        
        squares = process_squares_img(board_img, corners)

        for i, square_photo in enumerate(squares):
            square_photo = apply_augment_image(square_photo) # aplicar modificações às imagens
            output_folder = occupied_folder if vec_labels[i] else empty_folder
            square_photo_path = output_folder / f'{image_path.stem}_{i+1}{image_path.suffix}'
            cv2.imwrite(str(square_photo_path), square_photo)
    except Exception as e:
        print(e)

#  ordenar cantos e labels de tabuleiro, para ficar posicionado corretamente com peças na vertical
def reorder_chessboard(corners, piece_labels):
    ordered_corners, top_left_idx = sort_corners(corners)
    ordered_labels = sort_labels(piece_labels, top_left_idx)
    return ordered_corners, ordered_labels

#dados 4 cantos no formato [[x,y],[x,y],..], ordenar de forma a obter peças na vertical apos warp

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

#com base na posição onde cima-esq fica, concluir que rotação do tabuleiro foi realizada e ordenar as labels
def sort_labels(piece_labels, top_left_idx):
    board_2d = np.reshape(piece_labels, (8,8))
    idx_to_rot = [0,1,-1,2] # número de rotações 90º clockwise 

    ordered_labels = np.rot90(board_2d, k=idx_to_rot[top_left_idx])   # apply rotation
    return ordered_labels.flatten() # de volta para 1d array

#iterar por imagens de OSF_dataset
def process_ChessReD_dataset(input_folder_path, output_folder_path):
    if len(sys.argv) != 3:
        raise Exception("main.py <input_dataset_folder> <output_folder_path>")
    
    input_folder = Path(input_folder_path)
    output_folder = Path(output_folder_path)
    empty_folder = output_folder / 'empty'
    occupied_folder = output_folder / 'occupied'

    empty_folder.mkdir(parents=True, exist_ok=True)
    occupied_folder.mkdir(parents=True, exist_ok=True)

    json_path = input_folder / "annotations.json"

    with json_path.open('r') as json_file:
        data = json.load(json_file)

    corners_obj_list = data["annotations"]["corners"]
    images = data["images"]
    pieces = data["annotations"]["pieces"]

    # for corner_obj in corners_obj_list:
    #     process_image_chessred(corner_obj, images, pieces, empty_folder, occupied_folder, input_folder)
        
    with ProcessPoolExecutor(max_workers=10) as executor:
        futures = [executor.submit(process_image_chessred, corner_obj, images, pieces, empty_folder, occupied_folder, input_folder)
                   for corner_obj in corners_obj_list]

        for future in tqdm(as_completed(futures), total=len(futures), desc="Processing images"): # progress bar para saber quantas fotos já foram processadas
            future.result()  # wait for all tasks to complete

def process_image_chessred(corner_obj, images, pieces, empty_folder, occupied_folder, input_folder):

    corners = np.array([corner_obj["corners"]["top_left"], corner_obj["corners"]["top_right"], corner_obj["corners"]["bottom_left"], corner_obj["corners"]["bottom_right"]])
    image_path = input_folder / images[corner_obj["image_id"]]["path"]

    labels = find_range(pieces,"image_id",corner_obj["image_id"])
    vec_labels = listToVec(labels)

    corners, vec_labels = reorder_chessboard(corners, vec_labels) #ordenar os cantos para peças ficarem na vertical, e ordenar labels de peças de acordo

    board_img = cv2.imread(image_path, cv2.IMREAD_COLOR)
    
    squares = process_squares_img(board_img, corners)

    for i, square_photo in enumerate(squares):
        square_photo = apply_augment_image(square_photo) # aplicar modificações às imagens
        output_folder = occupied_folder if vec_labels[i] else empty_folder
        square_photo_path = output_folder / f'{image_path.stem}_{i+1}{image_path.suffix}'
        cv2.imwrite(str(square_photo_path), square_photo)

#aux funcs
def fenToVec(fen):
    pieces =    {"P": 1, "N": 2, "B": 3, "R": 4, "Q": 5, "K": 6,
                "p": -1, "n": -2, "b": -3, "r": -4, "q": -5, "k": -6}

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
    pieces = {"0": 1, "1": 4, "2": 2, "3": 3, "4": 5, "5": 6,
            "6": -1, "7": -4, "8": -2, "9": -3, "10": -5, "11": -6}

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
def augment_images_in_dir(input_dataset_folder, output_augmented_folder, num_new_img_per_original=1, max_files_augmented=0):
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
            executor.submit(process_and_save_image, image_path, output_folder, num_new_img_per_original)
            for image_path in image_paths
        ]
        for future in  tqdm(as_completed(futures), total=len(futures), desc="Augmenting images"):
            future.result()

#augment images for files specified in lines of folder
def augment_images_in_file(input_folder, file_path, num_new_img_per_original=1):
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
            executor.submit(process_and_save_image, image_path, output_folder, num_new_img_per_original)
            for image_path, output_folder in zip(image_paths, output_paths)
        ]
        for future in  tqdm(as_completed(futures), total=len(futures), desc="Augmenting images"):
            future.result()

#augment de uma só imagem
def process_and_save_image(image_path, output_dir, num_augmented_images_per_original):

    image = cv2.imread(str(image_path))
    if image is None:
        print(f"Failed to read image: {image_path}")
        return
    
    image = cv2.resize(image, (PiecesParams.image_size, PiecesParams.image_size))  # resize image (if needed)

    for j in range(num_augmented_images_per_original):
        aug_image = apply_augment_image(image)
        cv2.imwrite(str(output_dir / f'{image_path.stem}_aug02_{j}{image_path.suffix}'), aug_image)
        # print("image path:", image_path, "Image before:", image, "Image after:", aug_image)

#perform augment operation to image
def apply_augment_image(image):
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