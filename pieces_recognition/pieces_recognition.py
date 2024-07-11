from pieces_recognition.includes import *
import pieces_recognition.parameters as Params
import board_recognition.parameters as BoardParams

#corner_points = [top_left, top_right, bottom_left, bottom_right]
def interpret_empty_spaces(input_dataset_folder, output_folder):
    model = build_CNN()
    train_CNN(model, input_dataset_folder, output_folder)

def build_CNN(input_shape=(100,100,3)): #
    model = Sequential()

    #1 conv Block
    model.add(Input(shape=input_shape)) # input_shape é imagem de 100x100 com 3 canais RGB
    model.add(tf.keras.layers.Rescaling(1./255)) # normalize photo values to [0,1] scale
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
        loss='categorical_crossentropy',
        metrics=['accuracy'])

    print("Model built")
    return model

def train_CNN(model, input_dataset_folder, output_folder):
    input_dir = Path(input_dataset_folder)
    output_dir = Path(output_folder)

    train_dir = input_dir / 'train'
    val_dir = input_dir / 'val'
    test_dir = input_dir / 'test'

    checkpoint_path = output_dir / "cp.model.keras"

    output_dir.mkdir(parents=True, exist_ok=True) # fazer pasta destino se n existir

    model_cp_callback = tf.keras.callbacks.ModelCheckpoint( # checkpoint para guardar melhor model após cada epoch
        filepath=checkpoint_path,
        monitor='val_accuracy',
        mode='max',
        save_best_only=True)

    print("Getting datasets")

    train_dataset = tf.keras.utils.image_dataset_from_directory(
        train_dir,
        labels='inferred',
        label_mode='categorical',
        batch_size=Params.batch_size,
        image_size=(Params.image_size, Params.image_size),
        shuffle=True,
        seed=123
    )

    validation_dataset = tf.keras.utils.image_dataset_from_directory(
        val_dir,
        labels='inferred',
        label_mode='categorical',
        batch_size=Params.batch_size,
        image_size=(Params.image_size, Params.image_size),
        shuffle=True,
        seed=123
    )

    test_dataset = tf.keras.utils.image_dataset_from_directory(
        test_dir,
        labels='inferred',
        label_mode='categorical',
        batch_size=Params.batch_size,
        image_size=(Params.image_size, Params.image_size),
        shuffle=False,
        seed=123
    )

    print("Prefetch data")

    # optimize performance, segundo os docs, armazenando dados em cache:
    #  https://www.tensorflow.org/tutorials/load_data/images?hl=pt-br#load_data_using_a_keras_utility
    AUTOTUNE = tf.data.AUTOTUNE 

    train_dataset = train_dataset.cache().prefetch(buffer_size=AUTOTUNE)
    validation_dataset = validation_dataset.cache().prefetch(buffer_size=AUTOTUNE)
    test_dataset = test_dataset.cache().prefetch(buffer_size=AUTOTUNE)

    print("Starting model fitting")

    model.fit(
        train_dataset,
        validation_data = validation_dataset,
        epochs=Params.epochs, 
        callbacks=[model_cp_callback],
        verbose=1)
    
    # Evaluate the model on the test data
    test_loss, test_acc = model.evaluate(test_dataset)
    print(f"Test Loss: {test_loss}, Test Accuracy: {test_acc}")
