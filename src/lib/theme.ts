import { presets } from '../config/presets.ts'
import type { ClinicConfig } from '../config/schema.ts'

const fonts = {
  Newsreader: '"Newsreader Variable", Georgia, serif',
  Georgia: 'Georgia, serif',
  Manrope: '"Manrope Variable", system-ui, sans-serif',
  System: 'system-ui, sans-serif',
}

export function themeVariables(config: ClinicConfig) {
  const preset = presets[config.preset]
  const colors = { signal: preset.accent, surface: '#FFFFFF', ...preset, ...config.colors }
  return {
    '--primary': colors.primary, '--signal': colors.signal, '--dark': colors.dark,
    '--surface': colors.surface, '--paper': colors.paper, '--accent': colors.accent, '--ink': colors.ink,
    '--heading': fonts[config.fonts.heading], '--body': fonts[config.fonts.body],
  }
}
