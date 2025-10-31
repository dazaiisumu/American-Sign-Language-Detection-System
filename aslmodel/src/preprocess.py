import os
import cv2
import numpy as np
from sklearn.model_selection import train_test_split
import sys
import mediapipe as mp
import pickle

# Add the parent directory to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import DATASET_PATH, PROCESSED_PATH, IMG_SIZE, MAX_IMAGES_PER_CLASS

# Initialize MediaPipe Hands
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(static_image_mode=True, max_num_hands=1, min_detection_confidence=0.5)

print("="*50)
print("Extracting hand landmarks from dataset...")
print("="*50)

# Get class folders
letters = sorted([d for d in os.listdir(DATASET_PATH) if os.path.isdir(os.path.join(DATASET_PATH, d))])
print(f"Found {len(letters)} classes: {letters}")

X_landmarks = []  # Hand landmarks
y_labels = []     # Labels

def extract_landmarks(image):
    """Extract hand landmarks from an image"""
    results = hands.process(image)
    landmarks = []
    
    if results.multi_hand_landmarks:
        for hand_landmarks in results.multi_hand_landmarks:
            # Extract all 21 landmarks (x, y, z coordinates)
            for lm in hand_landmarks.landmark:
                landmarks.extend([lm.x, lm.y, lm.z])
            break  # Only use first hand found
    return np.array(landmarks)

print("\nProcessing images and extracting landmarks...")
for label, letter in enumerate(letters):
    class_path = os.path.join(DATASET_PATH, letter)
    image_files = [f for f in os.listdir(class_path) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
    
    print(f"Processing {letter} ({min(len(image_files), MAX_IMAGES_PER_CLASS)} images)")
    
    processed_count = 0
    for img_name in image_files[:MAX_IMAGES_PER_CLASS]:
        img_path = os.path.join(class_path, img_name)
        img = cv2.imread(img_path)
        
        if img is None:
            continue
            
        # Convert to RGB for MediaPipe
        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        landmarks = extract_landmarks(img_rgb)
        
        if len(landmarks) > 0:  # Only add if landmarks were detected
            X_landmarks.append(landmarks)
            y_labels.append(label)
            processed_count += 1
            
    print(f"  Successfully processed {processed_count} images for {letter}")

# Convert to numpy arrays
X_landmarks = np.array(X_landmarks)
y_labels = np.array(y_labels)

print(f"\nSuccessfully extracted landmarks from {len(X_landmarks)} images")
print(f"Landmarks shape: {X_landmarks.shape}")

# Split data
X_train, X_test, y_train, y_test = train_test_split(
    X_landmarks, y_labels, test_size=0.2, random_state=42, stratify=y_labels
)

# Save processed data
np.save(os.path.join(PROCESSED_PATH, "X_train_landmarks.npy"), X_train)
np.save(os.path.join(PROCESSED_PATH, "X_test_landmarks.npy"), X_test)
np.save(os.path.join(PROCESSED_PATH, "y_train_landmarks.npy"), y_train)
np.save(os.path.join(PROCESSED_PATH, "y_test_landmarks.npy"), y_test)

print("\n" + "="*50)
print("Landmark extraction complete!")
print(f"Training samples: {X_train.shape[0]}")
print(f"Testing samples: {X_test.shape[0]}")
print("="*50)