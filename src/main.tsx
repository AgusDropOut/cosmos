import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserStorage } from './core/storage/BrowserStorage'


const storageProvider = new BrowserStorage();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App storage={storageProvider} />
  </StrictMode>,
)
