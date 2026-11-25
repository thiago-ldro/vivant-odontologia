import assert from 'node:assert/strict'
import test from 'node:test'
import { clinicConfig } from '../src/config/clinic.config.ts'
import { clinicSchema } from '../src/config/schema.ts'
import { presets } from '../src/config/presets.ts'
import { bookingMessage, whatsAppUrl } from '../src/lib/booking.ts'
import { themeVariables } from '../src/lib/theme.ts'
import { seoMetadata } from '../src/lib/seo.ts'

test('gera a mensagem completa e preserva acentos e símbolos após a codificação', () => {
  const message = bookingMessage(' Ana  Guimarães & Luz ', 'Ortodontia', 'Manhã')
  assert.equal(message, 'Olá! Vim através do site da clínica e gostaria de solicitar um atendimento.\n\nNome: Ana Guimarães & Luz\n\nTratamento de interesse: Ortodontia\n\nPeríodo preferencial: Manhã\n\nGostaria de verificar a disponibilidade de horários.')
  const url = new URL(whatsAppUrl('5511999990000', message, false)!)
  assert.equal(url.origin, 'https://wa.me')
  assert.equal(url.pathname, '/5511999990000')
  assert.equal(url.searchParams.get('text'), message)
})

test('bloqueia destinos inválidos e bloqueia qualquer destino no modo demonstrativo', () => {
  for (const invalid of ['', '1199', '+5511999990000', '05511999990000', '55119999?text=']) {
    assert.equal(whatsAppUrl(invalid, 'Mensagem', false), null)
  }
  assert.equal(whatsAppUrl('5511999990000', 'Mensagem', true), null)
})

test('aplica todos os presets e respeita sobrescritas', () => {
  const values = Object.entries(presets).map(([preset, colors]) => {
    const config = clinicSchema.parse({ ...clinicConfig, preset })
    const theme = themeVariables(config)
    assert.equal(theme['--dark'], colors.dark)
    assert.equal(theme['--accent'], colors.accent)
    return theme['--primary']
  })
  assert.equal(new Set(values).size, Object.keys(presets).length)
  assert.equal(clinicConfig.preset, 'Vivant')
  const theme = themeVariables(clinicConfig)
  assert.equal(theme['--primary'], '#795626')
  assert.equal(theme['--dark'], '#241A15')
  assert.equal(theme['--accent'], '#E4C99E')
  assert.equal(themeVariables({ ...clinicConfig, colors: { primary: '#333333' } })['--primary'], '#333333')
})

test('valida JSON exportado, referências, IDs duplicados e URLs inválidas', () => {
  const roundTrip = clinicSchema.parse(JSON.parse(JSON.stringify(clinicConfig)))
  assert.deepEqual(roundTrip, clinicConfig)
  assert.equal(clinicSchema.safeParse({ ...roundTrip, treatments: [roundTrip.treatments[0], roundTrip.treatments[0]] }).success, false)
  assert.equal(clinicSchema.safeParse({ ...roundTrip, contact: { ...roundTrip.contact, maps: 'javascript:alert(1)' } }).success, false)
  assert.equal(clinicSchema.safeParse({ ...roundTrip, contact: { ...roundTrip.contact, embed: 'https://google.com.example.org/maps?output=embed&q=x' } }).success, false)
  assert.equal(clinicSchema.safeParse({ ...roundTrip, photos: { ...roundTrip.photos, heroMobile: '//example.com/a.png' } }).success, false)
})

test('demonstração fica sem Dentist e noindex continua ativo; produção usa dados configurados', () => {
  const demo = seoMetadata({ ...clinicConfig, demo: true, seo: { ...clinicConfig.seo, noindex: false } })
  assert.equal(demo.noindex, true)
  assert.equal(demo.schema, null)
  const active = seoMetadata({ ...clinicConfig, demo: false, contact: { ...clinicConfig.contact, city: 'São Paulo', address: 'Endereço de teste' }, seo: { ...clinicConfig.seo, domain: 'https://example.com', noindex: false } })
  assert.equal(active.canonical, 'https://example.com/')
  assert.equal(active.schema?.address?.addressLocality, 'São Paulo')
  assert.equal(active.noindex, false)
})
