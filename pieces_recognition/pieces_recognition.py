from pieces_recognition.includes import *
import pieces_recognition.parameters as Params
import board_recognition.parameters as BoardParams

#corner_points = [top_left, top_right, bottom_left, bottom_right]
def interpret_empty_spaces():

    build_CNN()
    pass

def build_CNN(input_shape=(100,100,3)): #
    model = Sequential()

    #1 conv Block
    model.add(Conv2D(filters=16, kernel_size=(5,5), strides=(1,1), activation='relu', input_shape=input_shape)) # input_shape é imagem de 100x100 com 3 canais RGB
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
    
    model.summary()

    # model.fit(x_train, y_train, batch_size=128, epochs=3, validation_data=(x_val,y_val))