import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { Toaster } from 'react-hot-toast'
import { TodoProvider } from './Context/TodoContext.jsx'
import { StyledEngineProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material'
import { BrowserRouter } from 'react-router-dom'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <StyledEngineProvider injectFirst>
      <TodoProvider>
        <CssBaseline />
        <BrowserRouter>
          <App />
        </BrowserRouter>
        <Toaster position="top-center" reverseOrder={false} />
      </TodoProvider>
    </StyledEngineProvider>
  </StrictMode>
);
