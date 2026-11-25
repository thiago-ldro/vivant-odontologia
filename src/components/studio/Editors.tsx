import type { ReactNode } from 'react'
import type { ClinicConfig, ClinicMetric, Photo, Treatment } from '../../config/schema'
import { Field, Select, Text, Upload } from './Fields'

export function Collection<T>({ label, items, set, create, render }: { label: string; items: T[]; set: (items: T[]) => void; create: () => T; render: (item: T, update: (item: T) => void) => ReactNode }) {
  return <div className="studio-collection">
    {items.map((item, index) => <details key={index} className="studio-record"><summary>{label} {index + 1}</summary>{render(item, (next) => set(items.map((value, current) => current === index ? next : value)))}<button type="button" onClick={() => set(items.filter((_, current) => current !== index))}>Remover {label.toLowerCase()}</button></details>)}
    <button type="button" onClick={() => set([...items, create()])}>Adicionar {label.toLowerCase()}</button>
  </div>
}

export function PhotoEditor({ label, photo, set }: { label: string; photo: Photo; set: (photo: Photo) => void }) {
  return <><Upload label={label} value={photo.src} set={(src) => set({ ...photo, src })} /><Text label="Texto alternativo" value={photo.alt} set={(alt) => set({ ...photo, alt })} /></>
}

const blankImage = { src: '', alt: '' }
const icons = ['sparkles', 'scan', 'align', 'shield', 'heart', 'layers'] as const

export function TreatmentsEditor({ items, set }: { items: Treatment[]; set: (items: Treatment[]) => void }) {
  return <Collection<Treatment> label="Tratamento" items={items} set={set} create={() => ({ id: 'novo-' + crypto.randomUUID().slice(0, 8), title: 'Novo tratamento', summary: '', details: '', icon: 'heart', image: blankImage })}
    render={(item, update) => <>
      <Text label="Nome do tratamento" value={item.title} set={(title) => update({ ...item, title })} />
      <Text label="Resumo" value={item.summary} set={(summary) => update({ ...item, summary })} multiline />
      <Text label="Detalhes" value={item.details} set={(details) => update({ ...item, details })} multiline />
      <Select label="Ícone" value={item.icon} options={icons} set={(icon) => update({ ...item, icon: icon as Treatment['icon'] })} />
      <PhotoEditor label="Imagem do tratamento" photo={item.image} set={(image) => update({ ...item, image })} />
    </>} />
}

export function TeamEditor({ items, set }: { items: ClinicConfig['team']; set: (items: ClinicConfig['team']) => void }) {
  return <Collection label="Profissional" items={items} set={set} create={() => ({ name: 'Novo profissional', specialty: '', registration: '', bio: '', image: blankImage })}
    render={(item, update) => <>
      <Text label="Nome do profissional" value={item.name} set={(name) => update({ ...item, name })} />
      <Text label="Especialidade" value={item.specialty} set={(specialty) => update({ ...item, specialty })} />
      <Text label="Registro profissional" value={item.registration} set={(registration) => update({ ...item, registration })} />
      <Text label="Apresentação" value={item.bio} set={(bio) => update({ ...item, bio })} multiline />
      <PhotoEditor label="Fotografia do profissional" photo={item.image} set={(image) => update({ ...item, image })} />
    </>} />
}

export function PhotosEditor({ photos, set }: { photos: ClinicConfig['photos']; set: (photos: ClinicConfig['photos']) => void }) {
  return <>
    {([['hero', 'Fotografia principal'], ['about', 'Fotografia institucional'], ['detail', 'Fotografia de detalhe']] as const).map(([key, label]) => <details className="studio-record" key={key}><summary>{label}</summary><PhotoEditor label={label} photo={photos[key]} set={(photo) => set({ ...photos, [key]: photo })} /></details>)}
    <Upload label="Imagem principal para celular" value={photos.heroMobile} set={(heroMobile) => set({ ...photos, heroMobile })} />
    <Text label="Crédito das imagens" value={photos.credit} set={(credit) => set({ ...photos, credit })} />
    <Text label="Crédito das fotos da galeria" value={photos.galleryCredit ?? ''} set={(galleryCredit) => set({ ...photos, galleryCredit })} />
    <Collection label="Foto da galeria" items={photos.gallery} set={(gallery) => set({ ...photos, gallery })} create={() => ({ ...blankImage, title: 'Nova foto' })}
      render={(item, update) => <><Text label="Legenda" value={item.title} set={(title) => update({ ...item, title })} /><PhotoEditor label="Foto" photo={item} set={(photo) => update({ ...item, ...photo })} /></>} />
  </>
}

const copyLabels = {
  heroTag: 'Linha de apoio do hero', heroEmphasis: 'Trecho final do slogan em destaque', heroDescription: 'Descrição do hero',
  aboutTitle: 'Título institucional', aboutIntro: 'Introdução institucional', aboutBody: 'Texto institucional',
  treatmentTitle: 'Título dos tratamentos', treatmentIntro: 'Introdução dos tratamentos',
  experienceTitle: 'Título da experiência', experienceIntro: 'Introdução da experiência',
  galleryTitle: 'Título da estrutura', galleryIntro: 'Introdução da estrutura',
  bookingTitle: 'Título do agendamento', bookingIntro: 'Introdução do agendamento', privacy: 'Aviso de privacidade',
} as const

export function CopyEditor({ copy, set }: { copy: ClinicConfig['copy']; set: (copy: ClinicConfig['copy']) => void }) {
  return <>
    {(Object.keys(copyLabels) as (keyof typeof copyLabels)[]).map((key) => <Text key={key} label={copyLabels[key]} value={copy[key]} set={(value) => set({ ...copy, [key]: value })} multiline />)}
    <Text label="Especialidades na faixa (uma por linha)" value={copy.specialties.join('\n')} set={(value) => set({ ...copy, specialties: value ? value.split('\n') : [] })} multiline />
    <Collection label="Diferencial" items={copy.benefits} set={(benefits) => set({ ...copy, benefits })} create={() => ({ title: 'Novo diferencial', description: '' })}
      render={(item, update) => <><Text label="Título do diferencial" value={item.title} set={(title) => update({ ...item, title })} /><Text label="Descrição do diferencial" value={item.description} set={(description) => update({ ...item, description })} multiline /></>} />
  </>
}

export function MetricsEditor({ items, set }: { items: ClinicMetric[]; set: (items: ClinicMetric[]) => void }) {
  return <Collection<ClinicMetric> label="Métrica" items={items} set={set}
    create={() => ({ label: 'Nova métrica', value: null, note: '' })}
    render={(item, update) => <>
      <Text label="Nome da métrica" value={item.label} set={(label) => update({ ...item, label })} />
      <Field label="Valor confirmado">
        <input type="number" min={0} step={1} inputMode="numeric" value={item.value ?? ''}
          onChange={({ target }) => update({ ...item, value: target.value === '' ? null : target.valueAsNumber })} />
      </Field>
      <Text label="Período ou fonte" value={item.note} set={(note) => update({ ...item, note })} />
    </>} />
}

type Review = ClinicConfig['reviews'][number]

export function ReviewsEditor({ items, set }: { items: Review[]; set: (items: Review[]) => void }) {
  return <Collection<Review> label="Avaliação" items={items} set={set} create={() => ({ name: 'Nome autorizado', rating: 5, quote: '', source: '' })}
    render={(item, update) => <>
      <Text label="Nome autorizado" value={item.name} set={(name) => update({ ...item, name })} />
      <Select label="Nota" value={String(item.rating)} options={['1', '2', '3', '4', '5']} set={(rating) => update({ ...item, rating: Number(rating) })} />
      <Text label="Depoimento" value={item.quote} set={(quote) => update({ ...item, quote })} multiline />
      <Text label="Link da fonte" value={item.source} set={(source) => update({ ...item, source })} />
    </>} />
}
