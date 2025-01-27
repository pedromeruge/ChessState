import cv2
import numpy as np
import math
from pathlib import Path
import random
from sklearn.cluster import DBSCAN, KMeans, AgglomerativeClustering
from sklearn.metrics import mean_squared_error
from itertools import combinations
from scipy.spatial.distance import pdist, squareform
from scipy.stats import mode
from sklearn.preprocessing import PolynomialFeatures
from sklearn.linear_model import LinearRegression
from scipy.stats import iqr
import random
import heapq
from sklearn.linear_model import RANSACRegressor
import time
from models.squares_recognition import *
import sys
import typing
import print_funcs.print_funcs as Prints