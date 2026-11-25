import { createRoot } from 'react-dom/client'
import { Studio, StudioPreview } from './components/studio/Studio'
import { portable } from './components/studio/portable-preview'
import './styles/site.css'
import './styles/studio.css'

const preview = portable ? document.body.dataset.portableView === 'preview' : new URLSearchParams(location.search).has('preview')
createRoot(document.getElementById('root')!).render(preview ? <StudioPreview /> : <Studio />)
