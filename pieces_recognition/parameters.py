#tamanho da foto -> na CNN vamos usar imagens de 100x100, em que cada quadrado tem 50x50 com mais 25 de contexto à volta para cada lado!
homography_square_length = 50  # tamanho de quadrado
homography_inner_length = homography_square_length * 8
homography_top_margin = 150 # tamanho excessivamente grande (50*3), para garantir que não se corta peças altas no fundo do tabuleiro
homography_other_margins = 25

image_size = 100 # homography_square_length = image_size / 2

#training parameters
batch_size = 32 # com 64 ficava sem memória!

#vanilla CNN params
epochs = 3

#model path
squares_model = "model_results/resnet.model.keras"
squares_resnet_weights = "model_results/model.weights.h5"

#square prediction security
square_threshold_predict = 0.90