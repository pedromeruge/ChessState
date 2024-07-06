from process_datasets.includes import *
import pieces_recognition.parameters as Params

#comando:
#python3 main.py /Volumes/BACKUPS/ChessState/OSF_dataset/exemplo/ /Volumes/BACKUPS/ChessState/OSF_dataset/processed/
#python3 main.py /Volumes/BACKUPS/ChessState/OSF_dataset/exemplo/ /Users/peters/Desktop/ChessState/datasets/OSF_dataset/processed/

#corner_points = [top_left, top_right, bottom_left, bottom_right]
def process_empty_space_image(board_img_path, corner_points):
    board_img = cv2.imread(board_img_path, cv2.IMREAD_COLOR)

    warped_img, pts_dst = warp_image(board_img, corner_points, 
                                     inner_length=Params.homography_inner_length, 
                                     top_margin=Params.homography_top_margin, 
                                     other_margin=Params.homography_other_margins)

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

def split_squares(board_img, corner_points):
    squares = []
    jump_size = Params.homography_square_length
    margin = Params.homography_other_margins
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

    with ProcessPoolExecutor() as executor: # processar diferentes imagens em processos separados (CPU heavy)
        futures = [executor.submit(process_image_osf, image_path, json_paths[image_path.stem], empty_folder, occupied_folder)
                   for image_path in image_paths]

        for future in tqdm(as_completed(futures), total=len(futures), desc="Processing images"): # progress bar para saber quantas fotos já foram processadas
            future.result()  # wait for all tasks to complete

def process_image_osf(image_path, json_path, empty_folder, occupied_folder):
    with json_path.open('r') as json_file:
        data = json.load(json_file)

    corners = np.array([data["corners"][1], data["corners"][2], data["corners"][0], data["corners"][3]])
    labels = data["fen"]

    squares = process_empty_space_image(image_path, corners)
    vec_labels = fenToVec(labels)

    for i, square_photo in enumerate(squares):
        output_folder = occupied_folder if vec_labels[i] else empty_folder
        square_photo_path = output_folder / f'{image_path.stem}_{i+1}{image_path.suffix}'
        cv2.imwrite(str(square_photo_path), square_photo)


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
        
    with ProcessPoolExecutor() as executor:
        futures = [executor.submit(process_image_chessred, corner_obj, images, pieces, empty_folder, occupied_folder, input_folder)
                   for corner_obj in corners_obj_list]

        for future in tqdm(as_completed(futures), total=len(futures), desc="Processing images"): # progress bar para saber quantas fotos já foram processadas
            future.result()  # wait for all tasks to complete

def process_image_chessred(corner_obj, images, pieces, empty_folder, occupied_folder, input_folder):

    corners = np.array([corner_obj["corners"]["top_left"], corner_obj["corners"]["top_right"], corner_obj["corners"]["bottom_left"], corner_obj["corners"]["bottom_right"]])
    image_path = input_folder / images[corner_obj["image_id"]]["path"]

    labels = find_range(pieces,"image_id",corner_obj["image_id"])

    squares = process_empty_space_image(image_path, corners)
    vec_labels = listToVec(labels)

    for i, square_photo in enumerate(squares):
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
def augment_images_in_dir(input_dataset_folder, output_augmented_folder, num_new_img_per_original=1):
    input_folder = Path(input_dataset_folder)
    output_folder = Path(output_augmented_folder)
    output_folder.mkdir(parents=True, exist_ok=True)

    image_paths = list(input_folder.glob('*.jpg')) + list(input_folder.glob('*.png')) + list(input_folder.glob('*.jpeg'))

    with ProcessPoolExecutor(max_workers=10) as executor:
        futures = [
            executor.submit(process_and_save_image, image_path, output_folder, num_new_img_per_original)
            for image_path in image_paths
        ]
        for future in  tqdm(as_completed(futures), total=len(futures), desc="Augmenting images"):
            future.result()

#augment de uma só imagem
def process_and_save_image(image_path, output_dir, num_augmented_images_per_original):
    image = cv2.imread(str(image_path))
    image = cv2.resize(image, (100, 100))  # resize image (if needed)
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    image = image.astype(np.float32) / 255.0  # normalize to [0, 1] before augment operations

    for j in range(num_augmented_images_per_original):
        aug_image = apply_augment_image(image)
        aug_image = (aug_image.numpy() * 255).astype(np.uint8)  # rescale to [0, 255] (denormalize)
        aug_image = cv2.cvtColor(aug_image, cv2.COLOR_RGB2BGR)  # Convert back to BGR
        cv2.imwrite(str(output_dir / f'{image_path.stem}_aug_{j}{image_path.suffix}'), aug_image)

#perform augment operation to image
def apply_augment_image(image):
    image = tf.image.random_flip_left_right(image)
    image = tf.image.random_flip_up_down(image)
    image = tf.image.random_brightness(image, max_delta=0.2)
    image = tf.image.random_contrast(image, lower=0.8, upper=1.2)
    image = tf.image.random_saturation(image, lower=0.8, upper=1.2)
    image = tf.image.random_hue(image, max_delta=0.2)
    return image