import { CONTATO } from '../dados/conteudo';
import { LogoTriarii } from './LogoTriarii';

export function Rodape() {
  return (
    <footer className="rodape">
      <div className="rodape__linha">
        <LogoTriarii comSubtitulo />
        <span>
          © <span suppressHydrationWarning>{new Date().getFullYear()}</span> Triarii Tecnologia
        </span>
        <nav className="rodape__links" aria-label="Rodapé">
          <a href={`mailto:${CONTATO.email}`}>{CONTATO.email}</a>
          <a href="/privacidade">Privacidade</a>
        </nav>
      </div>
      {/* Área onde as partículas formam a palavra TRIARII. Sem WebGL, aparece o texto vazado. */}
      <div className="rodape__palco" data-rodape-palco>
        <span className="rodape__gigante" aria-hidden="true">
          Triarii
        </span>
      </div>
    </footer>
  );
}
