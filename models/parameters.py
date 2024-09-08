
##
### Models that identify occupancy
##
squares_image_size = 100

#training parameters
batch_size = 64
shuffle_buffer_size = 3000

#vanilla CNN params
epochs = 3

#model path
best_squares_model_path = "model_results/occupancy/new_dataset/shuffle3000-val0.05/vanilla_img100/vanilla_img100.keras"

#square prediction security
square_threshold_predict = 0.5

##
### Models that identify pieces
##

pieces_threshold_predict = 0.8

best_pieces_model_path = "model_results/pieces/Vanilla_3_3_3/vanilla_3_3_3_pieces.keras"