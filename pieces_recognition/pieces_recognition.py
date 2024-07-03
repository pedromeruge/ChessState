from pieces_recognition.includes import *
import pieces_recognition.parameters as Params
import board_recognition.parameters as BoardParams

#corner_points = [top_left, top_right, bottom_left, bottom_right]
def process_empty_spaces(board_img, corner_points):
    squares_imgs = split_squares(board_img, corner_points)

    # show_result(squares_imgs, writeToFile=False)
    build_CNN()
    
    return squares_imgs

def split_squares(board_img, corner_points):
    squares = []
    jump_size = BoardParams.homography_square_length
    margin = BoardParams.homography_other_margins
    top_left = corner_points[0]

    for y in range(0, 8):
        for x in range(0, 8):
            start_x = int(x * jump_size)
            end_x = int(start_x + jump_size*2)
            start_y = int(top_left[1] - margin + y * jump_size)
            end_y = int(start_y + jump_size*2)

            tiles = board_img[start_y : end_y, start_x : end_x] # cols, rows
            squares.append(tiles)

    squares = np.array(squares)
    return squares

def show_result(chess_squares, writeToFile=False):

    #write result squares to file
    if (writeToFile):
        out_path = sys.argv[2]
        Path(out_path).mkdir(parents=True, exist_ok=True)

        for i, square in enumerate(chess_squares):
            final_path = out_path + "save/" + int(i)
            cv2.imwrite(final_path, square)

    grid_rows = grid_cols = 8
    
    _, axes = plt.subplots(grid_rows, grid_cols, figsize=(8,8))
    axes = axes.flatten()
    
    for idx, img in enumerate(chess_squares):
        if idx >= grid_rows * grid_cols:
            break
        
        #swap images to RGB
        resized_img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        
        # display img
        axes[idx].imshow(resized_img_rgb)
        axes[idx].axis('off')
    
    # Turn off axes for any remaining empty subplots
    for i in range(idx + 1, grid_rows * grid_cols):
        axes[i].axis('off')
    
    plt.tight_layout()
    plt.show()

    print("Square size (WxH):", chess_squares[0].shape[1], "x", chess_squares[0].shape[0])

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