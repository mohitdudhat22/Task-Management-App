import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Login from './Login';
import Registration from './Registration';
import { lightTheme, darkTheme } from './theme';
import './App.css';
import DashboardLayoutNavigationLinks from './Dashboard';

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const theme = createTheme(darkMode ? darkTheme : lightTheme);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          bgcolor: 'background.default',
          minHeight: '100vh',
          color: 'text.primary',
        }}
      >
        <Routes >
          <Route index path="/" element={<Login />} />
          <Route path="/register" element={<Registration />} />
          <Route 
            path="/dashboard/*" 
            element={
              <DashboardLayoutNavigationLinks 
                darkMode={darkMode} 
                toggleDarkMode={toggleDarkMode} 
              />
            } 
          />
        </Routes>
      </Box>
    </ThemeProvider>
  );
}

export default App;