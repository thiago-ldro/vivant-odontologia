import { useEffect, useRef, useState, type CSSProperties } from 'react'
import type { ClinicConfig } from './config/schema'
import { themeVariables } from './lib/theme'
import { Nav } from './components/layout/Navigation'
import { Footer } from './components/layout/Footer'
import { About, Hero, Marquee } from './components/sections/Intro'
import { Experience, Treatments } from './components/sections/Explore'
import { Gallery } from './components/sections/Gallery'
import { Contact, FAQ, Reviews, Team } from './components/sections/Details'
import { Metrics } from './components/sections/Metrics'
import { Booking } from './components/forms/Booking'
import { Dialog } from './components/ui/Dialog'

export default function App({ config, editing = false }: { config: ClinicConfig; editing?: boolean }) {
  const [selected, setSelected] = useState('')
  const [privacy, setPrivacy] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const { sections } = config

  useEffect(() => {
    if (editing || config.motion === 'off') return
    let disposed = false
    let stop: (() => void) | undefined
    const mode = config.motion
    const schedule = window.requestIdleCallback ?? ((run: () => void) => window.setTimeout(run, 250))
    const cancel = window.cancelIdleCallback ?? window.clearTimeout
    const idle = schedule(() => {
      void import('./components/motion/enhance').then(({ enhance }) => {
        if (!disposed && root.current) stop = enhance(root.current, mode)
      }).catch((error: unknown) => { if (import.meta.env.DEV) console.warn('Animações indisponíveis.', error) })
    }, { timeout: 1200 })
    return () => { disposed = true; cancel(idle); stop?.() }
  }, [config.motion, editing])

  return <div ref={root} className="site" data-preset={config.preset} data-motion={editing ? 'off' : config.motion} style={themeVariables(config) as CSSProperties}>
    <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
    <Nav config={config} />
    <main id="conteudo">
      <Hero config={config} />
      {sections.marquee && !!config.copy.specialties.length && <Marquee config={config} />}
      {sections.about && <About config={config} />}
      {config.metrics?.some(({ value }) => value !== null) && <Metrics items={config.metrics} animate={config.motion !== 'off'} />}
      {sections.treatments && !!config.treatments.length && <Treatments config={config} onSelect={setSelected} />}
      {sections.experience && <Experience config={config} />}
      {sections.gallery && !!config.photos.gallery.length && <Gallery config={config} />}
      {sections.team && !config.demo && !!config.team.length && <Team config={config} />}
      <Booking editing={editing} config={config} selected={selected} onSelect={setSelected} openPrivacy={() => setPrivacy(true)} />
      {sections.faq && !!config.faq.length && <FAQ config={config} />}
      {sections.reviews && !config.demo && (config.reviews.length > 0 || !!config.contact.reviewsLink) && <Reviews config={config} />}
      {sections.contact && <Contact config={config} />}
    </main>
    <Footer config={config} onPrivacy={() => setPrivacy(true)} />
    {privacy && <Dialog title="Aviso de privacidade" onClose={() => setPrivacy(false)}><div className="dialog-text"><h2>Aviso de privacidade</h2><p>{config.copy.privacy}</p></div></Dialog>}
  </div>
}
