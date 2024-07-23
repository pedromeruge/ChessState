image_size = 100 # homography_square_length = image_size / 2 # this size because resnet50 receives this input

#tamanho da foto -> na CNN vamos usar imagens de 100x100, em que cada quadrado tem 50x50 com mais 25 de contexto à volta para cada lado!
homography_square_length = int(image_size / 2)  # tamanho de quadrado
homography_inner_length = homography_square_length * 8
homography_top_margin = 150 # tamanho excessivamente grande (50*3), para garantir que não se corta peças altas no fundo do tabuleiro
homography_other_margins = int(homography_square_length / 2) # = homography_square_length / 2


#training parameters
batch_size = 64 # com 32/64 ficava sem memória!
shuffle_buffer_size = 1000

#vanilla CNN params
epochs = 3

#model path
squares_resnet_model_name = "resnet50"
squares_vanilla_model_name = "cp.model.keras"
import_squares_model_path = "model_results/new_dataset/shuffle3000-val0.05/" + squares_vanilla_model_name
import_squares_resnet_model_path = "model_results/shuffle5000-val0.15/resnet50_2.keras"

#square prediction security
square_threshold_predict = 0.75