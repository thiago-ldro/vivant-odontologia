import type { ClinicConfig, Photo } from '../config/schema.ts'

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
    treatments: config.treatments.map((item) => ({ ...item, image: photo(item.image) })),
    team: config.team.map((item) => ({ ...item, image: photo(item.image) })),
    seo: { ...config.seo, shareImage: replace(config.seo.shareImage) },
  }
}
