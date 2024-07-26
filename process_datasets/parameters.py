#augment values
# warp_max_delta = 40 # [0,..]
brightness_max_delta = 0.35
contrast_delta= 0.3
saturation_delta = 0.3
hue_max_delta = 0.03
noise_max_delta = 15 # [0,100]

#train_test_val percentages
# train_ratio = 1 - test_ratio -> fica o restante dos outros dois
test_ratio = 0.10

#Fen translation

fen_from_char = {"P": 1, "N": 2, "B": 3, "R": 4, "Q": 5, "K": 6,
                 "p": -1, "n": -2, "b": -3, "r": -4, "q": -5, "k": -6}

fen_from_int = {"0": 1, "1": 4, "2": 2, "3": 3, "4": 5, "5": 6,
                "6": -1, "7": -4, "8": -2, "9": -3, "10": -5, "11": -6}

fen_to_name = {"1": "white_pawn", "2": "white_knight", "3":"white_bishop", "4":"white_rook", "5":"white_queen", "6":"white_king",
             "-1": "black_pawn", "-2": "black_knight", "-3":"black_bishop", "-4":"black_rook", "-5":"black_queen", "-6":"black_king"}