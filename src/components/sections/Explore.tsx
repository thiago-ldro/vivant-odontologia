import { useRef, useState } from 'react'
import { Armchair, Focus, Heart, Layers, ListChecks, ScanLine, Search, Shield, Sparkles, Target, X } from 'lucide-react'
import type { ClinicConfig, Treatment } from '../../config/schema'
import { Dialog } from '../ui/Dialog'
import { Image } from './Intro'

const treatmentIcons = { sparkles: Sparkles, scan: ScanLine, align: Focus, shield: Shield, heart: Heart, layers: Layers }
const benefitIcons = [Heart, Target, Armchair, ScanLine, Shield, ListChecks]

const searchable = (value: string) => value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim()

export function Treatments({ config, onSelect }: { config: ClinicConfig; onSelect: (id: string) => void }) {
  const [active, setActive] = useState<Treatment | null>(null)
  const [query, setQuery] = useState('')
  const input = useRef<HTMLInputElement>(null)
  const words = searchable(query).split(/\s+/).filter(Boolean)
  const filtering = words.length > 0
  const matches = new Set(config.treatments.filter((item) => {
    const content = searchable(item.title + ' ' + item.summary)
    return words.every((word) => content.includes(word))
  }).map((item) => item.id))

  return <section id="tratamentos" className="section treatment-section">
    <div className="wrap">
      <div className="section-heading" data-reveal><div><p className="eyebrow">Tratamentos</p><h2>{config.copy.treatmentTitle}</h2></div><p>{config.copy.treatmentIntro}</p></div>
      <div className="treatment-filter">
        <div className="treatment-search" role="search" aria-label="Busca de tratamentos">
          <Search size={21} aria-hidden="true" />
          <label htmlFor="treatment-search" className="sr-only">Buscar tratamentos</label>
          <input ref={input} id="treatment-search" type="search" placeholder="Buscar tratamento" autoComplete="off"
            aria-controls="treatment-results" value={query} onChange={(event) => setQuery(event.target.value)} />
          {query && <button type="button" className="icon-button" aria-label="Limpar busca de tratamentos" onClick={() => {
            setQuery('')
            input.current?.focus()
          }}><X size={18} aria-hidden="true" /></button>}
        </div>
        <p className="treatment-result-count" aria-live="polite" aria-atomic="true">
          {filtering && matches.size > 0 && (matches.size === 1 ? '1 tratamento encontrado' : matches.size + ' tratamentos encontrados')}
        </p>
      </div>
      <div className={filtering ? 'treatment-grid is-filtered' : 'treatment-grid'} id="treatment-results">
        {matches.size === 0 && <div className="treatment-empty">
          <p aria-live="polite">Nenhum tratamento encontrado.</p>
          <a className="button outline-button" href="#agendamento">Pedir orientação</a>
        </div>}
        {config.treatments.map((item) => {
          const Icon = treatmentIcons[item.icon]
          return <article key={item.id} className="treatment" data-reveal hidden={!matches.has(item.id)}>
            <div className="treatment-photo"><Image photo={item.image} /><div className="treatment-icon"><Icon size={20} strokeWidth={1.4} /></div></div>
            <div className="treatment-copy"><h3>{item.title}</h3><p>{item.summary}</p><button className="link-button" aria-label={'Mais informações sobre ' + item.title} onClick={() => setActive(item)}>Saiba mais <span aria-hidden="true">+</span></button></div>
          </article>
        })}
      </div>
    </div>
    {active && <Dialog title={active.title} onClose={() => setActive(null)} className="treatment-dialog">
      <Image photo={active.image} /><div className="dialog-text"><p className="eyebrow">Tratamentos</p><h2>{active.title}</h2><p>{active.details}</p>
      <a href="#agendamento" className="button button-primary" onClick={() => { onSelect(active.id); setActive(null) }}>Solicitar atendimento</a></div>
    </Dialog>}
  </section>
}

export function Experience({ config }: { config: ClinicConfig }) {
  return <section className="experience section" aria-labelledby="experience-title" data-light>
    <div className="wrap experience-grid">
      <div data-reveal><p className="eyebrow">Sua experiência</p><h2 id="experience-title">{config.copy.experienceTitle}</h2><p>{config.copy.experienceIntro}</p><a href="#agendamento" className="button button-primary">Agendar avaliação</a></div>
      <ul>{config.copy.benefits.map((item, index) => {
        const Icon = benefitIcons[index % benefitIcons.length]
        return <li key={index} data-reveal><Icon size={26} strokeWidth={1.35} /><div><h3>{item.title}</h3><p>{item.description}</p></div></li>
      })}</ul>
    </div>
  </section>
}
