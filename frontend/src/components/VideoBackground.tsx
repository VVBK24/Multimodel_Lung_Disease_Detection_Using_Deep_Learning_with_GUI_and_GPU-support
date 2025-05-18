import React from 'react';
import { Box } from '@mui/material';

// Prop types for the VideoBackground component
interface VideoBackgroundProps {
  children: React.ReactNode;
}

const VideoBackground: React.FC<VideoBackgroundProps> = ({ children }) => {
  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Video overlay with gradient */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(45deg, rgba(0,0,139,0.7) 0%, rgba(128,0,128,0.7) 100%)',
          zIndex: 1,
        }}
      />

      {/* Video element */}
      <video
        autoPlay
        muted
        loop
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      >
        <source src="/src/assets/videos/gradient-background.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Content container */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 2,
          height: '100%',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default VideoBackground; 