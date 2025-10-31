import os
import sys
import numpy as np
import tensorflow as tf
from sklearn.metrics import classification_report
from sklearn.preprocessing import StandardScaler, LabelEncoder
import matplotlib.pyplot as plt
import pickle

# Add the parent directory to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import PROCESSED_PATH, MODELS_PATH, CLASS_NAMES

# Import custom components
from custom_model import (
    CustomDense, custom_relu, custom_softmax,
    custom_categorical_crossentropy, custom_accuracy,
    one_hot_encode
)

print("Loading landmark data...")
try:
    X_train = np.load(os.path.join(PROCESSED_PATH, "X_train_landmarks.npy"))
    y_train = np.load(os.path.join(PROCESSED_PATH, "y_train_landmarks.npy"))
    X_test = np.load(os.path.join(PROCESSED_PATH, "X_test_landmarks.npy"))
    y_test = np.load(os.path.join(PROCESSED_PATH, "y_test_landmarks.npy"))
    
    print(f"X_train shape: {X_train.shape}, y_train shape: {y_train.shape}")
    print(f"X_test shape: {X_test.shape}, y_test shape: {y_test.shape}")

except FileNotFoundError as e:
    print(f"ERROR: {e}")
    print("Run landmark preprocessing first: python preprocess_landmarks.py")
    exit()

# Check which classes are actually present
all_labels = np.concatenate([y_train, y_test])
unique_classes = np.unique(all_labels)
print(f"Unique classes found: {unique_classes}")
print(f"Number of classes: {len(unique_classes)}")

# Create a mapping from original labels to continuous labels (0, 1, 2, ...)
label_mapping = {orig_label: new_label for new_label, orig_label in enumerate(unique_classes)}
reverse_mapping = {new_label: orig_label for orig_label, new_label in label_mapping.items()}

print(f"Label mapping: {label_mapping}")

# Map the labels to continuous indices
y_train_mapped = np.array([label_mapping[label] for label in y_train])
y_test_mapped = np.array([label_mapping[label] for label in y_test])

# Filter CLASS_NAMES to only include classes that are present
present_class_names = [CLASS_NAMES[orig_label] for orig_label in unique_classes if orig_label < len(CLASS_NAMES)]
print(f"Present classes: {present_class_names}")

# Normalize landmarks
scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)

# Save the scaler
with open(os.path.join(MODELS_PATH, "landmark_scaler.pkl"), "wb") as f:
    pickle.dump(scaler, f)

# One-hot encode labels with correct number of classes using custom function
num_classes = len(unique_classes)
y_train_onehot = one_hot_encode(y_train_mapped, num_classes)
y_test_onehot = one_hot_encode(y_test_mapped, num_classes)

print(f"y_train_onehot shape: {y_train_onehot.shape}")
print(f"y_test_onehot shape: {y_test_onehot.shape}")

# Build neural network for landmarks using custom layers
model = tf.keras.Sequential([
    CustomDense(256, activation=custom_relu, input_shape=(X_train.shape[1],)),
    tf.keras.layers.Dropout(0.3),
    CustomDense(128, activation=custom_relu),
    tf.keras.layers.Dropout(0.3),
    CustomDense(64, activation=custom_relu),
    tf.keras.layers.Dropout(0.2),
    CustomDense(num_classes, activation=custom_softmax)
])

model.compile(
    optimizer='adam',
    loss=custom_categorical_crossentropy,
    metrics=[custom_accuracy]
)

model.summary()

# Train model
history = model.fit(
    X_train, y_train_onehot,
    epochs=50,
    batch_size=32,
    validation_data=(X_test, y_test_onehot),
    callbacks=[
        tf.keras.callbacks.EarlyStopping(patience=10, restore_best_weights=True),
        tf.keras.callbacks.ReduceLROnPlateau(factor=0.2, patience=5)
    ]
)

# Save model
model.save(os.path.join(MODELS_PATH, "landmark_model.h5"))

# Save the mapping information
with open(os.path.join(MODELS_PATH, "label_mapping.pkl"), "wb") as f:
    pickle.dump(label_mapping, f)
with open(os.path.join(MODELS_PATH, "reverse_mapping.pkl"), "wb") as f:
    pickle.dump(reverse_mapping, f)
with open(os.path.join(MODELS_PATH, "unique_classes.pkl"), "wb") as f:
    pickle.dump(unique_classes, f)

# Save the class name mapping
class_name_mapping = {new_label: CLASS_NAMES[orig_label] for orig_label, new_label in label_mapping.items()}
with open(os.path.join(MODELS_PATH, "class_name_mapping.pkl"), "wb") as f:
    pickle.dump(class_name_mapping, f)

# Evaluate
test_loss, test_acc = model.evaluate(X_test, y_test_onehot, verbose=0)
print(f"\nTest Accuracy: {test_acc*100:.2f}%")

# Classification report
y_pred = model.predict(X_test)
y_pred_classes = np.argmax(y_pred, axis=1)
y_true_classes = np.argmax(y_test_onehot, axis=1)

print("\nClassification Report:")
print(classification_report(y_true_classes, y_pred_classes, 
                           target_names=present_class_names,
                           labels=range(len(present_class_names))))

# Plot training history
plt.figure(figsize=(12, 4))
plt.subplot(1, 2, 1)
plt.plot(history.history['custom_accuracy'], label='Train Accuracy')
plt.plot(history.history['val_custom_accuracy'], label='Validation Accuracy')
plt.title('Model Accuracy')
plt.legend()

plt.subplot(1, 2, 2)
plt.plot(history.history['loss'], label='Train Loss')
plt.plot(history.history['val_loss'], label='Validation Loss')
plt.title('Model Loss')
plt.legend()

plt.savefig(os.path.join(MODELS_PATH, "landmark_training_history.png"))
plt.show()