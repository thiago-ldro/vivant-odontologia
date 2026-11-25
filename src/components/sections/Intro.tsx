import { CalendarDays, ChevronDown, Pause, Play, Sparkle } from 'lucide-react'
import { useState } from 'react'
import type { ClinicConfig, Photo } from '../../config/schema'

export function Image({ photo, className = '' }: { photo: Photo; className?: string }) {
  return photo.src ? <img className={className} src={photo.src} alt={photo.alt} loading="lazy" decoding="async" /> : <div className={'image-placeholder ' + className} role="img" aria-label={photo.alt || 'Imagem indisponível'} />
}

export function Hero({ config }: { config: ClinicConfig }) {
  const words = config.slogan.split(' ')
  const firstLine = config.copy.heroEmphasis && config.slogan.endsWith(config.copy.heroEmphasis) ? config.slogan.slice(0, -config.copy.heroEmphasis.length).trim() : ''
  const firstWords = firstLine ? firstLine.split(' ') : words
  return <section className="hero" id="inicio">
    {config.photos.hero.src && <picture className="hero-photo">
      {config.photos.heroMobile && <source media="(max-width: 690px)" srcSet={config.photos.heroMobile} />}
      <img src={config.photos.hero.src} alt={config.photos.hero.alt} fetchPriority="high" />
    </picture>}
    <div className="hero-shade" />
    <div className="hero-inner wrap">
      <p className="eyebrow hero-in"><Sparkle size={16} /> {config.copy.heroTag}</p>
      <h1 aria-label={config.slogan} className="hero-title">
        <span aria-hidden="true">{firstWords.map((word, index) => <span className="hero-word" key={index}>{word} </span>)}</span>
        {firstLine && <em aria-hidden="true">{config.copy.heroEmphasis.split(' ').map((word, index) => <span className="hero-word" key={index}>{word} </span>)}</em>}
      </h1>
      <p className="hero-summary hero-in">{config.copy.heroDescription}</p>
      <div className="hero-actions hero-in">
        <a className="button button-primary" data-magnetic href="#agendamento"><CalendarDays size={18} /> Agendar minha avaliação</a>
        {config.sections.about && <a className="button text-button" href="#sobre">Conheça nossa clínica</a>}
      </div>
    </div>
    <div className="wrap hero-bottom">
      <a href={config.sections.about ? '#sobre' : '#agendamento'} className="scroll-indicator"><span><ChevronDown size={17} /></span> Explore a clínica</a>
      {config.photos.credit && <small>{config.photos.credit}</small>}
    </div>
  </section>
}

export function Marquee({ config }: { config: ClinicConfig }) {
  const [paused, setPaused] = useState(false)
  return <div className="marquee" aria-label={'Especialidades: ' + config.copy.specialties.join(', ')}>
    <div className={'marquee-track ' + (paused ? 'paused' : '')} aria-hidden="true">
      {[0, 1, 2, 3].map((key) => <div className="marquee-group" key={key}>{config.copy.specialties.map((term, index) => <span key={index}>{term}<Sparkle size={15} /></span>)}</div>)}
    </div>
    <button className="marquee-control icon-button" aria-label={paused ? 'Reproduzir faixa' : 'Pausar faixa'} onClick={() => setPaused(!paused)}>{paused ? <Play size={17} /> : <Pause size={17} />}</button>
  </div>
}

export function About({ config }: { config: ClinicConfig }) {
  return <section id="sobre" className="section about wrap">
    <div className="about-visual" data-reveal>
      <figure className="about-large" data-mask><Image photo={config.photos.about} /></figure>
      <figure className="about-small"><Image photo={config.photos.detail} /></figure>
      <span className="about-mark" aria-hidden="true"><Sparkle size={24} /></span>
    </div>
    <div className="about-copy" data-reveal>
      <p className="eyebrow">Sobre a clínica</p><h2>{config.copy.aboutTitle}</h2>
      <p>{config.copy.aboutIntro}</p><p>{config.copy.aboutBody}</p>
      <a className="button outline-button" href={config.sections.gallery && config.photos.gallery.length ? '#estrutura' : '#agendamento'}>Conheça nossa estrutura</a>
    </div>
  </section>
}
