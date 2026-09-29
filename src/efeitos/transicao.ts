// Transição entre páginas: uma grade de blocos (os mesmos do painel de deploy
// do hero) cobre a tela em onda diagonal. No centro, o logo e uma linha de
// terminal com o destino ("$ cd /servicos"), que se "decodifica", e uma barra
// de progresso. O React troca a rota por baixo e os blocos se apagam em onda,
// revelando a página nova.

import { gsap } from 'gsap';

const reduzido = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const SIMBOLOS = '!<>-_\\/[]{}=+*^?#01';

// Monta (ou remonta, se o tamanho da tela mudou) a grade de blocos.
function grade(cortina: HTMLElement): { blocos: HTMLElement[]; linhas: number; colunas: number } {
  const campo = cortina.querySelector<HTMLElement>('.transicao__grade')!;
  const tamanho = Math.max(56, window.innerWidth / 32);
  const colunas = Math.ceil(window.innerWidth / tamanho);
  const linhas = Math.ceil(window.innerHeight / tamanho);
  if (campo.dataset.tamanho !== `${colunas}x${linhas}`) {
    campo.dataset.tamanho = `${colunas}x${linhas}`;
    campo.style.setProperty('--colunas', String(colunas));
    campo.style.setProperty('--linhas', String(linhas));
    campo.replaceChildren(
      ...Array.from({ length: colunas * linhas }, () => {
        const b = document.createElement('span');
        b.className = 'transicao__bloco';
        return b;
      }),
    );
  }
  return { blocos: Array.from(campo.children) as HTMLElement[], linhas, colunas };
}

// Texto que embaralha e vai se fixando da esquerda para a direita.
function decodificar(el: HTMLElement, texto: string, duracao: number): void {
  const estado = { p: 0 };
  gsap.to(estado, {
    p: 1,
    duration: duracao,
    ease: 'none',
    onUpdate: () => {
      const fixos = Math.floor(estado.p * texto.length);
      el.textContent = Array.from(texto, (c, i) =>
        i < fixos || c === ' ' ? c : SIMBOLOS[Math.floor(Math.random() * SIMBOLOS.length)],
      ).join('');
    },
    onComplete: () => {
      el.textContent = texto;
    },
  });
}

export function cobrir(cortina: HTMLElement, destino: string): Promise<void> {
  return new Promise((resolver) => {
    if (reduzido()) {
      resolver();
      return;
    }
    const { blocos, linhas, colunas } = grade(cortina);
    const comando = cortina.querySelector<HTMLElement>('[data-comando]')!;
    const barra = cortina.querySelector<HTMLElement>('.transicao__barra > span')!;
    const centro = cortina.querySelector<HTMLElement>('.transicao__centro')!;

    // Alguns blocos piscam acesos durante a cobertura, como uma matriz de LEDs.
    blocos.forEach((b) => {
      const s = Math.random();
      b.classList.toggle('aceso', s < 0.05);
      b.classList.toggle('aceso--bronze', s >= 0.05 && s < 0.07);
    });

    gsap.killTweensOf([...blocos, centro, barra]);
    cortina.classList.add('ativa');
    comando.textContent = '';

    const tl = gsap.timeline({ onComplete: () => resolver() });
    tl.fromTo(
      blocos,
      { scale: 0, opacity: 0 },
      {
        scale: 1.02,
        opacity: 1,
        duration: 0.32,
        ease: 'power2.out',
        stagger: { grid: [linhas, colunas], from: 'start', amount: 0.42 },
      },
      0,
    )
      .fromTo(centro, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }, 0.3)
      .add(() => decodificar(comando, `cd ${destino === '/' ? '~' : destino}`, 0.35), 0.32)
      .fromTo(barra, { scaleX: 0 }, { scaleX: 0.7, duration: 0.5, ease: 'power2.out' }, 0.3);
  });
}

export function descobrir(cortina: HTMLElement): void {
  if (reduzido()) {
    cortina.classList.remove('ativa');
    return;
  }
  const { blocos, linhas, colunas } = grade(cortina);
  const barra = cortina.querySelector<HTMLElement>('.transicao__barra > span')!;
  const centro = cortina.querySelector<HTMLElement>('.transicao__centro')!;

  const tl = gsap.timeline({ onComplete: () => cortina.classList.remove('ativa') });
  tl.to(barra, { scaleX: 1, duration: 0.18, ease: 'power2.in' }, 0)
    .to(centro, { opacity: 0, y: -8, duration: 0.2, ease: 'power2.in' }, 0.18)
    .to(
      blocos,
      {
        scale: 0,
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in',
        stagger: { grid: [linhas, colunas], from: 'start', amount: 0.42 },
      },
      0.22,
    );
}
