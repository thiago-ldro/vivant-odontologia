import type { ClinicConfig } from '../config/schema.ts'
import { validWhatsApp } from './booking.ts'

export function seoMetadata(config: ClinicConfig) {
  const { seo, contact } = config
  const canonical = seo.domain ? new URL('/', seo.domain).href : ''
  const noindex = config.demo || seo.noindex
  const robots = noindex ? 'noindex, nofollow' : 'index, follow'
  const shareImage = seo.shareImage.startsWith('https://') ? seo.shareImage : canonical && seo.shareImage.startsWith('/') ? new URL(seo.shareImage, canonical).href : ''
  const schema = config.demo ? null : {
    '@context': 'https://schema.org', '@type': 'Dentist', name: config.name, url: canonical || undefined,
    description: seo.description, image: shareImage || undefined,
    telephone: contact.phone || (validWhatsApp(contact.whatsapp, false) ? '+' + contact.whatsapp : undefined),
    email: contact.email || undefined,
    address: contact.address ? { '@type': 'PostalAddress', streetAddress: contact.address, addressLocality: contact.city, addressRegion: contact.region, postalCode: contact.postalCode, addressCountry: contact.country } : undefined,
    sameAs: contact.instagram ? [contact.instagram] : undefined,
    hasMap: contact.maps || undefined,
  }
  return { canonical, noindex, robots, shareImage, schema }
}
