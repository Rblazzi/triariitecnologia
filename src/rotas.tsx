import type { ComponentType } from 'react';
import { ComoTrabalhamos } from './paginas/ComoTrabalhamos';
import { Inicio } from './paginas/Inicio';
import { NaoEncontrada } from './paginas/NaoEncontrada';
import { Privacidade } from './paginas/Privacidade';
import { QuandoNosChamar } from './paginas/QuandoNosChamar';
import { Servicos } from './paginas/Servicos';
import { Sobre } from './paginas/Sobre';

export interface Rota {
  caminho: string;
  titulo: string;
  descricao: string;
  Pagina: ComponentType;
}

// Cada rota vira uma página pré-renderizada no build (scripts/prerender.mjs).
export const ROTAS: Rota[] = [
  {
    caminho: '/',
    titulo: 'Triarii Tecnologia',
    descricao:
      'Desenvolvimento de sistemas, infraestrutura em nuvem, dados e consultoria técnica para empresas que não podem parar.',
    Pagina: Inicio,
  },
  {
    caminho: '/servicos',
    titulo: 'Serviços — Triarii Tecnologia',
    descricao:
      'Desenvolvimento de sistemas, infraestrutura em nuvem, dados e consultoria técnica. Uma frente só ou todas juntas no mesmo projeto.',
    Pagina: Servicos,
  },
  {
    caminho: '/quando-nos-chamar',
    titulo: 'Quando nos chamar — Triarii Tecnologia',
    descricao:
      'Sistema legado, nuvem cara, dados desencontrados, projeto atrasado: as situações em que a Triarii costuma entrar, e o que fazemos em cada uma.',
    Pagina: QuandoNosChamar,
  },
  {
    caminho: '/como-trabalhamos',
    titulo: 'Como trabalhamos — Triarii Tecnologia',
    descricao:
      'Diagnóstico, plano, entrega em ciclos e sustentação: as quatro etapas de um projeto com a Triarii e o que você recebe em cada uma.',
    Pagina: ComoTrabalhamos,
  },
  {
    caminho: '/sobre',
    titulo: 'Sobre — Triarii Tecnologia',
    descricao:
      'Na legião romana, os triários eram a terceira linha: os veteranos chamados quando a batalha apertava. É esse o papel que a Triarii quer ter no seu projeto.',
    Pagina: Sobre,
  },
  {
    caminho: '/privacidade',
    titulo: 'Política de privacidade — Triarii Tecnologia',
    descricao: 'Como a Triarii Tecnologia trata os dados pessoais enviados pelo site, de acordo com a LGPD.',
    Pagina: Privacidade,
  },
];

export const ROTA_404: Rota = {
  caminho: '/404',
  titulo: 'Página não encontrada — Triarii Tecnologia',
  descricao: 'Esta página não existe.',
  Pagina: NaoEncontrada,
};

export function rotaDe(caminho: string): Rota {
  const limpo = caminho.replace(/\/+$/, '') || '/';
  return ROTAS.find((r) => r.caminho === limpo) ?? ROTA_404;
}
