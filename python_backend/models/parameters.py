
##
### Models that identify occupancy
##
squares_image_size = 100

#training parameters
batch_size = 32
val_batch_size = test_batch_size = 64

#vanilla CNN params
# epochs = 4

#model path
best_squares_model_path = "model_results/occupancy/new_dataset/shuffle3000-val0.05/vanilla_img100/vanilla_img100.keras"

#square prediction security
square_threshold_predict = 0.6

##
### Models that identify pieces
##
 
min_delta=0
patience=4
dropout=0.2

pieces_threshold_predict = 0.6

best_pieces_model_path = "model_results/pieces/Vanilla_3_3_3/vanilla_3_3_3_pieces.keras" 
# best_pieces_model_path = "model_results/pieces/InceptionV3_new/InceptionV3_pieces_2.keras"
