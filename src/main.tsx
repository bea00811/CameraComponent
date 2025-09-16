import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import CameraComponent from './Camera.tsx'
import './index.css'
// import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* <App /> */}
    <CameraComponent/>
  </StrictMode>,
)
