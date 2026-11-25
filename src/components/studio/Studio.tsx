import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Download, FileDown, FolderOpen, Monitor, RotateCcw, Smartphone, Tablet, Workflow } from 'lucide-react'
import App from '../../App'
import type { ClinicConfig } from '../../config/schema'
import { clinicSchema } from '../../config/schema'
import { clinicConfig } from '../../config/clinic.config'
import { presets } from '../../config/presets'
import type { SiteFormat } from '../../lib/site-package'
import { Field, Select, Text, Upload } from './Fields'
import { portable, previewConfig, previewDocument } from './portable-preview'
import { Collection, CopyEditor, MetricsEditor, PhotoEditor, PhotosEditor, ReviewsEditor, TeamEditor, TreatmentsEditor } from './Editors'

const devices = { Desktop: { width: 1440, icon: Monitor }, Tablet: { width: 768, icon: Tablet }, Mobile: { width: 390, icon: Smartphone } }

function download(name: string, blob: Blob) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = name
  link.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}
const labels: Record<keyof ClinicConfig['sections'], string> = { marquee: 'Faixa de especialidades', about: 'Sobre', treatments: 'Tratamentos', experience: 'Diferenciais', gallery: 'Galeria', team: 'Equipe', reviews: 'Avaliações', faq: 'Perguntas frequentes', contact: 'Contato' }
const contactLabels = { whatsapp: 'WhatsApp com DDI', phone: 'Telefone comercial', email: 'E-mail', instagram: 'Link do Instagram', address: 'Endereço', city: 'Cidade', region: 'Estado', postalCode: 'CEP', country: 'País', maps: 'Link do Google Maps', embed: 'URL de incorporação do Google Maps', reviewsLink: 'Link das avaliações no Google' } as const

export function Studio() {
  const [config, setConfig] = useState<ClinicConfig>(clinicConfig)
  const [device, setDevice] = useState<keyof typeof devices>(() => matchMedia('(max-width: 740px)').matches ? 'Mobile' : 'Desktop')
  const [status, setStatus] = useState('')
  const [exporting, setExporting] = useState(false)
  const [previewHtml] = useState(previewDocument)
  const [available, setAvailable] = useState(900)
  const frame = useRef<HTMLIFrameElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const validated = clinicSchema.safeParse(config)
  const width = devices[device].width
  const scale = Math.min(1, Math.max(1, available - 32) / width)
  const update = <K extends keyof ClinicConfig>(key: K, value: ClinicConfig[K]) => setConfig((previous) => ({ ...previous, [key]: value }))

  useEffect(() => {
    if (!stage.current) return
    const observer = new ResizeObserver(([entry]) => setAvailable(entry.contentRect.width))
    observer.observe(stage.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const update = window.setTimeout(() => {
      const parsed = clinicSchema.safeParse(config)
      if (parsed.success) frame.current?.contentWindow?.postMessage({ type: 'axyron-preview', config: parsed.data }, portable ? '*' : location.origin)
    }, 100)
    return () => window.clearTimeout(update)
  }, [config])

  async function importConfig(file?: File) {
    if (!file) return
    try {
      if (file.size > 50 * 1024 * 1024) throw new Error('O limite de importação é de 50 MB.')
      const result = clinicSchema.safeParse(JSON.parse(await file.text()))
      if (!result.success) {
        const issue = result.error.issues[0]
        throw new Error(issue.path.join('.') + ' · ' + issue.message)
      }
      setConfig(result.data)
      setStatus('Configuração importada.')
    } catch (error) { setStatus('Falha na importação. ' + (error instanceof Error ? error.message : 'Arquivo inválido.')) }
  }

  function exportConfig() {
    if (!validated.success) return
    download('axyron-clinica.json', new Blob([JSON.stringify(validated.data, null, 2)], { type: 'application/json' }))
    setStatus('Configuração exportada.')
  }

  async function exportSite(format: SiteFormat) {
    if (!validated.success || exporting) return
    setExporting(true)
    setStatus('Preparando o site para publicação…')
    try {
      const [{ packageSite }, { default: kit }] = await Promise.all([
        import('../../lib/site-package'),
        import('virtual:axyron-export-kit'),
      ])
      const archive = await packageSite(validated.data, kit, format)
      const name = validated.data.name.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 70)
      download((name || 'axyron') + (format === 'static' ? '-site.zip' : '-codigo.zip'), new Blob([archive], { type: 'application/zip' }))
      setStatus(format === 'static' ? 'Site exportado. As instruções para Vercel e Netlify estão no ZIP.' : 'Código exportado. As instruções para Lovable estão no ZIP.')
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Não foi possível exportar o site.')
    } finally {
      setExporting(false)
    }
  }

  return <div className="studio-shell">
    <header className="studio-header">
      <div className="studio-brand"><span className="studio-mark"><Workflow size={24} aria-hidden="true" /></span><h1>AXYRON <em>Studio</em></h1></div>
      <div className="studio-actions">
        <details className="studio-file-menu">
          <summary>Configuração <ChevronDown size={15} aria-hidden="true" /></summary>
          <div className="studio-file-panel">
            <label><FolderOpen size={16} aria-hidden="true" /> Importar JSON<input type="file" accept=".json,application/json" onChange={(event) => { void importConfig(event.target.files?.[0]); event.target.value = '' }} /></label>
            <button onClick={exportConfig} disabled={!validated.success}><FileDown size={16} aria-hidden="true" /> Exportar JSON</button>
            <button onClick={() => { void exportSite('source') }} disabled={!validated.success || exporting}><Download size={16} aria-hidden="true" /> Código para Lovable (.zip)</button>
            <button onClick={() => { setConfig(clinicConfig); setStatus('Configuração padrão restaurada.') }}><RotateCcw size={16} aria-hidden="true" /> Restaurar padrão</button>
          </div>
        </details>
        <button className="studio-export" onClick={() => { void exportSite('static') }} disabled={!validated.success || exporting}><Download size={17} aria-hidden="true" /> {exporting ? 'Preparando ZIP…' : 'Exportar site (.zip)'}</button>
      </div>
    </header>
    <div className="studio-body">
      <aside className="studio-editor" aria-label="Configuração da clínica">
        <div className="studio-sidebar-title"><h2>Personalizar site</h2><p>{config.name}</p></div>
        <p className="studio-status" role="status">{!validated.success ? 'Revise ' + validated.error.issues[0].path.join('.') + '. ' + validated.error.issues[0].message : status || 'As alterações válidas aparecem na prévia.'}</p>
        <details open><summary>Identidade visual</summary>
          <Text label="Nome da clínica ou profissional" value={config.name} set={(value) => update('name', value)} />
          <Text label="Nome no logotipo padrão" value={config.brand} set={(value) => update('brand', value)} />
          <Text label="Linha abaixo do logotipo" value={config.brandLine} set={(value) => update('brandLine', value)} />
          <Text label="Slogan" value={config.slogan} set={(value) => update('slogan', value)} multiline />
          <Upload label="Logotipo" value={config.logo} set={(value) => update('logo', value)} />
          <Text label="Nome acessível do logotipo" value={config.logoLabel ?? ''} set={(value) => update('logoLabel', value)} />
          <Upload label="Favicon" value={config.favicon} set={(value) => update('favicon', value)} />
          <Select label="Preset" value={config.preset} options={Object.keys(presets)} set={(value) => setConfig((previous) => ({ ...previous, preset: value as ClinicConfig['preset'], colors: {} }))} />
          <div className="studio-colors">{Object.entries({ ...presets[config.preset], ...config.colors }).map(([key, value]) => <Text key={key} label={{ primary:'Primária', signal:'Luz e reflexos', dark:'Fundo escuro', surface:'Superfície', paper:'Fundo claro', accent:'Destaque', ink:'Texto' }[key] ?? key} type="color" value={value} set={(color) => update('colors', { ...config.colors, [key]: color })} />)}</div>
          <Select label="Fonte dos títulos" value={config.fonts.heading} options={['Newsreader', 'Georgia', 'Manrope']} set={(heading) => update('fonts', { ...config.fonts, heading: heading as ClinicConfig['fonts']['heading'] })} />
          <Select label="Fonte do texto" value={config.fonts.body} options={['Manrope', 'System', 'Georgia']} set={(body) => update('fonts', { ...config.fonts, body: body as ClinicConfig['fonts']['body'] })} />
        </details>
        <details><summary>Contato e registros</summary>
          {(Object.keys(contactLabels) as (keyof typeof contactLabels)[]).map((key) => <Text key={key} label={contactLabels[key]} value={config.contact[key] ?? ''} set={(value) => update('contact', { ...config.contact, [key]: value })} />)}
          <Text label="Horários (um por linha)" value={config.contact.hours.join('\n')} set={(value) => update('contact', { ...config.contact, hours: value ? value.split('\n') : [] })} multiline />
          <Text label="Identificação profissional (CRO)" value={config.registration} set={(value) => update('registration', value)} />
        </details>
        <details><summary>Seções e demonstração</summary>
          <Field label="Modo demonstrativo"><input type="checkbox" checked={config.demo} onChange={(event) => update('demo', event.target.checked)} /></Field>
          <Select label="Intensidade das animações" value={config.motion} options={['full', 'light', 'off']} set={(motion) => update('motion', motion as ClinicConfig['motion'])} />
          {(Object.keys(labels) as (keyof typeof labels)[]).map((key) => <Field key={key} label={labels[key]}><input type="checkbox" checked={config.sections[key]} onChange={(event) => update('sections', { ...config.sections, [key]: event.target.checked })} /></Field>)}
        </details>
        <details>
          <summary>Métricas da clínica</summary>
          <p>Use números confirmados. Métricas com valor em branco ficam ocultas. Explique o período ou a fonte quando pertinente.</p>
          <MetricsEditor items={config.metrics ?? []} set={(metrics) => update('metrics', metrics)} />
        </details>
        <details><summary>Tratamentos</summary><TreatmentsEditor items={config.treatments} set={(value) => update('treatments', value)} /></details>
        <details><summary>Profissionais</summary><TeamEditor items={config.team} set={(value) => update('team', value)} /></details>
        <details><summary>Avaliações autorizadas</summary><ReviewsEditor items={config.reviews} set={(value) => update('reviews', value)} /></details>
        <details><summary>Textos institucionais</summary><CopyEditor copy={config.copy} set={(value) => update('copy', value)} /></details>
        <details><summary>Fotografias</summary><PhotosEditor photos={config.photos} set={(value) => update('photos', value)} /></details>
        <details><summary>Casos clínicos</summary>
          <Field label="Exibir casos clínicos no site profissional">
            <input type="checkbox" checked={!!config.clinicalCases} onChange={({ target }) =>
              update('clinicalCases', target.checked ? {
                author: { name: config.name, registration: config.registration },
                cover: { src: '', alt: '' }, coverMobile: '', gallery: [],
              } : undefined)} />
          </Field>
          {config.clinicalCases && <ClinicalCasesEditor cases={config.clinicalCases} set={(value) => update('clinicalCases', value)} />}
        </details>
        <details><summary>Perguntas frequentes</summary><Collection label="Pergunta" items={config.faq} set={(value) => update('faq', value)} create={() => ({ question: 'Nova pergunta', answer: '' })}
          render={(item, set) => <><Text label="Pergunta" value={item.question} set={(question) => set({ ...item, question })} /><Text label="Resposta" value={item.answer} set={(answer) => set({ ...item, answer })} multiline /></>} /></details>
        <details><summary>Busca e assinatura</summary>
          <Text label="Título de SEO" value={config.seo.title} set={(title) => update('seo', { ...config.seo, title })} />
          <Text label="Descrição de SEO" value={config.seo.description} set={(description) => update('seo', { ...config.seo, description })} multiline />
          <Text label="Domínio HTTPS" value={config.seo.domain} set={(domain) => update('seo', { ...config.seo, domain })} />
          <Upload label="Imagem de compartilhamento" value={config.seo.shareImage} set={(shareImage) => update('seo', { ...config.seo, shareImage })} />
          <Field label="Ocultar de mecanismos de busca"><input type="checkbox" checked={config.seo.noindex} onChange={(event) => update('seo', { ...config.seo, noindex: event.target.checked })} /></Field>
          <Text label="Assinatura" value={config.signature.label} set={(label) => update('signature', { ...config.signature, label })} />
          <Text label="Link da assinatura" value={config.signature.url} set={(url) => update('signature', { ...config.signature, url })} />
        </details>
      </aside>
      <section className="studio-preview" aria-labelledby="studio-preview-title">
        <div className="studio-preview-bar">
          <h2 id="studio-preview-title">Prévia do site</h2>
          <div className="device-picker" aria-label="Tamanho da prévia">
            {(Object.keys(devices) as (keyof typeof devices)[]).map((item) => {
              const Icon = devices[item].icon
              return <button key={item} aria-pressed={device === item} onClick={() => setDevice(item)}><Icon size={16} aria-hidden="true" />{item}</button>
            })}
          </div>
        </div>
        <div className="studio-stage" ref={stage}>
          <div style={{ width: width * scale, height: 900 * scale }} className="studio-frame-shell">
            <iframe title={'Prévia ' + device} ref={frame}
              src={portable ? undefined : 'studio.html?preview'}
              srcDoc={previewHtml}
              sandbox={portable ? 'allow-scripts allow-forms' : undefined}
              width={width} height={900} style={{ transform: 'scale(' + scale + ')' }} onLoad={() => {
                if (validated.success) frame.current?.contentWindow?.postMessage({ type: 'axyron-preview', config: validated.data }, portable ? '*' : location.origin)
              }} />
          </div>
        </div>
      </section>
    </div>
  </div>
}

function ClinicalCasesEditor({ cases, set }: {
  cases: NonNullable<ClinicConfig['clinicalCases']>
  set: (value: NonNullable<ClinicConfig['clinicalCases']>) => void
}) {
  return <>
    <p>Para exibir os casos autorizados, preencha o nome e o CRO do dentista que os realizou. Os dados devem coincidir com a identificação do site.</p>
    <Text label="Nome do autor dos casos" value={cases.author.name} set={(name) => set({ ...cases, author: { ...cases.author, name } })} />
    <Text label="CRO do autor dos casos" value={cases.author.registration} set={(registration) => set({ ...cases, author: { ...cases.author, registration } })} />
    <PhotoEditor label="Comparação da capa" photo={cases.cover} set={(cover) => set({ ...cases, cover, coverMobile: cover.src === cases.cover.src ? cases.coverMobile : '' })} />
    <Upload label="Comparação da capa para celular" value={cases.coverMobile} set={(coverMobile) => set({ ...cases, coverMobile })} />
    <Collection label="Caso clínico" items={cases.gallery} set={(gallery) => set({ ...cases, gallery })} create={() => ({ src: '', alt: '' })}
      render={(item, update) => <PhotoEditor label="Fotografia comparativa" photo={item} set={update} />} />
  </>
}

export function StudioPreview() {
  const [config, setConfig] = useState<ClinicConfig>(clinicConfig)
  const [resolved, setResolved] = useState<ClinicConfig | null>(null)
  useEffect(() => {
    function receive(event: MessageEvent) {
      const allowedOrigin = portable ? document.body.dataset.portableParentOrigin : location.origin
      if (event.origin !== allowedOrigin || event.source !== window.parent || event.data?.type !== 'axyron-preview') return
      const parsed = clinicSchema.safeParse(event.data.config)
      if (parsed.success) setConfig(parsed.data)
    }
    window.addEventListener('message', receive)
    return () => window.removeEventListener('message', receive)
  }, [])
  useEffect(() => {
    if (!portable) return
    let cancelled = false
    void previewConfig(config).then((value) => { if (!cancelled) setResolved(value) })
    return () => { cancelled = true }
  }, [config])
  const display = portable ? resolved : config
  return display ? <App config={display} editing /> : null
}
