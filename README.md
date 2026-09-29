# triariitecnologia

Site institucional da Triarii Tecnologia: desenvolvimento, infraestrutura, dados e consultoria.

Feito com React + TypeScript (Vite), GSAP, Lenis e Three.js.

## Rodar

```bash
npm install
npm run dev      # desenvolvimento em http://localhost:5173
npm run build    # gera o site pronto em dist/ (cada página pré-renderizada)
npm run preview  # serve o dist/ localmente
```

## Onde mexer

- `src/dados/conteudo.ts`: textos (serviços, situações, etapas, perguntas, contato)
- `src/rotas.tsx`: páginas, títulos e descrições
- `src/paginas/`: uma tela por arquivo
- `src/style.css`: cores e estilos (tokens no topo, em `:root`)
- `src/efeitos/`: animações (abertura, partículas, transição etc.)
- `src/dados/logo.ts`: geometria do logo

## Configuração (variáveis de ambiente)

Veja `.env.example`. Localmente, copie para `.env`; na hospedagem, cadastre nas variáveis do projeto.

- `VITE_WEB3FORMS_KEY`: com ela, o formulário envia direto para o e-mail de contato
  (crie grátis em https://web3forms.com). Sem ela, o formulário abre o programa de e-mail.
- `SITE_URL`: domínio final (ex.: `https://www.triarii.com.br`). Gera canonical, `og:url`,
  imagem de compartilhamento com URL absoluta e `sitemap.xml`.

## Publicar

Qualquer hospedagem estática (Vercel, Netlify, Cloudflare Pages): comando `npm run build`, pasta `dist`, página de erro `404.html`.

- **Vercel:** `vercel.json` já traz build, URLs sem `.html` e cabeçalhos de segurança.
- **Netlify / Cloudflare Pages:** os cabeçalhos estão em `public/_headers`.

## Segurança

- CSP em cada página, gerada no build com o hash do único script inline.
- Cabeçalhos: HSTS, `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`.
- Nenhum recurso de terceiros: fontes servidas pelo próprio site.
- Formulário com campo-isca contra robôs, bloqueio de envio duplo e limites de tamanho.
