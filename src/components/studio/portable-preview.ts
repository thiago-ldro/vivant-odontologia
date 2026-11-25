import type { ClinicConfig } from '../../config/schema'
import { mapClinicImages } from '../../lib/clinic-images'

export const portable = import.meta.env.MODE === 'portable'

const imageMime: Record<string, string> = { svg: 'svg+xml', webp: 'webp', png: 'png', jpg: 'jpeg', jpeg: 'jpeg', avif: 'avif', gif: 'gif' }

export function previewDocument() {
  if (!portable) return undefined
  const copy = document.documentElement.cloneNode(true) as HTMLElement
  const body = copy.querySelector('body')!
  body.dataset.portableView = 'preview'
  body.dataset.portableParentOrigin = location.protocol === 'file:' ? 'null' : location.origin
  copy.querySelector('#root')!.replaceChildren()
  return '<!doctype html>' + copy.outerHTML
}

export async function previewConfig(config: ClinicConfig) {
  if (!portable) return config
  const { default: kit } = await import('virtual:axyron-export-kit')
  return mapClinicImages(config, (url) => {
    if (!url.startsWith('/')) return url
    const asset = kit.media[url.slice(1)]
    const mime = imageMime[url.split('.').at(-1)?.toLowerCase() ?? '']
    return asset && mime ? 'data:image/' + mime + ';base64,' + asset : url
  })
}
