import { useState, type FormEvent } from 'react'
import { CalendarDays, LockKeyhole, MessageCircle } from 'lucide-react'
import { bookingMessage, periods, validWhatsApp, whatsAppUrl } from '../../lib/booking'
import type { ClinicConfig } from '../../config/schema'

interface Props {
  config: ClinicConfig
  selected: string
  onSelect: (id: string) => void
  editing?: boolean
  openPrivacy: () => void
}

export function Booking({ config, selected, onSelect, openPrivacy, editing = false }: Props) {
  const [name, setName] = useState('')
  const [period, setPeriod] = useState('')
  const [consent, setConsent] = useState(false)
  const [attempted, setAttempted] = useState(false)
  const [preview, setPreview] = useState(false)
  const [status, setStatus] = useState('')
  const demo = editing || !validWhatsApp(config.contact.whatsapp, config.demo)
  const current = config.treatments.find((item) => item.id === selected)
  const message = bookingMessage(name, current?.title ?? 'Prefiro não informar', period || 'Não informado')
  const errors = {
    name: name.trim().length < 2 ? 'Informe seu nome com pelo menos dois caracteres.' : '',
    period: !period ? 'Selecione um período ou indique que não tem preferência.' : '',
    consent: !consent ? 'Confirme a ciência do aviso de privacidade.' : '',
  }
  const completed = Object.values(errors).filter((error) => !error).length

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setAttempted(true)
    const invalid = Object.entries(errors).find(([, value]) => value)
    if (invalid) {
      event.currentTarget.querySelector<HTMLElement>('#booking-' + invalid[0])?.focus()
      return
    }
    const url = whatsAppUrl(config.contact.whatsapp, message, config.demo || editing)
    if (url) {
      setStatus('Mensagem preparada para revisão no WhatsApp. A disponibilidade será confirmada pela clínica.')
      window.open(url, '_blank', 'noopener,noreferrer')
    } else {
      setPreview(true)
      setStatus('Prévia pronta. O WhatsApp está indisponível nesta versão.')
    }
  }

  function error(field: keyof typeof errors) {
    return attempted && errors[field] ? <small className="field-error" id={field + '-error'}>{errors[field]}</small> : null
  }

  return <section id="agendamento" className="booking section">
    <div className="wrap booking-grid">
      <div className="booking-intro" data-reveal><p className="eyebrow"><CalendarDays size={16} /> Agendamento</p><h2>{config.copy.bookingTitle}</h2><p>{config.copy.bookingIntro}</p><div className="booking-note"><LockKeyhole size={18} /><span>Seus dados são usados para compor a mensagem de contato.</span></div></div>
      <form className="booking-form" noValidate onSubmit={submit}>
        <div className="form-progress"><p>Solicitação de atendimento</p><progress value={completed} max={3} aria-label="Campos obrigatórios preenchidos" /></div>
        <label htmlFor="booking-name">Seu nome <span aria-hidden="true">*</span></label>
        <input id="booking-name" autoComplete="name" required maxLength={100} placeholder="Como podemos chamar você?" value={name} onChange={(event) => setName(event.target.value)} aria-invalid={attempted && !!errors.name} aria-describedby={error('name') ? 'name-error' : undefined} />
        {error('name')}
        <label htmlFor="booking-treatment">Tratamento de interesse</label>
        <select id="booking-treatment" value={current?.id ?? ''} onChange={(event) => onSelect(event.target.value)}>
          <option value="">Prefiro não informar</option>{config.treatments.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
        </select>
        <label htmlFor="booking-period">Período preferencial <span aria-hidden="true">*</span></label>
        <select id="booking-period" required value={period} onChange={(event) => setPeriod(event.target.value)} aria-invalid={attempted && !!errors.period} aria-describedby={error('period') ? 'period-error' : undefined}>
          <option value="">Selecione uma opção</option>{periods.map((item) => <option key={item}>{item}</option>)}
        </select>
        {error('period')}
        <div className="consent"><input id="booking-consent" type="checkbox" required checked={consent} onChange={(event) => setConsent(event.target.checked)} aria-invalid={attempted && !!errors.consent} aria-describedby={error('consent') ? 'consent-error' : undefined} /><div><label htmlFor="booking-consent">Li e estou ciente do aviso de privacidade.</label> <button type="button" className="inline-link" onClick={openPrivacy}>Ler aviso</button></div></div>
        {error('consent')}
        <button type="submit" className="button button-dark"><MessageCircle size={19} /> {demo ? 'Gerar prévia da mensagem' : 'Continuar pelo WhatsApp'}</button>
        <button type="button" className="inline-link preview-toggle" aria-expanded={preview} aria-controls="message-preview" onClick={() => setPreview(!preview)}>{preview ? 'Ocultar prévia' : 'Ver prévia da mensagem'}</button>
        <div id="message-preview" hidden={!preview}><pre className="message-preview">{message}</pre></div>
        {demo && <p className="form-note">Prévia demonstrativa. O redirecionamento está desativado.</p>}
        <div className="form-note" role="status">{status}</div>
      </form>
    </div>
  </section>
}
