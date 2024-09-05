from numpy import square
from process_datasets.includes import *
import squares_recognition.parameters as PiecesParams
import process_datasets.parameters as Params
import process_datasets.pieces_datasets as PiecesData
import process_datasets.squares_datasets as SquaresData
import process_datasets.process_dataset_common as CommonData

"""
    Functions related to processing images from the OSF dataset
"""

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

    split_OSF_dataset(input_folder, output_subfolders, SquaresData.split_board_squares, SquaresData.augment_square_image)

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
    
    split_OSF_dataset(input_folder, output_subfolders, PiecesData.split_board_pieces, CommonData.augment_image_without_warp)
    
#split all images in the osf_dataset, given a split function
def split_OSF_dataset(input_folder, output_subfolders, split_func, augment_func=None):
    image_paths = list(input_folder.glob('*.jpg')) + list(input_folder.glob('*.png')) + list(input_folder.glob('*.jpeg'))
    json_paths = {path.stem: input_folder / f'{path.stem}.json' for path in image_paths}  # corresponder cada png a um json 

    with ProcessPoolExecutor(max_workers=10) as executor: # processar diferentes imagens em processos separados (CPU heavy)
        futures = [executor.submit(process_single_img_osf, image_path, json_paths[image_path.stem], output_subfolders, split_func, augment_func)
                   for image_path in image_paths]

        for future in tqdm(as_completed(futures), total=len(futures), desc="Processing images"): # progress bar para saber quantas fotos já foram processadas
            future.result()  # wait for all tasks to complete
    
#receives either split_board_squares or split_board_pieces funcs, to split the squares or pieces of an image of the osf dataset
def process_single_img_osf(image_path, json_path, output_subfolders, split_func, augment_func=None):
    try :
        with json_path.open('r') as json_file:
            data = json.load(json_file)

        corners = np.array([data["corners"][1], data["corners"][2], data["corners"][0], data["corners"][3]]) # ordenado com base em lado branco e preto
        labels = data["fen"]
        vec_labels = CommonData.fenToVec(labels)

        corners, vec_labels = CommonData.reorder_chessboard(corners, vec_labels) #ordenar os cantos para peças ficarem na vertical, e ordenar labels de peças de acordo

        board_img = cv2.imread(image_path, cv2.IMREAD_COLOR)
        
        split_func(image_path, board_img, corners, vec_labels, output_subfolders, augment_func)
        
    except Exception as e:
        print(e)
