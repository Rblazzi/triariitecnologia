import { LogoTriarii } from './LogoTriarii';

// Tela da abertura. Só aparece quando o <head> marca o <html> com tem-abertura;
// a animação fica em efeitos/abertura.ts.
export function Abertura() {
  return (
    <div className="abertura" aria-hidden="true">
      <div className="abertura__centro">
        <LogoTriarii className="abertura__logo" comSubtitulo />
      </div>
      <div className="abertura__rodape">
        <span className="abertura__frase">Res ad triarios rediit</span>
        <span className="abertura__contador">000</span>
      </div>
    </div>
  );
}
