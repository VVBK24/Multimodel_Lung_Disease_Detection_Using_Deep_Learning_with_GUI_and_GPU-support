import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import '../assets/gradient-animation.css';

const LandingPage = () => {
  const navigate = useNavigate();

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
      {/* Hero Section with Video Background */}
      <Box
        sx={{
          width: '100vw',
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
          margin: 0,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Video Background with Gradient Overlay */}
        <div className="video-overlay">
          <div className="gradient-background"></div>
          <video autoPlay muted loop className="video-background">
            <source src="/src/assets/videos/gradient-background.mp4" type="video/mp4" />
          </video>
        </div>

        {/* Content */}
        <Box sx={{ 
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          padding: { xs: 2, md: 4 },
          position: 'relative',
          zIndex: 2,
          color: 'white'
        }}>
          <Box sx={{ maxWidth: '1200px' }}>
            <Typography
              variant="h2"
              component="h1"
              gutterBottom
              sx={{
                fontSize: { xs: '2.5rem', sm: '3rem', md: '3.75rem' },
                fontWeight: 'bold',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}
            >
              AI-Powered Lung Disease Detection
            </Typography>
            <Typography
              variant="h5"
              gutterBottom
              sx={{
                fontSize: { xs: '1.25rem', sm: '1.5rem' },
                mb: 3,
                textShadow: '0 1px 2px rgba(0,0,0,0.3)'
              }}
            >
              Advanced diagnosis using state-of-the-art deep learning models
            </Typography>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              onClick={() => navigate('/predict')}
              sx={{
                mt: 2,
                py: 1.5,
                px: 4,
                fontSize: '1.1rem',
                background: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(5px)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'rgba(138, 43, 226, 0.7)',
                  transform: 'translateY(-3px)',
                  boxShadow: '0 8px 15px rgba(0,0,0,0.2)'
                }
              }}
            >
              Get Started
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default LandingPage; 