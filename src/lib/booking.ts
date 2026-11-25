export const periods = ['Manhã', 'Tarde', 'Sem preferência'] as const

export function bookingMessage(name: string, treatment: string, period: string) {
  return [
    'Olá! Vim através do site da clínica e gostaria de solicitar um atendimento.',
    'Nome: ' + name.trim().replace(/\s+/g, ' '),
    'Tratamento de interesse: ' + treatment,
    'Período preferencial: ' + period,
    'Gostaria de verificar a disponibilidade de horários.',
  ].join('\n\n')
}

export function validWhatsApp(number: string, demo: boolean) {
  return !demo && /^[1-9]\d{7,14}$/.test(number)
}

export function whatsAppUrl(number: string, message: string, demo: boolean) {
  return validWhatsApp(number, demo) ? 'https://wa.me/' + number + '?text=' + encodeURIComponent(message) : null
}
