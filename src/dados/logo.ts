// Geometria do logo TRIARII, redesenhado em vetor a partir da arte original
// (public/image.png), medindo letra por letra. Usada pelo componente
// <LogoTriarii> e pelas partículas, que amostram estas mesmas formas.
//
// Unidades = pixels da arte original: letras de y = 7 a y = 63 (linha de base),
// com a ponta do A subindo até y = 4. Traço das hastes: 13. Os "R" são
// desenhados com traço (stroke) e cortados na linha de base; o resto é preenchido.

export const TRACO = 13;
export const BASE = 63;
export const CAIXA_MARCA = { x: 0, y: 4, largura: 386, altura: 59 };

export interface Parte {
  d: string;
  tipo: 'preenchido' | 'traco';
  cor: 'prata' | 'bronze';
  classe: string;
}

// Um R: haste, bojo (arco) e perna diagonal, deslocado em x.
const r = (x: number): Parte[] => [
  { d: `M${x} 7H${x + 13}V63H${x}Z`, tipo: 'preenchido', cor: 'prata', classe: 'logo__letra' },
  {
    d: `M${x + 6.5} 13.5H${x + 40}A10.5 10.5 0 0 1 ${x + 40} 34.5H${x + 6.5}`,
    tipo: 'traco',
    cor: 'prata',
    classe: 'logo__letra',
  },
  { d: `M${x + 31} 36L${x + 59.7} 67`, tipo: 'traco', cor: 'prata', classe: 'logo__letra' },
];

// Um I: haste com o topo inclinado e o pingo inclinado em bronze, deslocado em x.
const i = (x: number): Parte[] => [
  { d: `M${x} 18L${x + 13} 20.5V63H${x}Z`, tipo: 'preenchido', cor: 'prata', classe: 'logo__letra' },
  { d: `M${x} 7H${x + 13}V17.5L${x} 15Z`, tipo: 'preenchido', cor: 'bronze', classe: 'logo__pingo' },
];

// Cada letra é um grupo, na ordem em que aparece (a abertura anima nessa ordem).
export const LETRAS: Parte[][] = [
  // T
  [{ d: 'M0 7H61V18H37V63H24V18H0Z', tipo: 'preenchido', cor: 'prata', classe: 'logo__letra' }],
  // R
  r(75),
  // I
  i(152),
  // A sem barra, com a ponta de lança em bronze: a terceira linha, pronta para entrar.
  [
    { d: 'M179 63L214 4L249 63H235L214 27.6L193 63Z', tipo: 'preenchido', cor: 'prata', classe: 'logo__letra' },
    { d: 'M204.5 63L214 45L223.5 63Z', tipo: 'preenchido', cor: 'bronze', classe: 'logo__triangulo' },
  ],
  // R
  r(259),
  // I
  i(341),
  // I final
  i(373),
];

// O símbolo: só o A com a ponta de lança. Serve de ícone (aba do navegador,
// cortina, selo) e de forma para as partículas.
export const SIMBOLO = LETRAS[3];
export const CAIXA_SIMBOLO = { x: 177, y: 2, largura: 74, altura: 63 };

export const CORES = {
  prata: ['#f0f0f1', '#c9cacd', '#8f9196'],
  bronze: ['#e3a758', '#a96f2d'],
};
