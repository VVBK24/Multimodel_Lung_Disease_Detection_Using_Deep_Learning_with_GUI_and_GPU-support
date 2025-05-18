import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing import image
import cv2
import base64
import os
import uuid
from datetime import datetime

class HeatmapGenerator:
    def __init__(self):
        self.model_layers = {
            'ct_efficientnetv2s': 'top_conv',  # For EfficientNetV2S
            'ct_resnet50': 'conv5_block3_out',       # For ResNet50
            'xray_mobilenetv2': 'block_16_project_BN',  # For MobileNetV2
            'xray_vgg16': 'block5_conv3',            # For VGG16
            'default': 'top_conv'         # Default to EfficientNetV2S layer
        }
        # Create static directory if it doesn't exist
        current_dir = os.path.dirname(os.path.abspath(__file__))  # Get the directory containing this file
        self.static_dir = os.path.join(current_dir, 'static', 'heatmaps')
        os.makedirs(self.static_dir, exist_ok=True)
        print(f"Static directory created at: {self.static_dir}")

    def get_heatmap(self, model, img_array, last_conv_layer_name):
        try:
            print(f"\nGetting heatmap for layer: {last_conv_layer_name}")
            print(f"Model input shape: {model.input_shape}")
            print(f"Model output shape: {model.output_shape}")
            
            # Create a model that maps the input image to the activations of the last conv layer
            grad_model = tf.keras.models.Model(
                [model.inputs],
                [model.get_layer(last_conv_layer_name).output, model.output]
            )
            print(f"Grad model created successfully")

            # Get the gradient of the predicted class with respect to the output feature map
            with tf.GradientTape() as tape:
                conv_outputs, predictions = grad_model(img_array)
                print(f"Conv outputs shape: {conv_outputs.shape}")
                print(f"Predictions shape: {predictions.shape}")
                
                class_idx = tf.argmax(predictions[0])
                print(f"Predicted class index: {class_idx}")
                loss = predictions[:, class_idx]
                print(f"Loss shape: {loss.shape}")

            # Get the gradients of the loss with respect to the output feature map
            grads = tape.gradient(loss, conv_outputs)
            print(f"Gradients shape: {grads.shape}")

            # Generate the heatmap
            pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))
            print(f"Pooled gradients shape: {pooled_grads.shape}")
            
            heatmap = tf.reduce_mean(tf.multiply(pooled_grads, conv_outputs), axis=-1)
            heatmap = np.maximum(heatmap, 0)
            heatmap /= np.max(heatmap)
            print(f"Final heatmap shape: {heatmap.shape}")

            return heatmap[0]
        except Exception as e:
            print(f"Error generating heatmap: {str(e)}")
            import traceback
            traceback.print_exc()
            return None

    def apply_heatmap(self, img_path, heatmap, alpha=0.4):
        try:
            # Load the original image
            img = cv2.imread(img_path)
            img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            
            # Resize heatmap to match image size
            heatmap = cv2.resize(heatmap, (img.shape[1], img.shape[0]))
            
            # Convert heatmap to RGB
            heatmap = np.uint8(255 * heatmap)
            heatmap = cv2.applyColorMap(heatmap, cv2.COLORMAP_JET)
            
            # Superimpose the heatmap on original image
            superimposed_img = heatmap * alpha + img
            superimposed_img = np.clip(superimposed_img, 0, 255).astype(np.uint8)
            
            return superimposed_img
        except Exception as e:
            print(f"Error applying heatmap: {str(e)}")
            return None

    def generate_visualization(self, model, img_path, model_type):
        try:
            print(f"\nGenerating visualization for model type: {model_type}")
            print(f"Image path: {img_path}")
            print(f"Static directory path: {self.static_dir}")
            print(f"Directory exists: {os.path.exists(self.static_dir)}")
            print(f"Directory is writable: {os.access(self.static_dir, os.W_OK)}")
            
            # Load and preprocess image
            img = image.load_img(img_path, target_size=(224, 224))
            img_array = image.img_to_array(img) / 255.0
            img_array = np.expand_dims(img_array, axis=0)
            print(f"Image array shape: {img_array.shape}")

            # Get the last conv layer name for the model
            last_conv_layer = self.model_layers.get(model_type)
            if not last_conv_layer:
                print(f"No layer mapping found for model type: {model_type}")
                return None
            print(f"Using layer: {last_conv_layer}")

            # Generate heatmap
            heatmap = self.get_heatmap(model, img_array, last_conv_layer)
            if heatmap is None:
                print("Failed to generate heatmap")
                return None
            print(f"Heatmap shape: {heatmap.shape}")

            # Apply heatmap to original image
            visualization = self.apply_heatmap(img_path, heatmap)
            if visualization is None:
                print("Failed to apply heatmap")
                return None
            print(f"Visualization shape: {visualization.shape}")

            # Generate unique filename
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            unique_id = str(uuid.uuid4())[:8]
            filename = f'heatmap_{timestamp}_{unique_id}.jpg'
            filepath = os.path.join(self.static_dir, filename)
            print(f"Saving heatmap to: {filepath}")

            # Create directory if it doesn't exist
            os.makedirs(os.path.dirname(filepath), exist_ok=True)

            # Save the visualization
            try:
                cv2.imwrite(filepath, cv2.cvtColor(visualization, cv2.COLOR_RGB2BGR))
                print(f"File saved successfully")
                print(f"File exists: {os.path.exists(filepath)}")
                print(f"File size: {os.path.getsize(filepath)} bytes")
            except Exception as save_error:
                print(f"Error saving file: {str(save_error)}")
                return None
            
            # Return the relative URL path
            url_path = f'/static/heatmaps/{filename}'
            print(f"Returning URL path: {url_path}")
            return url_path

        except Exception as e:
            print(f"Error in visualization generation: {str(e)}")
            import traceback
            traceback.print_exc()
            return None 