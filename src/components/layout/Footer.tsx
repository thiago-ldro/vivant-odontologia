import { CalendarDays, MessageCircle } from 'lucide-react'
import type { ClinicConfig } from '../../config/schema'
import { Brand, navigation } from './Navigation'

export function Footer({ config, onPrivacy }: { config: ClinicConfig; onPrivacy: () => void }) {
  const c = config.contact
  return <>
    <footer className="footer">
      <div className="wrap">
        <div className="footer-grid">
          <div><Brand config={config} showLogo={!config.clinicalCases} /><p>{config.demo ? 'Website demonstrativo da AXYRON.' : config.copy.heroTag}</p></div>
          <nav aria-label="Navegação do rodapé">{navigation(config).map(([id, label]) => <a key={id} href={'#' + id}>{label}</a>)}</nav>
          <div className="footer-info">{c.hours.map((item, index) => <p key={index}>{item}</p>)}{c.address && <p>{c.address}</p>}{c.instagram && <a href={c.instagram}>Instagram</a>}{config.registration && <p>{config.registration}</p>}<button className="inline-link" onClick={onPrivacy}>Aviso de privacidade</button></div>
        </div>
        <div className="footer-end"><small>© {new Date().getFullYear()} {config.name}</small>{config.signature.label && (config.signature.url ? <a href={config.signature.url}>{config.signature.label}</a> : <small>{config.signature.label}</small>)}</div>
      </div>
    </footer>
    <a className="floating-chat icon-button" aria-label="Preparar mensagem para WhatsApp" href="#agendamento"><MessageCircle size={25} /></a>
    <div className="mobile-book"><a className="button button-primary" href="#agendamento"><CalendarDays size={18} /> Agendar avaliação</a></div>
  </>
}
