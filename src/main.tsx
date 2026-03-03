import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { PartyProvider } from './state/PartyContext'
import { ToastProvider } from './context/ToastContext'
import { BrowserRouter } from 'react-router-dom'

const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PartyProvider>
      <ToastProvider>
        <BrowserRouter basename={basename}>
          <App />
        </BrowserRouter>
      </ToastProvider>
    </PartyProvider>
  </StrictMode>,
)
