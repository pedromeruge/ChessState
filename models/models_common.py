from numpy import square
from models.includes import *
import models.parameters as Params
import board_recognition.parameters as BoardParams


def import_CNN(input_path):
    model = load_model(
                input_path,
                compile=True)
    
    return model

def train_vanilla_CNN(input_dataset_folder, output_folder, model, model_name, epochs=3):
    try:
        input_image_size = model.input_shape[1:3]

        input_dir = Path(input_dataset_folder)
        output_dir = Path(output_folder)

        train_val_dir = input_dir / 'train_val'

        test_dir = input_dir / 'test'

        checkpoint_path = output_dir / (model_name + ".keras")

        output_dir.mkdir(parents=True, exist_ok=True) # fazer pasta destino se n existir

        model_cp_callback = tf.keras.callbacks.ModelCheckpoint( # checkpoint para guardar melhor model após cada epoch
            filepath=checkpoint_path,
            monitor='val_accuracy',
            mode='max',
            save_best_only=True,
            verbose=1)

        #clear previous sessions
        tf.keras.backend.clear_session()

        # Enable mixed precision
        tf.keras.mixed_precision.set_global_policy('mixed_float16')

        print("Getting datasets")

        datagen = tf.keras.preprocessing.image.ImageDataGenerator(
            rescale=1./255,
            validation_split=0.1
        )

        train_ds = datagen.flow_from_directory(
            train_val_dir,
            target_size=input_image_size,
            batch_size=Params.batch_size,
            class_mode='sparse',
            subset='training',
            shuffle=True
        )
        
        val_ds = datagen.flow_from_directory(
            train_val_dir,
            target_size=input_image_size,
            batch_size=Params.batch_size,
            class_mode='sparse',
            subset='validation',
            shuffle=True
        )

        test_datagen = tf.keras.preprocessing.image.ImageDataGenerator(rescale=1./255)

        test_ds = test_datagen.flow_from_directory(
            test_dir,
            target_size=input_image_size,
            batch_size=Params.batch_size,
            class_mode='sparse',
            shuffle=False
        )

        model.compile(
            optimizer=tf.keras.optimizers.Adam(learning_rate=1e-3),
            loss=tf.keras.losses.SparseCategoricalCrossentropy(),
            metrics=['accuracy']
        )

        print("Starting model fitting")

        model.fit(
            train_ds,
            validation_data = val_ds,
            epochs=epochs, 
            callbacks=[model_cp_callback],
            verbose=1)
        
        # Evaluate the model on the test data
        test_loss, test_acc = model.evaluate(test_ds)
        print(f"Test Loss: {test_loss}, Test Accuracy: {test_acc}")

    except Exception as e:
        traceback.print_exc()

def train_vanilla_pieces_CNN(input_dataset_folder, output_folder, model):
    try:
        input_image_size = model.input_shape[1:3]

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

            # Enable mixed precision
        tf.keras.mixed_precision.set_global_policy('mixed_float16')

        #clear previous sessions
        tf.keras.backend.clear_session()

        print("Getting datasets")

        datagen = tf.keras.preprocessing.image.ImageDataGenerator(
            rescale=1./255,
            validation_split=0.1
        )

        train_ds = datagen.flow_from_directory(
            train_val_dir,
            target_size=input_image_size,
            batch_size=Params.batch_size,
            class_mode='sparse',
            subset='training',
            shuffle=True
        )

        val_ds = datagen.flow_from_directory(
            train_val_dir,
            target_size=input_image_size,
            batch_size=Params.batch_size,
            class_mode='sparse',
            subset='validation',
            shuffle=True
        )

        test_datagen = tf.keras.preprocessing.image.ImageDataGenerator(rescale=1./255)

        test_ds = test_datagen.flow_from_directory(
            test_dir,
            target_size=input_image_size,
            batch_size=Params.batch_size,
            class_mode='sparse',
            shuffle=False
        )

        model.compile(
            optimizer=tf.keras.optimizers.Adam(learning_rate=1e-4),
            loss=tf.keras.losses.SparseCategoricalCrossentropy(),
            metrics=['accuracy']
        )

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
        
    except Exception as e:
        traceback.print_exc()

def train_prebuilt_occupancy_CNN(input_dataset_folder, output_folder, model):
    try :
        input_image_size = model.input_shape[1:3]

        input_dir = Path(input_dataset_folder)
        output_dir = Path(output_folder)

        train_val_dir = input_dir / 'train_val'
        test_dir = input_dir / 'test'

        output_dir.mkdir(parents=True, exist_ok=True) # fazer pasta destino se n existir

        #clear previous sessions
        tf.keras.backend.clear_session()

        print("Getting datasets")

        # Enable mixed precision
        tf.keras.mixed_precision.set_global_policy('mixed_float16')

        datagen = tf.keras.preprocessing.image.ImageDataGenerator(
            rescale=1./255,
            validation_split=0.1
        )

        train_ds = datagen.flow_from_directory(
            train_val_dir,
            target_size=input_image_size,
            batch_size=Params.batch_size,
            class_mode='sparse',
            subset='training',
            shuffle=True
        )

        val_ds = datagen.flow_from_directory(
            train_val_dir,
            target_size=input_image_size,
            batch_size=Params.batch_size,
            class_mode='sparse',
            subset='validation',
            shuffle=True
        )

        test_datagen = tf.keras.preprocessing.image.ImageDataGenerator(rescale=1./255)

        test_ds = test_datagen.flow_from_directory(
            test_dir,
            target_size=input_image_size,
            batch_size=Params.batch_size,
            class_mode='sparse',
            shuffle=False
        )

        print("Starting model fitting")

        model.compile(
            optimizer=tf.keras.optimizers.Adam(learning_rate=1e-4),
            loss=tf.keras.losses.SparseCategoricalCrossentropy(),
            metrics=['accuracy']
        )

        #train for one epoch with rest of layers frozen
        model.fit(
            train_ds,
            validation_data=val_ds,
            epochs=1,
            verbose=1
        )

        model.save(output_dir / (Params.squares_resnet_model_name + '_1.keras'))

        # unfreeze base model
        model.layers[0].trainable = True

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
            verbose=1
        )

        model.save(output_folder +  Params.squares_resnet_model_name + '_2.keras')

        # Evaluate the model on the test data
        test_loss, test_acc = model.evaluate(test_ds)
        print(f"Test Loss: {test_loss}, Test Accuracy: {test_acc}")

    except Exception as e:
        traceback.print_exc()

def train_prebuilt_pieces_CNN(input_dataset_folder, output_folder, model, model_name):
    try :
        input_image_size = model.input_shape[1:3]

        input_dir = Path(input_dataset_folder)
        output_dir = Path(output_folder)

        train_val_dir = input_dir / 'train_val'
        test_dir = input_dir / 'test'

        output_dir.mkdir(parents=True, exist_ok=True) # fazer pasta destino se n existir

        #clear previous sessions
        tf.keras.backend.clear_session()

        print("Getting datasets")

        # Enable mixed precision
        tf.keras.mixed_precision.set_global_policy('mixed_float16')

        datagen = tf.keras.preprocessing.image.ImageDataGenerator(
            rescale=1./255,
            validation_split=0.1
        )

        train_ds = datagen.flow_from_directory(
            train_val_dir,
            target_size=input_image_size,
            batch_size=Params.batch_size,
            class_mode='sparse',
            subset='training',
            shuffle=True
        )

        val_ds = datagen.flow_from_directory(
            train_val_dir,
            target_size=input_image_size,
            batch_size=Params.batch_size,
            class_mode='sparse',
            subset='validation',
            shuffle=True
        )

        test_datagen = tf.keras.preprocessing.image.ImageDataGenerator(rescale=1./255)

        test_ds = test_datagen.flow_from_directory(
            test_dir,
            target_size=input_image_size,
            batch_size=Params.batch_size,
            class_mode='sparse',
            shuffle=False
        )

        model.compile(
            optimizer=tf.keras.optimizers.Adam(learning_rate=1e-4),
            loss=tf.keras.losses.SparseCategoricalCrossentropy(),
            metrics=['accuracy']
        )

        print("Starting model fitting")

        #train for one epoch with rest of layers frozen
        model.fit(
            train_ds,
            validation_data=val_ds,
            epochs=2,
            verbose=1
        )

        model.save(output_dir / (model_name + '_1.keras'))

        # unfreeze base model
        model.layers[0].trainable = True

        #recompile with lower training rate, but full CNN unfrozen now
        model.compile(
            optimizer=tf.keras.optimizers.Adam(learning_rate=1e-4),
            loss=tf.keras.losses.SparseCategoricalCrossentropy(),
            metrics=['accuracy']
        )

        # Train the entire model for 4 epochs
        model.fit(
            train_ds,
            validation_data=val_ds,
            epochs=4,
            verbose=1
        )

        model.save(output_dir / (model_name + '_2.keras'))
        # Evaluate the model on the test data
        test_loss, test_acc = model.evaluate(test_ds)
        print(f"Test Loss: {test_loss}, Test Accuracy: {test_acc}")

    except Exception as e:
        traceback.print_exc()


def build_fine_tuned_keras_CNN(input_shape, num_classes, keras_model_func):
    try :
       
        base_model = keras_model_func(

            input_shape=input_shape,
            include_top=False,
            weights='imagenet' # pretrained weights from imagenet
        )

        base_model.trainable = False  # freeze base model

        # add classification head 
        x = base_model.output
        x = tf.keras.layers.GlobalAveragePooling2D()(x)  # add Global Average Pooling layer
        x = Dense(num_classes, activation='softmax')(x)  # dense layer with nodes for each class and softmax activation

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
        traceback.print_exc()