import { useState } from 'react';
import {
  Typography,
  Box,
  Paper,
  Button,
  CircularProgress,
  TextField,
  Alert,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  Fade,
  Zoom,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel
} from '@mui/material';
import { useDropzone } from 'react-dropzone';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ChatIcon from '@mui/icons-material/Chat';
import PersonIcon from '@mui/icons-material/Person';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import CloseIcon from '@mui/icons-material/Close';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  visualization?: string;
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

const Lung = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [visualizationDialog, setVisualizationDialog] = useState(false);
  const [selectedVisualization, setSelectedVisualization] = useState<string | null>(null);
  const [scanMode, setScanMode] = useState<'auto' | 'ct' | 'xray'>('auto');
  const [modelType, setModelType] = useState<'default' | 'ct_efficientnetb0' | 'ct_resnet50' | 'xray_vgg16' | 'xray_mobilenetv2'>('default');
  const [isGeminiLoading, setIsGeminiLoading] = useState(false);

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setSelectedFile(file);
      setError(null);

      try {
        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } catch (err) {
        setError('Failed to process image. Please try again.');
      }
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.dicom']
    },
    maxFiles: 1
  });

  const handleAnalyze = async () => {
    try {
      if (!selectedFile) {
        setError('Please select an image file');
        return;
      }

      setAnalyzing(true);
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('scan_mode', scanMode);
      formData.append('model_type', modelType);

      const response = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Backend response:', data); // Debug log
      
      if (data.status === 'error') {
        throw new Error(data.error || 'Analysis failed');
      }

      // Format the analysis result message
      let resultMessage = `Analysis of your ${data.image_type} shows:\n`;
      resultMessage += `• Disease Type: ${data.disease_type}\n`;
      resultMessage += `• Confidence: ${(data.disease_probability * 100).toFixed(1)}%\n`;
      resultMessage += `• Model used: ${data.model_used}\n`;
      
      if (data.disease_type === "Pneumonia") {
        resultMessage += `• Severity: ${data.pneumonia_severity}\n`;
      } else if (data.cancer_subtype) {
        resultMessage += `• Cancer Subtype: ${data.cancer_subtype}\n`;
      }

      // Add the analysis result to chat history with visualization
      const chatMessage = {
        role: 'assistant' as const,
        content: resultMessage,
        timestamp: new Date(),
        visualization: data.visualization
      };
      console.log('Chat message with visualization:', chatMessage); // Debug log

      setChatHistory(prev => [...prev, chatMessage]);
    } catch (error) {
      console.error('Error during analysis:', error);
      setError(error instanceof Error ? error.message : 'Failed to analyze image');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const userMessage = chatMessage;
    setChatMessage('');
    
    // Add user message
    setChatHistory(prev => [...prev, {
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    }]);

    try {
      setIsGeminiLoading(true);
      
      const lowerMessage = userMessage.toLowerCase();
      
      // Handle general questions about the AI
      if (lowerMessage.includes('what are you') || 
          lowerMessage.includes('who are you') || 
          lowerMessage.includes('what is your purpose') ||
          lowerMessage.includes('what do you do')) {
        
        const aiResponse = `I am a medical AI assistant specialized in lung disease analysis. I can help you:
• Analyze chest X-rays and CT scans for lung conditions
• Explain your diagnosis in simple terms
• Provide information about lung diseases
• Suggest preventive measures
• Answer questions about your specific condition

Please upload your chest image for a detailed analysis, or feel free to ask me any questions about lung health.`;

        setChatHistory(prev => [...prev, {
          role: 'assistant',
          content: aiResponse,
          timestamp: new Date()
        }]);
        return;
      }

      // Handle help requests
      if (lowerMessage.includes('help') || lowerMessage.includes('how to use')) {
        const aiResponse = `Here's how to use this tool:

1. Upload your chest image (X-ray or CT scan)
2. Select the appropriate scan type (Auto-detect, CT Scan, or X-Ray)
3. Choose a model for analysis (optional)
4. Click "Analyze Image"
5. Once analysis is complete, you can:
   • View the diagnosis
   • Ask questions about your condition
   • Get information about prevention
   • Learn about treatment options

Feel free to upload your image to get started!`;

        setChatHistory(prev => [...prev, {
          role: 'assistant',
          content: aiResponse,
          timestamp: new Date()
        }]);
        return;
      }

      // Handle model selection questions
      if (lowerMessage.includes('model') || lowerMessage.includes('which model') || lowerMessage.includes('best model')) {
        const aiResponse = `Here's a guide to our models:

1. Default Model:
   • Automatically selects the best model based on your image
   • Good for general use

2. CT Scan Models:
   • EfficientNetB0: Fast and accurate for CT scans
   • ResNet50: Detailed analysis for complex cases

3. X-ray Models:
   • VGG16: High accuracy for X-ray images
   • MobileNetV2: Quick analysis with good results

For best results:
• Use CT models for CT scans
• Use X-ray models for X-ray images
• Or let the system auto-detect with the default model

Would you like to try analyzing an image?`;

        setChatHistory(prev => [...prev, {
          role: 'assistant',
          content: aiResponse,
          timestamp: new Date()
        }]);
        return;
      }

      // Get the last analysis result if it exists
      const lastAnalysis = chatHistory.find(msg => 
        msg.role === 'assistant' && msg.content.includes('Analysis')
      )?.content || '';

      // Extract the condition from the analysis
      const conditionMatch = lastAnalysis.match(/Disease Type: (.*?)(?:\n|$)/);
      const condition = conditionMatch ? conditionMatch[1] : '';

      // Check for different types of questions
      const isPreventionQuestion = lowerMessage.includes('prevent') || 
                                 lowerMessage.includes('prevention') ||
                                 lowerMessage.includes('preventive measure') ||
                                 lowerMessage.includes('prevention measures') ||
                                 lowerMessage.includes('avoid') ||
                                 lowerMessage.includes('precaution');

      const isTreatmentQuestion = lowerMessage.includes('treatment') ||
                                lowerMessage.includes('cure') ||
                                lowerMessage.includes('medication') ||
                                lowerMessage.includes('therapy');

      const isSymptomQuestion = lowerMessage.includes('symptom') ||
                              lowerMessage.includes('sign') ||
                              lowerMessage.includes('feel') ||
                              lowerMessage.includes('experience');

      // Prepare context for Gemini
      let prompt = `You are a medical information assistant. Provide direct, helpful information while maintaining appropriate medical disclaimers. Be concise and informative.

Context: Previous lung scan analysis: ${lastAnalysis}\n\nUser question: ${userMessage}\n\n`;
      
      if (isPreventionQuestion) {
        if (!condition) {
          prompt += `To provide specific preventive measures, we need to analyze your lung scan first. Please upload your scan using the upload button above.`;
        } else {
          prompt += `Based on your ${condition} diagnosis, provide detailed preventive measures focusing on:
1. Lifestyle changes
2. Environmental protection
3. Medical prevention
4. Monitoring and follow-up

Include specific, actionable steps while maintaining appropriate medical disclaimers.`;
        }
      } else if (isTreatmentQuestion) {
        if (!condition) {
          prompt += `To provide specific treatment information, we need to analyze your lung scan first. Please upload your scan using the upload button above.`;
        } else {
          prompt += `For ${condition}, provide information about:
1. Common treatment options
2. Medical interventions
3. Lifestyle modifications
4. Follow-up care

Include important disclaimers about consulting healthcare providers.`;
        }
      } else if (isSymptomQuestion) {
        if (!condition) {
          prompt += `To provide specific symptom information, we need to analyze your lung scan first. Please upload your scan using the upload button above.`;
        } else {
          prompt += `For ${condition}, describe:
1. Common symptoms
2. Warning signs
3. When to seek medical attention
4. Symptom management

Maintain appropriate medical disclaimers.`;
        }
      } else {
        if (!lastAnalysis) {
          prompt += `To provide accurate information about your lung health, please upload your lung scan using the upload button above.`;
        } else {
          prompt += `Your lung scan shows ${condition}. Provide a clear, informative response to the user's question while:
1. Explaining the condition
2. Addressing their specific question
3. Including relevant medical information
4. Maintaining appropriate disclaimers

For specific medical advice, always recommend consulting a healthcare provider.`;
        }
      }

      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyCmbLw4-Oi0Ip9WAmxelIhf_uwQGLzFVhA",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1024,
            },
            safetySettings: [
              {
                category: "HARM_CATEGORY_HARASSMENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              },
              {
                category: "HARM_CATEGORY_HATE_SPEECH",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              },
              {
                category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              },
              {
                category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              }
            ]
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to get response from Gemini');
      }

      const data: GeminiResponse = await response.json();
      const aiResponse = data.candidates[0]?.content?.parts[0]?.text || 
        "I apologize, but I couldn't generate a response at this time. Please try again or consult with a healthcare professional.";

      // Add AI response to chat history
      setChatHistory(prev => [...prev, {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      }]);

    } catch (error) {
      console.error('Error during chat:', error);
      setChatHistory(prev => [...prev, {
        role: 'assistant',
        content: 'I apologize, but I encountered an error while processing your request. Please try again later.',
        timestamp: new Date()
      }]);
    } finally {
      setIsGeminiLoading(false);
    }
  };

  const handleVisualizationClick = (visualization: string) => {
    setSelectedVisualization(visualization);
    setVisualizationDialog(true);
  };

  // Handle scan mode changes
  const handleScanModeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const mode = event.target.value as 'auto' | 'ct' | 'xray';
    setScanMode(mode);
    
    // Reset model type to default when scan mode changes
    setModelType('default');
  };

  // Handle model type changes
  const handleModelTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setModelType(event.target.value as any);
  };

  return (
    <Box sx={{ 
      width: '100vw',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      padding: { xs: 1, sm: 2, md: 3 },
      boxSizing: 'border-box',
      margin: 0,
      overflow: 'hidden',
      bgcolor: 'background.default'
    }}>
      <Box sx={{ 
        width: '100%',
        bgcolor: 'primary.main',
        color: 'white',
        py: 4,
        px: { xs: 2, md: 4 },
        display: 'flex',
        justifyContent: 'center'
      }}>
        <Box sx={{ maxWidth: '1200px', width: '100%' }}>
          <Typography variant="h3" component="h1" gutterBottom align="center">
            Lung Disease Analysis
          </Typography>
          <Typography variant="h6" color="text.secondary" align="center" sx={{ color: 'white' }}>
            Select image type and upload your chest image for analysis
          </Typography>
        </Box>
      </Box>

      <Box sx={{ 
        flex: 1,
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        py: 4,
        px: { xs: 2, md: 4 }
      }}>
        <Box sx={{ 
          maxWidth: '1200px',
          width: '100%',
          display: 'flex',
          gap: 4,
          flexDirection: { xs: 'column', md: 'row' }
        }}>
          {/* Left Column - Image Upload */}
          <Box sx={{ flex: 1 }}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Upload Chest Image
              </Typography>
              
              {/* Scan Mode Selection */}
              <FormControl component="fieldset" sx={{ mb: 2, width: '100%' }}>
                <FormLabel component="legend">Select Scan Type</FormLabel>
                <RadioGroup
                  row
                  name="scan-mode"
                  value={scanMode}
                  onChange={handleScanModeChange}
                >
                  <FormControlLabel value="auto" control={<Radio />} label="Auto-detect" />
                  <FormControlLabel value="ct" control={<Radio />} label="CT Scan" />
                  <FormControlLabel value="xray" control={<Radio />} label="X-Ray" />
                </RadioGroup>
              </FormControl>
              
              {/* Model Selection */}
              <FormControl component="fieldset" sx={{ mb: 3, width: '100%' }}>
                <FormLabel component="legend">Select Model</FormLabel>
                <RadioGroup
                  row
                  name="model-type"
                  value={modelType}
                  onChange={handleModelTypeChange}
                >
                  <FormControlLabel value="default" control={<Radio />} label="Default" />
                  
                  {/* CT Scan Models */}
                  {(scanMode === 'auto' || scanMode === 'ct') && (
                    <>
                      <FormControlLabel value="ct_efficientnetb0" control={<Radio />} label="EfficientNetB0" />
                      <FormControlLabel value="ct_resnet50" control={<Radio />} label="ResNet50" />
                    </>
                  )}
                  
                  {/* X-ray Models */}
                  {(scanMode === 'auto' || scanMode === 'xray') && (
                    <>
                      <FormControlLabel value="xray_vgg16" control={<Radio />} label="VGG16" />
                      <FormControlLabel value="xray_mobilenetv2" control={<Radio />} label="MobileNetV2" />
                    </>
                  )}
                </RadioGroup>
              </FormControl>
              
              <Box sx={{ mt: 2 }}>
                <Paper
                  {...getRootProps()}
                  sx={{
                    p: 4,
                    textAlign: 'center',
                    cursor: 'pointer',
                    bgcolor: isDragActive ? 'action.hover' : 'background.paper',
                    border: '2px dashed',
                    borderColor: isDragActive ? 'primary.main' : 'grey.300',
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: 'primary.main',
                      bgcolor: 'action.hover'
                    }
                  }}
                >
                  <input {...getInputProps()} />
                  <Zoom in={!preview}>
                    <Box>
                      <CloudUploadIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
                      <Typography variant="h6" gutterBottom>
                        {isDragActive ? 'Drop your image here' : 'Drag & drop your chest image here'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Supported formats: JPEG, PNG, DICOM
                      </Typography>
                    </Box>
                  </Zoom>

                  {preview && (
                    <Fade in={true}>
                      <Box>
                        <img
                          src={preview}
                          alt="Preview"
                          style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain' }}
                        />
                      </Box>
                    </Fade>
                  )}
                </Paper>

                {preview && (
                  <Button
                    variant="contained"
                    onClick={handleAnalyze}
                    disabled={analyzing}
                    fullWidth
                    size="large"
                    sx={{ mt: 2 }}
                  >
                    {analyzing ? (
                      <>
                        <CircularProgress size={24} sx={{ mr: 1 }} />
                        Analyzing...
                      </>
                    ) : (
                      'Analyze Image'
                    )}
                  </Button>
                )}

                {error && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {error}
                  </Alert>
                )}
              </Box>
            </Paper>
          </Box>

          {/* Right Column - Chat Interface */}
          <Box sx={{ flex: 1 }}>
            <Paper sx={{ height: '600px', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="h6">
                  <ChatIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Medical Assistant
                </Typography>
              </Box>

              <List sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
                {chatHistory.map((message, index) => (
                  <ListItem
                    key={index}
                    sx={{
                      flexDirection: message.role === 'user' ? 'row-reverse' : 'row',
                      mb: 2
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        sx={{
                          bgcolor: message.role === 'user' ? 'primary.main' : 'secondary.main'
                        }}
                      >
                        {message.role === 'user' ? <PersonIcon /> : <SmartToyIcon />}
                      </Avatar>
                    </ListItemAvatar>
                    <Paper
                      sx={{
                        maxWidth: '70%',
                        p: 2,
                        ml: message.role === 'user' ? 1 : 2,
                        mr: message.role === 'user' ? 2 : 1,
                        bgcolor: message.role === 'user' ? 'primary.light' : 'secondary.light',
                        color: message.role === 'user' ? 'primary.contrastText' : 'secondary.contrastText'
                      }}
                    >
                      <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                        {message.content}
                      </Typography>
                      {message.visualization && (
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => message.visualization && handleVisualizationClick(message.visualization)}
                          sx={{ mt: 1 }}
                        >
                          View Heatmap
                        </Button>
                      )}
                      <Typography variant="caption" sx={{ display: 'block', mt: 1, opacity: 0.8 }}>
                        {message.timestamp.toLocaleTimeString()}
                      </Typography>
                    </Paper>
                  </ListItem>
                ))}
              </List>

              <Box
                component="form"
                onSubmit={handleChatSubmit}
                sx={{
                  p: 2,
                  borderTop: 1,
                  borderColor: 'divider',
                  display: 'flex',
                  gap: 1
                }}
              >
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Ask about the condition or preventive measures..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  size="small"
                />
                <Button type="submit" variant="contained" disabled={!chatMessage.trim()}>
                  Send
                </Button>
              </Box>
            </Paper>
          </Box>
        </Box>
      </Box>

      {/* Visualization Dialog */}
      <Dialog
        open={visualizationDialog}
        onClose={() => setVisualizationDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Model Visualization
          <IconButton
            aria-label="close"
            onClick={() => setVisualizationDialog(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedVisualization && (
            <img
              src={`http://localhost:5000${selectedVisualization}`}
              alt="Model Visualization"
              style={{ width: '100%', height: 'auto' }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVisualizationDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Lung; 