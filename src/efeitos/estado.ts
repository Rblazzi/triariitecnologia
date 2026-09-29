// Instâncias únicas dos efeitos globais, compartilhadas entre os componentes.
// Só existem no navegador (no build de pré-renderização ficam nulas).

import type Lenis from 'lenis';
import type { Palco } from './particulas';

export const estado: {
  lenis: Lenis | null;
  palco: Palco | null;
  reduzido: boolean;
} = {
  lenis: null,
  palco: null,
  reduzido: false,
};
