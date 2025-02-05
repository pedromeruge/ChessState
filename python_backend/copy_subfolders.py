import os
from re import sub
import shutil
import sys
from pathlib import Path

#script to copy/move all the classes distributed by subfolders of a dataset to same named subfolders in another folder

#copy files in subfolders to other dir
def copy_subfolder_files(source_folder, dest_folder):
    operate_on_subfolder_files(source_folder, dest_folder, shutil.copy)

#move files in subfolders to other dir
def move_subfolder_files(source_folder, dest_folder):
    operate_on_subfolder_files(source_folder, dest_folder, shutil.move)

#aux func to apply operation_func to all files in subfolders in dir
def operate_on_subfolder_files(source_folder, dest_folder, operation_func):
    source_folder = Path(source_folder)
    dest_folder = Path(dest_folder)

    for subfolder in source_folder.iterdir():
        if subfolder.is_dir():
            dest_subfolder = dest_folder / subfolder.name
            dest_subfolder.mkdir(parents=True, exist_ok=True)
            for file in subfolder.iterdir():
                dest_file = dest_subfolder / file.name
                try:
                    operation_func(str(file), str(dest_file))
                except FileExistsError:
                    new_file_name = f"{file.name}_copy"
                    dest_file = dest_subfolder / new_file_name
                    operation_func(str(file), str(dest_file))
                except Exception as e:
                    print(e)
                   
copy_subfolder_files(sys.argv[1], sys.argv[2])
