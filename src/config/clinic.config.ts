import type { ClinicConfig, Photo } from './schema.ts'

const folder = '/images/vivant/'
const photo = (file: string, alt: string): Photo => ({ src: folder + file + '.webp', alt })
const hero = photo('hero', 'Recepção da Vivant com poltronas claras, painéis de madeira e iluminação indireta')
const recepcao = photo('recepcao', 'Balcão e assentos da recepção da Vivant')
const espera = photo('espera', 'Sala de espera com sofá longo, arcos iluminados e piso de madeira')
const atendimento = photo('atendimento', 'Consultório da Vivant com cadeira odontológica, bancada e luminária')
const consultorio = photo('consultorio', 'Mesa de atendimento e duas poltronas em um dos consultórios da Vivant')
const equipamentos = photo('equipamentos', 'Cadeira odontológica e luminária articulada em sala de atendimento')
const tomografia = photo('tomografia', 'Tomógrafo odontológico instalado na sala de exames da clínica')
const planejamento = photo('planejamento', 'Tela de um consultório da Vivant exibindo imagens para planejamento odontológico')
const detalhe = photo('detalhe', 'Poltronas e luminária sobre uma mesa de atendimento da Vivant')
const address = 'Av. Ailton Gomes, 2375 · Pirajá'
const officialPhone = '(88) 98889-0898'
const maps = 'https://www.google.com/maps/search/?api=1&query=Vivant+Instituto+de+Odontologia%2C+Juazeiro+do+Norte&query_place_id=ChIJVWfqfZN5oQcRvVpXJwPazDs'
const professional = { name: 'Dr. José Dyglei da Silva', registration: 'CRO-CE 15170' }

export const clinicConfig = {
  ...professional,
  brand: 'Dr. José Dyglei',
  brandLine: 'Cirurgião-dentista',
  logo: '',
  favicon: folder + 'simbolo.webp',
  slogan: 'Cuidar do seu sorriso é cuidar de você.',
  preset: 'Vivant',
  colors: {},
  fonts: { heading: 'Newsreader', body: 'Manrope' },
  motion: 'full',
  demo: false,
  contact: {
    whatsapp: '55' + officialPhone.replace(/\D/g, ''),
    phone: '+55 ' + officialPhone,
    email: '',
    instagram: 'https://www.instagram.com/vivant.odontologia/',
    address,
    city: 'Juazeiro do Norte',
    region: 'CE',
    postalCode: '63033-027',
    country: 'BR',
    hours: ['Segunda a sexta, 8h às 18h', 'Sábado, 8h às 12h'],
    maps,
    reviewsLink: 'https://search.google.com/local/reviews?placeid=ChIJVWfqfZN5oQcRvVpXJwPazDs',
    embed: 'https://www.google.com/maps?q=Vivant+Instituto+de+Odontologia%2C+Av.+Ailton+Gomes%2C+2375%2C+Juazeiro+do+Norte&output=embed',
  },
  sections: {
    marquee: true, about: true, treatments: true, experience: true, gallery: true,
    team: false, reviews: true, faq: true, contact: true,
  },
  photos: {
    hero, heroMobile: folder + 'hero-mobile.webp', about: atendimento, detail: detalhe,
    credit: '', galleryCredit: 'Fotografias da Vivant, publicadas na galeria da clínica.',
    gallery: [
      { ...recepcao, title: 'Recepção' },
      { ...espera, title: 'Sala de espera' },
      { ...atendimento, title: 'Consultório' },
      { ...tomografia, title: 'Sala de tomografia' },
      { ...consultorio, title: 'Espaço de atendimento' },
    ],
  },
  clinicalCases: {
    author: professional,
    cover: photo('caso-clinico-01', 'Fotografias do sorriso de um paciente antes e após a conclusão do tratamento'),
    coverMobile: folder + 'caso-clinico-01-mobile.webp',
    gallery: [
      photo('caso-clinico-02', 'Registro inicial da arcada dentária e fotografia do sorriso após a conclusão do tratamento'),
    ],
  },
  copy: {
    heroTag: 'Pirajá · Juazeiro do Norte',
    heroEmphasis: 'é cuidar de você.',
    heroDescription: 'Atendimento odontológico no Instituto Vivant, no bairro Pirajá, em Juazeiro do Norte.',
    aboutTitle: 'Uma clínica para cada fase do seu sorriso.',
    aboutIntro: 'No bairro Pirajá, a Vivant reúne atendimento odontológico para toda a família, com avaliação clínica, ortodontia, estética e reabilitação oral.',
    aboutBody: 'O scanner intraoral e a tomografia na própria clínica ajudam no planejamento quando indicados. O espaço conta com estacionamento próprio e sala de repouso.',
    treatmentTitle: 'Encontre o cuidado que você procura.',
    treatmentIntro: 'Conheça os tratamentos da Vivant e escolha sobre o que quer conversar na avaliação. A indicação depende das condições de saúde bucal de cada pessoa.',
    experienceTitle: 'Do primeiro atendimento ao planejamento.',
    experienceIntro: 'A consulta é o momento de explicar o que você precisa, tirar dúvidas e conversar sobre as opções para o seu caso.',
    galleryTitle: 'Por dentro da Vivant.',
    galleryIntro: 'Conheça a recepção, os consultórios e a sala de exames antes da sua visita.',
    bookingTitle: 'Vamos marcar sua avaliação?',
    bookingIntro: 'Escolha o assunto e o período em que prefere ser atendido. A recepção da Vivant confirma a disponibilidade pelo WhatsApp.',
    privacy: 'O formulário monta a mensagem no seu navegador. Ao continuar, o texto é aberto no WhatsApp para você revisar e decidir se deseja enviá-lo. Este site não guarda os dados preenchidos. Evite informar diagnósticos, exames ou outros dados pessoais além do necessário. Para dúvidas sobre privacidade, entre em contato com a recepção da Vivant.',
    specialties: ['Implantes dentários', 'Prótese protocolo', 'Facetas dentárias', 'Invisalign', 'Clareamento dental', 'Tratamento de canal'],
    benefits: [
      { title: 'Escuta na avaliação', description: 'Conte o que trouxe você à consulta e converse sobre suas prioridades.' },
      { title: 'Scanner intraoral', description: 'O escaneamento digital pode auxiliar o planejamento, quando indicado.' },
      { title: 'Conforto na visita', description: 'A clínica dispõe de estacionamento próprio e sala de repouso.' },
      { title: 'Tomografia na clínica', description: 'A equipe pode solicitar imagens para complementar a avaliação e o planejamento.' },
    ],
  },
  treatments: [
    {
      id: 'implantes', title: 'Implantes dentários', icon: 'scan',
      summary: 'Avaliação para reabilitar a falta de um ou mais dentes.',
      details: 'O dentista avalia as condições da boca e do osso e pode solicitar exames para discutir as alternativas de reposição e planejar as etapas.',
      image: planejamento,
    },
    {
      id: 'protese-protocolo', title: 'Prótese protocolo', icon: 'layers',
      summary: 'Planejamento de uma prótese fixa sobre implantes para reabilitação de uma arcada.',
      details: 'Na consulta, o profissional avalia se a prótese sobre implantes é indicada e explica as etapas, as alternativas e os cuidados de manutenção.',
      image: atendimento,
    },
    {
      id: 'facetas', title: 'Facetas dentárias', icon: 'sparkles',
      summary: 'Avaliação estética da forma, proporção e cor dos dentes.',
      details: 'A conversa inicial aborda o que você deseja mudar. O profissional avalia a saúde dos dentes e da gengiva para apresentar as opções que se aplicam ao caso.',
      image: detalhe,
    },
    {
      id: 'ortodontia', title: 'Ortodontia e Invisalign', icon: 'align',
      summary: 'Aparelhos ortodônticos e alinhadores transparentes para casos com indicação.',
      details: 'A avaliação da mordida e do alinhamento dos dentes ajuda a escolher entre aparelho ortodôntico e alinhadores Invisalign, conforme as necessidades de cada pessoa.',
      image: consultorio,
    },
    {
      id: 'clareamento', title: 'Clareamento dental', icon: 'sparkles',
      summary: 'Clareamento com orientação e acompanhamento odontológico.',
      details: 'A avaliação verifica a origem das manchas, a saúde bucal e a sensibilidade dos dentes antes de escolher a técnica e explicar os cuidados necessários.',
      image: photo('clareamento', 'Moldeiras transparentes e escala de tonalidades na publicação da Vivant sobre clareamento'),
    },
    {
      id: 'protese', title: 'Prótese dentária', icon: 'layers',
      summary: 'Opções de reabilitação para substituir dentes e recuperar a função mastigatória.',
      details: 'O tipo de prótese é definido após avaliar a mordida, as gengivas, os dentes remanescentes e a rotina de higiene.',
      image: equipamentos,
    },
    {
      id: 'canal', title: 'Tratamento de canal', icon: 'heart',
      summary: 'Avaliação da polpa dentária em casos de inflamação ou infecção.',
      details: 'O dentista examina o dente e pode solicitar imagens para identificar a causa dos sintomas e orientar o tratamento.',
      image: photo('endodontia', 'Luminária e cadeira odontológica em um consultório da clínica'),
    },
    {
      id: 'avaliacao', title: 'Clínica geral e prevenção', icon: 'shield',
      summary: 'Consulta de rotina para avaliar a saúde bucal e orientar os próximos cuidados.',
      details: 'A consulta inclui uma avaliação da boca e orientações de prevenção. Se houver indicação, a equipe conversa sobre exames, acompanhamento ou atendimento especializado.',
      image: photo('avaliacao', 'Sala de avaliação da clínica com cadeira odontológica e bancada iluminada'),
    },
  ],
  metrics: [],
  team: [],
  reviews: [],
  faq: [
    { question: 'Como agendo uma avaliação?', answer: 'Prepare sua mensagem no formulário ou ligue para ' + officialPhone + '. A recepção confirma os horários disponíveis.' },
    { question: 'Onde fica a Vivant?', answer: 'Na Avenida Ailton Gomes, 2375, no bairro Pirajá, em Juazeiro do Norte. A clínica tem estacionamento próprio. Você pode abrir a rota na seção de contato.' },
    { question: 'Qual é o horário de atendimento?', answer: 'De segunda a sexta, das 8h às 18h, e aos sábados, das 8h às 12h. Para feriados, consulte a recepção.' },
    { question: 'A clínica realiza exames no local?', answer: 'A Vivant conta com scanner intraoral e tomógrafo. A equipe orienta sobre os exames necessários para cada caso.' },
    { question: 'Preciso saber qual tratamento eu quero?', answer: 'Você pode escolher a opção de não informar o tratamento e explicar suas necessidades na avaliação.' },
  ],
  seo: {
    title: 'Dr. José Dyglei da Silva | Dentista em Juazeiro do Norte',
    description: 'Dr. José Dyglei da Silva, cirurgião-dentista (CRO-CE 15170). Atendimento na Vivant, em Juazeiro do Norte, com agendamento pelo WhatsApp.',
    domain: '',
    shareImage: hero.src,
    noindex: true,
  },
  signature: { label: 'Desenvolvido por AXYRON', url: '' },
} satisfies ClinicConfig
