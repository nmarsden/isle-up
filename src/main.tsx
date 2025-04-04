import { createRoot } from 'react-dom/client'
import './style/index.css'
import App from './components/app.tsx'

createRoot(document.getElementById('root')!).render(
  <App />
)
