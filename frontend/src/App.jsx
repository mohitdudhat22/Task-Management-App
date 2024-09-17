import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import Todo from './Todo'
import Login from './Login'
import Registration from './Registration'

function App() {

  return (
    <>
      <BrowserRouter>
      <Routes  path="/">
        <Route index element={<Login />} />
        <Route path="register" element={<Registration />} />
        <Route path="dashboard" element={<Todo />} />

      </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
