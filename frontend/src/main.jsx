import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import Dashboard from './Dashboard.jsx'

createRoot(document.getElementById('root')).render(

    <BrowserRouter>
    <Routes>
      <Route path="/login" element={<App/>}/>
      <Route path="/" element={<Dashboard/>}/>
      </Routes>
    </BrowserRouter>
)
