from numpy import square
from process_datasets.includes import *
import squares_recognition.parameters as PiecesParams
import process_datasets.parameters as Params
import process_datasets.pieces_datasets as PiecesData
import process_datasets.squares_datasets as SquaresData
import process_datasets.process_dataset_common as CommonData

"""
    Functions related to processing images from the ChessReD_dataset
"""

#iterar por imagens de OSF_dataset
def process_ChessReD_dataset_squares(input_folder_path, output_folder_path):
    if len(sys.argv) != 3:
        raise Exception("main.py <input_dataset_folder> <output_folder_path>")
    
    input_folder = Path(input_folder_path)
    output_folder = Path(output_folder_path)
    empty_folder = output_folder / 'empty'
    occupied_folder = output_folder / 'occupied'

    empty_folder.mkdir(parents=True, exist_ok=True)
    occupied_folder.mkdir(parents=True, exist_ok=True)

    output_subfolders = [empty_folder, occupied_folder]

    split_ChessReD_dataset(input_folder, output_subfolders, SquaresData.split_board_squares, SquaresData.augment_square_image)

#iterar por imagens de OSF_dataset
def process_ChessReD_dataset_pieces(input_folder_path, output_folder_path):
    if len(sys.argv) != 3:
        raise Exception("main.py <input_dataset_folder> <output_folder_path>")
    
    input_folder = Path(input_folder_path)
    output_folder = Path(output_folder_path)
    
    output_subfolders = []
    for piece in Params.fen_to_name.values():
        piece_subfolder = output_folder / piece
        piece_subfolder.mkdir(parents=True, exist_ok=True)
        output_subfolders.append(piece_subfolder)
    
    split_ChessReD_dataset(input_folder, output_subfolders, PiecesData.split_board_pieces, PiecesData.augment_image)

def split_ChessReD_dataset(input_folder, output_subfolders, split_func, augment_func=None):
    json_path = input_folder / "annotations.json"

    with json_path.open('r') as json_file:
        data = json.load(json_file)

    corners_obj_list = data["annotations"]["corners"]
    images = data["images"]
    pieces = data["annotations"]["pieces"]

    with ProcessPoolExecutor(max_workers=10) as executor:
        futures = [executor.submit(process_single_img_chessred, corner_obj, images, pieces, output_subfolders, input_folder, split_func, augment_func)
                   for corner_obj in corners_obj_list]

        for future in tqdm(as_completed(futures), total=len(futures), desc="Processing images"): # progress bar para saber quantas fotos já foram processadas
            future.result()  # wait for all tasks to complete

def process_single_img_chessred(corner_obj, images, pieces, output_subfolders, input_folder, split_func, augment_func=None):
    try :
        corners = np.array([corner_obj["corners"]["top_left"], corner_obj["corners"]["top_right"], corner_obj["corners"]["bottom_left"], corner_obj["corners"]["bottom_right"]])
        image_path = input_folder / images[corner_obj["image_id"]]["path"]

        labels = CommonData.find_range(pieces,"image_id",corner_obj["image_id"])
        vec_labels = CommonData.listToVec(labels)

        corners, vec_labels = CommonData.reorder_chessboard(corners, vec_labels) #ordenar os cantos para peças ficarem na vertical, e ordenar labels de peças de acordo

        board_img = cv2.imread(image_path, cv2.IMREAD_COLOR)
        
        split_func(image_path, board_img, corners, vec_labels, output_subfolders, augment_func)
                
    except Exception as e:
        print(e)