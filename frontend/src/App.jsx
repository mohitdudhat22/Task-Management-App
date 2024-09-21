import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import Login from './Login';
import Registration from './Registration';
import { lightTheme, darkTheme } from './theme';
import './App.css';
import DashboardLayoutNavigationLinks from './Dashboard';
import Layout from './Layout';
import { useState } from 'react';

function App() {
  const [darkMode, setDarkMode] = useState(false);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
        <Routes >
          <Route path="/" element={<Login />} />
          <Route path="register" element={<Registration />} />
          <Route
            path="*"
            element={
              <Layout toggleDarkMode={toggleTheme} darkMode={darkMode}>
              <DashboardLayoutNavigationLinks toggleTheme={toggleTheme} />
            </Layout>
          }
        /> 
         </Routes>    

    </ThemeProvider>
  );
}

export default App;
