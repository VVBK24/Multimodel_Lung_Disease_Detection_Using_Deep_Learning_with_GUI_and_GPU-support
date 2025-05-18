import { AppBar, Toolbar, Typography, Button, Box, IconButton, Menu, MenuItem, useTheme, useMediaQuery } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useState } from 'react';

interface NavbarProps {
  toggleColorMode: () => void;
  mode: 'light' | 'dark';
}

const Navbar = ({ toggleColorMode, mode }: NavbarProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const NavLinks = () => (
    <>
      <Button 
        color="inherit" 
        component={RouterLink} 
        to="/"
        sx={{ 
          opacity: 0.7, 
          padding: '8px 16px',
          '&:hover': { 
            opacity: 1,
            background: mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            borderRadius: '8px',
            transform: 'translateY(-2px)'
          },
          transition: 'all 0.3s ease'
        }}
      >
        Home
      </Button>
      <Button 
        color="inherit" 
        component={RouterLink} 
        to="/about"
        sx={{ 
          opacity: 0.7, 
          padding: '8px 16px',
          '&:hover': { 
            opacity: 1,
            background: mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            borderRadius: '8px',
            transform: 'translateY(-2px)'
          },
          transition: 'all 0.3s ease'
        }}
      >
        About
      </Button>
      <Button 
        color="inherit" 
        component={RouterLink} 
        to="/predict"
        sx={{ 
          opacity: 0.7, 
          padding: '8px 16px',
          '&:hover': { 
            opacity: 1,
            background: mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            borderRadius: '8px',
            transform: 'translateY(-2px)'
          },
          transition: 'all 0.3s ease'
        }}
      >
        Predict
      </Button>
      <IconButton onClick={toggleColorMode} color="inherit">
        {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
      </IconButton>
    </>
  );

  return (
    <AppBar 
      position="sticky" 
      sx={{ 
        zIndex: theme.zIndex.drawer + 1,
        background: 'transparent',
        boxShadow: 'none',
        backdropFilter: 'blur(20px)',
        backgroundColor: mode === 'dark' 
          ? 'rgba(0, 0, 0, 0.3)' 
          : 'rgba(255, 255, 255, 0.3)'
      }}
    >
      <Toolbar>
        <Typography
          variant="h6"
          component="div"
          sx={{
            flexGrow: 1,
            fontWeight: 'bold',
            fontSize: { xs: '1.2rem', sm: '1.5rem' },
          }}
        >
          Lung Disease Detection
        </Typography>
        
        {isMobile ? (
          <>
            <IconButton
              size="large"
              edge="end"
              color="inherit"
              aria-label="menu"
              onClick={handleMenu}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem component={RouterLink} to="/" onClick={handleClose}>
                Home
              </MenuItem>
              <MenuItem component={RouterLink} to="/about" onClick={handleClose}>
                About
              </MenuItem>
              <MenuItem component={RouterLink} to="/predict" onClick={handleClose}>
                Predict
              </MenuItem>
              <MenuItem onClick={() => { toggleColorMode(); handleClose(); }}>
                {mode === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </MenuItem>
            </Menu>
          </>
        ) : (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <NavLinks />
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 