import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import '../src/pages/authentication/src/index.css'
import '../src/pages/dashboard/src/index.css'
import '../src/pages/final/src/index.css'
import '../src/pages/simulation/src/index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
