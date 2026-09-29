// Entrada usada só no build, para pré-renderizar cada rota em HTML estático.
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import { App } from './App';

export { ROTA_404, ROTAS } from './rotas';

export function renderizar(url: string): string {
  return renderToString(
    <StaticRouter location={url}>
      <App />
    </StaticRouter>,
  );
}
