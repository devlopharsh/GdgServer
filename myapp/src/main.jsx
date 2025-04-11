import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import React from "react"
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from "./components/Register"
import './index.css'
import App from './App.jsx'
import QRScanner from './components/qrscanner.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/QR" element={<QRScanner />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
