import { useEffect, useState } from 'react'
import { CalendarDays, Menu } from 'lucide-react'
import type { ClinicConfig } from '../../config/schema'
import { Dialog } from '../ui/Dialog'

export function navigation(c: ClinicConfig) {
  return [
    ['inicio', 'Início'],
    ...(c.sections.about ? [['sobre', 'Sobre']] : []),
    ...(c.sections.treatments && c.treatments.length ? [['tratamentos', 'Tratamentos']] : []),
    ...(c.sections.gallery && c.photos.gallery.length ? [['estrutura', 'Nossa estrutura']] : []),
    ...(c.sections.team && !c.demo && c.team.length ? [['equipe', 'Equipe']] : []),
    ...(c.sections.contact ? [['contato', 'Contato']] : []),
  ]
}

export function Brand({ config, showLogo = true }: { config: ClinicConfig; showLogo?: boolean }) {
  const professional = !!config.clinicalCases
  const logo = showLogo ? config.logo : ''
  const name = (logo && config.logoLabel?.trim()) || config.name
  return <a href="#inicio" className={professional ? 'brand brand-professional' : 'brand'} aria-label={name + ' – Início'}>
    {logo ? <img src={logo} alt="" width={52} height={52} /> : <>
      {!professional && <svg viewBox="0 0 42 39" aria-hidden="true"><path d="M2 34 21 3l19 31H2Zm8 0 11-18 11 18M21 3v13" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinejoin="round" /></svg>}
      <span><strong>{config.brand}</strong><small>{config.brandLine}{professional && config.registration ? ' · ' + config.registration : ''}</small></span>
    </>}
  </a>
}

export function Nav({ config }: { config: ClinicConfig }) {
  const [open, setOpen] = useState(false)
  const [compact, setCompact] = useState(false)
  useEffect(() => {
    const update = () => setCompact(window.scrollY > 38)
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])
  return <>
    <header className={'topbar ' + (compact ? 'compact' : '')}>
      <div className="reading-progress" />
      <div className="wrap topbar-inner">
        <Brand config={config} />
        <nav className="desktop-nav" aria-label="Navegação principal">{navigation(config).map(([id, label]) => <a key={id} href={'#' + id}>{label}</a>)}</nav>
        <a className="button nav-book" href="#agendamento"><CalendarDays size={15} /> Agendar avaliação</a>
        <button className="icon-button hamburger" aria-label="Abrir menu" aria-expanded={open} onClick={() => setOpen(true)}><Menu /></button>
      </div>
    </header>
    {open && <Dialog title="Menu principal" className="nav-dialog" onClose={() => setOpen(false)}>
      <nav aria-label="Navegação móvel">{navigation(config).map(([id, label]) => <a key={id} href={'#' + id} onClick={() => setOpen(false)}>{label}</a>)}<a className="button button-primary" href="#agendamento" onClick={() => setOpen(false)}>Agendar avaliação</a></nav>
    </Dialog>}
  </>
}
