# AI-Powered Lung Disease Detection System

A modern web application for detecting lung diseases using chest X-rays and CT scans through advanced deep learning models.

## Features

- Upload and analyze chest X-rays and CT scans
- Support for multiple image formats (JPEG, PNG, DICOM)
- Real-time image preview
- AI-powered disease detection using ensemble models:
  - VGG16 and MobileNetV2 for X-rays
  - ResNet-50 and EfficientNet-B0 for CT scans
- Interactive AI chatbot for medical queries
- Modern, responsive UI built with React and Material-UI

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add the following variables:
```env
VITE_FLASK_API_URL=your_flask_api_url
VITE_GOOGLE_AI_API_URL=your_google_ai_api_url
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   └── Navbar.tsx
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx
│   │   │   ├── AboutPage.tsx
│   │   │   └── PredictionPage.tsx
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/
│   ├── package.json
│   └── README.md
```

## API Integration

The application expects the following API endpoints:

1. Flask Backend:
   - POST `/predict` - For image analysis
   - Expected response format:
     ```json
     {
       "disease": "string",
       "confidence": number,
       "description": "string"
     }
     ```

2. Google AI API:
   - POST `/chat` - For AI chatbot responses
   - Expected request format:
     ```json
     {
       "message": "string",
       "context": "string"
     }
     ```
   - Expected response format:
     ```json
     {
       "response": "string"
     }
     ```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
