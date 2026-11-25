import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

export function enhance(root: HTMLElement, mode: 'full' | 'light') {
  gsap.registerPlugin(ScrollTrigger)
  const media = gsap.matchMedia()
  media.add('(prefers-reduced-motion: no-preference)', () => {
    root.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
      if (el.getBoundingClientRect().top < innerHeight) return
      gsap.from(el, {
        y: 24,
        duration: .78,
        ease: 'power3.out',
        clearProps: 'transform',
        scrollTrigger: { trigger: el, start: 'top 95%', once: true },
      })
    })
    root.querySelectorAll<HTMLElement>('[data-mask]').forEach((el) => {
      gsap.from(el, {
        clipPath: 'inset(0 0 18% 0)',
        duration: 1,
        ease: 'power3.out',
        clearProps: 'clipPath',
        scrollTrigger: { trigger: el, start: 'top 94%', once: true },
      })
    })
    const progress = root.querySelector('.reading-progress')
    if (progress) gsap.to(progress, { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: true } })
  })
  if (mode === 'full' && (navigator.hardwareConcurrency || 4) >= 4) {
    media.add('(min-width: 1024px) and (pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
      const lenis = new Lenis({ syncTouch: false, prevent: (node) => node instanceof HTMLElement && !!node.closest('dialog, .gallery-rail') })
      const frame = (time: number) => lenis.raf(time * 1000)
      lenis.on('scroll', ScrollTrigger.update)
      gsap.ticker.add(frame)
      const hero = root.querySelector('.hero')
      const portrait = root.querySelector('.hero:not([data-clinical-cover]) .hero-photo img')
      if (hero && portrait) {
        gsap.fromTo(portrait, { yPercent: 0, scale: 1 }, {
          yPercent: 4, scale: 1.085, ease: 'none',
          scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: .55 },
        })
      }
      const about = root.querySelector('.about')
      const detail = root.querySelector('.about-small')
      if (about && detail) {
        gsap.fromTo(detail, { y: 18 }, {
          y: -22, ease: 'none',
          scrollTrigger: { trigger: about, start: 'top bottom', end: 'bottom top', scrub: .55 },
        })
      }
      const ui = new AbortController()
      const opts = { signal: ui.signal }
      root.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((el) => {
        el.addEventListener('pointermove', (event) => {
          const rect = el.getBoundingClientRect()
          gsap.to(el, { x: (event.clientX - rect.left - rect.width / 2) * .12, y: (event.clientY - rect.top - rect.height / 2) * .16, duration: .25, overwrite: true })
        }, opts)
        el.addEventListener('pointerleave', () => { gsap.to(el, { x: 0, y: 0, duration: .35, overwrite: true }) }, opts)
      })
      const light = root.querySelector<HTMLElement>('[data-light]')
      light?.addEventListener('pointermove', (event) => {
        const rect = light.getBoundingClientRect()
        light.style.setProperty('--light-x', event.clientX - rect.left + 'px')
        light.style.setProperty('--light-y', event.clientY - rect.top + 'px')
      }, opts)
      return () => { ui.abort(); gsap.ticker.remove(frame); lenis.destroy() }
    })
  }
  const resize = new ResizeObserver(() => ScrollTrigger.refresh(true))
  resize.observe(root)
  return () => {
    resize.disconnect()
    media.revert()
  }
}
