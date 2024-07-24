image_size = 128 # homography_square_length = image_size / 2 # this size because resnet50 receives this input

#tamanho da foto -> na CNN vamos usar imagens de 100x100, em que cada quadrado tem 50x50 com mais 25 de contexto à volta para cada lado!
homography_square_length = int(image_size / 2)  # tamanho de quadrado
homography_inner_length = homography_square_length * 8
homography_top_margin = 150 # tamanho excessivamente grande (50*3), para garantir que não se corta peças altas no fundo do tabuleiro
homography_other_margins = int(homography_square_length / 2) # = homography_square_length / 2


#training parameters
batch_size = 128 # com 32/64 ficava sem memória!
shuffle_buffer_size = 100 # acho que isto não afeta grande coisa

#vanilla CNN params
epochs = 3

#model path
squares_resnet_model_name = "mobilenetv2_img128"
squares_vanilla_model_name = "mobilenetv2_img128.keras"
import_squares_model_path = "model_results/new_dataset/val0.05/mobilenetv2/" + squares_vanilla_model_name
import_squares_resnet_model_path = "model_results/shuffle5000-val0.15/resnet50_2.keras"

#square prediction security
square_threshold_predict = 0.5