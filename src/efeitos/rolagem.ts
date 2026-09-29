// Rolagem suave (Lenis) integrada ao GSAP ScrollTrigger, revelações ao rolar
// e o parallax do hero. Os cliques em links são tratados pelo roteador (App.tsx).

import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function iniciarRolagem(): Lenis {
  const lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((tempo) => lenis.raf(tempo * 1000));
  gsap.ticker.lagSmoothing(0);
  return lenis;
}

// Liga as revelações da página atual. Devolve a limpeza, chamada a cada troca de rota.
export function iniciarRevelacoes(): () => void {
  document.documentElement.classList.add('js-revelar');

  const ctx = gsap.context(() => {
    ScrollTrigger.batch('.revelar', {
      start: 'top 88%',
      once: true,
      onEnter: (lote) =>
        lote.forEach((el, i) => gsap.delayedCall(i * 0.09, () => el.classList.add('visivel'))),
    });

    // Títulos de seção entram com um leve deslize.
    gsap.utils.toArray<HTMLElement>('.secao__titulo, .nome__titulo').forEach((titulo) => {
      gsap.from(titulo, {
        y: 40,
        opacity: 0,
        duration: 1,
        ease: 'expo.out',
        scrollTrigger: { trigger: titulo, start: 'top 90%', once: true },
      });
    });

    // O texto do hero sobe mais devagar e esmaece ao sair.
    if (document.querySelector('.hero')) {
      gsap.to('.hero__texto', {
        yPercent: -14,
        opacity: 0.25,
        ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
      });
    }
  });

  return () => ctx.revert();
}
