import cv2
import numpy as np
import tensorflow as tf
import mediapipe as mp
import pickle
import os
import sys
import time

# Add parent directory for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from .config import MODELS_PATH, MIN_CONFIDENCE
from .custom_model import custom_softmax, custom_relu, CustomDense

# -----------------------------
# Load Model and Artifacts
# -----------------------------
model = tf.keras.models.load_model(
    os.path.join(MODELS_PATH, "landmark_model.h5"),
    custom_objects={'CustomDense': CustomDense},
    compile=False
)

with open(os.path.join(MODELS_PATH, "landmark_scaler.pkl"), "rb") as f:
    scaler = pickle.load(f)

with open(os.path.join(MODELS_PATH, "class_name_mapping.pkl"), "rb") as f:
    class_name_mapping = pickle.load(f)

print(f"Loaded model for {len(class_name_mapping)} classes: {list(class_name_mapping.values())}")

# -----------------------------
# MediaPipe Initialization
# -----------------------------
mp_hands = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils
hands = mp_hands.Hands(
    static_image_mode=False,
    max_num_hands=1,
    min_detection_confidence=0.7,
    min_tracking_confidence=0.5
)

# -----------------------------
# Extract Landmarks from Frame
# -----------------------------
def extract_landmarks_from_frame(rgb_frame):
    results = hands.process(rgb_frame)
    landmarks = []

    if results.multi_hand_landmarks:
        for hand_landmarks in results.multi_hand_landmarks:
            for lm in hand_landmarks.landmark:
                landmarks.extend([lm.x, lm.y, lm.z])
            return np.array(landmarks), hand_landmarks
    return None, None

# -----------------------------
# Detection Loop Function
# -----------------------------
def run_detection_loop(shared_dict, min_confidence, running_flag):
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("ERROR: Could not open camera")
        return

    print("Detection loop started. Camera opened.")

    while running_flag["status"]:
        success, frame = cap.read()
        if not success:
            continue

        frame = cv2.flip(frame, 1)
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        landmarks, hand_landmarks = extract_landmarks_from_frame(rgb_frame)

        label = "No hand"
        color = (0, 0, 255)

        if landmarks is not None and len(landmarks) == 63:
            landmarks_scaled = scaler.transform(landmarks.reshape(1, -1))
            predictions = model.predict(landmarks_scaled, verbose=0)
            predicted_class_idx = np.argmax(predictions)
            confidence = float(predictions[0][predicted_class_idx])
            predicted_class_name = class_name_mapping.get(predicted_class_idx, f"Class_{predicted_class_idx}")

            if confidence >= min_confidence:
                shared_dict.update({
                    "letter": predicted_class_name,
                    "confidence": confidence,
                    "timestamp": time.strftime("%Y-%m-%dT%H:%M:%S")
                })
                label = f"{predicted_class_name} ({confidence:.2f})"
                color = (0, 255, 0)
            else:
                shared_dict.update({
                    "letter": None,
                    "confidence": confidence,
                    "timestamp": time.strftime("%Y-%m-%dT%H:%M:%S")
                })
                label = "Uncertain"
                color = (0, 165, 255)
        else:
            shared_dict.update({
                "letter": None,
                "confidence": 0.0,
                "timestamp": time.strftime("%Y-%m-%dT%H:%M:%S")
            })

        # Draw hand landmarks and label if detected
        if hand_landmarks:
            h, w, _ = frame.shape
            mp_drawing.draw_landmarks(frame, hand_landmarks, mp_hands.HAND_CONNECTIONS)
            x_coords = [int(lm.x * w) for lm in hand_landmarks.landmark]
            y_coords = [int(lm.y * h) for lm in hand_landmarks.landmark]
            x_min, x_max = min(x_coords), max(x_coords)
            y_min, y_max = min(y_coords), max(y_coords)
            cv2.rectangle(frame, (x_min, y_min), (x_max, y_max), color, 2)
            cv2.putText(frame, label, (x_min, y_min - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)
        else:
            cv2.putText(frame, label, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, color, 2)

        # Show frame
        cv2.imshow("ASL Detection", frame)

        # Allow quitting with 'q'
        if cv2.waitKey(1) & 0xFF == ord('q'):
            running_flag["status"] = False
            break

    cap.release()
    cv2.destroyAllWindows()
    print("Detection loop stopped. Camera released.")
