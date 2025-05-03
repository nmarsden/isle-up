import { createRoot } from 'react-dom/client'
import './style/index.css'
import './assets/fontawesome/css/fontawesome.css'
import './assets/fontawesome/css/solid.css'
import './assets/fontawesome/css/regular.css'
import App from './components/app.tsx'

createRoot(document.getElementById('root')!).render(
  <App />
)
