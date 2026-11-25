import type { ClinicConfig, Photo } from '../config/schema.ts'

export function visibleClinicalCases(config: ClinicConfig) {
  const cases = config.clinicalCases
  if (config.demo || !cases || !config.registration.trim()) return
  if (cases.author.name !== config.name || cases.author.registration !== config.registration) return
  return cases
}

export function heroMedia(config: ClinicConfig) {
  const cases = visibleClinicalCases(config)
  return cases?.cover.src
    ? { hero: cases.cover, heroMobile: cases.coverMobile, isClinical: true }
    : { hero: config.photos.hero, heroMobile: config.photos.heroMobile, isClinical: false }
}

export function mapClinicImages(config: ClinicConfig, replace: (url: string) => string): ClinicConfig {
  const photo = <T extends Photo>(image: T): T => ({ ...image, src: replace(image.src) })
  return {
    ...config,
    logo: replace(config.logo),
    favicon: replace(config.favicon),
    photos: {
      ...config.photos,
      hero: photo(config.photos.hero),
      heroMobile: replace(config.photos.heroMobile),
      about: photo(config.photos.about),
      detail: photo(config.photos.detail),
      gallery: config.photos.gallery.map(photo),
    },
    ...(config.clinicalCases && { clinicalCases: {
      ...config.clinicalCases,
      cover: photo(config.clinicalCases.cover),
      coverMobile: replace(config.clinicalCases.coverMobile),
      gallery: config.clinicalCases.gallery.map(photo),
    } }),
    treatments: config.treatments.map((item) => ({ ...item, image: photo(item.image) })),
    team: config.team.map((item) => ({ ...item, image: photo(item.image) })),
    seo: { ...config.seo, shareImage: replace(config.seo.shareImage) },
  }
}
