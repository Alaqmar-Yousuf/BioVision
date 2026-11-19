import cv2
import numpy as np
import tensorflow as tf
from tensorflow import keras

def find_last_conv_layer(model):
    """
    Locates the name of the final convolutional layer in the network.
    For EfficientNetB0, this is typically 'top_conv'.
    """
    for layer in reversed(model.layers):
        if 'conv' in layer.name.lower() and hasattr(layer, 'output') and len(layer.output.shape) == 4:
            return layer.name
    # Fallback to any layer with 4D feature map output before pooling
    for layer in reversed(model.layers):
        if hasattr(layer, 'output') and len(layer.output.shape) == 4:
            return layer.name
    return 'top_conv'

def make_gradcam_heatmap(batch, model, layer_name, class_index=None):
    """
    Generates a Grad-CAM heatmap for a given input batch and target class.
    """
    grad_model = keras.Model(
        model.inputs,
        [model.get_layer(layer_name).output, model.output]
    )
    
    with tf.GradientTape() as tape:
        conv_out, preds = grad_model(batch)
        if class_index is None:
            class_index = int(tf.argmax(preds[0]))
        score = preds[:, class_index]
        
    grads = tape.gradient(score, conv_out)
    weights = tf.reduce_mean(grads, axis=(0, 1, 2))
    heat = tf.reduce_sum(conv_out[0] * weights, axis=-1)
    heat = tf.maximum(heat, 0)
    heat = heat / (tf.reduce_max(heat) + 1e-8)
    return heat.numpy()

def overlay_heatmap(img_rgb, heat, alpha=0.4):
    """
    Blends the computed heatmap over the original RGB image using JET colormap.
    """
    heat_resized = cv2.resize(heat, (img_rgb.shape[1], img_rgb.shape[0]))
    colored = cv2.applyColorMap(np.uint8(255 * heat_resized), cv2.COLORMAP_JET)
    colored = cv2.cvtColor(colored, cv2.COLOR_BGR2RGB)
    return cv2.addWeighted(img_rgb, 1.0 - alpha, colored, alpha, 0)
