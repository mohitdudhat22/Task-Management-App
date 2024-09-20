import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { Toaster } from 'react-hot-toast'
import { TodoProvider } from './Context/TodoContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <TodoProvider>
    <App />
    <Toaster position="top-center"
  reverseOrder={false}/>
    </TodoProvider>
  </StrictMode>,
)
