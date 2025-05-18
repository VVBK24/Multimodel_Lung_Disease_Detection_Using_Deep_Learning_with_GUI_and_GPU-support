import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import Navbar from './components/Navbar.tsx';
import LandingPage from './pages/LandingPage.tsx';
import AboutPage from './pages/AboutPage.tsx';
import PredictionPage from './pages/PredictionPage.tsx';
import Lung from './pages/Lung.tsx';
import { useState, useMemo } from 'react';

function App() {
  const [mode, setMode] = useState<'light' | 'dark'>('light');

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: '#2196f3',
            light: '#64b5f6',
            dark: '#1976d2',
          },
          secondary: {
            main: '#f50057',
            light: '#ff4081',
            dark: '#c51162',
          },
          background: {
            default: mode === 'light' ? '#fafafa' : '#121212',
            paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
          },
        },
        components: {
          MuiCssBaseline: {
            styleOverrides: {
              html: {
                height: '100%',
                scrollBehavior: 'smooth',
              },
              body: {
                margin: 0,
                padding: 0,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'background-color 0.3s ease',
              },
              '#root': {
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              },
            },
          },
        },
        typography: {
          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        },
        shape: {
          borderRadius: 8,
        },
      }),
    [mode]
  );

  const toggleColorMode = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar toggleColorMode={toggleColorMode} mode={mode} />
          <main style={{ flex: 1, width: '100%', overflowX: 'hidden' }}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/predict" element={<PredictionPage />} />
              <Route path="/predict/lung" element={<Lung />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
