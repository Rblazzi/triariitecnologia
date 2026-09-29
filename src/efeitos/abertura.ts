// Abertura do site: a formação acende linha por linha, o contador chega a 100,
// o logo voa até o topo e uma cortina sobe revelando o hero.
// Só roda na primeira visita da sessão, entrando pela home (a decisão é tomada
// no <head>). A tela é markup do React (Abertura.tsx) e some pelo CSS quando a
// classe tem-abertura sai do <html>.

import { gsap } from 'gsap';

const CHAVE = 'triarii-abertura';

// Entrada do hero: palavras sobem e o texto de apoio aparece.
function entradaHero(tl: gsap.core.Timeline, inicio: number): void {
  tl.from(
    '.hero__titulo .palavra > *',
    { yPercent: 115, rotate: 4, duration: 1, ease: 'expo.out', stagger: 0.055 },
    inicio,
  );
  tl.from(
    '.hero__texto .rotulo, .hero__lead, .hero__acoes, .selo',
    { opacity: 0, y: 18, duration: 0.8, ease: 'power3.out', stagger: 0.08 },
    inicio + 0.25,
  );
}

interface Opcoes {
  reduzido: boolean;
  aoTerminar: () => void;
}

export function executarAbertura({ reduzido, aoTerminar }: Opcoes): void {
  const raiz = document.documentElement;
  const tela = document.querySelector<HTMLElement>('.abertura');
  const comAbertura = raiz.classList.contains('tem-abertura') && tela;

  if (reduzido) {
    raiz.classList.add('hero-pronto');
    raiz.classList.remove('tem-abertura');
    aoTerminar();
    return;
  }

  if (!comAbertura) {
    // Visita repetida: só a entrada do hero, sem a tela de abertura.
    raiz.classList.add('hero-pronto');
    const tl = gsap.timeline({ onComplete: aoTerminar });
    entradaHero(tl, 0.1);
    return;
  }

  try {
    sessionStorage.setItem(CHAVE, '1');
  } catch {
    /* navegação privada: a abertura roda de novo, sem problema */
  }
  window.scrollTo(0, 0);

  const logo = tela.querySelector<SVGElement>('.logo__marca')!;
  const contador = tela.querySelector<HTMLElement>('.abertura__contador')!;
  const destino = document.querySelector<SVGElement>('.topo .logo__marca');

  // Deslocamento do logo grande até o ícone do topo.
  const voo = (() => {
    if (!destino) return { x: 0, y: -window.innerHeight, scale: 0.3 };
    const a = logo.getBoundingClientRect();
    const b = destino.getBoundingClientRect();
    return {
      x: b.left + b.width / 2 - (a.left + a.width / 2),
      y: b.top + b.height / 2 - (a.top + a.height / 2),
      scale: b.width / a.width,
    };
  })();

  const progresso = { v: 0 };
  const tl = gsap.timeline({
    onComplete: () => {
      raiz.classList.remove('tem-abertura');
      aoTerminar();
    },
  });

  // Duração da contagem de 000 a 100. O resto da abertura acompanha este valor.
  const CONTAGEM = 2.6;
  const fim = CONTAGEM + 0.25; // pequena pausa no 100 antes do logo voar

  tl.to(
    progresso,
    {
      v: 100,
      duration: CONTAGEM,
      ease: 'power1.inOut',
      onUpdate: () => {
        contador.textContent = String(Math.round(progresso.v)).padStart(3, '0');
      },
    },
    0,
  )
    // As letras de TRIARII sobem uma a uma ao longo da contagem...
    .from(
      '.abertura .logo__grupo',
      { opacity: 0, y: 16, duration: 0.6, ease: 'power3.out', stagger: CONTAGEM * 0.07 },
      CONTAGEM * 0.04,
    )
    // ...a ponta de lança cresce dentro do A (a terceira linha entrando)...
    .from(
      '.abertura .logo__triangulo',
      { scale: 0, transformOrigin: '50% 100%', duration: 0.7, ease: 'back.out(2)' },
      CONTAGEM * 0.62,
    )
    // ...os pingos dos três I caem no lugar, um depois do outro...
    .from(
      '.abertura .logo__pingo',
      { y: -26, opacity: 0, duration: 0.6, ease: 'bounce.out', stagger: 0.12 },
      CONTAGEM * 0.7,
    )
    // ...e TECNOLOGIA aparece entre as linhas bronze.
    .from(
      '.abertura .logo__sub',
      { opacity: 0, letterSpacing: '1.1em', duration: 0.9, ease: 'power3.out' },
      CONTAGEM * 0.66,
    )
    .to('.abertura .logo__sub, .abertura__rodape', { opacity: 0, duration: 0.3 }, fim)
    .to(logo, { ...voo, duration: 0.75, ease: 'expo.inOut' }, fim)
    .add(() => raiz.classList.add('hero-pronto'), fim + 0.55)
    .to(tela, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.75, ease: 'expo.inOut' }, fim + 0.5);

  entradaHero(tl, fim + 0.7);
}
