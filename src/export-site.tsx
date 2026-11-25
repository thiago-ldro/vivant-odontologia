import { createRoot } from 'react-dom/client'
import App from './App'
import type { ClinicConfig } from './config/schema'
import './styles/site.css'

const config = JSON.parse(document.getElementById('axyron-config')!.textContent!) as ClinicConfig
createRoot(document.getElementById('root')!).render(<App config={config} />)
