import { useEffect, useRef } from 'react';
import { Route, Routes, useLocation, useNavigate, useNavigationType } from 'react-router';
import { Abertura } from './componentes/Abertura';
import { LogoTriarii } from './componentes/LogoTriarii';
import { Rodape } from './componentes/Rodape';
import { Topo } from './componentes/Topo';
import { estado } from './efeitos/estado';
import { iniciarRevelacoes } from './efeitos/rolagem';
import { cobrir, descobrir } from './efeitos/transicao';
import { ROTA_404, ROTAS, rotaDe } from './rotas';

const DESLOCAMENTO_TOPO = -72; // altura do topo fixo, para âncoras não ficarem escondidas

function rolarPara(hash: string, imediato: boolean): void {
  const alvo = hash ? document.querySelector<HTMLElement>(hash) : null;
  if (estado.lenis) {
    // Depois de trocar de página a altura muda: a rolagem precisa medir de novo
    // antes, senão fica presa ao limite da página anterior.
    estado.lenis.resize();
    estado.lenis.scrollTo(alvo ?? 0, {
      offset: alvo ? DESLOCAMENTO_TOPO : 0,
      immediate: imediato,
      force: true,
      duration: 1.4,
    });
  } else if (alvo) {
    alvo.scrollIntoView();
  } else {
    window.scrollTo(0, 0);
  }
}

export function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const tipoNavegacao = useNavigationType();
  const cortina = useRef<HTMLDivElement>(null);
  const palco = useRef<HTMLDivElement>(null);
  const cobrindo = useRef(false);
  const primeira = useRef(true);

  // Palco WebGL e distorção dos cartões: carregados à parte, uma vez para o site todo.
  useEffect(() => {
    if (estado.reduzido || !palco.current) return;
    const el = palco.current;
    Promise.all([import('./efeitos/particulas'), import('./efeitos/tinta')]).then(([particulas, tinta]) => {
      if (!particulas.suportaWebGL() || estado.palco) return;
      estado.palco = particulas.iniciarParticulas(el);
      if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        tinta.iniciarTinta('.servico', (grupo) => estado.palco?.destacar(grupo));
      }
    });
  }, []);

  // Links internos: a cortina cobre a tela, a rota troca por baixo e a cortina revela a página nova.
  useEffect(() => {
    const aoClicar = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = (e.target as Element | null)?.closest<HTMLAnchorElement>('a[href]');
      if (!link || link.target === '_blank' || link.hasAttribute('download') || link.classList.contains('skip')) return;
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin || !/^https?:$/.test(url.protocol)) return;

      e.preventDefault();
      const mesmaPagina = rotaDe(url.pathname) === rotaDe(window.location.pathname);
      if (mesmaPagina) {
        rolarPara(url.hash, false);
        if (url.hash) history.replaceState(history.state, '', url.hash);
        return;
      }
      if (cobrindo.current || !cortina.current) return;
      cobrindo.current = true;
      guardarRolagem.current();
      cobrir(cortina.current, url.pathname).then(() => navigate(url.pathname + url.hash));
    };
    document.addEventListener('click', aoClicar);
    return () => document.removeEventListener('click', aoClicar);
  }, [navigate]);

  // Guarda a posição de rolagem de cada entrada do histórico, para o "voltar"
  // do navegador devolver o visitante ao ponto onde estava.
  // Salva antes da troca: no clique (antes da cortina), no voltar/avançar
  // (popstate chega antes do React renderizar a página nova) e ao sair do site.
  const chaveAtual = useRef(location.key);
  chaveAtual.current = location.key;
  const guardarRolagem = useRef(() => {
    try {
      sessionStorage.setItem(`triarii-rolagem-${chaveAtual.current}`, String(Math.round(window.scrollY)));
    } catch {
      /* sem armazenamento: o voltar leva ao topo */
    }
  });
  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    const guardar = guardarRolagem.current;
    window.addEventListener('popstate', guardar);
    window.addEventListener('pagehide', guardar);
    return () => {
      window.removeEventListener('popstate', guardar);
      window.removeEventListener('pagehide', guardar);
    };
  }, []);

  // A cada página: título, rolagem, foco, partículas, revelações e fim da transição.
  useEffect(() => {
    const rota = rotaDe(location.pathname);
    document.title = rota.titulo;
    document.querySelector('meta[name="description"]')?.setAttribute('content', rota.descricao);
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', rota.titulo);
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', rota.descricao);

    const salvo = (() => {
      try {
        return sessionStorage.getItem(`triarii-rolagem-${location.key}`);
      } catch {
        return null;
      }
    })();
    if (tipoNavegacao === 'POP' && salvo !== null && !primeira.current) {
      estado.lenis?.resize();
      if (estado.lenis) estado.lenis.scrollTo(Number(salvo), { immediate: true, force: true });
      else window.scrollTo(0, Number(salvo));
    } else if (!primeira.current || location.hash) {
      rolarPara(location.hash, true);
    }

    // Leitores de tela e teclado: o foco vai para o título da página nova,
    // que é anunciado, em vez de ficar no link clicado (que já não existe).
    if (!primeira.current && !location.hash) {
      const titulo = document.querySelector<HTMLElement>('main h1');
      if (titulo) {
        titulo.setAttribute('tabindex', '-1');
        titulo.focus({ preventScroll: true });
      }
    }

    estado.palco?.recarregar();
    const limpar = estado.reduzido ? () => {} : iniciarRevelacoes();

    if (cobrindo.current && cortina.current) {
      cobrindo.current = false;
      descobrir(cortina.current);
    }
    primeira.current = false;
    return limpar;
  }, [location.pathname, location.key]);

  return (
    <>
      <Abertura />
      <div className="transicao" ref={cortina} aria-hidden="true">
        <div className="transicao__grade" />
        <div className="transicao__centro">
          <LogoTriarii className="transicao__logo" comSubtitulo />
          <p className="transicao__terminal">
            <span className="transicao__prompt">$</span> <span data-comando />
            <span className="transicao__cursor" />
          </p>
          <div className="transicao__barra">
            <span />
          </div>
        </div>
      </div>
      <div className="palco" ref={palco} data-palco aria-hidden="true" />

      <a className="skip" href="#conteudo">
        Pular para o conteúdo
      </a>
      <Topo />
      <Routes>
        {ROTAS.map(({ caminho, Pagina }) => (
          <Route key={caminho} path={caminho} element={<Pagina />} />
        ))}
        <Route path="*" element={<ROTA_404.Pagina />} />
      </Routes>
      <Rodape />
    </>
  );
}
