from models.includes import *
import models.parameters as Params
import models.models_common as Common

# (depois de fazer "source ~/venv-metal/bin/activate") python3 main.py dataset_input/ model_output


#corner_points = [top_left, top_right, bottom_left, bottom_right]
def interpret_empty_spaces(square_img_list):

    # model = import_resnet_CNN_weights(Params.import_squares_resnet_weights_path)
    model = Common.import_CNN(Params.best_squares_model_path)

    #normalizar imagem
    square_img_list = square_img_list.astype(np.float32) # convert to float to avoid overflows
    square_img_list /= 255.0 

    pred_result = model.predict(
            square_img_list,
            batch_size = Params.batch_size,
            verbose=2)

    predicts = np.argmax(pred_result, axis=1)
    # max_indices = np.argmax(predicts, axis=1)

    # result = np.where(max_values < Params.square_threshold_predict, -1, max_indices) # substituir resultados que n se tem muita certeza por -1

    # return result
    return predicts

#tenativa de CNN vanilla, mas tem resultados fracos
def build_vanilla_CNN(input_shape=(100, 100, 3), num_classes=2):
    try:
        #clear previous sessions
        tf.keras.backend.clear_session()

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
            loss=tf.keras.losses.SparseCategoricalCrossentropy(),
            metrics=['accuracy'])

        print("Model built")

        return model 
    
    except Exception as e:
        print(e)
        exit(1)

def build_pretrained_CNN(input_shape=(Params.squares_image_size, Params.squares_image_size, 3), num_classes=2):
    try :
       
        #Com base neste site e no paper, escolhei qual modelo usar:
        #https://typeset.io/questions/which-cnn-architectures-are-best-suited-for-lightweight-1h7nmivciw#

        base_model = tf.keras.applications.MobileNetV2( #no paper usaram resnet18 mas n existe builtin no keras.applications.
            #testar usar MobileNetV2 a seguir!!
            input_shape=input_shape,
            include_top=False,
            weights='imagenet' # pretrained weights from imagenet
        )

        base_model.trainable = False  # freeze base model

        # add classification head 
        x = base_model.output
        x = tf.keras.layers.GlobalAveragePooling2D()(x)  # add Global Average Pooling layer
        x = Dense(num_classes, activation='softmax')(x)  # dense layer with 2 nodes for each class and softmax activation

        # Create the final model
        model = tf.keras.Model(inputs=base_model.input, outputs=x)

        model.compile(
            optimizer=tf.keras.optimizers.Adam(learning_rate=1e-3),
            loss=tf.keras.losses.SparseCategoricalCrossentropy(),
            metrics=['accuracy']
        )

        print("Model built")

        return model
    
    except Exception as e:
        print(e)
        exit(1)