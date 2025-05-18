import numpy as np
import tensorflow as tf
from tensorflow.keras.models import Model
from tensorflow.keras.layers import GlobalAveragePooling2D, Dense, Input, Dropout, BatchNormalization
from tensorflow.keras.applications import MobileNetV2, ResNet50, EfficientNetV2S, VGG16
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.preprocessing import image
import os
from heatmap_generator import HeatmapGenerator

class ImageProcessor:
    def __init__(self):
        try:
            # Define the scan type classifier model architecture
            def create_scan_classifier():
                input_tensor = Input(shape=(224, 224, 3))
                base_model = MobileNetV2(weights='imagenet', include_top=False, input_tensor=input_tensor)
                x = base_model.output
                x = GlobalAveragePooling2D()(x)
                x = Dropout(0.3)(x)
                output = Dense(1, activation='sigmoid')(x)
                model = Model(inputs=input_tensor, outputs=output)
                model.compile(optimizer=Adam(1e-4), loss='binary_crossentropy', metrics=['accuracy'])
                return model

            # Define CT model builder
            def build_ct_model(base_model, num_classes=4):
                x = base_model.output
                x = GlobalAveragePooling2D()(x)
                x = BatchNormalization()(x)
                x = Dropout(0.4)(x)
                output = Dense(num_classes, activation='softmax')(x)
                return Model(inputs=base_model.input, outputs=output)

            # Load scan type classifier
            self.scan_type_model = create_scan_classifier()
            self.scan_type_model.load_weights('models/ct_vs_xray_classifier.h5')

            # Load CT models
            # EfficientNetV2S (now the default)
            eff_base = EfficientNetV2S(weights='imagenet', include_top=False, input_shape=(224, 224, 3))
            self.ct_efficientnetv2s = build_ct_model(eff_base, num_classes=4)
            self.ct_efficientnetv2s.load_weights('models/ct_efficientnetv2s.h5')
            self.ct_efficientnetv2s.compile(optimizer=Adam(1e-4), loss='categorical_crossentropy', metrics=['accuracy'])

            # ResNet50
            resnet_base = ResNet50(weights='imagenet', include_top=False, input_shape=(224, 224, 3))
            self.ct_resnet50 = build_ct_model(resnet_base, num_classes=4)
            self.ct_resnet50.load_weights('models/ct_resnet50.h5')
            self.ct_resnet50.compile(optimizer=Adam(1e-4), loss='categorical_crossentropy', metrics=['accuracy'])

            # Define X-ray model builder (binary classification)
            def build_xray_model(base_model):
                x = base_model.output
                x = GlobalAveragePooling2D()(x)
                x = Dropout(0.3)(x)
                output = Dense(1, activation='sigmoid')(x)
                return Model(inputs=base_model.input, outputs=output)

            # Load X-ray models
            # MobileNetV2
            mobile_base = MobileNetV2(weights='imagenet', include_top=False, input_shape=(224, 224, 3))
            self.xray_mobilenetv2 = build_xray_model(mobile_base)
            self.xray_mobilenetv2.load_weights('models/xray_mobilenetv2.h5')
            self.xray_mobilenetv2.compile(optimizer=Adam(1e-4), loss='binary_crossentropy', metrics=['accuracy'])

            # VGG16
            vgg_base = VGG16(weights='imagenet', include_top=False, input_shape=(224, 224, 3))
            self.xray_vgg16 = build_xray_model(vgg_base)
            self.xray_vgg16.load_weights('models/xray_vgg16.h5')
            self.xray_vgg16.compile(optimizer=Adam(1e-4), loss='binary_crossentropy', metrics=['accuracy'])
            
            # Initialize heatmap generator
            self.heatmap_generator = HeatmapGenerator()
            
            print("All models loaded successfully")
            
        except Exception as e:
            print(f"Error loading models: {str(e)}")
            raise

        self.ct_classes = ['Adenocarcinoma', 'Large Cell Carcinoma', 'Squamous Cell Carcinoma', 'normal']
        self.xray_classes = ['pneumonia', 'normal']

    def preprocess_image(self, img_path):
        try:
            img = image.load_img(img_path, target_size=(224, 224))
            img_array = image.img_to_array(img) / 255.0
            img_array = np.expand_dims(img_array, axis=0)
            print(f"Image shape after preprocessing: {img_array.shape}")
            return img_array
        except Exception as e:
            print(f"Error in preprocessing: {str(e)}")
            raise

    def detect_scan_type(self, img_array):
        try:
            scan_pred = self.scan_type_model.predict(img_array, verbose=0)[0][0]
            print(f"Scan type prediction: {scan_pred}")
            return "ct" if scan_pred < 0.5 else "xray"
        except Exception as e:
            print(f"Error in scan type detection: {str(e)}")
            return "unknown"

    def get_model_predictions(self, img_array, scan_type):
        predictions = {}
        try:
            if scan_type == "ct":
                # Get predictions from both CT models
                effnet_pred = self.ct_efficientnetv2s.predict(img_array, verbose=0)[0]
                resnet_pred = self.ct_resnet50.predict(img_array, verbose=0)[0]
                
                effnet_class_idx = np.argmax(effnet_pred)
                resnet_class_idx = np.argmax(resnet_pred)
                
                predictions['efficientnet'] = {
                    'disease': self.ct_classes[effnet_class_idx],
                    'confidence': float(effnet_pred[effnet_class_idx])
                }
                predictions['resnet50'] = {
                    'disease': self.ct_classes[resnet_class_idx],
                    'confidence': float(resnet_pred[resnet_class_idx])
                }
            else:
                # Get predictions from both X-ray models (binary classification)
                mobilenet_pred = self.xray_mobilenetv2.predict(img_array, verbose=0)[0][0]
                vgg_pred = self.xray_vgg16.predict(img_array, verbose=0)[0][0]
                
                # Convert binary predictions to class labels
                mobilenet_class = 'pneumonia' if mobilenet_pred > 0.5 else 'normal'
                vgg_class = 'pneumonia' if vgg_pred > 0.5 else 'normal'
                
                predictions['mobilenet'] = {
                    'disease': mobilenet_class,
                    'confidence': float(mobilenet_pred if mobilenet_class == 'pneumonia' else 1 - mobilenet_pred)
                }
                predictions['vgg16'] = {
                    'disease': vgg_class,
                    'confidence': float(vgg_pred if vgg_class == 'pneumonia' else 1 - vgg_pred)
                }
            
            return predictions
        except Exception as e:
            print(f"Error getting model predictions: {str(e)}")
            return None

    def process_image(self, img_path, model_type='default'):
        try:
            print(f"\nProcessing image: {img_path}")
            img_array = self.preprocess_image(img_path)
            scan_type = self.detect_scan_type(img_array)
            print(f"Detected scan type: {scan_type}")
            
            if scan_type == "unknown":
                return {
                    "scan_type": "unknown",
                    "disease": "unknown",
                    "confidence": 0.0,
                    "model_used": "error",
                    "all_predictions": {},
                    "visualization": None
                }
            
            # Get predictions from all relevant models
            predictions = self.get_model_predictions(img_array, scan_type)
            
            if not predictions:
                return {
                    "scan_type": scan_type,
                    "disease": "unknown",
                    "confidence": 0.0,
                    "model_used": "error",
                    "all_predictions": {},
                    "visualization": None
                }
            
            # For CT scans and X-rays, use the user-selected model if specified, otherwise use auto-detection
            if scan_type == "ct":
                if model_type in ["ct_efficientnetb0", "ct_efficientnetv2s"]:
                    best_prediction = predictions['efficientnet']
                    model_used = 'ct_efficientnetv2s'
                    model = self.ct_efficientnetv2s
                elif model_type == "ct_resnet50":
                    best_prediction = predictions['resnet50']
                    model_used = 'ct_resnet50'
                    model = self.ct_resnet50
                else:  # auto/default
                    best_prediction = predictions['efficientnet']
                    model_used = 'ct_efficientnetv2s'
                    model = self.ct_efficientnetv2s
            else:  # xray
                if model_type == "xray_vgg16":
                    best_prediction = predictions['vgg16']
                    model_used = 'xray_vgg16'
                    model = self.xray_vgg16
                elif model_type == "xray_mobilenetv2":
                    best_prediction = predictions['mobilenet']
                    model_used = 'xray_mobilenetv2'
                    model = self.xray_mobilenetv2
                else:  # auto/default
                    # Use the model with the highest confidence
                    best_prediction = max(predictions.values(), key=lambda x: x['confidence'])
                    model_used = 'xray_mobilenetv2' if best_prediction == predictions['mobilenet'] else 'xray_vgg16'
                    model = self.xray_mobilenetv2 if model_used == 'xray_mobilenetv2' else self.xray_vgg16
            
            print(f"\nGenerating heatmap for model: {model_used}")
            # Generate heatmap visualization
            heatmap = self.heatmap_generator.generate_visualization(model, img_path, model_used)
            print(f"Generated heatmap: {heatmap}")
            
            return {
                "scan_type": scan_type,
                "disease": best_prediction['disease'],
                "confidence": best_prediction['confidence'],
                "model_used": model_used,
                "all_predictions": predictions,
                "visualization": heatmap
            }
        except Exception as e:
            print(f"Error processing image: {str(e)}")
            return {
                "scan_type": "unknown",
                "disease": "unknown",
                "confidence": 0.0,
                "model_used": "error",
                "all_predictions": {},
                "visualization": None
            }
