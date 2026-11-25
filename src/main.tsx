import { createRoot, hydrateRoot } from 'react-dom/client'
import App from './App'
import { clinicConfig } from './config/clinic.config'
import './styles/site.css'

const root = document.getElementById('root')!
const app = <App config={clinicConfig} />
if (root.hasChildNodes()) hydrateRoot(root, app)
else createRoot(root).render(app)
