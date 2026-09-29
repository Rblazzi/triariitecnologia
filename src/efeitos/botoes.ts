// Botões magnéticos: são puxados pelo cursor quando ele chega perto e soltam
// faíscas ao serem clicados.

import { gsap } from 'gsap';

const RAIO = 70; // distância, além da borda, em que o botão começa a ser puxado

// Roda uma vez para o site inteiro. Os eventos são delegados e os botões são
// procurados a cada movimento, então valem também para os que o React monta
// depois de uma troca de rota.
export function iniciarBotoes(): void {
  const mouseFino = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  document.addEventListener('click', (e) => {
    const b = (e.target as Element | null)?.closest<HTMLElement>('.botao');
    if (b) faiscas(e.clientX, e.clientY, b);
  });
  if (!mouseFino) return;

  interface Estado {
    b: HTMLElement;
    x: (v: number) => void;
    y: (v: number) => void;
    preso: boolean;
  }
  const cache = new WeakMap<HTMLElement, Estado>();
  const estadoDe = (b: HTMLElement): Estado => {
    let s = cache.get(b);
    if (!s) {
      s = {
        b,
        x: gsap.quickTo(b, 'x', { duration: 0.5, ease: 'power3.out' }),
        y: gsap.quickTo(b, 'y', { duration: 0.5, ease: 'power3.out' }),
        preso: false,
      };
      cache.set(b, s);
    }
    return s;
  };

  // No máximo uma medição de layout por quadro, e só dos botões visíveis.
  let ultimo: PointerEvent | null = null;
  let agendado = 0;
  const medir = (): void => {
    agendado = 0;
    const e = ultimo;
    if (!e) return;
    for (const b of document.querySelectorAll<HTMLElement>('.botao')) {
      if (!b.offsetParent) continue; // escondido (display: none)
      const s = estadoDe(b);
      // Posição sem o deslocamento do próprio ímã, para ele não "fugir" do cursor.
      const r = s.b.getBoundingClientRect();
      const tx = Number(gsap.getProperty(s.b, 'x')) || 0;
      const ty = Number(gsap.getProperty(s.b, 'y')) || 0;
      const dx = e.clientX - (r.left - tx + r.width / 2);
      const dy = e.clientY - (r.top - ty + r.height / 2);
      const perto = Math.abs(dx) < r.width / 2 + RAIO && Math.abs(dy) < r.height / 2 + RAIO;
      if (perto) {
        s.preso = true;
        s.x(dx * 0.28);
        s.y(dy * 0.38);
      } else if (s.preso) {
        s.preso = false;
        gsap.to(s.b, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.35)' });
      }
    }
  };
  window.addEventListener(
    'pointermove',
    (e) => {
      ultimo = e;
      if (!agendado) agendado = requestAnimationFrame(medir);
    },
    { passive: true },
  );
}

function faiscas(x: number, y: number, origem: HTMLElement): void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  // Clique pelo teclado não tem posição: usa o centro do botão.
  if (x === 0 && y === 0) {
    const r = origem.getBoundingClientRect();
    x = r.left + r.width / 2;
    y = r.top + r.height / 2;
  }
  const total = 18;
  for (let i = 0; i < total; i++) {
    const f = document.createElement('span');
    f.className = i % 3 === 0 ? 'faisca faisca--ion' : 'faisca';
    document.body.append(f);
    const angulo = (i / total) * Math.PI * 2 + Math.random() * 0.4;
    const distancia = 40 + Math.random() * 60;
    gsap.set(f, { x, y, scale: 0.6 + Math.random() * 0.8 });
    gsap.to(f, {
      x: x + Math.cos(angulo) * distancia,
      y: y + Math.sin(angulo) * distancia,
      scale: 0,
      opacity: 0,
      duration: 0.6 + Math.random() * 0.4,
      ease: 'power3.out',
      onComplete: () => f.remove(),
    });
  }
}
