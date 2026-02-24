import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Register from './pages/Register.jsx'
import Login from './pages/Login.jsx'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Chat from "./pages/Chat";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<App />} />
        <Route path='/register' element={<Register />} />
        <Route path='/login' element={<Login />} />
        <Route path="/Chat" element={<Chat />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)