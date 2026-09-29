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

## Publicar

Qualquer hospedagem estática (Vercel, Netlify, Cloudflare Pages): comando `npm run build`, pasta `dist`, página de erro `404.html`.
