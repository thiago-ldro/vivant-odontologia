import { useState } from 'react'
import { ChevronLeft, ChevronRight, Clock3, Instagram, Mail, MapPin, MessageCircle, Phone, Plus, Star } from 'lucide-react'
import type { ClinicConfig } from '../../config/schema'
import { validWhatsApp } from '../../lib/booking'
import { Image } from './Intro'

export function Team({ config }: { config: ClinicConfig }) {
  return <section id="equipe" className="wrap section">
    <p className="eyebrow">Equipe</p><h2>Quem cuida de você.</h2>
    <div className="team-grid">{config.team.map((member, index) => <article key={index} data-reveal>
      {member.image.src && <Image photo={member.image} />}
      <div className="team-member-copy">
        {member.registration && <p className="team-registration">{member.registration}</p>}
        <h3>{member.name}</h3>
        <p className="team-specialty">{member.specialty}</p>
        <p>{member.bio}</p>
      </div>
    </article>)}</div>
  </section>
}

export function Reviews({ config }: { config: ClinicConfig }) {
  const [current, setCurrent] = useState(0)
  const item = config.reviews[current % config.reviews.length]
  const change = (delta: number) => setCurrent((value) => (value + config.reviews.length + delta) % config.reviews.length)
  return <section aria-labelledby="reviews-title" className="section reviews wrap">
    <p className="eyebrow">Avaliações</p><h2 id="reviews-title">Relatos de pacientes.</h2>
    <div aria-live="polite" key={item.name + current} className="review-slide"><p className="rating" aria-label={item.rating + ' de 5 estrelas'}>{'★'.repeat(item.rating)}</p><blockquote>{item.quote}</blockquote><p>{item.name}{item.source && <> · <a href={item.source}>Ver fonte</a></>}</p></div>
    {config.reviews.length > 1 && <div className="gallery-controls"><button className="icon-button" aria-label="Avaliação anterior" onClick={() => change(-1)}><ChevronLeft /></button><button className="icon-button" aria-label="Próxima avaliação" onClick={() => change(1)}><ChevronRight /></button></div>}
  </section>
}

export function FAQ({ config }: { config: ClinicConfig }) {
  return <section className="section faq wrap" id="perguntas">
    <div data-reveal><p className="eyebrow">Perguntas frequentes</p><h2>Antes da sua visita.</h2></div>
    <div className="accordion" data-reveal>{config.faq.map(({ question, answer }, index) => <details key={index} name="faq"><summary>{question}<Plus size={20} /></summary><p>{answer}</p></details>)}</div>
  </section>
}

export function Contact({ config }: { config: ClinicConfig }) {
  const [showMap, setShowMap] = useState(false)
  const c = config.contact
  const hasDetails = c.address || c.hours.length || c.phone || c.email || c.instagram || validWhatsApp(c.whatsapp, config.demo)
  return <section className="contact section" id="contato">
    <div className="wrap contact-grid">
      <div data-reveal><p className="eyebrow">Localização e contato</p><h2>Planeje sua visita.</h2><a className="button outline-button" href="#agendamento">Solicitar atendimento</a></div>
      <div className="contact-details" data-reveal>
        {c.address && <p><MapPin size={19} /><span>{c.address}{(c.city || c.region) && <><br />{[c.city, c.region].filter(Boolean).join(' · ')}</>}</span></p>}
        {!!c.hours.length && <p><Clock3 size={19} /><span>{c.hours.map((item, index) => <span className="hours-line" key={index}>{item}</span>)}</span></p>}
        {c.phone && <p><Phone size={19} /><a href={'tel:' + c.phone.replace(/[^+\d]/g, '')}>{c.phone}</a></p>}
        {c.email && <p><Mail size={19} /><a href={'mailto:' + c.email}>{c.email}</a></p>}
        {c.instagram && <p><Instagram size={19} /><a href={c.instagram}>Instagram</a></p>}
        {validWhatsApp(c.whatsapp, config.demo) && <p><MessageCircle size={19} /><a href={'https://wa.me/' + c.whatsapp}>WhatsApp</a></p>}
        {c.reviewsLink && <p><Star size={19} /><a href={c.reviewsLink}>Ver avaliações no Google</a></p>}
        {!hasDetails && <p>{config.demo ? 'Endereço, horários e canais de contato serão cadastrados na versão da clínica.' : 'Consulte os canais de atendimento para informações sobre a visita.'}</p>}
        {c.maps && <a className="inline-link" href={c.maps}>Abrir no Google Maps</a>}
        {c.embed && (!showMap ? <button className="inline-link" onClick={() => setShowMap(true)}>Carregar mapa interativo</button> : <iframe className="map" title="Mapa da localização da clínica" src={c.embed} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" />)}
      </div>
    </div>
  </section>
}
