import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router';
import { NAVEGACAO } from '../dados/conteudo';
import { estado } from '../efeitos/estado';
import { LogoTriarii } from './LogoTriarii';

// Os links são <a> comuns: o App intercepta os cliques para tocar a transição
// antes de trocar a rota.
export function Topo() {
  const { pathname } = useLocation();
  const [aberto, setAberto] = useState(false);
  const botaoMenu = useRef<HTMLButtonElement>(null);
  const nav = useRef<HTMLElement>(null);

  // Fecha o menu ao trocar de página.
  useEffect(() => setAberto(false), [pathname]);

  const parouRolagem = useRef(false);
  useEffect(() => {
    document.documentElement.classList.toggle('menu-aberto', aberto);
    // Com o menu aberto, o conteúdo por trás não recebe foco, clique nem rolagem.
    document.querySelectorAll('main, .rodape').forEach((el) => el.toggleAttribute('inert', aberto));
    if (aberto) {
      estado.lenis?.stop();
      parouRolagem.current = true;
    } else if (parouRolagem.current) {
      estado.lenis?.start(); // só religa a rolagem que o próprio menu desligou
      parouRolagem.current = false;
    }
    if (aberto) nav.current?.querySelector<HTMLElement>('a')?.focus();
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && aberto) {
        setAberto(false);
        botaoMenu.current?.focus();
      }
    };
    document.addEventListener('keydown', aoTeclar);
    return () => document.removeEventListener('keydown', aoTeclar);
  }, [aberto]);

  const atual = (href: string) => (pathname.replace(/\/$/, '') === href ? 'page' : undefined);

  return (
    <header className="topo">
      <a className="marca" href="/" aria-label="Triarii Tecnologia, início">
        <LogoTriarii />
      </a>
      <button
        ref={botaoMenu}
        className="topo__menu"
        type="button"
        aria-expanded={aberto}
        aria-controls="nav-principal"
        onClick={() => setAberto((a) => !a)}
      >
        {aberto ? 'Fechar' : 'Menu'}
      </button>
      <nav ref={nav} className="topo__nav" id="nav-principal" aria-label="Principal">
        {NAVEGACAO.map((item) => (
          <a key={item.href} href={item.href} aria-current={atual(item.href)}>
            {item.rotulo}
          </a>
        ))}
        {/* Em telas muito estreitas, o botão de orçamento aparece aqui dentro do menu. */}
        <a className="botao topo__nav-cta" href="/#contato">
          Pedir orçamento
        </a>
      </nav>
      <a className="botao botao--pequeno" href="/#contato">
        Pedir orçamento
      </a>
    </header>
  );
}
