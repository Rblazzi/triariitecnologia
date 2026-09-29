// Fontes servidas pelo próprio site (sem Google Fonts: nenhum IP de visitante vai
// para terceiros, e a página não depende de outro domínio para carregar).
import '@fontsource-variable/unbounded';
import '@fontsource-variable/geist';
import '@fontsource-variable/geist-mono';
import './style.css';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { App } from './App';
import { iniciarBotoes } from './efeitos/botoes';
import { iniciarCursor } from './efeitos/cursor';
import { estado } from './efeitos/estado';
import { iniciarRolagem } from './efeitos/rolagem';

// Efeitos globais: ligados uma vez, antes do React montar, para as páginas
// já encontrarem a rolagem suave pronta.
estado.reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!estado.reduzido) {
  estado.lenis = iniciarRolagem();
  iniciarBotoes();
  iniciarCursor();
}

const raiz = document.getElementById('raiz')!;
const app = (
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

// No build, cada rota vem pré-renderizada (data-rota): o React só "hidrata" o
// HTML pronto. Em desenvolvimento, ou numa rota sem HTML próprio, renderiza do zero.
const limpo = (c: string) => c.replace(/\/+$/, '') || '/';
if (raiz.dataset.rota && limpo(raiz.dataset.rota) === limpo(window.location.pathname)) {
  hydrateRoot(raiz, app);
} else {
  raiz.replaceChildren();
  createRoot(raiz).render(app);
}
