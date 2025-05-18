import { Typography, Card, CardContent, Avatar, Box as MUIBox, useMediaQuery, keyframes, Paper, Grid, useTheme } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import ScienceIcon from '@mui/icons-material/Science';
import SpeedIcon from '@mui/icons-material/Speed';
import SecurityIcon from '@mui/icons-material/Security';
import BarChartIcon from '@mui/icons-material/BarChart';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import AirlineStopsIcon from '@mui/icons-material/AirlineStops';
import teamPhoto from '../assets/photo/team/juned.png';
import teamPhoto1 from '../assets/photo/team/vyasa.png';
import teamPhoto2 from '../assets/photo/team/BRC.png';


// Optimize animations
const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

// Remove gradient animation as it's performance heavy
const floatAnimation = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
`;

const pulseAnimation = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.01); }
`;

// Add new animation for the team section background
const teamBackgroundAnimation = keyframes`
  0% {
    background-position: 0% 50%;
  }
  100% {
    background-position: 100% 50%;
  }
`;

const teamMembers = [
  {
    name: 'BK Vyasa Varma',
    role: 'Frontend and Backend Developer',
    bio: 'Specialized in React and modern web technologies. Experienced in building scalable backend systems and API development.',
    photo: teamPhoto1,  // Use the imported photo
    bgColor: '#FFA726',  // Orange background
    github: 'https://github.com/VVBK24',
    linkedin: 'https://www.linkedin.com/in/bk-vyasa-varma-899b58252/',
  },
  {
    name: 'Mohammadjuned Allauddin Halakarni',
    role: 'AI Engineer',
    bio: 'Occasionally reviewed architectures and gave vague suggestions. worked on medical image analysis.',
    photo: teamPhoto,  // Use the imported photo
    bgColor: '#26C6DA',  // Cyan background
    github: 'https://github.com/janesmith',
    linkedin: 'https://linkedin.com/in/janesmith',
  },
  {
    name: 'BRC Abhishek',
    role: 'Dataset Collection',
    bio: 'Promised dataset help. Still waiting. Experienced in building scalable datasets for healthcare applications.',
    photo: teamPhoto2,  // Use the imported photo
    bgColor: '#66BB6A',  // Green background
    github: 'https://github.com/mikejohnson',
    linkedin: 'https://linkedin.com/in/mikejohnson',
  },
  {
    name: 'M Sudarshan',
    role: 'Medical Domain Advisor (Unofficial)',
    bio: 'Medical Imaging May have nodded in agreement once. Still under observation.',
    photo: teamPhoto,  // Use the imported photo
    bgColor: '#7E57C2',  // Purple background
    github: 'https://github.com/sarahwilliams',
    linkedin: 'https://linkedin.com/in/sarahwilliams',
  },
];

const projectFeatures = [
  {
    title: "Multi-Model Analysis",
    description: "Utilizes VGG16, MobileNetV2, ResNet-50, and EfficientNet-B0 to provide comprehensive lung disease detection across different image types.",
    icon: <ScienceIcon fontSize="large" sx={{ color: '#6a11cb' }} />
  },
  {
    title: "X-ray & CT Support",
    description: "Automatically detects and processes both X-ray and CT scan images, providing specialized analysis for each image type.",
    icon: <MedicalServicesIcon fontSize="large" sx={{ color: '#6a11cb' }} />
  },
  {
    title: "Heatmap Visualization",
    description: "Advanced visualization tools that highlight areas of concern in lung images, helping doctors understand AI decisions.",
    icon: <BarChartIcon fontSize="large" sx={{ color: '#6a11cb' }} />
  },
  {
    title: "Fast Results",
    description: "Delivers diagnostic predictions in seconds, allowing for quick preliminary assessment of lung conditions.",
    icon: <SpeedIcon fontSize="large" sx={{ color: '#6a11cb' }} />
  },
  {
    title: "Mode Selection",
    description: "Offers auto-detection, CT-specific, and X-ray-specific analysis modes for tailored diagnostics.",
    icon: <AirlineStopsIcon fontSize="large" sx={{ color: '#6a11cb' }} />
  },
  {
    title: "Secure Processing",
    description: "All images are processed securely and no patient data is stored or shared, maintaining privacy and compliance.",
    icon: <SecurityIcon fontSize="large" sx={{ color: '#6a11cb' }} />
  }
];

const AboutPage = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  
  // Define colors based on theme
  const cardBgColor = isDarkMode ? '#2d2d2d' : '#FFFFFF';
  const cardTextColor = isDarkMode ? '#FFFFFF' : '#000000';
  const textColor = theme.palette.text.primary;
  const secondaryTextColor = theme.palette.text.secondary;
  
  return (
    <MUIBox sx={{ 
      width: '100%',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box',
      overflow: 'hidden',
      position: 'relative',
      bgcolor: 'rgba(106, 17, 203, 0.95)',
      background: 'linear-gradient(135deg, rgba(106, 17, 203, 0.95) 0%, rgba(37, 117, 252, 0.95) 100%)',
    }}>
      {/* Optimize background elements - reduce number and simplify */}
      <MUIBox sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(2px)',
        }
      }}>
        {[...Array(3)].map((_, i) => (
          <MUIBox
            key={i}
            sx={{
              position: 'absolute',
              width: '300px',
              height: '300px',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
              borderRadius: '50%',
              filter: 'blur(30px)',
              animation: `${floatAnimation} ${15 + i * 3}s infinite ease-in-out`,
              top: `${15 + i * 30}%`,
              left: `${10 + i * 30}%`,
              transform: 'translate(-50%, -50%)',
              willChange: 'transform',
            }}
          />
        ))}
      </MUIBox>

      {/* Content Container */}
      <MUIBox sx={{ 
        position: 'relative',
        zIndex: 1,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        {/* Header Section */}
        <MUIBox sx={{ 
          width: '100%',
          py: 6,
          px: { xs: 2, md: 4 },
          display: 'flex',
          justifyContent: 'center',
          position: 'relative',
        }}>
          <MUIBox sx={{ 
            maxWidth: '1200px', 
            width: '100%', 
            textAlign: 'center',
            position: 'relative',
            zIndex: 2
          }}>
            <Typography 
              variant="h3" 
              component="h1" 
              gutterBottom
              sx={{
                fontWeight: 700,
                color: 'white',
                textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
                mb: 3,
                animation: `${fadeIn} 0.5s ease-out`
              }}
            >
              About Our Project
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: 'rgba(255, 255, 255, 0.9)',
                maxWidth: '800px',
                margin: '0 auto',
                lineHeight: 1.6,
                textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
                animation: `${fadeIn} 0.5s ease-out 0.2s both`
              }}
            >
              AI-powered lung disease detection system for better healthcare outcomes
            </Typography>
          </MUIBox>
        </MUIBox>

        {/* Team and Features sections with white background */}
        <MUIBox sx={{ 
          bgcolor: 'background.paper',
          width: '100%',
          borderRadius: '40px 40px 0 0',
          mt: 4,
          position: 'relative',
          zIndex: 2,
          boxShadow: '0px -10px 30px rgba(0,0,0,0.1)',
          p: 4
        }}>
          {/* Team Section with simplified background */}
          <MUIBox sx={{ 
            maxWidth: '1200px', 
            width: '100%', 
            margin: '0 auto',
            padding: '40px 20px',
            background: 'linear-gradient(-45deg, #6a11cb15, #2575fc15)',
            borderRadius: '20px',
          }}>
            <Typography 
              variant="h4" 
              component="h2" 
              gutterBottom 
              sx={{ 
                textAlign: 'center', 
                color: 'text.primary', 
                mb: 4,
                position: 'relative',
                '&::after': {
                  content: '""',
                  display: 'block',
                  width: '60px',
                  height: '4px',
                  background: 'linear-gradient(90deg, #6a11cb, #2575fc)',
                  margin: '15px auto',
                  borderRadius: '2px'
                }
              }}
            >
              Our Team
            </Typography>

            {/* Optimized Team Grid */}
            <Grid container spacing={3} justifyContent="center">
              {teamMembers.map((member, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.2s ease-out',
                      animation: `${fadeIn} 0.5s ease-out forwards`,
                      animationDelay: `${index * 0.1}s`,
                      bgcolor: cardBgColor,
                      color: cardTextColor,
                      overflow: 'visible',
                      position: 'relative',
                      willChange: 'transform',
                      '&:hover': {
                        transform: 'translateY(-3px)',
                        '& .card-glow': {
                          opacity: 0.5
                        }
                      },
                    }}
                  >
                    {/* Simplified glow effect */}
                    <MUIBox
                      className="card-glow"
                      sx={{
                        position: 'absolute',
                        top: -5,
                        left: -5,
                        right: -5,
                        bottom: -5,
                        background: `linear-gradient(135deg, ${member.bgColor}22 0%, ${member.bgColor}11 100%)`,
                        borderRadius: '16px',
                        filter: 'blur(5px)',
                        opacity: 0,
                        transition: 'opacity 0.2s ease-out',
                        willChange: 'opacity',
                        zIndex: -1
                      }}
                    />

                    <MUIBox
                      sx={{
                        position: 'relative',
                        height: '280px',
                        bgcolor: member.bgColor,
                        borderRadius: '16px 16px 0 0',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        overflow: 'hidden',
                      }}
                    >
                      <MUIBox
                        component="img"
                        src={member.photo}
                        alt={member.name}
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          objectPosition: 'center 15%',
                          transition: 'transform 0.2s ease-out',
                          willChange: 'transform',
                          '&:hover': {
                            transform: 'scale(1.05)',
                          }
                        }}
                      />
                    </MUIBox>
                    <CardContent sx={{ 
                      textAlign: 'center', 
                      p: 3, 
                      flexGrow: 1, 
                      display: 'flex', 
                      flexDirection: 'column',
                      mt: 2,
                      color: cardTextColor,
                    }}>
                      <Typography variant="h6" gutterBottom sx={{ 
                        fontWeight: 'bold', 
                        color: cardTextColor 
                      }}>
                        {member.name}
                      </Typography>
                      <Typography color="primary" gutterBottom sx={{ mb: 2 }}>
                        {member.role}
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        flexGrow: 1,
                        color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary'
                      }}>
                        {member.bio}
                      </Typography>
                      <MUIBox sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
                        <a
                          href={member.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: cardTextColor }}
                        >
                          <GitHubIcon sx={{ 
                            fontSize: 28, 
                            transition: 'transform 0.2s ease-out',
                            willChange: 'transform',
                            '&:hover': { 
                              color: member.bgColor,
                              transform: 'scale(1.1)'
                            } 
                          }} />
                        </a>
                        <a
                          href={member.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: cardTextColor }}
                        >
                          <LinkedInIcon sx={{ 
                            fontSize: 28, 
                            transition: 'transform 0.2s ease-out',
                            willChange: 'transform',
                            '&:hover': { 
                              color: member.bgColor,
                              transform: 'scale(1.1)'
                            } 
                          }} />
                        </a>
                      </MUIBox>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </MUIBox>

          {/* Project Description Section */}
          <MUIBox sx={{ 
            py: 6,
            display: 'flex',
            justifyContent: 'center',
            px: { xs: 2, md: 4 }
          }}>
            <MUIBox sx={{ 
              maxWidth: '1200px',
              width: '100%',
              animation: `${fadeIn} 0.5s ease-out`
            }}>
              <Typography variant="h4" component="h2" gutterBottom sx={{ textAlign: 'center', color: 'text.primary', mb: 4 }}>
                Project Overview
              </Typography>
              <Paper elevation={2} sx={{ p: 4, borderRadius: 2, bgcolor: 'background.paper' }}>
                <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.7, color: 'text.primary' }}>
                <span style={{ fontSize: '1.2em', fontWeight: 'bold' }}>WELCOME to Our Lung Disease Detection App</span>, where deep learning meets medical expertise — kind of like the Batman and Robin of the tech world. 
                  We're here to give you accurate preliminary diagnoses of lung conditions. Our lung disease detection application combines the power of deep learning with medical expertise 
                  to provide accurate preliminary diagnoses of various lung conditions.😅
                </Typography>
                <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.7, color: 'text.primary' }}>
                  By leveraging multiple convolutional neural network architectures trained on extensive medical imaging 
                  datasets, our system can analyze both CT scans and X-ray images to detect abnormalities that might 
                  indicate pneumonia or various types of lung cancer.
                </Typography>
                <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.7, color: 'text.primary' }}>
                  Oh, and don't let us forget — our friend (who we begged for help but got little in return, because... well, techies) did absolutely nothing to get this project off the ground. 
                  But we're sure they're happy we got it done! If it weren't for their total lack of assistance, we might have actually finished this in half the time. 😜
                </Typography>
              </Paper>
            </MUIBox>
          </MUIBox>

          {/* Features Section - Optimized Cards */}
          <MUIBox sx={{ maxWidth: '1200px', width: '100%', margin: '0 auto', mt: 6 }}>
            <Typography 
              variant="h4" 
              component="h2" 
              gutterBottom 
              sx={{ 
                textAlign: 'center', 
                color: 'text.primary', 
                mb: 4,
                position: 'relative',
                '&::after': {
                  content: '""',
                  display: 'block',
                  width: '60px',
                  height: '4px',
                  background: 'linear-gradient(90deg, #6a11cb, #2575fc)',
                  margin: '15px auto',
                  borderRadius: '2px'
                }
              }}
            >
              Key Features
            </Typography>

            <Grid container spacing={3}>
              {projectFeatures.map((feature, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Paper 
                    elevation={2} 
                    sx={{ 
                      p: 3, 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center',
                      borderRadius: 2,
                      bgcolor: 'background.paper',
                      transition: 'transform 0.2s ease-out',
                      animation: `${fadeIn} 0.5s ease-out forwards`,
                      animationDelay: `${index * 0.1}s`,
                      position: 'relative',
                      overflow: 'hidden',
                      willChange: 'transform',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        '& .feature-icon': {
                          transform: 'scale(1.02)',
                        },
                        '& .feature-glow': {
                          opacity: 0.5
                        }
                      }
                    }}
                  >
                    {/* Simplified feature glow effect */}
                    <MUIBox
                      className="feature-glow"
                      sx={{
                        position: 'absolute',
                        top: -10,
                        left: -10,
                        right: -10,
                        bottom: -10,
                        background: 'linear-gradient(135deg, rgba(106, 17, 203, 0.05) 0%, rgba(37, 117, 252, 0.05) 100%)',
                        filter: 'blur(5px)',
                        opacity: 0,
                        transition: 'opacity 0.2s ease-out',
                        willChange: 'opacity',
                        zIndex: 0
                      }}
                    />

                    <MUIBox 
                      className="feature-icon"
                      sx={{ 
                        mb: 2,
                        transition: 'transform 0.2s ease-out',
                        willChange: 'transform',
                        zIndex: 1
                      }}
                    >
                      {feature.icon}
                    </MUIBox>
                    <Typography 
                      variant="h6" 
                      gutterBottom 
                      sx={{ 
                        textAlign: 'center', 
                        fontWeight: 'bold', 
                        color: 'text.primary',
                        zIndex: 1
                      }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        textAlign: 'center',
                        zIndex: 1
                      }}
                    >
                      {feature.description}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </MUIBox>
        </MUIBox>
      </MUIBox>
    </MUIBox>
  );
};

export default AboutPage; 