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

min_horiz_margin = 20
max_horiz_margin = 50

min_vert_margin = 50
max_vert_margin = 150
def process_pieces_img(board_img, corner_points, vec_labels):
    warped_img, pts_dst = CommonData.warp_image(board_img, corner_points, 
                                     inner_length=homography_inner_length, 
                                     top_margin=homography_top_margin, 
                                     other_margin=homography_other_margins * 2)
    
    #obtain pieces images
    pieces = []
    square_size = homography_square_length # size of each square on the board
    top_left = pts_dst[0] # ponto no topo à esq

    for y in range(8):
        vert_margin = homography_square_length * (4 - y /3) # mais altura para elementos no fundo, pois estarão mais distorcidos verticalmente

        for x in range(8):

            horiz_margin_left = homography_square_length * (1 - (x/7)) # mais margem esq para elementos à esq, porque estarão mais distorcidos nesse sentido
            horiz_margin_right = homography_square_length * (x/7) # mais margem dir para elementos à dir, porque estarão mais distorcidos nesse sentido

            if (vec_labels[y*8 + x] == 0.0): # if square is empty, ignore
                pieces.append(None)
                continue

            start_x = int(x * square_size + top_left[0] - horiz_margin_left) # posição inicial deste quadrado, menos uma margem para a esquerda
            end_x = int((start_x + horiz_margin_left) + square_size + horiz_margin_right) # posição inicial deste quadrado, mais uma margem para a direita

            end_y = int(y * square_size + square_size + top_left[1]) # posição inicial deste quadrado,  uma margem para baixo
            start_y = int(end_y - vert_margin) # posição inicial deste quadrado, menos uma margem para cima

            tile = warped_img[start_y : end_y, start_x : end_x] # cols, rows
            if (x > 4): # se quadrado for do lado direito do tabuleiro verticalmente, flip para estar sempre a peça mais próxima da esq do ecrã
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
    
    CommonData.split_OSF_dataset(input_folder, output_subfolders, split_board_pieces)
 
def split_board_pieces(image_path, board_img, corners, vec_labels, output_subfolders):

    pieces = process_pieces_img(board_img, corners, vec_labels)

    for i, piece_photo in enumerate(pieces):
        if piece_photo is None: # só guardar fotos com peças, excluir espaços vazios
            continue
        piece_photo = CommonData.apply_augment_image(piece_photo, piece=True) # aplicar modificações às imagens
        output_folder = output_subfolders[list(Params.fen_to_name.keys()).index(str(int(vec_labels[i])))] # meio pesado, mas funciona
        piece_photo_path = output_folder / f'{image_path.stem}_{i+1}{image_path.suffix}'
        cv2.imwrite(str(piece_photo_path), piece_photo)
   