# AXYRON Dental

- Edite dados do cliente em `src/config/clinic.config.ts`. Mantenha schema, tipos e Studio alinhados ao adicionar campos.
- Preserve a separação das entradas Vite. `index.html` é público. `studio.html` usa configuração, script e saída próprios.
- Nunca persista valores digitados no formulário nem os envie para analytics. Preserve os bloqueios de WhatsApp na demonstração e na prévia do Studio.
- A demonstração usa `noindex` e imagens conceituais identificadas. Profissionais e depoimentos exigem dados reais e autorizados.
- Priorize HTML semântico, teclado, foco visível, navegação por âncoras e movimento reduzido.
- Execute `npm run typecheck`, `npm run lint`, `npm test`, `npm run build` e `npm run build:studio`. Para alterações de interface, rode `npm run build:portable` e `npm run test:e2e` depois das builds. Os testes verificam também os ZIPs do Studio.
- Publique somente `dist/`. Não versione `node_modules/`, builds, credenciais ou dados de pacientes.
