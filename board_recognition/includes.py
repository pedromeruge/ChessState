import cv2
import numpy as np
import math
# import matplotlib.pyplot as plt
from pathlib import Path
import random
from sklearn.cluster import DBSCAN, KMeans, AgglomerativeClustering
import itertools
from scipy.spatial.distance import pdist, squareform