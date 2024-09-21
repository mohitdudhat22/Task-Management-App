import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import Login from './Login';
import Registration from './Registration';
import { lightTheme, darkTheme } from './theme';
import './App.css';
import Dashboard from './Dashboard';
import Layout from './Layout';
import { useState } from 'react';
import DashboardLayoutNavigationLinks from './Dashboard';

function App() {
  const [darkMode, setDarkMode] = useState(false);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="register" element={<Registration />} />
        <Route path="/dashboard/*" element={<DashboardLayoutNavigationLinks />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
