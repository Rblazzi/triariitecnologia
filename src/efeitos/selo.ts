// Selo circular do hero. Gira devagar e acelera conforme a velocidade da rolagem.

import { gsap } from 'gsap';
import type Lenis from 'lenis';

// Devolve uma função que para o giro (usada quando o React desmonta o hero).
export function iniciarSelo(selo: HTMLElement, lenis: Lenis | null): () => void {
  const texto = selo.querySelector<SVGElement>('.selo__texto');
  if (!texto) return () => {};

  let angulo = 0;
  let velocidade = 0;
  const girar = (_t: number, delta: number): void => {
    const alvo = 0.12 + Math.min(Math.abs(lenis?.velocity ?? 0) * 0.08, 2.5);
    velocidade += (alvo - velocidade) * 0.08;
    angulo = (angulo + velocidade * (delta / 16.67)) % 360;
    texto.style.transform = `rotate(${angulo.toFixed(2)}deg)`;
  };
  gsap.ticker.add(girar);
  return () => gsap.ticker.remove(girar);
}
