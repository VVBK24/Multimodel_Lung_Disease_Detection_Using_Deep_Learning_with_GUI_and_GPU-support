import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Stack,
  Box,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Paper,
  Button,
  CircularProgress,
  TextField,
  Alert,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ChatIcon from '@mui/icons-material/Chat';
import PersonIcon from '@mui/icons-material/Person';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import CloseIcon from '@mui/icons-material/Close';
import { useDropzone } from 'react-dropzone';
// Import the lungs.gif
import lungsGif from '../assets/photo/lungs.gif';
import heartGif from '../assets/photo/heart.gif';
import blood from '../assets/photo/blood.gif';

interface DiseaseCardProps {
  title: string;
  description: string;
  image: string;
  isComingSoon?: boolean;
}

interface PredictionResult {
  disease: string;
  confidence: number;
  description: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  visualization?: string;
}

const PredictionPage = () => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [visualizationDialog, setVisualizationDialog] = useState(false);
  const [selectedVisualization, setSelectedVisualization] = useState<string | null>(null);

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError(null);
      setResult(null);
      setChatHistory([]);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.dicom']
    },
    maxFiles: 1
  });

  const handlePredict = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

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

      setResult({
        disease: data.disease_type,
        confidence: data.disease_probability,
        description: `Analysis shows ${data.disease_type.toLowerCase()} with ${(data.disease_probability * 100).toFixed(1)}% confidence.`
      });
      
      // Add initial AI message with heatmap
      const chatMessage = {
        role: 'assistant' as const,
        content: `I've detected signs of ${data.disease_type.toLowerCase()} in your chest image with ${(data.disease_probability * 100).toFixed(1)}% confidence. Would you like to know more about the condition or discuss preventive measures?`,
        timestamp: new Date(),
        visualization: data.visualization
      };
      console.log('Chat message with heatmap:', chatMessage); // Debug log
      setChatHistory([chatMessage]);
    } catch (err) {
      console.error('Prediction error:', err);
      setError(err instanceof Error ? err.message : 'Failed to process image. Please ensure your backend server is running and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const userMessage = chatMessage;
    setChatMessage('');
    
    // Add user message with timestamp
    setChatHistory(prev => [...prev, {
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    }]);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let aiResponse = "I understand your concern. Based on the analysis, I recommend:";
      if (userMessage.toLowerCase().includes('prevent')) {
        aiResponse = "To prevent pneumonia, you should:\n1. Get vaccinated\n2. Practice good hygiene\n3. Don't smoke\n4. Maintain a healthy lifestyle\n5. Get adequate rest";
      } else if (userMessage.toLowerCase().includes('treatment')) {
        aiResponse = "Common treatments for pneumonia include:\n1. Antibiotics for bacterial pneumonia\n2. Rest and hydration\n3. Over-the-counter medications for fever\n4. Follow-up chest X-rays\n5. Breathing exercises";
      }
      
      setChatHistory(prev => [...prev, {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      }]);
    } catch (err) {
      setError('Failed to get AI response. Please try again.');
    }
  };

  const handleVisualizationClick = (visualization: string) => {
    setSelectedVisualization(visualization);
    setVisualizationDialog(true);
  };

  const DiseaseCard = ({ title, description, image, isComingSoon = false }: DiseaseCardProps) => (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: isComingSoon ? 'not-allowed' : 'pointer',
        opacity: isComingSoon ? 0.7 : 1,
        transition: 'transform 0.2s ease-in-out',
        '&:hover': {
          transform: isComingSoon ? 'none' : 'scale(1.02)',
          boxShadow: isComingSoon ? undefined : (theme) => theme.shadows[10],
        },
      }}
      onClick={() => {
        if (!isComingSoon && title.toLowerCase() === 'lung disease') {
          navigate('/predict/lung');
        }
      }}
    >
      <CardMedia
        component="img"
        height="200"
        image={image}
        alt={title}
        sx={{ objectFit: 'cover' }}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            {title}
          </Typography>
          {isComingSoon && (
            <Chip
              icon={<LockIcon />}
              label="Coming Soon"
              color="secondary"
              size="small"
            />
          )}
        </Box>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ 
      width: '100%',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box',
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
        <Box sx={{ maxWidth: '1200px', width: '100%', textAlign: 'center' }}>
          <Typography variant="h3" component="h1" gutterBottom>
            Disease Detection System
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
          flexDirection: 'column',
          gap: 4
        }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>
            <Box flex={1}>
              <DiseaseCard
                title="Lung Disease"
                description="Upload chest X-rays or CT scans for AI-powered lung disease detection"
                image={lungsGif}
              />
            </Box>
            <Box flex={1}>
              <DiseaseCard
                title="Heart Disease"
                description="Advanced heart disease detection using medical imaging"
                image={heartGif}
                isComingSoon
              />
            </Box>
            <Box flex={1}>
              <DiseaseCard
                title="Blood Disease"
                description="Blood cell analysis and disease detection"
                image={blood}
                isComingSoon
              />
            </Box>
          </Stack>

          {selectedFile && (
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>
              {/* Image Upload and Analysis Section */}
              <Box flex={1}>
                <Paper
                  {...getRootProps()}
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    cursor: 'pointer',
                    bgcolor: isDragActive ? 'action.hover' : 'background.paper',
                    border: '2px dashed',
                    borderColor: isDragActive ? 'primary.main' : 'grey.300',
                    borderRadius: 2,
                    mb: 2,
                  }}
                >
                  <input {...getInputProps()} />
                  <CloudUploadIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    {isDragActive ? 'Drop the image here' : 'Drag and drop an image here, or click to select'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Supported formats: JPEG, PNG, DICOM
                  </Typography>
                </Paper>

                {preview && (
                  <Box sx={{ mt: 2 }}>
                    <img
                      src={preview}
                      alt="Preview"
                      style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain' }}
                    />
                    <Button
                      variant="contained"
                      onClick={handlePredict}
                      disabled={loading}
                      fullWidth
                      sx={{ mt: 2 }}
                    >
                      {loading ? <CircularProgress size={24} /> : 'Analyze Image'}
                    </Button>
                  </Box>
                )}

                {error && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {error}
                  </Alert>
                )}

                {result && (
                  <Paper sx={{ p: 3, mt: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Analysis Results
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      Detected: {result.disease}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      Confidence: {(result.confidence * 100).toFixed(1)}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {result.description}
                    </Typography>
                  </Paper>
                )}
              </Box>

              {/* Chat Interface */}
              <Box flex={1}>
                <Paper sx={{ height: '600px', display: 'flex', flexDirection: 'column', p: 2 }}>
                  <Typography variant="h6" sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                    <ChatIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Medical Assistant
                  </Typography>
                  
                  <List sx={{ flexGrow: 1, overflow: 'auto', mb: 2 }}>
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
                              sx={{ 
                                mt: 1,
                                color: message.role === 'user' ? 'primary.main' : 'secondary.main',
                                borderColor: message.role === 'user' ? 'primary.main' : 'secondary.main',
                                '&:hover': {
                                  borderColor: message.role === 'user' ? 'primary.dark' : 'secondary.dark',
                                  bgcolor: message.role === 'user' ? 'primary.light' : 'secondary.light',
                                  opacity: 0.8
                                }
                              }}
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

                  <Box component="form" onSubmit={handleChatSubmit} sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      fullWidth
                      variant="outlined"
                      placeholder="Ask about the diagnosis or preventive measures..."
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
            </Stack>
          )}
        </Box>
      </Box>

      {/* Visualization Dialog */}
      <Dialog
        open={visualizationDialog}
        onClose={() => setVisualizationDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            bgcolor: 'background.paper'
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: 'primary.main', 
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          Model Visualization
          <IconButton
            aria-label="close"
            onClick={() => setVisualizationDialog(false)}
            sx={{
              color: 'white',
              '&:hover': {
                bgcolor: 'primary.dark'
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {selectedVisualization && (
            <img
              src={`http://localhost:5000${selectedVisualization}`}
              alt="Model Visualization"
              style={{ 
                width: '100%', 
                height: 'auto',
                borderRadius: 8,
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
              }}
            />
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setVisualizationDialog(false)}
            variant="contained"
            color="primary"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PredictionPage; 