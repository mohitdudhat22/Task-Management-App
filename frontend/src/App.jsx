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
import { requestFCMToken, onMessageListener } from './utils/firebaseUtils';
import { getMessaging, onMessage } from 'firebase/messaging';
import toast from 'react-hot-toast';

function App() {
  const [fcmToken, setFcmToken] = useState(null)
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    requestFCMToken()
    .then(token => {
      console.log('FCM Token:', token);
      setFcmToken(token);
    })
    .catch(error => {
      console.error('Error fetching FCM token:', error);
    });

  const messaging = getMessaging();
  onMessage(messaging, (payload) => {
    console.log('Foreground message:', payload);
  });
  }, [darkMode]);

  const theme = createTheme(darkMode ? darkTheme : lightTheme);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  onMessageListener().then((payload) => {
    console.log('Foreground message:', payload);
    toast(
      <div className="flex items-center p-4 bg-white border-l-4 border-blue-500 shadow-md rounded-md">
        <div className="flex-grow">
          <strong className="block text-lg font-semibold text-gray-800">{payload.notification.title}</strong>
          <span className="block text-gray-600">{payload.notification.body}</span>
        </div>
        <button className="ml-4 text-gray-600 hover:text-blue-500 focus:outline-none" onClick={() => toast.dismiss()}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>,
      {
        position: 'top-center',
        duration: 10000,
        className: 'z-50',
      }
    );
  }).catch((err) => {
    console.log('Failed: ', err);
  })
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