// Painel do hero: um deploy em três linhas, como a formação em três linhas que
// deu nome à Triarii. BUILD e TESTES enchem em íon; DEPLOY, a terceira linha,
// entra por último, em bronze, e coloca o sistema no ar. O ciclo se repete.
// Os blocos também sobem perto do cursor.

interface Linha {
  nome: string;
  classe: string;
  status: string; // texto da legenda enquanto esta linha carrega
  avanco: number; // quanto o bloco sobe perto do cursor, em px
}

const LINHAS: Linha[] = [
  { nome: 'Build', classe: 'build', status: 'compilando o build…', avanco: 6 },
  { nome: 'Testes', classe: 'testes', status: 'rodando os testes…', avanco: 9 },
  { nome: 'Deploy', classe: 'deploy', status: 'publicando em produção…', avanco: 16 },
];
const CONCLUIDO = 'no ar · deploy concluído';

// Tempos do ciclo, em segundos.
const CARGA = 1.5; // cada linha enchendo
const INTERVALO = 0.3; // pausa entre uma linha e a próxima
const NO_AR = 3.2; // tudo aceso, antes de recomeçar
const APAGAR = 0.7; // blocos apagando para o próximo ciclo
const CICLO = LINHAS.length * (CARGA + INTERVALO) + NO_AR + APAGAR;

const LARGURA_BLOCO = 14;
const ESPACO = 10;
const RAIO = 140;

interface Bloco {
  el: HTMLElement;
  x: number;
  y: number;
  avanco: number;
}

// Devolve uma função que desliga o painel (usada quando o React desmonta o hero).
export function iniciarFormacao(campo: HTMLElement): () => void {
  const reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const raiz = document.documentElement;
  const status = campo.closest('figure')?.querySelector<HTMLElement>('[data-deploy-status]') ?? null;
  let blocos: Bloco[] = [];
  let colunas = 0;
  let filas: { blocos: HTMLElement[]; pct: HTMLElement; acesos: number }[] = [];

  // Largura disponível para os blocos (descontando as colunas do nome e do percentual).
  const larguraUtil = (): number => {
    const referencia = campo.querySelector<HTMLElement>('.fila__escudos');
    const largura = referencia ? referencia.clientWidth : campo.clientWidth;
    return largura - LARGURA_BLOCO;
  };

  const construir = (quantidade: number): void => {
    campo.replaceChildren();
    filas = LINHAS.map((linha, indiceLinha) => {
      const fila = document.createElement('div');
      fila.className = `fila fila--${linha.classe}`;
      fila.style.setProperty('--linha', String(indiceLinha));

      const nome = document.createElement('span');
      nome.className = 'fila__nome';
      nome.textContent = linha.nome;

      const blocosEl = document.createElement('div');
      blocosEl.className = 'fila__escudos';
      const lista: HTMLElement[] = [];
      for (let i = 0; i < quantidade; i++) {
        const bloco = document.createElement('span');
        bloco.className = 'escudo';
        bloco.style.setProperty('--i', String(i));
        bloco.dataset.avanco = String(linha.avanco);
        blocosEl.append(bloco);
        lista.push(bloco);
      }

      const pct = document.createElement('span');
      pct.className = 'fila__pct';
      pct.textContent = '000%';

      fila.append(nome, blocosEl, pct);
      campo.append(fila);
      return { blocos: lista, pct, acesos: -1 };
    });
  };

  const medir = (): void => {
    const base = campo.getBoundingClientRect();
    blocos = Array.from(campo.querySelectorAll<HTMLElement>('.escudo')).map((el) => {
      const r = el.getBoundingClientRect();
      return {
        el,
        x: r.left - base.left + r.width / 2,
        y: r.top - base.top + r.height / 2,
        avanco: Number(el.dataset.avanco),
      };
    });
  };

  const montar = (): void => {
    if (!campo.children.length) construir(0);
    const novas = Math.max(6, Math.floor((larguraUtil() + ESPACO) / (LARGURA_BLOCO + ESPACO)));
    if (novas !== colunas) {
      colunas = novas;
      construir(colunas);
    }
    medir();
  };

  // Acende os primeiros `fracao` blocos de uma linha e atualiza o percentual.
  const encher = (k: number, fracao: number): void => {
    const fila = filas[k];
    if (!fila) return;
    const pct = `${String(Math.round(fracao * 100)).padStart(3, '0')}%`;
    if (fila.pct.textContent !== pct) {
      fila.pct.textContent = pct;
      fila.pct.classList.toggle('pronto', fracao >= 1);
    }
    const acesos = Math.round(fracao * fila.blocos.length);
    if (acesos === fila.acesos) return;
    fila.acesos = acesos;
    fila.blocos.forEach((b, i) => {
      b.classList.toggle('aceso', i < acesos);
      b.classList.toggle('cabeca', i === acesos - 1 && acesos < fila.blocos.length);
    });
  };

  const escrever = (texto: string): void => {
    if (status && status.textContent !== texto) status.textContent = texto;
  };

  montar();

  let espera: number | undefined;
  const aoRedimensionar = (): void => {
    window.clearTimeout(espera);
    espera = window.setTimeout(() => {
      montar();
      filas.forEach((f) => (f.acesos = -1)); // força redesenhar o estado atual
    }, 150);
  };
  window.addEventListener('resize', aoRedimensionar);

  // Movimento reduzido: o painel fica parado no estado concluído.
  if (reduzido) {
    LINHAS.forEach((_, k) => encher(k, 1));
    escrever(CONCLUIDO);
    return () => {
      window.clearTimeout(espera);
      window.removeEventListener('resize', aoRedimensionar);
    };
  }

  // ---------- Ciclo do deploy ----------
  let visivel = true;
  const observador = new IntersectionObserver(([e]) => (visivel = e.isIntersecting));
  observador.observe(campo);

  let tempo = 0;
  let anterior = performance.now();
  let ciclo = 0;
  const passo = (agora: number): void => {
    ciclo = requestAnimationFrame(passo);
    const delta = Math.min((agora - anterior) / 1000, 0.1);
    anterior = agora;
    // Espera a abertura terminar, e pausa fora da tela ou com a aba escondida.
    if (!visivel || document.hidden || (raiz.classList.contains('tem-abertura') && !raiz.classList.contains('hero-pronto'))) {
      return;
    }
    tempo = (tempo + delta) % CICLO;

    const fimCarga = LINHAS.length * (CARGA + INTERVALO);
    if (tempo < fimCarga) {
      let ativa = 0;
      LINHAS.forEach((_, k) => {
        const inicio = k * (CARGA + INTERVALO);
        const fracao = Math.min(1, Math.max(0, (tempo - inicio) / CARGA));
        if (tempo >= inicio) ativa = k;
        encher(k, fracao);
      });
      escrever(LINHAS[ativa].status);
    } else if (tempo < fimCarga + NO_AR) {
      LINHAS.forEach((_, k) => encher(k, 1));
      escrever(CONCLUIDO);
    } else {
      LINHAS.forEach((_, k) => encher(k, 0)); // o CSS apaga os blocos com transição
    }
  };
  ciclo = requestAnimationFrame(passo);

  // ---------- Cursor ----------
  let alvo: { x: number; y: number } | null = null;
  let quadro = 0;

  const desenhar = (): void => {
    quadro = 0;
    for (const b of blocos) {
      let d = 0;
      if (alvo) {
        const dist = Math.hypot(b.x - alvo.x, b.y - alvo.y);
        d = Math.max(0, 1 - dist / RAIO);
      }
      b.el.style.translate = d > 0 ? `0 ${(-b.avanco * d).toFixed(2)}px` : '';
      b.el.style.setProperty('--d', d > 0 ? d.toFixed(3) : '0');
    }
  };
  const agendar = (): void => {
    if (!quadro) quadro = requestAnimationFrame(desenhar);
  };

  const area = campo.closest('section') ?? campo;
  const aoMover = (ev: Event): void => {
    const evento = ev as PointerEvent;
    const base = campo.getBoundingClientRect();
    alvo = { x: evento.clientX - base.left, y: evento.clientY - base.top };
    agendar();
  };
  const aoSair = (): void => {
    alvo = null;
    agendar();
  };
  area.addEventListener('pointermove', aoMover);
  area.addEventListener('pointerleave', aoSair);

  return () => {
    window.clearTimeout(espera);
    window.removeEventListener('resize', aoRedimensionar);
    observador.disconnect();
    cancelAnimationFrame(ciclo);
    cancelAnimationFrame(quadro);
    area.removeEventListener('pointermove', aoMover);
    area.removeEventListener('pointerleave', aoSair);
  };
}
