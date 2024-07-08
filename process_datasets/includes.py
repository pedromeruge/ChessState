import cv2
import random
import numpy as np
import sys
from pathlib import Path
import matplotlib.pyplot as plt
import json
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor, as_completed # concurrent process execution
from tqdm import tqdm # progress bar
from bisect import bisect_left, bisect_right # bin sort para encontrar image_ids mais facilmente
import tensorflow as tf
from sklearn.preprocessing import minmax_scale
from sklearn.model_selection import train_test_split
import shutil # copiar,mover ficheiros
