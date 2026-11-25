# Vivant Instituto de Odontologia

Site institucional da Vivant em Juazeiro do Norte, criado sobre o AXYRON Dental. O site usa o dourado do logotipo, tons de madeira e fotografias da própria clínica. A build é estática, com HTML pré-renderizado.

## Executar

Use Node.js 22.12+ ou 24 LTS.

```sh
npm ci
npm run dev
npm run studio
```

O comando `dev` abre o site. O comando `studio` abre o editor em `/studio.html` no endereço indicado pelo Vite. O Studio tem prévias responsivas, edição da configuração, importação e exportação JSON e downloads em ZIP.

## Conteúdo e fotos

- Consulte a [página atual da Vivant](https://vivant-odontologia-juazeiro-do-norte.localo.site/) e a [página de contato](https://vivant-odontologia-juazeiro-do-norte.localo.site/contact/) para telefone, horário, endereço, tratamentos e estrutura. O número também consta como WhatsApp no [cadastro empresarial](https://www.econodata.com.br/consulta-empresa/49976267000108-vivant-instituto-de-odontologia-ltda).
- O logotipo é o avatar da [página atual](https://vivant-odontologia-juazeiro-do-norte.localo.site/). As imagens vêm da [galeria fornecida](https://vivant-odontologia-juazeiro-do-norte.localo.site/photos) e da [publicação sobre clareamento](https://vivant-odontologia-juazeiro-do-norte.localo.site/blog/2661461120532459695-clareamento-dental-na-vivant-e-feito). As cópias WebP estão em `public/images/vivant/`. A licença MIT do código não se estende à marca ou às imagens da clínica. O mapa e o link de avaliações usam o identificador do estabelecimento contido na página de referência.
- O CEP segue o site da clínica. O cadastro empresarial apresenta outro CEP para a mesma rua e número. Confirme o CEP com a recepção antes da publicação.
- Os dados da equipe e do responsável técnico devem ser revisados com a clínica para preencher a identificação profissional. As avaliações podem ser consultadas no Google a partir da seção Contato.
- Edite dados e textos em `src/config/clinic.config.ts`, cores em `src/config/presets.ts` e o acabamento do tema em `src/styles/vivant.css`. Substitua fotos e textos alternativos juntos.

## Validar e gerar a entrega

```sh
npm run typecheck
npm run lint
npm test
npm run build
npm run build:studio
npm run build:portable
npx playwright install chromium
npm run test:e2e
npm run audit
```

Se o Chromium estiver instalado no sistema, aponte `AXYRON_CHROMIUM` para o executável para usá-lo nos testes e na auditoria. Os testes verificam formulário e privacidade, menu mobile, galeria, tratamentos, exportações do Studio e ausência do Studio na versão pública.

## Publicar

- A Vercel e a Netlify podem importar este repositório e executar `npm run build`. A pasta pública de saída é `dist/`.
- Confirme com a Vivant o uso das fotos na versão final, os dados da recepção, a identificação profissional e o domínio definitivo. Configure o domínio e altere `seo.noindex` para `false` quando a clínica aprovar a publicação.
- O site usa `wa.me` para preparar a mensagem. O paciente revisa e envia no WhatsApp, e a recepção confirma o horário. O formulário não persiste os dados digitados.
- A edição pode ser entregue com `npm run build:portable`. O ZIP do Studio fica em `artifacts/AXYRON-Studio-Portatil.zip`. No Studio, use **Exportar site (.zip)** para arquivos estáticos ou **Código para Lovable (.zip)** para o código-fonte. As instruções de cada fluxo acompanham o ZIP.
