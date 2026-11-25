import { renderToString } from 'react-dom/server'
import App from './App'
import { clinicConfig } from './config/clinic.config'

export function render() {
  return renderToString(<App config={clinicConfig} />)
}
