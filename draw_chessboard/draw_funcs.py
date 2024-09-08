from numpy import save
from draw_chessboard.includes import *
import draw_chessboard.parameters as Params

square_size = int(Params.chessboard_size / 8)

piece_images = {
    1 : Image.open('draw_chessboard/pieces/dark_bishop.png').resize((square_size,square_size)),
    2: Image.open('draw_chessboard/pieces/dark_king.png').resize((square_size,square_size)),
    3: Image.open('draw_chessboard/pieces/dark_knight.png').resize((square_size,square_size)),
    4: Image.open('draw_chessboard/pieces/dark_pawn.png').resize((square_size,square_size)),
    5: Image.open('draw_chessboard/pieces/dark_queen.png').resize((square_size,square_size)),
    6: Image.open('draw_chessboard/pieces/dark_rook.png').resize((square_size,square_size)),
    7: Image.open('draw_chessboard/pieces/light_bishop.png').resize((square_size,square_size)),
    8: Image.open('draw_chessboard/pieces/light_king.png').resize((square_size,square_size)),
    9: Image.open('draw_chessboard/pieces/light_knight.png').resize((square_size,square_size)),
    10: Image.open('draw_chessboard/pieces/light_pawn.png').resize((square_size,square_size)),
    11: Image.open('draw_chessboard/pieces/light_queen.png').resize((square_size,square_size)),
    12: Image.open('draw_chessboard/pieces/light_rook.png').resize((square_size,square_size)),
}

def draw_chessboard(piece_positions: np.ndarray, square_size = square_size, save_path=""):
    try:  
        grid = draw_grid(square_size)
        chessboard = paste_pieces(grid, piece_positions)

        chessboard.show(title="Result")

        if (save_path):
            chessboard.save(save_path)
    except Exception as e:
        traceback.print_exc()

def draw_grid(square_size: int = square_size, rows: int = 8, cols: int = 8) -> Image:
    img_base = Image.new('RGB', (cols*square_size, rows*square_size), Params.chessboard_dark_color)
    grid = ImageDraw.Draw(img_base)

    for row in range(rows):
        for col in range(cols):
            if (row + col) % 2 == 0:
                grid.rectangle([col * square_size, row * square_size, (col + 1) * square_size, (row + 1) * square_size], fill=Params.chessboard_light_color)

    return img_base

def paste_pieces(chessboard: Image,  piece_positions: np.ndarray) -> Image:
    print(piece_positions)
    for i, piece in enumerate(piece_positions):
        if piece != 0:
            (row, col) = divmod(i,8)
            chessboard.paste(piece_images[piece], (col * square_size, row * square_size, (col + 1) * square_size, (row + 1) * square_size), piece_images[piece])
    
    return chessboard