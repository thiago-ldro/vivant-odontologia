import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react'
import type { ClinicConfig } from '../../config/schema'
import { Dialog } from '../ui/Dialog'
import { Image } from './Intro'

export function Gallery({ config }: { config: ClinicConfig }) {
  const rail = useRef<HTMLDivElement>(null)
  const [selected, setSelected] = useState<number | null>(null)
  const [progress, setProgress] = useState(0)
  const items = config.photos.gallery
  const credit = config.photos.galleryCredit ?? config.photos.credit
  const current = selected === null ? undefined : items[selected]

  function measure(element: HTMLDivElement) {
    const end = element.scrollWidth - element.clientWidth
    setProgress(end <= 2 ? 100 : Math.max(0, Math.min(100, Math.round(100 * element.scrollLeft / end))))
  }

  useEffect(() => {
    const element = rail.current
    if (!element) return

    measure(element)
    const resize = new ResizeObserver(() => measure(element))
    resize.observe(element)
    return () => resize.disconnect()
  }, [items.length])

  useEffect(() => {
    const element = rail.current
    if (!element || config.motion === 'off') return
    const media = matchMedia('(min-width: 1024px) and (pointer: fine) and (prefers-reduced-motion: no-preference)')
    let timer: number | undefined

    function move(event: WheelEvent) {
      if (!media.matches || !element || event.ctrlKey || event.shiftKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return
      const maximum = element.scrollWidth - element.clientWidth
      const direction = Math.sign(event.deltaY)
      if (!direction || maximum <= 1 || (direction < 0 && element.scrollLeft <= 1) || (direction > 0 && element.scrollLeft >= maximum - 1)) return
      event.preventDefault()
      element.classList.add('wheel-drag')
      element.scrollLeft += event.deltaY * (event.deltaMode === 1 ? 16 : 1)
      window.clearTimeout(timer)
      timer = window.setTimeout(() => element.classList.remove('wheel-drag'), 170)
    }

    element.addEventListener('wheel', move, { passive: false })
    return () => {
      element.removeEventListener('wheel', move)
      window.clearTimeout(timer)
      element.classList.remove('wheel-drag')
    }
  }, [config.motion])

  const change = (delta: number) => setSelected((index) => index === null ? null : (index + items.length + delta) % items.length)
  function scroll(delta: number) {
    const element = rail.current
    if (!element) return
    const gap = Number.parseFloat(getComputedStyle(element).columnGap) || 0
    element.scrollBy({ left: delta * ((element.firstElementChild?.clientWidth ?? 0) + gap), behavior: 'auto' })
  }

  return <section id="estrutura" className="section gallery">
    <div className="wrap section-heading" data-reveal>
      <div><p className="eyebrow">Nossa estrutura</p><h2>{config.copy.galleryTitle}</h2></div>
      <div>
        <p>{config.copy.galleryIntro}</p>
        <div className="gallery-controls">
          <button className="icon-button" onClick={() => scroll(-1)} aria-label="Deslizar galeria para trás" aria-controls="gallery-rail" disabled={progress === 0}><ChevronLeft /></button>
          <button className="icon-button" onClick={() => scroll(1)} aria-label="Deslizar galeria para frente" aria-controls="gallery-rail" disabled={progress === 100}><ChevronRight /></button>
          <progress className="gallery-progress" aria-label="Progresso da galeria" value={progress} max={100} />
        </div>
      </div>
    </div>
    <div className="gallery-rail" id="gallery-rail" ref={rail} aria-label="Galeria da estrutura" role="region" tabIndex={0}
      onScroll={(event) => measure(event.currentTarget)}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget || (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight')) return
        event.preventDefault()
        scroll(event.key === 'ArrowLeft' ? -1 : 1)
      }}>
      {items.map((item, index) => <figure key={index}>
        <button className="gallery-photo" onClick={() => setSelected(index)} aria-label={'Ampliar ' + item.title}>
          <Image photo={item} /><span><Maximize2 size={18} /></span>
        </button>
        <figcaption>{item.title}</figcaption>
      </figure>)}
    </div>
    {credit && <p className="wrap photo-credit">{credit}</p>}
    {current && <Dialog title="Visualização da galeria" className="gallery-dialog" onClose={() => setSelected(null)}
      onKeyDown={(event) => {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
        event.preventDefault()
        change(event.key === 'ArrowLeft' ? -1 : 1)
      }}>
      <Image photo={current} />
      <div className="gallery-dialog-nav">
        <button className="icon-button" aria-label="Foto anterior" onClick={() => change(-1)}><ChevronLeft /></button>
        <p aria-live="polite">{current.title}</p>
        <button className="icon-button" aria-label="Próxima foto" onClick={() => change(1)}><ChevronRight /></button>
      </div>
    </Dialog>}
  </section>
}
