from pieces_recognition.includes import *
import pieces_recognition.parameters as Params
import board_recognition.parameters as BoardParams

# (depois de fazer "source ~/venv-metal/bin/activate") python3 main.py dataset_input/ model_output


#corner_points = [top_left, top_right, bottom_left, bottom_right]
def interpret_empty_spaces(square_imgs_list):

    model = import_CNN(Params.import_squares_model_path)
    # model = import_resnet_CNN_weights(Params.squares_resnet_weights)
    predicts = predict_squares(model, square_imgs_list)
    return predicts

def import_CNN(input_path):
    model = load_model(
                input_path,
                compile=True)
    
    return model

def import_resnet_CNN_weights(input_path):
    # Recreate the model architecture
    base_model = tf.keras.applications.ResNet50(
        input_shape=(Params.image_size, Params.image_size, 3),
        include_top=False,
        weights=None  # weights loaded after
    )

    # Rebuild the model with the same architecture
    model = Sequential([
        base_model,
        tf.keras.layers.GlobalAveragePooling2D(),
        Dense(2, activation='softmax')
    ])

    # Load the weights into the model
    model.load_weights(input_path)

    # Optionally, compile the model if you plan to use it for further training or evaluation
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-4),
        loss=tf.keras.losses.SparseCategoricalCrossentropy(),
        metrics=['accuracy']
    )

    return model

def predict_squares(model, square_img_list):

    print("antes normalizar: ", square_img_list)
    #normalizar imagem
    square_img_list = square_img_list.astype(np.float32) # convert to float to avoid overflows
    square_img_list /= 255.0 
    
    print("depois normalizar: ", square_img_list)

    predicts = model.predict(
            square_img_list,
            batch_size = Params.batch_size,
            verbose=2)

    max_values = np.max(predicts, axis=1)
    max_indices = np.argmax(predicts, axis=1)

    result = np.where(max_values < Params.square_threshold_predict, -1, max_indices) # substituir resultados que n se tem muita certeza por -1

    return result

#tenativa de CNN vanilla, mas tem resultados fracos
def build_vanilla_CNN(input_dataset_folder, output_folder):

    model = Sequential()

    #1 conv Block
    model.add(Input(shape=(100,100,3))) # input_shape é imagem de 100x100 com 3 canais RGB
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

    model.add(Dense(2, activation='softmax'))

    model.compile(
        optimizer=Adam(learning_rate=1e-3), 
        loss=tf.keras.losses.SparseCategoricalCrossentropy(),
        metrics=['accuracy'])

    print("Model built")

    input_dir = Path(input_dataset_folder)
    output_dir = Path(output_folder)

    train_val_dir = input_dir / 'train_val'
    # val_dir = input_dir / 'val'
    test_dir = input_dir / 'test'

    checkpoint_path = output_dir / "cp.model.keras"

    output_dir.mkdir(parents=True, exist_ok=True) # fazer pasta destino se n existir

    model_cp_callback = tf.keras.callbacks.ModelCheckpoint( # checkpoint para guardar melhor model após cada epoch
        filepath=checkpoint_path,
        monitor='val_accuracy',
        mode='max',
        save_best_only=True,
        verbose=1)

    print("Getting datasets")

    train_ds = tf.keras.preprocessing.image_dataset_from_directory(
        train_val_dir,
        validation_split=0.2,
        subset="training",
        seed=123,
        image_size=(Params.image_size, Params.image_size),
        batch_size=Params.batch_size,
        # color_mode="grayscale",
        shuffle=True
    )

    val_ds = tf.keras.preprocessing.image_dataset_from_directory(
        train_val_dir,
        validation_split=0.2,
        subset="validation",
        seed=123,
        image_size=(Params.image_size, Params.image_size),
        batch_size=Params.batch_size,
        shuffle=True
    )

    test_ds = tf.keras.utils.image_dataset_from_directory(
        test_dir,
        batch_size=Params.batch_size,
        image_size=(Params.image_size, Params.image_size),
        shuffle=False,
        seed=123
    )

    normalization_layer = tf.keras.layers.Rescaling(1./255)

    print("Prefetch data")

    # optimize performance, segundo os docs, armazenando dados em cache:
    #  https://www.tensorflow.org/tutorials/load_data/images?hl=pt-br#load_data_using_a_keras_utility
    AUTOTUNE = tf.data.AUTOTUNE 

    train_ds = train_ds.map(lambda x, y: (normalization_layer(x), y), num_parallel_calls=AUTOTUNE)
    val_ds = val_ds.map(lambda x, y: (normalization_layer(x), y), num_parallel_calls=AUTOTUNE)
    test_ds = test_ds.map(lambda x, y: (normalization_layer(x), y), num_parallel_calls=AUTOTUNE)

    train_ds = train_ds.cache().shuffle(Params.shuffle_buffer_size).prefetch(buffer_size=AUTOTUNE)
    val_ds = val_ds.cache().prefetch(buffer_size=AUTOTUNE)
    test_ds = test_ds.cache().prefetch(buffer_size=AUTOTUNE)

    print("Starting model fitting")

    model.fit(
        train_ds,
        validation_data = val_ds,
        epochs=Params.epochs, 
        callbacks=[model_cp_callback],
        verbose=1)
    
    # Evaluate the model on the test data
    test_loss, test_acc = model.evaluate(test_ds)
    print(f"Test Loss: {test_loss}, Test Accuracy: {test_acc}")

def build_ResNet_CNN(input_dataset_folder, output_folder):

    input_dir = Path(input_dataset_folder)
    output_dir = Path(output_folder)

    train_val_dir = input_dir / 'train_val'
    test_dir = input_dir / 'test'

    output_dir.mkdir(parents=True, exist_ok=True) # fazer pasta destino se n existir

    train_ds = tf.keras.preprocessing.image_dataset_from_directory(
        train_val_dir,
        validation_split=0.2,
        subset="training",
        seed=123,
        image_size=(Params.image_size, Params.image_size),
        batch_size=Params.batch_size
    )

    val_ds = tf.keras.preprocessing.image_dataset_from_directory(
        train_val_dir,
        validation_split=0.2,
        subset="validation",
        seed=123,
        image_size=(Params.image_size, Params.image_size),
        batch_size=Params.batch_size
    )

    test_ds = tf.keras.preprocessing.image_dataset_from_directory(
        test_dir,
        batch_size=Params.batch_size,
        image_size=(Params.image_size, Params.image_size),
        shuffle=False,
        seed=123
    )

    normalization_layer = tf.keras.layers.Rescaling(1./255) #normalize data

    print("Prefetch data")

    # optimize performance, segundo os docs, armazenando dados em cache:
    #  https://www.tensorflow.org/tutorials/load_data/images?hl=pt-br#load_data_using_a_keras_utility
    AUTOTUNE = tf.data.AUTOTUNE 

    train_ds = train_ds.map(lambda x, y: (normalization_layer(x), y), num_parallel_calls=AUTOTUNE)
    val_ds = val_ds.map(lambda x, y: (normalization_layer(x), y), num_parallel_calls=AUTOTUNE)
    test_ds = test_ds.map(lambda x, y: (normalization_layer(x), y), num_parallel_calls=AUTOTUNE)

    train_ds = train_ds.cache().shuffle(Params.shuffle_buffer_size).prefetch(buffer_size=AUTOTUNE)
    val_ds = val_ds.cache().prefetch(buffer_size=AUTOTUNE)
    test_ds = test_ds.cache().prefetch(buffer_size=AUTOTUNE)

    checkpoint_path = output_dir / "resnet.model.keras"

    model_cp_callback = tf.keras.callbacks.ModelCheckpoint( # checkpoint para guardar melhor model após cada epoch
        filepath=checkpoint_path,
        monitor='val_accuracy',
        mode='max',
        save_best_only=True,
        verbose=1)

    base_model = tf.keras.applications.ResNet50(
        input_shape=(Params.image_size, Params.image_size, 3),
        include_top=False,
        weights='imagenet' # pretrained weights from imagenet
    )

    base_model.trainable = False  # freeze base model

    # add classification head 
    model = tf.keras.Sequential([
        base_model,
        tf.keras.layers.GlobalAveragePooling2D(),
        Dense(2, activation='softmax')
    ])

    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-3),
        loss=tf.keras.losses.SparseCategoricalCrossentropy(),
        metrics=['accuracy']
    )

    #train for one epoch with rest of layers frozen
    model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=1,
        callbacks=[model_cp_callback],
        verbose=1
    )

    # unfreeze base model
    base_model.trainable = True

    #recompile with lower training rate, but full CNN unfrozen now
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-4),
        loss=tf.keras.losses.SparseCategoricalCrossentropy(),
        metrics=['accuracy']
    )

    # Train the entire model for two epochs
    model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=2,
        callbacks=[model_cp_callback],
        verbose=1
    )

    # Evaluate the model on the test data
    test_loss, test_acc = model.evaluate(test_ds)
    print(f"Test Loss: {test_loss}, Test Accuracy: {test_acc}")
