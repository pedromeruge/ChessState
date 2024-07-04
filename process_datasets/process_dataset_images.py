from process_datasets.includes import *
import pieces_recognition.parameters as Params

#corner_points = [top_left, top_right, bottom_left, bottom_right]
def process_empty_space_image(board_img_path, corner_points):
    board_img = cv2.imread(board_img_path, cv2.IMREAD_COLOR)

    warped_img, pts_dst = warp_image(board_img, corner_points, inner_length=Params.homography_inner_length, top_margin=Params.homography_top_margin, other_margin=Params.homography_other_margins)

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

    im_out = cv2.warpPerspective(img, h, (inner_length + 2*other_margin, inner_length + top_margin + other_margin))

    return im_out, pts_dst

def split_squares(board_img, corner_points):
    squares = []
    jump_size = Params.homography_square_length
    margin = Params.homography_other_margins
    top_left = corner_points[0]

    for y in range(0, 8):
        for x in range(0, 8):
            start_x = int(x * jump_size)
            end_x = int(start_x + jump_size*2)
            start_y = int(top_left[1] - margin + y * jump_size)
            end_y = int(start_y + jump_size*2)

            tiles = board_img[start_y : end_y, start_x : end_x] # cols, rows
            squares.append(tiles)

    squares = np.array(squares)
    return squares

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

    for image_path in input_folder.glob('*.png'):
        base_name = image_path.stem
        json_path = input_folder / f'{base_name}.json'

        if json_path.exists():
            with json_path.open('r') as json_file:
                data = json.load(json_file)

            corners = data["corners"] #baixo-esq, cima-esq, cima-dir, baixo-dir (com baixo a ser os brancos sempre)
            corners = np.array([corners[1], corners[2], corners[0], corners[3]])# precisamos de corners na ordem cima-esq, cima-dir, baixo-esq, baixo-dir

            labels = data["fen"]

            squares = process_empty_space_image(image_path, corners)

            vec_labels = fenToVec(labels)

            for i, square_photo in enumerate(squares):
                if vec_labels[i]:
                    output_folder = occupied_folder
                else:
                    output_folder = empty_folder
                
                square_photo_path = str(output_folder / f'{base_name}_{i+1}{image_path.suffix}')
                cv2.imwrite(square_photo_path, square_photo)

pieces =    {"P": 1, "N": 2, "B": 3, "R": 4, "Q": 5, "K": 6,
             "p": -1, "n": -2, "b": -3, "r": -4, "q": -5, "k": -6}

def fenToVec(fen):

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
