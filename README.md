# Lung Disease Analysis System

A comprehensive web application for analyzing chest X-rays and CT scans to detect lung diseases using deep learning models.

The system intelligently uses GPU resources if available, otherwise falls back to CPU for processing, ensuring efficient performance across different hardware setups.
Our modular architecture allows easy integration of various models, enabling flexibility to improve and expand the system with new disease detection capabilities.

## Table of Contents
- [Features](#features)
- [System Requirements](#system-requirements)
- [Installation](#installation)
- [Project Structure](#project-structure)
- [Technical Details](#technical-details)
- [Usage Guide](#usage-guide)
- [Models](#models)
- [API Documentation](#api-documentation)
- [Visualization System](#visualization-system)
- [Troubleshooting](#troubleshooting)

## Features

### Core Functionality
- Support for both X-ray and CT scan analysis
- Automatic scan type detection
- Multiple pre-trained model options
- Real-time disease prediction
- Heatmap visualization of affected areas
- Interactive chat interface for medical consultation

### Image Analysis
- Supports JPEG, PNG, and DICOM formats
- Automatic image preprocessing
- High-resolution image handling
- Real-time preview functionality

### AI Models
- Multiple specialized models:
  - CT Scan Models:
    - EfficientNetB0
    - ResNet50
  - X-Ray Models:
    - VGG16
    - MobileNetV2
  - Auto-detection capability

### Visualization
- Gradient-based heatmap generation
- Interactive visualization dialog
- Color-coded disease localization
- Adjustable visualization opacity

### Chat Interface
- Real-time medical consultation
- Disease-specific preventive measures
- Timestamp-enabled message history
- Role-based message styling

## System Requirements

### Backend
- Python 3.8+
- TensorFlow 2.x
- OpenCV
- Flask
- NumPy
- Pillow

### Frontend
- Node.js 14+
- React 18+
- Material-UI 5+
- TypeScript 4+

## Installation

### Backend Setup
```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start backend server
python backend/app.py
```

### Frontend Setup
```bash
# Install dependencies
cd frontend
npm install

# Start development server
npm start
```

## Project Structure

```
project/
├── backend/
│   ├── app.py                 # Main Flask application
│   ├── image_processor.py     # Image processing logic
│   ├── heatmap_generator.py   # Visualization generation
│   ├── models/               # Pre-trained models
│   └── static/
│       └── heatmaps/        # Generated heatmap storage
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Lung.tsx     # Main analysis interface
│   │   │   └── Prediction.tsx # Secondary prediction page
│   │   └── components/
│   └── public/
└── requirements.txt
```

## Technical Details

### Backend Implementation

#### Image Processing Pipeline
1. Image upload handling
2. Format detection and validation
3. Preprocessing and normalization
4. Model selection and prediction
5. Heatmap generation
6. Result compilation

#### Heatmap Generation Process
1. Model layer selection based on architecture
2. Gradient computation
3. Feature map extraction
4. Heatmap overlay generation
5. File storage and URL generation

### Frontend Implementation

#### State Management
- File selection and preview
- Analysis status tracking
- Chat history management
- Visualization dialog control
- Model and scan type selection

#### UI Components
- Drag and drop file upload
- Real-time image preview
- Interactive chat interface
- Visualization dialog
- Model selection radio buttons

## Usage Guide

### Basic Usage
1. Select scan type (Auto, CT, or X-ray)
2. Choose preferred model
3. Upload image via drag & drop or file selection
4. Click "Analyze Image"
5. View results and heatmap visualization
6. Interact with chat interface for more information

### Advanced Features
1. Model Selection:
   - Auto-detect: Automatically selects appropriate model
   - Manual: Choose specific model based on scan type
   
2. Visualization:
   - Click "View Heatmap" for detailed visualization
   - Adjust dialog size for better viewing
   
3. Chat Interface:
   - Ask about specific conditions
   - Request preventive measures
   - Get detailed medical advice

## Models

### CT Scan Models
1. EfficientNetB0
   - Optimized for CT scan analysis
   - Layer: top_conv
   - Best for: General CT scan analysis

2. ResNet50
   - Deep residual learning
   - Layer: conv5_block3_out
   - Best for: Detailed feature extraction

### X-Ray Models
1. VGG16
   - Traditional CNN architecture
   - Layer: block5_conv3
   - Best for: Clear X-ray images

2. MobileNetV2
   - Lightweight architecture
   - Layer: block_16_project_BN
   - Best for: Quick analysis

## API Documentation

### Endpoints

#### POST /predict
- Purpose: Image analysis and prediction
- Parameters:
  - image: File (image)
  - scan_mode: string (auto/ct/xray)
  - model_type: string (model selection)
- Response:
  ```json
  {
    "disease_type": string,
    "disease_probability": float,
    "model_used": string,
    "visualization": string (URL),
    "image_type": string
  }
  ```

## Visualization System

### Heatmap Generation
- Based on Grad-CAM technique
- Uses model-specific convolutional layers
- Generates color-coded overlays
- Saves as JPEG files in static directory

### File Management
- Unique filename generation
- Timestamp-based naming
- Automatic directory creation
- Proper file permissions handling

## Troubleshooting

### Common Issues
1. Image Upload Failures
   - Check file format
   - Verify file size
   - Ensure proper permissions

2. Model Prediction Errors
   - Verify image quality
   - Check model compatibility
   - Ensure proper preprocessing

3. Visualization Issues
   - Check static directory permissions
   - Verify file paths
   - Ensure proper URL configuration

### Error Messages
- Invalid file format
- Model loading failure
- Prediction error
- Visualization generation failure
- File access denied

### Support
For additional support or bug reports, please create an issue in the repository. # Multimodal-
