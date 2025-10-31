# custom_model.py
import tensorflow as tf
import numpy as np

# ===========================
# CUSTOM ACTIVATIONS & FUNCTIONS
# ===========================
def custom_relu(x):
    return tf.maximum(0.0, x)

def custom_softmax(x):
    e_x = tf.exp(x - tf.reduce_max(x, axis=-1, keepdims=True))  # numerical stability
    return e_x / tf.reduce_sum(e_x, axis=-1, keepdims=True)

def custom_categorical_crossentropy(y_true, y_pred):
    epsilon = 1e-7
    y_pred = tf.clip_by_value(y_pred, epsilon, 1.0 - epsilon)
    return tf.reduce_mean(-tf.reduce_sum(y_true * tf.math.log(y_pred), axis=-1))

def custom_accuracy(y_true, y_pred):
    correct_predictions = tf.equal(tf.argmax(y_true, axis=-1), tf.argmax(y_pred, axis=-1))
    return tf.reduce_mean(tf.cast(correct_predictions, tf.float32))

def one_hot_encode(labels, num_classes):
    one_hot = np.zeros((len(labels), num_classes), dtype=np.float32)
    for i, label in enumerate(labels):
        one_hot[i, label] = 1
    return one_hot

# ===========================
# CUSTOM LAYERS
# ===========================
class CustomDense(tf.keras.layers.Layer):
    def __init__(self, units, activation=None, **kwargs):
        super(CustomDense, self).__init__(**kwargs)
        self.units = units
        self.activation_name = activation.__name__ if callable(activation) else activation
        self.activation = activation

    def build(self, input_shape):
        self.kernel = self.add_weight(
            shape=(int(input_shape[-1]), self.units),
            initializer='glorot_uniform',
            trainable=True,
            name='kernel'
        )
        self.bias = self.add_weight(
            shape=(self.units,),
            initializer='zeros',
            trainable=True,
            name='bias'
        )

    def call(self, inputs):
        output = tf.matmul(inputs, self.kernel) + self.bias
        if self.activation:
            output = self.activation(output)
        return output
    
    def get_config(self):
        config = super(CustomDense, self).get_config()
        config.update({
            'units': self.units,
            'activation': self.activation_name
        })
        return config
    
    @classmethod
    def from_config(cls, config):
        # Convert string activation name back to function
        activation_name = config.get('activation')
        if activation_name == 'custom_relu':
            config['activation'] = custom_relu
        elif activation_name == 'custom_softmax':
            config['activation'] = custom_softmax
        else:
            config['activation'] = None
        return cls(**config)

# ===========================
# CUSTOM CNN MODEL (for future image-based models)
# ===========================
class CustomCNNModel(tf.keras.Model):
    def __init__(self, num_classes):
        super(CustomCNNModel, self).__init__()
        self.conv1 = tf.keras.layers.Conv2D(32, kernel_size=3, activation=custom_relu)
        self.bn1 = tf.keras.layers.BatchNormalization()
        self.pool1 = tf.keras.layers.MaxPooling2D(pool_size=2)
        self.dropout1 = tf.keras.layers.Dropout(0.25)

        self.conv2 = tf.keras.layers.Conv2D(64, kernel_size=3, activation=custom_relu)
        self.bn2 = tf.keras.layers.BatchNormalization()
        self.pool2 = tf.keras.layers.MaxPooling2D(pool_size=2)
        self.dropout2 = tf.keras.layers.Dropout(0.25)

        self.conv3 = tf.keras.layers.Conv2D(128, kernel_size=3, activation=custom_relu)
        self.bn3 = tf.keras.layers.BatchNormalization()
        self.pool3 = tf.keras.layers.MaxPooling2D(pool_size=2)
        self.dropout3 = tf.keras.layers.Dropout(0.25)

        self.flatten = tf.keras.layers.Flatten()
        self.dense1 = CustomDense(256, activation=custom_relu)
        self.bn4 = tf.keras.layers.BatchNormalization()
        self.dropout4 = tf.keras.layers.Dropout(0.5)
        self.dense2 = CustomDense(num_classes, activation=custom_softmax)

    def call(self, inputs):
        x = self.conv1(inputs)
        x = self.bn1(x)
        x = self.pool1(x)
        x = self.dropout1(x)

        x = self.conv2(x)
        x = self.bn2(x)
        x = self.pool2(x)
        x = self.dropout2(x)

        x = self.conv3(x)
        x = self.bn3(x)
        x = self.pool3(x)
        x = self.dropout3(x)

        x = self.flatten(x)
        x = self.dense1(x)
        x = self.bn4(x)
        x = self.dropout4(x)
        return self.dense2(x)