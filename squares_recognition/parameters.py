image_size = 224 # homography_square_length = image_size / 2 # this size because resnet50 receives this input

#training parameters
batch_size = 128 # com 32/64 ficava sem memória!
shuffle_buffer_size = 3000 # acho que isto não afeta grande coisa

#vanilla CNN params
epochs = 3

#model path
squares_resnet_model_name = "mobilenetv2_img128"
squares_vanilla_model_name = "mobilenetv2_img128.keras"
import_squares_model_path = "model_results/new_dataset/val0.05/mobilenetv2/" + squares_vanilla_model_name
import_squares_resnet_model_path = "model_results/shuffle5000-val0.15/resnet50_2.keras"

#square prediction security
square_threshold_predict = 0.5