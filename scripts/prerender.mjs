// Pré-renderiza cada rota do React em HTML estático, depois do build.
// Resultado: dist/index.html, dist/servicos/index.html, ... e dist/404.html,
// cada um com o conteúdo, título, descrição e metadados da página. Buscadores
// leem o texto sem rodar JavaScript, e o React só "hidrata" o que já está lá.
//
// Também gera:
// - a política de segurança (CSP) de cada página, com o hash do script inline;
// - robots.txt e, quando SITE_URL está definido, sitemap.xml;
// - URLs absolutas (canonical, og:url, og:image) quando SITE_URL está definido.
//
// Defina o domínio no build:  SITE_URL=https://www.triarii.com.br npm run build

import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const dist = path.resolve('dist');
const ssr = path.resolve('dist-ssr');
const SITE_URL = (process.env.SITE_URL ?? '').replace(/\/+$/, '');
const modelo = await fs.readFile(path.join(dist, 'index.html'), 'utf8');
const { renderizar, ROTAS, ROTA_404, CONTATO, EQUIPE } = await import(
  pathToFileURL(path.join(ssr, 'entry-server.js')).href
);

const escapar = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const absoluta = (caminho) => (SITE_URL ? SITE_URL + caminho : caminho);
// Sem barra no fim, igual aos links do site e ao vercel.json (trailingSlash: false).
const urlDaRota = (caminho) => absoluta(caminho);

// Troca o content de uma <meta> pelo atributo (name ou property).
const trocarMeta = (html, attr, nome, valor) =>
  html.replace(
    new RegExp(`(<meta\\s+${attr}="${nome}"\\s+content=")[^"]*(")`),
    `$1${escapar(valor)}$2`,
  );

// CSP: só scripts do próprio site e o script inline do <head>, liberado pelo hash.
// Mudou o script inline? O hash é recalculado sozinho a cada build.
const hashes = [...modelo.matchAll(/<script(?![^>]*\bsrc=)(?![^>]*application\/ld\+json)[^>]*>([\s\S]*?)<\/script>/g)].map(
  ([, codigo]) => `'sha256-${crypto.createHash('sha256').update(codigo).digest('base64')}'`,
);
const CSP = [
  "default-src 'self'",
  `script-src 'self' ${hashes.join(' ')}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:", // o Vite embute as fontes bem pequenas no CSS como data:
  "connect-src 'self' https://api.web3forms.com",
  "form-action 'self' https://api.web3forms.com",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
].join('; ');

// Dados estruturados da empresa (Google e outros buscadores).
const organizacao = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Triarii Tecnologia',
  description: ROTAS[0].descricao,
  email: CONTATO.email,
  ...(SITE_URL && { url: `${SITE_URL}/`, logo: `${SITE_URL}/icon-512.png` }),
  founder: EQUIPE.map((p) => ({ '@type': 'Person', name: p.nome, sameAs: p.linkedin })),
  knowsAbout: ['Desenvolvimento de software', 'Infraestrutura em nuvem', 'Engenharia de dados', 'Consultoria em TI'],
};

for (const rota of [...ROTAS, ROTA_404]) {
  const e404 = rota === ROTA_404;
  const corpo = renderizar(rota.caminho);

  let head = `<meta http-equiv="Content-Security-Policy" content="${CSP}" />\n`;
  if (e404) head += '    <meta name="robots" content="noindex" />\n';
  else if (SITE_URL) head += `    <link rel="canonical" href="${urlDaRota(rota.caminho)}" />\n`;
  if (SITE_URL && !e404) head += `    <meta property="og:url" content="${urlDaRota(rota.caminho)}" />\n`;
  if (rota.caminho === '/') {
    head += `    <script type="application/ld+json">${JSON.stringify(organizacao).replace(/</g, '\\u003c')}</script>\n`;
  }

  let html = modelo
    .replace('<meta charset="UTF-8" />', `<meta charset="UTF-8" />\n    ${head.trimEnd()}`)
    .replace('<div id="raiz"></div>', `<div id="raiz" data-rota="${rota.caminho}">${corpo}</div>`)
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapar(rota.titulo)}</title>`);
  html = trocarMeta(html, 'name', 'description', rota.descricao);
  html = trocarMeta(html, 'property', 'og:title', rota.titulo);
  html = trocarMeta(html, 'property', 'og:description', rota.descricao);
  html = trocarMeta(html, 'property', 'og:image', absoluta('/og.png'));

  const destino =
    rota.caminho === '/'
      ? path.join(dist, 'index.html')
      : e404
        ? path.join(dist, '404.html')
        : path.join(dist, rota.caminho.slice(1), 'index.html');
  await fs.mkdir(path.dirname(destino), { recursive: true });
  await fs.writeFile(destino, html);
  console.log(`  ${rota.caminho.padEnd(22)} → ${path.relative(dist, destino)}`);
}

// robots.txt e sitemap.xml
let robots = 'User-agent: *\nAllow: /\n';
if (SITE_URL) {
  const hoje = new Date().toISOString().slice(0, 10);
  const urls = ROTAS.map(
    (r) => `  <url><loc>${urlDaRota(r.caminho)}</loc><lastmod>${hoje}</lastmod></url>`,
  ).join('\n');
  await fs.writeFile(
    path.join(dist, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
  );
  robots += `\nSitemap: ${SITE_URL}/sitemap.xml\n`;
  console.log('  sitemap.xml');
} else {
  console.log('  (SITE_URL não definido: sem sitemap.xml e sem URLs absolutas)');
}
await fs.writeFile(path.join(dist, 'robots.txt'), robots);

await fs.rm(ssr, { recursive: true, force: true });
