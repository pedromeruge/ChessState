from numpy import square
from process_datasets.includes import *
import pieces_recognition.parameters as PiecesParams
import process_datasets.parameters as Params
import process_datasets.process_dataset_common as CommonData
import print_funcs.print_funcs as Prints


"""
    Functions related to creating the pieces dataset that contains images from OSF_dataset and Chess_ReD dataset
"""

homography_square_length = int(PiecesParams.image_size_width / 2) # tamanho de quadrado em que peça se encontra


homography_inner_length = homography_square_length * 8
homography_top_margin = homography_square_length * 5 # tamanho excessivamente grande (50*5), para garantir que não se corta peças altas no fundo do tabuleiro
homography_other_margins = homography_square_length

# margins/limits of cropped pieces
min_height_increase = 1
max_base_height_increase = 3 # height from multiplying a base height by the current line
max_height_increase = 5 # max height, considering the previous base_height increase, plus the disp_vector increase

min_width_increase = 0
max_base_width_increase = .5 # height from multilpying a base width for the current col
max_width_increase = 1 # max_height, considering the perivous base_width, plus the rotation increase

out_height = (1 + max_height_increase) * homography_square_length # output height
out_width = (1 + max_width_increase) * homography_square_length # output width

# crop board pieces based on:
# estimated rotation from comparing before and after chessboard top line slopes
# estimated scale from comparing max y value of vector difference between original and final corner points
# efficient
# decent results

def process_pieces_img(board_img, corner_points, vec_labels):
    try:
        warped_img, pts_dst, H = CommonData.warp_image(board_img, corner_points, 
                                        inner_length=homography_inner_length, 
                                        top_margin=homography_top_margin, 
                                        other_margin=homography_other_margins * 2)
        
        pieces = []
        square_size = homography_square_length # size of each square on the board
        chessboard_size = homography_inner_length
        top_left = pts_dst[0] # top left point

        #scalars to calculate extra margins for each piece crop
        horiz_scalar, vert_scalar =  calculate_image_scalars(board_img, corner_points, warped_img, pts_dst)

        for y in range(8):

            vert_increase = min_height_increase + ((max_height_increase - min_height_increase) + (vert_scalar / chessboard_size)) * (1 - y/7)  # more height for elements further back, since they are generally more distorted
            vert_increase = min(vert_increase, max_height_increase)

            for x in range(8):
                
                if (vec_labels[y*8 + x] == 0.0): # if square is empty, ignore
                    pieces.append(None)
                    continue
        
                if ( x < 4): # more left width for elements further left, since they are generally more distorted
                    left_increase = min_width_increase + (max_base_width_increase - min_width_increase) * (1 - x/3)
                    right_increase = 0
                else: # more right width for elements further right, since they are generally more distorted
                    left_increase = 0
                    right_increase = min_width_increase + (max_base_width_increase - min_width_increase) * ((x - 4)/3)

                if (horiz_scalar > 0): # more left width, due to positive rotation
                    horiz_scalar_increase = max(horiz_scalar * (1 - x/7), max_width_increase - max_base_width_increase) # guarantees that the extra width from the rotation does not surpass the max_width_allowed
                    left_increase = left_increase + horiz_scalar_increase
                else:
                    horiz_scalar_increase = max(abs(horiz_scalar) * (x/7), max_width_increase - max_base_width_increase) # guarantees that the extra width from the rotation does not surpass the max_width_allowed
                    right_increase = right_increase + horiz_scalar_increase

                start_x = int(square_size * (x - left_increase) + top_left[0]) # posição inicial deste quadrado, menos uma margem para a esquerda
                end_x = int(square_size * (x + 1 + right_increase) + top_left[0]) # posição final deste quadrado, mais uma margem para a direita

                start_y = int((y - vert_increase) * square_size + top_left[1]) # posição inicial deste quadrado, menos uma margem para cima
                end_y = int((y + 1) * square_size + top_left[1]) # posição final do quadrado

                tile = warped_img[start_y : end_y, start_x : end_x] # cols, rows
                
                if (x > 4): # se quadrado for do lado direito do tabuleiro verticalmente, flip para estar sempre a peça relevante mais próxima da esq do ecrã
                    tile = cv2.flip(tile, 1)

                regular_sized_tile = np.zeros((out_height,out_width,3), dtype=tile.dtype) # blank image of fixed size, to fit other image into

                height,width,_ = tile.shape
                regular_sized_tile[-height: ,:width] = tile

                pieces.append(regular_sized_tile)

        # Prints.show_result(warped_img, output_path="~/Desktop/save/")
        return np.array(pieces, dtype=object)
    
    except Exception as e:
        traceback.print_exc()

#calculate left,right and top margins to add to cropped piece of the image:
def calculate_image_scalars(orig_img, orig_points, final_img, final_points):

    orig_height, orig_width, _ = orig_img.shape
    final_height, final_width, _ =final_img.shape

# vertical margin scalar, calculated from displacement vectors between orig and final corner positioins, 4 vectors are summed um, extracting abs(y) of resulting vector
    width_ratio, height_ratio = (orig_width / final_width) , (orig_height / final_height)

    scale_matrix = np.array([[width_ratio, 0],
                            [0, height_ratio]])
    
    final_points = final_points @ scale_matrix

    displacement_vectors = final_points - orig_points # vetores que indicam quanto cada canto foi distorcido na foto final, tendo em conta escala das imagens antes e depois
    sum_disp_vectors = np.sum(displacement_vectors, axis=0) # sum x and y

    vertical_scalar = abs(sum_disp_vectors[1])

# horiz margin scalar, calculated from estimated rotation of top corner of before and after images
    orig_top_vec = orig_points[1] - orig_points[0]
    final_top_vec = final_points[1] - final_points[0]

    normal_orig_top_vec = orig_top_vec / np.linalg.norm(orig_top_vec) # assumed that vectors have non null norm
    normal_final_top_vec = final_top_vec / np.linalg.norm(final_top_vec)

    horiz_scalar = np.cross(normal_orig_top_vec, normal_final_top_vec) # cross product gives scalar that reflects angle of rotation of warp

    return horiz_scalar, vertical_scalar

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

#aux funcs 

#calculate weighted average vector based on position in grid
def calculate_displacement_vector(col, row, disp_vectors: np.array):

    """
    col: current column in grid
    row: current row in grid
    disp_vectors: 4 displacement vectors for each corner of the chessboard, in np.array
    """

    x_normalized = (col + 1) / 8
    y_normalized = (row + 1) / 8

    top_disp = (1 - x_normalized) * disp_vectors[0] + x_normalized * disp_vectors[1]
    bottom_disp = (1 - x_normalized) * disp_vectors[2] + x_normalized * disp_vectors[3]
    final_disp = (1 - y_normalized) * top_disp + y_normalized * bottom_disp

    return final_disp



# IDEA 2:
# crop board pieces based on vector difference and bilinear interpolation between original and final points
# in some perspective warps, vectors could go in complete wrong directions
# correct vertical margins, wrong horizontal margins
# efficient

# def process_pieces_img2(board_img, corner_points, vec_labels):
#     try:
#         warped_img, pts_dst, h = CommonData.warp_image(board_img, corner_points, 
#                                         inner_length=homography_inner_length, 
#                                         top_margin=homography_top_margin, 
#                                         other_margin=homography_other_margins * 2)
        
#         #obtain pieces images
#         pieces = []
#         square_size = homography_square_length # size of each square on the board
#         top_left = pts_dst[0] # ponto no topo à esq

#         orig_height, orig_width, _ = board_img.shape
#         final_height, final_width, _ = warped_img.shape

#         sx, sy = (orig_width / final_width) , (orig_height / final_height)

#         scale_matrix = np.array([[sx, 0],
#                                 [0, sy]])
        
#         pts_dst = pts_dst @ scale_matrix

#         displacement_vectors = pts_dst - corner_points # vetores que indicam quanto cada canto foi distorcido na foto final, tendo em conta escala das imagens antes e depois
#         # displacement_vectors[:,1] = (lambda x: - abs(x))(displacement_vectors[:, 1]) # fazer com que todos as coordenadas verticais apontem para cima, visto que peças só podem ser esticadas para cima

#         cdst = Prints.print_vectors(board_img, corner_points, pts_dst, Prints.color_green, Prints.color_red)
#         Prints.show_result(cdst, output_path="~/Desktop/save/")
#         # Prints.show_result(warped_img, output_path="~/Desktop/save/")

#         for y in range(8):
#             for x in range(8):

#                 curr_displacement = calculate_displacement_vector(x,y, displacement_vectors)
#                 curr_displacement[1] = - abs(curr_displacement[1])

#                 print(curr_displacement)

#                 vert_margin = 5 * (1 - y/7)   # mais altura para elementos no fundo, pois estarão mais distorcidos verticalmente, também tem em conta se imagem está mais ou menos verticalmente distorcida
#                 vert_margin = CommonData.inbetween(min_height_box, vert_margin, max_height_box)

#                 horiz_margin_left = 0  # mais margem esq para elementos à esq, porque estarão mais distorcidos nesse sentido,  também tem em conta se imagem está mais ou menos verticalmente distorcida para a esq
#                 horiz_margin_right = 5 * (x/7)  # mais margem dir para elementos à dir, porque estarão mais distorcidos nesse sentido,  também tem em conta se imagem está mais ou menos verticalmente distorcida para a dir

#                 horiz_margin = (horiz_margin_left + square_size) + horiz_margin_right # ir desde lado da esq do quadrado (ja incluída a margem esq extra) até ao outro lado do quadrado, com a margem extra da dir
#                 horiz_margin = CommonData.inbetween(min_width_box, horiz_margin, max_width_box)

#                 if (vec_labels[y*8 + x] == 0.0): # if square is empty, ignore
#                     pieces.append(None)
#                     continue

#                 start_x = int(x * square_size + top_left[0] - horiz_margin_left) # posição inicial deste quadrado, menos uma margem para a esquerda
#                 end_x = int(start_x + horiz_margin) # posição inicial deste quadrado, mais uma margem para a direita

#                 end_y = int((y + 1) * square_size + top_left[1]) # posição inicial deste quadrado,  uma margem para baixo
#                 start_y = int(end_y - vert_margin) # posição inicial deste quadrado, menos uma margem para cima

#                 #Print vector displacement direction for each square
#                 middle_x = ((x * square_size + (x + 1) * square_size) / 2) + top_left[0]
#                 middle_y = ((y * square_size + (y + 1) * square_size) / 2) + top_left[1]
#                 cdst = Prints.print_vectors(warped_img, np.array([[int(middle_x), int(middle_y)]]), np.array([[int(middle_x + curr_displacement[0]), int(middle_y + curr_displacement[1])]]), Prints.color_yellow, Prints.color_red)

#         Prints.show_result(warped_img, output_path="~/Desktop/save/")

#         return np.array(pieces, dtype=object)
    
#     except Exception as e:
#         traceback.print_exc()

# # IDEA 3:
# # crop board pieces based on estimated rotation and scale provided by the homography matrix
# # angles worked decently
# # correct horizontal margins, wrong vertical margins
# # costly
# def process_pieces_img3(board_img, corner_points, vec_labels):
#     try:
#         warped_img, pts_dst, H = CommonData.warp_image(board_img, corner_points, 
#                                         inner_length=homography_inner_length, 
#                                         top_margin=homography_top_margin, 
#                                         other_margin=homography_other_margins * 2)
        
#         #obtain pieces images
#         pieces = []
#         square_size = homography_square_length # size of each square on the board
#         top_left = pts_dst[0] # ponto no topo à esq

#         orig_height, orig_width, _ = board_img.shape
#         final_height, final_width, _ = warped_img.shape

#         width_ratio, height_ratio = (orig_width / final_width) , (orig_height / final_height)
        
#         #adjust homography matrix to account for the ratio difference between images
#         H_adjusted = H.copy()
#         H_adjusted[0, :] /= width_ratio
#         H_adjusted[1, :] /= height_ratio

#         # normalize matrix
#         H_adjusted = H_adjusted / H_adjusted[2, 2]

#         rot_scale_matrix = H[:2, :2]

#         # Use SVD to decompose R_S into rotation and scaling
#         # this assumes the before and after images are in the same plane, so values won't be exact but an estimation

#         U, sigma, Vt = np.linalg.svd(rot_scale_matrix)

#         R = np.dot(U, Vt)

#         # Scaling factors
#         scale_x, scale_y = sigma

#         #rotation angle
#         rotation_angle = np.rad2deg(np.arctan2(R[1, 0], R[0, 0]))

#     except Exception as e:
#         traceback.print_exc()
