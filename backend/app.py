from flask import Flask, request, jsonify, send_from_directory
from werkzeug.utils import secure_filename
import os
from image_processor import ImageProcessor
from flask_cors import CORS
import logging
import tensorflow as tf
import subprocess
import platform

# Configure logging
logging.basicConfig(level=logging.INFO,
                   format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def get_nvidia_gpu_info():
    """Get NVIDIA GPU information if available"""
    try:
        if platform.system() == 'Windows':
            # For Windows, we'll use nvidia-smi
            nvidia_smi = subprocess.check_output(['nvidia-smi', '--query-gpu=gpu_name,memory.total,compute_capability.major,compute_capability.minor', '--format=csv,noheader']).decode('utf-8').strip()
            if nvidia_smi:
                for gpu_info in nvidia_smi.split('\n'):
                    name, memory, cc_major, cc_minor = gpu_info.split(', ')
                    logger.info(f"GPU Details:")
                    logger.info(f"  - Name: {name}")
                    logger.info(f"  - Memory: {memory}")
                    logger.info(f"  - Compute Capability: {cc_major}.{cc_minor}")
                    
                    # Check compatibility
                    compute_capability = float(f"{cc_major}.{cc_minor}")
                    if compute_capability < 3.5:
                        logger.warning(f"Your GPU (Compute Capability {compute_capability}) is not compatible with TensorFlow!")
                        logger.warning("TensorFlow requires NVIDIA GPU with Compute Capability >= 3.5")
                        return False
                    return True
        return None
    except (subprocess.CalledProcessError, FileNotFoundError):
        return None

# Check for GPU availability and log device information
physical_devices = tf.config.list_physical_devices()
gpu_devices = tf.config.list_physical_devices('GPU')

logger.info("TensorFlow version: %s", tf.__version__)
logger.info("Available physical devices:")
for device in physical_devices:
    logger.info(f"  - {device.device_type}: {device.name}")

if gpu_devices:
    logger.info("✅ GPU is available. Using GPU devices:")
    for gpu in gpu_devices:
        logger.info(f"  - {gpu.name}")
    
    # Get detailed GPU information
    gpu_compatible = get_nvidia_gpu_info()
    
    if gpu_compatible is False:
        logger.warning("❌ Your GPU is detected but not compatible with TensorFlow!")
        logger.warning("The application will fall back to CPU mode ⚠️")
        # Disable GPU
        tf.config.set_visible_devices([], 'GPU')
        logger.info("GPU has been disabled, running on CPU only 💻")
    elif gpu_compatible:
        # Configure GPU memory growth
        try:
            for gpu in gpu_devices:
                tf.config.experimental.set_memory_growth(gpu, True)
            logger.info("GPU memory growth enabled")
            logger.info("The application will utilize your GPU for faster processing 🚀")
        except RuntimeError as e:
            logger.warning(f"GPU memory growth configuration failed: {str(e)}")
else:
    logger.warning("❌ No GPU devices found. Running on CPU only 💻")
    logger.warning("Processing will be slower. For better performance, consider using a compatible NVIDIA GPU 📈")

# Get the absolute path to the backend directory
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_DIR = os.path.join(BACKEND_DIR, 'static')

# Ensure static directory exists
os.makedirs(os.path.join(STATIC_DIR, 'heatmaps'), exist_ok=True)

app = Flask(__name__, static_url_path='/static', static_folder=STATIC_DIR)
CORS(app)  # Enable CORS for all routes

# Initialize the processor
try:
    processor = ImageProcessor()
    logger.info("Models loaded successfully")
except Exception as e:
    logger.error(f"Failed to initialize ImageProcessor: {str(e)}")
    raise

# Configure upload folder
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/static/heatmaps/<path:filename>')
def serve_heatmap(filename):
    logger.info(f"Serving heatmap: {filename}")
    try:
        heatmap_path = os.path.join(STATIC_DIR, 'heatmaps', filename)
        logger.info(f"Looking for heatmap at: {heatmap_path}")
        logger.info(f"File exists: {os.path.exists(heatmap_path)}")
        return send_from_directory(os.path.join(STATIC_DIR, 'heatmaps'), filename)
    except Exception as e:
        logger.error(f"Error serving heatmap {filename}: {str(e)}")
        return "File not found", 404

@app.route('/predict', methods=['POST'])
def predict():
    if 'image' not in request.files:
        return jsonify({'status': 'error', 'error': 'No file part'}), 400
    
    file = request.files['image']
    if file.filename == '':
        return jsonify({'status': 'error', 'error': 'No selected file'}), 400
    
    if not allowed_file(file.filename):
        return jsonify({'status': 'error', 'error': 'File type not allowed'}), 400
    
    # Get scan mode and model type from request
    scan_mode = request.form.get('scan_mode', 'auto')
    model_type = request.form.get('model_type', 'default')
    
    try:
        # Save the uploaded file
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        logger.info(f"File saved: {filepath}")
        
        # Process the image
        result = processor.process_image(filepath, model_type)
        logger.info(f"Image processed successfully: {result}")
        
        # Clean up the uploaded file
        os.remove(filepath)
        logger.info(f"Temporary file removed: {filepath}")
        
        # Format response to match frontend expectations
        response = {
            'status': 'success',
            'image_type': result['scan_type'],
            'disease_type': result['disease'],
            'disease_probability': result['confidence'],
            'model_used': result['model_used'],
            'visualization': result['visualization'],  # This will now be a URL to the heatmap image
            'all_predictions': result['all_predictions']
        }
        
        # Add additional fields based on disease type
        if result['disease'] == 'pneumonia':
            response['pneumonia_severity'] = 'moderate'  # Placeholder severity
        elif result['disease'] in ['Adenocarcinoma', 'Large Cell Carcinoma', 'Squamous Cell Carcinoma']:
            response['cancer_subtype'] = result['disease']
        
        return jsonify(response)
        
    except Exception as e:
        logger.error(f"Error processing image: {str(e)}")
        return jsonify({
            'status': 'error',
            'error': str(e),
            'image_type': 'unknown',
            'disease_type': 'unknown',
            'disease_probability': 0.0,
            'model_used': 'error',
            'all_predictions': {}
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy'})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000) 
    
