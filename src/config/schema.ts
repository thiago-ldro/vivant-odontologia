import { z } from 'zod'
import { presets } from './presets.ts'

const text = z.string()
const hex = text.regex(/^#[\da-f]{6}$/i)
const https = text.refine((value) => {
  if (!value) return true
  try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password } catch { return false }
}, 'Use uma URL HTTPS válida.')
const image = text.refine((value) => !value || /^\/(?!\/)[^\\\s?#]+$/.test(value) || /^data:image\/(webp|png|jpeg|avif|gif);base64,[a-z\d+/=]+$/i.test(value) || (value.startsWith('https://') && https.safeParse(value).success), 'Use uma imagem local, HTTPS ou raster incorporada.')
const photo = z.object({ src: image, alt: text })
const galleryPhoto = photo.extend({ title: text })
const treatments = z.array(z.object({ id: text.regex(/^[a-z0-9-]+$/), title: text.min(1), summary: text, details: text, icon: z.enum(['sparkles','scan','align','shield','heart','layers']), image: photo })).refine((items) => new Set(items.map((item) => item.id)).size === items.length, 'Cada tratamento precisa ter um ID único.')
const mapsEmbed = https.refine((value) => {
  if (!value) return true
  try {
    const url = new URL(value)
    return /^(?:www\.)?google\.com(?:\.br)?$/.test(url.hostname) && (
      /^\/maps\/embed(?:\/|$)/.test(url.pathname) ||
      (url.pathname === '/maps' && url.searchParams.has('q') && url.searchParams.get('output') === 'embed')
    )
  } catch { return false }
}, 'Use um link de incorporação do Google Maps.')

export const clinicSchema = z.object({
  name: text.min(1), brand: text.min(1), brandLine: text, slogan: text.min(1), logo: image, favicon: image,
  logoLabel: text.optional(),
  demo: z.boolean(), preset: z.enum(Object.keys(presets) as [keyof typeof presets, ...(keyof typeof presets)[]]),
  colors: z.object({ primary: hex, signal: hex, dark: hex, surface: hex, paper: hex, accent: hex, ink: hex }).partial(),
  fonts: z.object({ heading: z.enum(['Newsreader', 'Georgia', 'Manrope']), body: z.enum(['Manrope', 'System', 'Georgia']) }),
  motion: z.enum(['full', 'light', 'off']),
  contact: z.object({
    whatsapp: text.regex(/^(?:[1-9]\d{7,14})?$/, 'Use DDI, DDD e número, somente dígitos.'),
    phone: text.regex(/^[+\d().\s-]*$/), email: z.union([z.literal(''), z.email()]), instagram: https,
    address: text, city: text, region: text, postalCode: text, country: text, hours: z.array(text),
    maps: https, embed: mapsEmbed, reviewsLink: https.optional(),
  }),
  sections: z.object({ marquee: z.boolean(), about: z.boolean(), treatments: z.boolean(), experience: z.boolean(), gallery: z.boolean(), team: z.boolean(), reviews: z.boolean(), faq: z.boolean(), contact: z.boolean() }),
  photos: z.object({ hero: photo, heroMobile: image, about: photo, detail: photo, gallery: z.array(galleryPhoto), credit: text, galleryCredit: text.optional() }),
  clinicalCases: z.object({
    author: z.object({ name: text, registration: text }),
    cover: photo,
    coverMobile: image,
    gallery: z.array(photo),
  }).optional(),
  copy: z.object({
    heroTag: text, heroEmphasis: text, heroDescription: text, aboutTitle: text, aboutIntro: text, aboutBody: text, treatmentTitle: text, treatmentIntro: text,
    experienceTitle: text, experienceIntro: text, galleryTitle: text, galleryIntro: text, bookingTitle: text, bookingIntro: text, privacy: text,
    specialties: z.array(text), benefits: z.array(z.object({ title: text, description: text })),
  }),
  treatments,
  metrics: z.array(z.object({
    label: text.trim().min(1),
    value: z.number().int().nonnegative().nullable(),
    note: text,
  })).optional(),
  team: z.array(z.object({ name: text.min(1), specialty: text, registration: text, bio: text, image: photo })),
  reviews: z.array(z.object({ name: text.min(1), rating: z.number().int().min(1).max(5), quote: text.min(1), source: https })),
  faq: z.array(z.object({ question: text.min(1), answer: text })),
  seo: z.object({ title: text, description: text, domain: https, shareImage: image, noindex: z.boolean() }),
  signature: z.object({ label: text, url: https }),
  registration: text,
})

export type ClinicConfig = z.infer<typeof clinicSchema>
export type Photo = ClinicConfig['photos']['hero']
export type Treatment = ClinicConfig['treatments'][number]
export type ClinicMetric = NonNullable<ClinicConfig['metrics']>[number]
