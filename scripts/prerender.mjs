// Pré-renderiza cada rota do React em HTML estático, depois do build.
// Resultado: dist/index.html, dist/servicos/index.html, ... e dist/404.html,
// cada um com o conteúdo, o título e a descrição da página. Buscadores leem o
// texto sem precisar rodar JavaScript, e o React só "hidrata" o que já está lá.

import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const dist = path.resolve('dist');
const ssr = path.resolve('dist-ssr');
const modelo = await fs.readFile(path.join(dist, 'index.html'), 'utf8');
const { renderizar, ROTAS, ROTA_404 } = await import(pathToFileURL(path.join(ssr, 'entry-server.js')).href);

const escapar = (s) =>
  s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

for (const rota of [...ROTAS, ROTA_404]) {
  const corpo = renderizar(rota.caminho);
  const html = modelo
    .replace('<div id="raiz"></div>', `<div id="raiz" data-rota="${rota.caminho}">${corpo}</div>`)
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapar(rota.titulo)}</title>`)
    .replace(/(<meta\s+name="description"\s+content=")[^"]*(")/, `$1${escapar(rota.descricao)}$2`)
    .replace(/(<meta\s+property="og:title"\s+content=")[^"]*(")/, `$1${escapar(rota.titulo)}$2`);

  const destino =
    rota.caminho === '/'
      ? path.join(dist, 'index.html')
      : rota === ROTA_404
        ? path.join(dist, '404.html')
        : path.join(dist, rota.caminho.slice(1), 'index.html');
  await fs.mkdir(path.dirname(destino), { recursive: true });
  await fs.writeFile(destino, html);
  console.log(`  ${rota.caminho.padEnd(22)} → ${path.relative(dist, destino)}`);
}

await fs.rm(ssr, { recursive: true, force: true });
