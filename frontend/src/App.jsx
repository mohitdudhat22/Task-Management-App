import React, { useState, useMemo } from 'react';
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
  const [darkMode, setDarkMode] = useState(false);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  const theme = useMemo(() => createTheme(darkMode ? darkTheme : lightTheme), [darkMode]);

  return (
    <ThemeProvider theme={theme}>
      {console.log(theme)}
      <CssBaseline />
      <Box
        sx={{
          bgcolor: theme.palette.background.default,
          minHeight: '100vh',
          color: theme.palette.text.primary,
        }}
      >
        <Routes>
          <Route path="/" element={<Login />}/>
          <Route path="/register" element={<Registration />} />
          <Route path="/dashboard/*" element={<DashboardLayoutNavigationLinks />} />
        </Routes>
      </Box>
    </ThemeProvider>
  );
}

export default App;