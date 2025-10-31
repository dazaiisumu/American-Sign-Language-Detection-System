# config.py for ASL Recognition System
import os
from pathlib import Path

# =====================================================================
# PROJECT PATHS AND DIRECTORIES - CORRECTED
# =====================================================================
# Base directory of the project
BASE_DIR = Path(__file__).resolve().parent.parent  # Go up one level to SignLanguageDetection/


# Data directories - CORRECTED
DATA_DIR = BASE_DIR / 'data'
# Your dataset is in data/asl_alphabet_train/asl_alphabet_train/
RAW_DATA_DIR = DATA_DIR / 'asl_alphabet_train' / 'asl_alphabet_train'  # Added extra level
PROCESSED_DATA_DIR = DATA_DIR / 'processed'

# Model directory
MODELS_DIR = BASE_DIR / 'models'

# Path to the ASL alphabet dataset - CORRECTED
DATASET_PATH = RAW_DATA_DIR  # This now matches your actual path

# Path for saving processed data
PROCESSED_PATH = PROCESSED_DATA_DIR
MODELS_PATH = MODELS_DIR

# Create directories if they don't exist (only create ones that should exist)
for dir_path in [DATA_DIR, PROCESSED_DATA_DIR, MODELS_DIR]:
    os.makedirs(dir_path, exist_ok=True)

# =====================================================================
# IMAGE PROCESSING PARAMETERS
# =====================================================================
# Image size for model input
IMG_SIZE = (64, 64)

# =====================================================================
# DATA AUGMENTATION PARAMETERS
# =====================================================================
ROTATION_RANGE = 15
WIDTH_SHIFT_RANGE = 0.1
HEIGHT_SHIFT_RANGE = 0.1
ZOOM_RANGE = 0.1
BRIGHTNESS_RANGE = [0.9, 1.1]
HORIZONTAL_FLIP = True
FILL_MODE = 'nearest'

# =====================================================================
# DATA SPLITTING PARAMETERS
# =====================================================================
TEST_SIZE = 0.2
RANDOM_STATE = 42
STRATIFY = True

# =====================================================================
# MODEL TRAINING PARAMETERS
# =====================================================================
BATCH_SIZE = 32
EPOCHS = 20
LEARNING_RATE = 0.001
NUM_CLASSES = 29

# =====================================================================
# CLASS LABELS
# =====================================================================
CLASS_NAMES = [
    'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O',
    'P','Q','R','S','T','U','V','W','X','Y','Z','del','nothing','space'
]

LETTER_TO_IDX = {letter: idx for idx, letter in enumerate(CLASS_NAMES)}
IDX_TO_LETTER = {idx: letter for idx, letter in enumerate(CLASS_NAMES)}

# =====================================================================
# INFERENCE SETTINGS
# =====================================================================
MIN_CONFIDENCE = 0.7
MAX_IMAGES_PER_CLASS = 300

# =====================================================================
# MEDIAPIPE SETTINGS
# =====================================================================
MAX_NUM_HANDS = 1
MIN_DETECTION_CONFIDENCE = 0.7
MIN_TRACKING_CONFIDENCE = 0.5
STATIC_IMAGE_MODE = False
HAND_PADDING = 40