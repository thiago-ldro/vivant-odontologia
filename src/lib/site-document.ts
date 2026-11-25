import type { ClinicConfig } from '../config/schema.ts'
import { presets } from '../config/presets.ts'
import { seoMetadata } from './seo.ts'
import { heroMedia } from './clinic-images.ts'

const escape = (value: string) => value.replace(/[&<>"']/g, (char) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]!
))

export function scriptJson(value: unknown) {
  return JSON.stringify(value).replace(/</g, '\\u003c')
}

export function clinicHead(config: ClinicConfig) {
  const seo = seoMetadata(config)
  const tags = [
    '<title>' + escape(config.seo.title) + '</title>',
    '<meta name="description" content="' + escape(config.seo.description) + '">',
    '<meta name="theme-color" content="' + escape(config.colors.dark ?? presets[config.preset].dark) + '">',
    '<meta name="robots" content="' + seo.robots + '">',
    '<meta property="og:type" content="website">',
    '<meta property="og:locale" content="pt_BR">',
    '<meta property="og:title" content="' + escape(config.seo.title) + '">',
    '<meta property="og:description" content="' + escape(config.seo.description) + '">',
    '<meta property="og:site_name" content="' + escape(config.name) + '">',
  ]
  if (config.favicon) tags.push('<link rel="icon" href="' + escape(config.favicon) + '">')
  if (seo.canonical) tags.push('<link rel="canonical" href="' + escape(seo.canonical) + '">', '<meta property="og:url" content="' + escape(seo.canonical) + '">')
  if (seo.shareImage) tags.push('<meta property="og:image" content="' + escape(seo.shareImage) + '">')
  if (seo.schema) tags.push('<script type="application/ld+json">' + scriptJson(seo.schema) + '</script>')
  const { hero, heroMobile } = heroMedia(config)
  if (hero.src && !hero.src.startsWith('data:')) {
    tags.push('<link rel="preload" as="image" fetchpriority="high" href="' + escape(hero.src) + '"' + (heroMobile ? ' media="(min-width: 691px)"' : '') + '>')
  }
  if (hero.src && heroMobile && !heroMobile.startsWith('data:')) {
    tags.push('<link rel="preload" as="image" fetchpriority="high" href="' + escape(heroMobile) + '" media="(max-width: 690px)">')
  }
  return tags.join('\n    ')
}

export function clinicRobots(config: ClinicConfig) {
  const { canonical, noindex } = seoMetadata(config)
  const listed = canonical && !noindex
  return {
    'robots.txt': 'User-agent: *\nAllow: /\n' + (listed ? 'Sitemap: ' + canonical + 'sitemap.xml\n' : ''),
    'sitemap.xml': '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + (listed ? '<url><loc>' + escape(canonical) + '</loc></url>' : '') + '</urlset>\n',
  }
}
