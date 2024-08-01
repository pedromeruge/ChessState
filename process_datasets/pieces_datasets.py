from numpy import square
from process_datasets.includes import *
import pieces_recognition.parameters as PiecesParams
import process_datasets.parameters as Params
import process_datasets.process_dataset_common as CommonData

"""
    Functions related to creating the pieces dataset that contains images from OSF_dataset and Chess_ReD dataset
"""

homography_square_length = int(PiecesParams.image_size_width / 2) # tamanho de quadrado em que peça se encontra
homography_inner_length = homography_square_length * 8
homography_top_margin = 150 # tamanho excessivamente grande (50*3), para garantir que não se corta peças altas no fundo do tabuleiro
homography_other_margins = homography_square_length

displ_vectors_scale = homography_square_length / 8

#limites das caixas
min_height_box = homography_square_length * 2
max_height_box = homography_square_length * 4

min_width_box = homography_square_length 
max_width_box = homography_square_length * 2

def process_pieces_img(board_img, corner_points, vec_labels):
    warped_img, pts_dst, _ = CommonData.warp_image(board_img, corner_points, 
                                     inner_length=homography_inner_length, 
                                     top_margin=homography_top_margin, 
                                     other_margin=homography_other_margins * 2)
    
    #obtain pieces images
    pieces = []
    square_size = homography_square_length # size of each square on the board
    top_left = pts_dst[0] # ponto no topo à esq
    
    displacement_vectors = corner_points - pts_dst # vetores que indicam quanto cada canto foi distorcido na foto final

    height_width_ratio = PiecesParams.image_size_height / PiecesParams.image_size_width

    max_disp = { # max_displacament em cada sentido
        'left': max(displacement_vectors[0][0], displacement_vectors[2][0]) / (displ_vectors_scale * height_width_ratio * 0.6),
        'right': max(displacement_vectors[1][0], displacement_vectors[3][0]) / (displ_vectors_scale * height_width_ratio * 0.6),
        'top': max(displacement_vectors[0][1], displacement_vectors[1][1]) / (displ_vectors_scale * 0.6),
        'bottom': max(displacement_vectors[2][1], displacement_vectors[3][1]) / displ_vectors_scale
    }

    # print(max_disp)

    for y in range(8):

        vert_margin = (homography_square_length + max_disp['top']) * (2.5 - y/7)  # mais altura para elementos no fundo, pois estarão mais distorcidos verticalmente, também tem em conta se imagem está mais ou menos verticalmente distorcida
        vert_margin = CommonData.inbetween(min_height_box, vert_margin, max_height_box)

        for x in range(8):

            horiz_margin_left = max_disp['left'] * (1 - x/7)  # mais margem esq para elementos à esq, porque estarão mais distorcidos nesse sentido,  também tem em conta se imagem está mais ou menos verticalmente distorcida para a esq
            horiz_margin_right = max_disp['right'] * (x/7)  # mais margem dir para elementos à dir, porque estarão mais distorcidos nesse sentido,  também tem em conta se imagem está mais ou menos verticalmente distorcida para a dir

            horiz_margin = (horiz_margin_left + square_size) + horiz_margin_right # ir desde lado da esq do quadrado (ja incluída a margem esq extra) até ao outro lado do quadrado, com a margem extra da dir
            horiz_margin = CommonData.inbetween(min_width_box, horiz_margin, max_width_box)

            if (vec_labels[y*8 + x] == 0.0): # if square is empty, ignore
                pieces.append(None)
                continue

            start_x = int(x * square_size + top_left[0] - horiz_margin_left) # posição inicial deste quadrado, menos uma margem para a esquerda
            end_x = int(start_x + horiz_margin) # posição inicial deste quadrado, mais uma margem para a direita

            end_y = int((y + 1) * square_size + top_left[1]) # posição inicial deste quadrado,  uma margem para baixo
            start_y = int(end_y - vert_margin) # posição inicial deste quadrado, menos uma margem para cima

            tile = warped_img[start_y : end_y, start_x : end_x] # cols, rows
            
            if (x > 4): # se quadrado for do lado direito do tabuleiro verticalmente, flip para estar sempre a peça relevante mais próxima da esq do ecrã
                tile = cv2.flip(tile, 1)

            regular_sized_tile = np.zeros((PiecesParams.image_size_height,PiecesParams.image_size_width,3), dtype=tile.dtype) # blank image of fixed size, to fit other image into

            height,width,_ = tile.shape
            regular_sized_tile[-height: ,:width] = tile

            pieces.append(regular_sized_tile)

    return np.array(pieces, dtype=object)
    # show_result(squares_imgs, writeToFile=False)

#obtain dataset of split and separated images of differente piece types in OSF dataset
def process_OSF_dataset_pieces(input_folder_path, output_folder_path):
    if len(sys.argv) != 3:
        raise Exception("main.py <input_dataset_folder> <output_folder_path>")
    
    input_folder = Path(input_folder_path)
    output_folder = Path(output_folder_path)

    output_subfolders = []
    for piece in Params.fen_to_name.values():
        piece_subfolder = output_folder / piece
        piece_subfolder.mkdir(parents=True, exist_ok=True)
        output_subfolders.append(piece_subfolder)
    
    CommonData.split_OSF_dataset(input_folder, output_subfolders, split_board_pieces, augment_piece_image)
 
def split_board_pieces(image_path, board_img, corners, vec_labels, output_subfolders, augment_func):

    pieces = process_pieces_img(board_img, corners, vec_labels)

    for i, piece_photo in enumerate(pieces):
        if piece_photo is None: # só guardar fotos com peças, excluir espaços vazios
            continue
        piece_photo = augment_func(piece_photo) # aplicar modificações às imagens
        output_folder = output_subfolders[list(Params.fen_to_name.keys()).index(str(int(vec_labels[i])))] # meio pesado, mas funciona
        piece_photo_path = output_folder / f'{image_path.stem}_{i+1}{image_path.suffix}'
        cv2.imwrite(str(piece_photo_path), piece_photo)
   
#perform augment operation to image
def augment_piece_image(image):
    base_seed = np.random.randint(0, 2**32 - 1)
    seed = tf.constant([0, base_seed], dtype=tf.int64)
    image = tf.image.stateless_random_brightness(image, max_delta=Params.brightness_max_delta, seed=seed)
    image = tf.image.stateless_random_contrast(image, lower=1-Params.contrast_delta, upper=1+Params.contrast_delta, seed=seed)
    image = tf.image.stateless_random_saturation(image, lower=1-Params.saturation_delta, upper=1+Params.saturation_delta, seed=seed)
    image = tf.image.stateless_random_hue(image, max_delta=Params.hue_max_delta, seed=seed)
    image = tf.image.random_jpeg_quality(image, min_jpeg_quality=100 - Params.noise_max_delta, max_jpeg_quality=100)
    #tp.image. warp??
    image = image.numpy().astype(np.uint8)
    return image