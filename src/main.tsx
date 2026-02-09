import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { PartyProvider } from './state/PartyContext'
import { BrowserRouter } from 'react-router-dom'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PartyProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </PartyProvider>
  </StrictMode>,
)
