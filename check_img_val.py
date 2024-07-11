import os
from PIL import Image
import sys

def validate_images(directory):
    valid_extensions = ('.jpg', '.jpeg', '.png')
    for root, dirs, files in os.walk(directory):
        print("Starting directory:", directory)
        for file in files:
            if not file.lower().endswith(valid_extensions):
                print(f"Non-image file found and skipped: {file}")
                continue
            try:
                img_path = os.path.join(root, file)
                with Image.open(img_path) as img:
                    img.verify()  # Verify that it is, in fact, an image
            except (IOError, SyntaxError) as e:
                print(f"Corrupted image file: {img_path}")
    print(">>>Finished directory: ", directory)

# Validate train, val, and test directories
# validate_images('/Volumes/BACKUPS/ChessState/Final_dataset/val')
validate_images('/Volumes/BACKUPS/ChessState/Final_dataset/test')
validate_images('/Volumes/BACKUPS/ChessState/Final_dataset/train')
