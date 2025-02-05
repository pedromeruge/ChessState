from models.includes import *
import models.parameters as Params
import models.models_common as Common
import print_funcs.print_funcs as Prints

# (depois de fazer "source ~/venv-metal/bin/activate") python3 main.py dataset_input/ model_output

#corner_points = [top_left, top_right, bottom_left, bottom_right]
def interpret_pieces(pieces_img_list, occupation_mask):

    model = Common.import_CNN(Params.best_pieces_model_path)

    pieces_img_list = pieces_img_list.astype(np.float32) # convert to float to avoid overflows
    pieces_img_list /= 255.0 

    pred_result = model.predict(
            pieces_img_list,
            batch_size = Params.batch_size,
            verbose=2)

    predicts = np.argmax(pred_result, axis=1) + 1 # leave zero value for empty places
    
    final_list = np.zeros(64,dtype=np.int32)
    final_list[occupation_mask] = predicts

    uncertain_predicts = np.zeros(64,dtype=bool)
    uncertain_predicts[occupation_mask] = np.max(pred_result, axis=1) < Params.square_threshold_predict # register which predicts are uncertain
    
    return final_list, uncertain_predicts

#tested
def build_vanilla_CNN_3_3_3(input_dataset_folder, output_folder, input_shape=(250, 150, 3), num_classes=12):
    try:

        model = Sequential()

        #1 conv Block
        model.add(Input(shape=input_shape)) # input_shape é imagem de 100x100 com 3 canais RGB
        model.add(Conv2D(filters=16, kernel_size=(5,5), strides=(1,1), activation='relu')) 
        model.add(MaxPooling2D(pool_size=(2,2), strides=(2,2))) # a cada 2x2 píxeis simplifica -> stride também é 2

        #2 conv Block
        model.add(Conv2D(filters=32, kernel_size=(5,5), strides=(1,1), activation='relu')) # input_shape é imagem de 100x100 com 3 canais RGB
        model.add(MaxPooling2D(pool_size=(2,2), strides=(2,2))) # a cada 2x2 píxeis simplifica -> stride também é 2

        #3 conv Block
        model.add(Conv2D(filters=64, kernel_size=(3,3), strides=(1,1), activation='relu')) # input_shape é imagem de 100x100 com 3 canais RGB
        model.add(MaxPooling2D(pool_size=(2,2), strides=(2,2))) # a cada 2x2 píxeis simplifica -> stride também é 2

        #reshape para passar a uma vetor de 640,000 dimensões (correto??)
        model.add(Flatten())

        model.add(Dense(1000, activation='relu'))

        model.add(Dense(256, activation='relu'))

        model.add(Dense(num_classes, activation='softmax'))

        model.compile(
            optimizer=Adam(learning_rate=1e-3), 
            loss=tf.keras.losses.CategoricalCrossentropy(),
            metrics=['accuracy'])

        print("Model built")
        Common.train_vanilla_pieces_CNN(input_dataset_folder, output_folder, model, "vanilla_3_3_3_pieces_2", 4)
        
    except Exception as e:
        print(e)

def build_vanilla_CNN_3_3_2(input_dataset_folder, output_folder, input_shape=(250, 150, 3), num_classes=12):
    try:

        model = Sequential()

        #1 conv Block
        model.add(Input(shape=input_shape)) # input_shape é imagem de 100x100 com 3 canais RGB
        model.add(Conv2D(filters=16, kernel_size=(5,5), strides=(1,1), activation='relu')) 
        model.add(MaxPooling2D(pool_size=(2,2), strides=(2,2))) # a cada 2x2 píxeis simplifica -> stride também é 2

        #2 conv Block
        model.add(Conv2D(filters=32, kernel_size=(5,5), strides=(1,1), activation='relu')) # input_shape é imagem de 100x100 com 3 canais RGB
        model.add(MaxPooling2D(pool_size=(2,2), strides=(2,2))) # a cada 2x2 píxeis simplifica -> stride também é 2

        #3 conv Block
        model.add(Conv2D(filters=64, kernel_size=(3,3), strides=(1,1), activation='relu')) # input_shape é imagem de 100x100 com 3 canais RGB
        model.add(MaxPooling2D(pool_size=(2,2), strides=(2,2))) # a cada 2x2 píxeis simplifica -> stride também é 2

        #reshape para passar a uma vetor de 640,000 dimensões (correto??)
        model.add(Flatten())

        model.add(Dense(1000, activation='relu'))

        # model.add(Dense(256, activation='relu')) # no middle dense layer

        model.add(Dense(num_classes, activation='softmax'))

        model.compile(
            optimizer=Adam(learning_rate=1e-3), 
            loss=tf.keras.losses.CategoricalCrossentropy(),
            metrics=['accuracy'])

        print("Model built")

        Common.train_vanilla_pieces_CNN(input_dataset_folder, output_folder, model, "vanilla_3_3_2_pieces",4)
        
    except Exception as e:
        print(e)

# tested, stopped mid-way through
def build_ResNet50V2_CNN(input_dataset_folder, output_folder, input_shape=(250,150, 3), num_classes=12):
    try :
        model = Common.build_fine_tuned_keras_CNN(input_shape, num_classes, tf.keras.applications.resnet_v2.ResNet50V2)
        Common.train_prebuilt_pieces_CNN(input_dataset_folder, output_folder, model, tf.keras.applications.resnet_v2.preprocess_input, 249, "ResNet50V2_pieces")
    except Exception as e:
        print(e)

def build_MobileNetV2_CNN(input_dataset_folder, output_folder, input_shape=(250,150, 3), num_classes=12):
    try :
        model = Common.build_fine_tuned_keras_CNN(input_shape, num_classes, tf.keras.applications.mobilenet_v2.MobileNetV2)
        Common.train_prebuilt_pieces_CNN(input_dataset_folder, output_folder, model, tf.keras.applications.mobilenet_v2.preprocess_input, 249, "MobileNetV2_pieces")
    except Exception as e:
        print(e)

def build_InceptionV3_CNN(input_dataset_folder, output_folder, input_shape=(250,150, 3), num_classes=12):
    try :
        model = Common.build_fine_tuned_keras_CNN(input_shape, num_classes, tf.keras.applications.inception_v3.InceptionV3)
        Common.train_prebuilt_pieces_CNN(input_dataset_folder, output_folder, model, tf.keras.applications.inception_v3.preprocess_input, 249, "InceptionV3_pieces")
    except Exception as e:
        print(e)

#heavy model - not suited for mobile 
def build_VGG16_CNN(input_dataset_folder, output_folder, input_shape=(250,150, 3), num_classes=12):
    try :
        model = Common.build_fine_tuned_keras_CNN(input_shape, num_classes, tf.keras.applications.vgg_16.VGG16)
        Common.train_prebuilt_pieces_CNN(input_dataset_folder, output_folder, model,tf.keras.applications.vgg_16.preprocess_input, 249, "VGG16_pieces")
    except Exception as e:
        print(e)
