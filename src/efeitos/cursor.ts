// Aura do cursor: um anel que segue o mouse com atraso e cresce sobre elementos
// clicáveis. O cursor do sistema continua visível; a aura só acompanha.

import { gsap } from 'gsap';

const INTERATIVOS = 'a, button, input, select, textarea, label, .servico';

export function iniciarCursor(): void {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  const aura = document.createElement('div');
  aura.className = 'aura';
  aura.setAttribute('aria-hidden', 'true');
  document.body.append(aura);

  const x = gsap.quickTo(aura, 'x', { duration: 0.45, ease: 'power3.out' });
  const y = gsap.quickTo(aura, 'y', { duration: 0.45, ease: 'power3.out' });

  window.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    aura.classList.add('ativa');
    x(e.clientX);
    y(e.clientY);
    const alvo = (e.target as Element | null)?.closest(INTERATIVOS);
    aura.classList.toggle('sobre', !!alvo);
  });
  document.documentElement.addEventListener('pointerleave', () => aura.classList.remove('ativa'));
  window.addEventListener('pointerdown', () => aura.classList.add('clique'));
  window.addEventListener('pointerup', () => aura.classList.remove('clique'));
}
