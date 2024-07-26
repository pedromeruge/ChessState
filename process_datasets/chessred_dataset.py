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

    labels = CommonData.find_range(pieces,"image_id",corner_obj["image_id"])
    vec_labels = CommonData.listToVec(labels)

    corners, vec_labels = CommonData.reorder_chessboard(corners, vec_labels) #ordenar os cantos para peças ficarem na vertical, e ordenar labels de peças de acordo

    board_img = cv2.imread(image_path, cv2.IMREAD_COLOR)
    
    squares = SquaresData.process_squares_img(board_img, corners)

    for i, square_photo in enumerate(squares):
        square_photo = CommonData.apply_augment_image(square_photo) # aplicar modificações às imagens
        output_folder = occupied_folder if vec_labels[i] else empty_folder
        square_photo_path = output_folder / f'{image_path.stem}_{i+1}{image_path.suffix}'
        cv2.imwrite(str(square_photo_path), square_photo)
