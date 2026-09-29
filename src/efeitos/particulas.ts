// Palco WebGL único do site. As mesmas partículas mudam de forma conforme a
// rolagem. Cada seção declara sua forma com data-forma="...":
//   formacao → a formação em perspectiva (horizonte dos triários em bronze)
//   nucleos  → um ícone por serviço (</>, rack de servidores, banco de dados,
//              rede de nós), cada um preso ao seu cartão na home
//   caos     → o problema antes de alguém organizar
//   linha    → um pipeline de CI/CD com um estágio por etapa, que acende
//              em bronze conforme a rolagem
//   circuito → um chip de processador com trilhas de circuito
//   logo     → o símbolo do logo, o A com a ponta de lança
//              (data-forma-lado="direita" para o lado direito)
// No fim da página, sempre: a palavra TRIARII do logo, no rodapé.

import { criarRobo } from './robo';
import {
  BASE,
  CAIXA_MARCA,
  CAIXA_SIMBOLO,
  LETRAS,
  SIMBOLO,
  TRACO,
  type Parte,
} from '../dados/logo';
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three';

type RGB = [number, number, number];
const rgb = (hex: string): RGB => {
  const n = parseInt(hex.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};
const ION = rgb('#2fe3e0');
const BRONZE = rgb('#d99c4c'); // as cores do logo
const PRATA = rgb('#d8d9dc');
const NEUTRO = rgb('#4a5a8c');

const FOV = 50;
const DISTANCIA = 10;

interface Layout {
  meiaL: number; // metade da largura visível no plano z = 0
  meiaA: number; // metade da altura visível no plano z = 0
  estreito: boolean;
  rodapeY: number;
  rodapeA: number;
}

interface Forma {
  pos: Float32Array;
  cor: Float32Array;
  onda: number;
  tamanho: number;
  // Formas presas ao conteúdo: rolam junto com a página, acompanhando a borda
  // de um elemento (mais um deslocamento em px), em vez de ficarem fixas na tela.
  ancora?: { el: HTMLElement; borda: 'topo' | 'base' | 'centro'; px: number; z: number };
  attrPos?: BufferAttribute;
  attrCor?: BufferAttribute;
}

// Gerador determinístico: a mesma forma sai igual a cada redimensionamento.
function aleatorio(semente: number): () => number {
  return () => {
    semente = (semente + 0x6d2b79f5) | 0;
    let t = Math.imul(semente ^ (semente >>> 15), 1 | semente);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const limitar = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const suave = (a: number, b: number, v: number) => {
  const t = limitar((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};

function nova(N: number, onda: number, tamanho: number): Forma {
  return { pos: new Float32Array(N * 3), cor: new Float32Array(N * 3), onda, tamanho };
}
function ponto(f: Forma, i: number, x: number, y: number, z: number, c: RGB, brilho: number): void {
  f.pos[i * 3] = x;
  f.pos[i * 3 + 1] = y;
  f.pos[i * 3 + 2] = z;
  f.cor[i * 3] = c[0] * brilho;
  f.cor[i * 3 + 1] = c[1] * brilho;
  f.cor[i * 3 + 2] = c[2] * brilho;
}
function girar(x: number, y: number, z: number, rx: number, ry: number): [number, number, number] {
  const y1 = y * Math.cos(rx) - z * Math.sin(rx);
  const z1 = y * Math.sin(rx) + z * Math.cos(rx);
  const x2 = x * Math.cos(ry) + z1 * Math.sin(ry);
  const z2 = -x * Math.sin(ry) + z1 * Math.cos(ry);
  return [x2, y1, z2];
}
// ---------- Formas ----------

function formacao(N: number): Forma {
  const f = nova(N, 0.14, 1);
  const colunas = Math.round(Math.sqrt(N * 2.6));
  const fileiras = Math.ceil(N / colunas);
  const largura = 34;
  const profundidade = 30;
  const passo = largura / (colunas - 1);
  for (let i = 0; i < N; i++) {
    const c = i % colunas;
    const r = Math.floor(i / colunas);
    const x = c * passo - largura / 2 + (r % 2 ? passo / 2 : 0);
    const z = 4 - (r / fileiras) * profundidade;
    const t = r / fileiras;
    const borda = limitar((1 - Math.abs(x) / (largura / 2)) / 0.45);
    const [cor, brilho] = t < 0.45 ? [ION, 0.42] : t < 0.82 ? [ION, 0.62] : [BRONZE, 0.95];
    ponto(f, i, x, -2.3, z, cor, brilho * borda);
  }
  return f;
}

// Ícones dos serviços, desenhados numa caixa de 100 × 100. Traços em íon;
// o que é pintado com BRONZE_2D vira partícula bronze (o detalhe da marca).
const ION_2D = '#ffffff';
const BRONZE_2D = '#ff0000';
const FORTE_2D = '#00ff00'; // íon mais brilhante, para o que precisa se destacar
type Desenho = (ctx: CanvasRenderingContext2D) => void;

const traco = (ctx: CanvasRenderingContext2D, cor: string, largura: number, d: string): void => {
  ctx.strokeStyle = cor;
  ctx.lineWidth = largura;
  ctx.stroke(new Path2D(d));
};
const bolinha = (ctx: CanvasRenderingContext2D, cor: string, x: number, y: number, raio: number): void => {
  ctx.fillStyle = cor;
  ctx.beginPath();
  ctx.arc(x, y, raio, 0, Math.PI * 2);
  ctx.fill();
};

const ICONES: Desenho[] = [
  // Desenvolvimento: </>, com a barra em bronze.
  (ctx) => {
    traco(ctx, ION_2D, 7, 'M31 27L10 50L31 73M69 27L90 50L69 73');
    traco(ctx, BRONZE_2D, 7, 'M58 16L42 84');
  },
  // Infraestrutura: um rack de servidores, com os LEDs em bronze.
  (ctx) => {
    for (const y of [12, 39, 66]) {
      ctx.strokeStyle = ION_2D;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.roundRect(12, y, 76, 22, 5);
      ctx.stroke();
      bolinha(ctx, BRONZE_2D, 25, y + 11, 3.6);
      bolinha(ctx, BRONZE_2D, 36, y + 11, 3.6);
      traco(ctx, ION_2D, 3.5, `M56 ${y + 11}H78`);
    }
  },
  // Dados: o cilindro do banco de dados, com o topo em bronze.
  (ctx) => {
    ctx.lineWidth = 5;
    ctx.strokeStyle = BRONZE_2D;
    ctx.beginPath();
    ctx.ellipse(50, 20, 34, 10, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = ION_2D;
    for (const y of [40, 60, 80]) {
      ctx.beginPath();
      ctx.ellipse(50, y, 34, 10, 0, 0, Math.PI);
      ctx.stroke();
    }
    traco(ctx, ION_2D, 5, 'M16 20V80M84 20V80');
  },
  // Consultoria: uma rede de nós conectados (a arquitetura), com o nó central em bronze.
  (ctx) => {
    const nos = Array.from({ length: 6 }, (_, i) => {
      const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
      return [50 + Math.cos(a) * 37, 50 + Math.sin(a) * 37] as const;
    });
    ctx.strokeStyle = ION_2D;
    ctx.lineWidth = 2.6;
    nos.forEach(([x, y], i) => {
      const [x2, y2] = nos[(i + 1) % nos.length];
      ctx.beginPath();
      ctx.moveTo(50, 50);
      ctx.lineTo(x, y);
      ctx.moveTo(x, y);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    });
    nos.forEach(([x, y]) => bolinha(ctx, ION_2D, x, y, 6));
    bolinha(ctx, BRONZE_2D, 50, 50, 10);
  },
];

let amostrasIcones: Amostra[] = [];
const amostrarIcone = (desenho: Desenho): Amostra => amostrarDesenho(desenho, 100, 100, 3);

// Desenha num canvas 2D (caixa largura × altura) e lê os pixels como partículas.
function amostrarDesenho(desenho: Desenho, largura: number, altura: number, escala: number): Amostra {
  const c = document.createElement('canvas');
  c.width = Math.ceil(largura * escala);
  c.height = Math.ceil(altura * escala);
  const ctx = c.getContext('2d');
  if (!ctx) return { pontos: [], proporcao: altura / largura };
  ctx.scale(escala, escala);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  desenho(ctx);
  const dados = ctx.getImageData(0, 0, c.width, c.height).data;
  const pontos: Amostra['pontos'] = [];
  for (let y = 0; y < c.height; y += 2) {
    for (let x = 0; x < c.width; x += 2) {
      const k = (y * c.width + x) * 4;
      if (dados[k + 3] > 128) {
        pontos.push({
          u: x / c.width,
          v: y / c.height,
          bronze: dados[k + 1] < 100,
          forte: dados[k] < 100, // pintado com FORTE_2D (verde puro)
        });
      }
    }
  }
  return { pontos, proporcao: altura / largura };
}

function nucleos(N: number, L: Layout, lado?: string, el?: HTMLElement): Forma {
  const f = nova(N, 0.05, 0.95);
  const r = aleatorio(11);
  const n = Math.ceil(N / 4);
  const direita = lado === 'direita' && !L.estreito;

  // Página Serviços: os quatro ícones agrupados à direita do título.
  const cx = Math.max(L.meiaL * 0.48, 1.6);
  const cy = L.meiaA * (direita ? 0.3 : 0.42);
  let R = direita ? Math.min(L.meiaA * 0.22, L.meiaL * 0.14, 1.4) : Math.min(L.meiaA * 0.3, L.meiaL * 0.32, 1.8);
  const [xa, xb] = direita ? [L.meiaL * 0.3, L.meiaL * 0.74] : [-cx, cx];
  // Mesma ordem dos cartões na grade: dev, infra, dados, consultoria.
  let centros: [number, number][] = [
    [xa, cy],
    [xb, cy],
    [xa, -cy],
    [xb, -cy],
  ];

  // Home (e celular): cada ícone fica preso ao seu cartão, no canto superior
  // direito (na altura do título, onde sobra espaço), e rola junto com a página
  // em vez de passar por cima dos textos.
  const z = -2;
  const grade = direita ? null : el?.querySelector<HTMLElement>('.servicos__grade');
  const cartoes = grade ? Array.from(grade.querySelectorAll<HTMLElement>('.servico')).slice(0, 4) : [];
  if (grade && cartoes.length === 4) {
    const g = grade.getBoundingClientRect();
    const mundoPorPx = (2 * L.meiaA * ((DISTANCIA - z) / DISTANCIA)) / window.innerHeight;
    const [fx, fy] = L.estreito ? [0.8, 0.12] : [0.82, 0.22];
    centros = cartoes.map((c) => {
      const rc = c.getBoundingClientRect();
      return [
        (rc.left + rc.width * fx - window.innerWidth / 2) * mundoPorPx,
        -(rc.top + rc.height * fy - (g.top + g.height / 2)) * mundoPorPx,
      ];
    });
    const primeiro = cartoes[0].getBoundingClientRect();
    R = (L.estreito ? Math.min(primeiro.width * 0.09, primeiro.height * 0.07) : Math.min(primeiro.width * 0.11, primeiro.height * 0.15)) * mundoPorPx;
    f.ancora = { el: grade, borda: 'centro', px: 0, z };
  }

  if (amostrasIcones.length !== ICONES.length) amostrasIcones = ICONES.map(amostrarIcone);

  for (let i = 0; i < N; i++) {
    const g = Math.min(3, Math.floor(i / n));
    const amostra = amostrasIcones[g];
    const p = amostra.pontos[Math.floor(r() * amostra.pontos.length)];
    // Ícone levemente inclinado, com um pouco de profundidade, para não parecer chapado.
    const [x, y, zz] = girar(
      (p.u - 0.5) * 2 * R,
      -(p.v - 0.5) * 2 * R,
      (r() - 0.5) * R * 0.16,
      0.12,
      g % 2 ? -0.28 : 0.28,
    );
    const [x0, y0] = centros[g];
    ponto(f, i, x0 + x, y0 + y, z + zz, p.bronze ? BRONZE : ION, p.bronze ? 1 : 0.7 + r() * 0.3);
  }
  return f;
}

function caos(N: number, L: Layout): Forma {
  const f = nova(N, 0.55, 0.8);
  const r = aleatorio(23);
  for (let i = 0; i < N; i++) {
    const faisca = r() < 0.06;
    ponto(
      f,
      i,
      (r() * 2 - 1) * L.meiaL * 1.25,
      (r() * 2 - 1) * L.meiaA * 1.15,
      -8 + r() * 10,
      faisca ? BRONZE : NEUTRO,
      faisca ? 0.8 : 0.3 + r() * 0.3,
    );
  }
  return f;
}

// Pipeline de CI/CD (caixa 1000 × 90): quatro estágios, um por etapa do
// processo, ligados por um barramento de dados com pacotes em bronze.
// Os estágios ficam em 1/8, 3/8, 5/8 e 7/8 da largura, como as colunas das etapas.
const desenharPipeline: Desenho = (ctx) => {
  const cy = 45;
  const lado = 56;
  const centros = [125, 375, 625, 875];
  // Barramento: linha principal e duas tracejadas, só entre os estágios.
  const trechos = [[0, 97], [153, 347], [403, 597], [653, 847], [903, 1000]];
  for (const [a, b] of trechos) {
    traco(ctx, ION_2D, 3, `M${a} ${cy}H${b}`);
    ctx.setLineDash([10, 9]);
    traco(ctx, ION_2D, 1.6, `M${a} ${cy - 17}H${b}M${a} ${cy + 17}H${b}`);
    ctx.setLineDash([]);
    // Pacotes de dados passando no barramento.
    for (const t of [0.3, 0.68]) {
      ctx.fillStyle = BRONZE_2D;
      ctx.fillRect(a + (b - a) * t - 4, cy - 4, 8, 8);
    }
  }
  centros.forEach((cx, k) => {
    // Estágio: um bloco; o último (sustentação) em bronze, como no resto do site.
    ctx.strokeStyle = k === 3 ? BRONZE_2D : ION_2D;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(cx - lado / 2, cy - lado / 2, lado, lado, 9);
    ctx.stroke();
    if (k === 0) {
      // Diagnóstico: lupa
      ctx.lineWidth = 3.4;
      ctx.strokeStyle = ION_2D;
      ctx.beginPath();
      ctx.arc(cx - 4, cy - 4, 10, 0, Math.PI * 2);
      ctx.stroke();
      traco(ctx, ION_2D, 3.4, `M${cx + 3.5} ${cy + 3.5}L${cx + 13} ${cy + 13}`);
    } else if (k === 1) {
      // Plano: checklist
      for (const dy of [-12, 0, 12]) {
        ctx.fillStyle = ION_2D;
        ctx.fillRect(cx - 16, cy + dy - 2.5, 5, 5);
        traco(ctx, ION_2D, 3, `M${cx - 6} ${cy + dy}H${cx + 15}`);
      }
    } else if (k === 2) {
      // Entrega em ciclos: setas em ciclo
      ctx.lineWidth = 3.4;
      ctx.strokeStyle = ION_2D;
      ctx.beginPath();
      ctx.arc(cx, cy, 13, Math.PI * 0.15, Math.PI * 1.75);
      ctx.stroke();
      const a = Math.PI * 1.75;
      const [px, py] = [cx + Math.cos(a) * 13, cy + Math.sin(a) * 13];
      traco(ctx, ION_2D, 3.4, `M${px - 8} ${py - 1}L${px} ${py}L${px + 1} ${py + 8}`);
    } else {
      // Sustentação: linha de monitoramento
      traco(ctx, ION_2D, 3.2, `M${cx - 18} ${cy}H${cx - 9}L${cx - 4} ${cy - 13}L${cx + 3} ${cy + 13}L${cx + 8} ${cy - 5}L${cx + 11} ${cy}H${cx + 18}`);
    }
  });
};

let amostraPipeline: Amostra | null = null;

// O processo como pipeline de CI/CD. Desenhado em y = 0 e depois preso ao
// conteúdo (veja `ancora` em gerar): lado="meio" fica no vão entre o texto de
// abertura e as etapas; sem lado, fica logo abaixo das etapas (home).
function linha(N: number, L: Layout, lado?: string, el?: HTMLElement): Forma {
  const f = nova(N, 0.03, 0.9);
  const r = aleatorio(37);
  const apagar = lado === 'meio' ? 0.8 : 1;
  const z = -1;
  amostraPipeline ??= amostrarDesenho(desenharPipeline, 1000, 90, 2);
  const amostra = amostraPipeline;
  // Mesma largura da grade de etapas, para cada estágio cair sobre a sua coluna.
  const mundoPorPx = (2 * L.meiaA * ((DISTANCIA - z) / DISTANCIA)) / window.innerHeight;
  const etapas = el?.querySelector<HTMLElement>('.processo__etapas');
  const largura = etapas ? etapas.getBoundingClientRect().width * mundoPorPx : L.meiaL * 1.7;
  const altura = largura * amostra.proporcao;
  for (let i = 0; i < N; i++) {
    const p = amostra.pontos[Math.floor(r() * amostra.pontos.length)];
    ponto(
      f,
      i,
      (p.u - 0.5) * largura,
      -(p.v - 0.5) * altura,
      z + (r() - 0.5) * 0.1,
      p.bronze ? BRONZE : ION,
      (p.bronze ? 0.95 : 0.5 + r() * 0.2) * apagar,
    );
  }
  return f;
}

// Chip de processador com trilhas de circuito (caixa 1000 × 400): o núcleo em
// bronze, pinos nos quatro lados e trilhas que saem em ângulo até terminais.
const desenharCircuito: Desenho = (ctx) => {
  const r = aleatorio(91);
  const cx = 500;
  const cy = 200;
  const meio = 75;
  const pinos = 7;
  const passo = (meio * 2) / (pinos + 1);

  ctx.strokeStyle = ION_2D;
  ctx.lineWidth = 3;
  for (let i = 1; i <= pinos; i++) {
    const o = -meio + i * passo;
    const s = Math.sign(o) || 1;
    for (const lado of [-1, 1]) {
      // Laterais: trilhas longas na horizontal, que espalham o circuito pela largura.
      const x0 = cx + lado * meio;
      const x1 = x0 + lado * (22 + r() * 60);
      const d = 14 + r() * 26;
      const y2 = cy + o + s * d;
      const x2 = x1 + lado * d;
      const x3 = cx + lado * (230 + r() * 250);
      traco(ctx, ION_2D, 3, `M${x0} ${cy + o}H${x1}L${x2} ${y2}H${x3}`);
      bolinha(ctx, ION_2D, x3, y2, 5.5);

      // Topo e base: trilhas curtas na vertical que viram para os lados.
      const y0 = cy + lado * meio;
      const y1 = y0 + lado * (16 + r() * 34);
      const e = 12 + r() * 20;
      const yv = y1 + lado * e;
      const xv = cx + o + s * e;
      const xf = xv + s * (30 + r() * 140);
      traco(ctx, ION_2D, 3, `M${cx + o} ${y0}V${y1}L${xv} ${yv}H${xf}`);
      bolinha(ctx, ION_2D, xf, yv, 5.5);
    }
  }
  // O chip e o núcleo.
  ctx.fillStyle = '#000';
  ctx.globalCompositeOperation = 'destination-out';
  ctx.fillRect(cx - meio, cy - meio, meio * 2, meio * 2);
  ctx.globalCompositeOperation = 'source-over';
  ctx.strokeStyle = FORTE_2D;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.roundRect(cx - meio, cy - meio, meio * 2, meio * 2, 12);
  ctx.stroke();
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(cx - 46, cy - 46, 92, 92, 6);
  ctx.stroke();
  ctx.fillStyle = BRONZE_2D;
  ctx.fillRect(cx - 32, cy - 32, 64, 64);
  bolinha(ctx, FORTE_2D, cx - meio + 17, cy - meio + 17, 5);
};

let amostraCircuito: Amostra | null = null;

// Discreto: fica atrás do texto ("Por que Triarii", "Como a gente entra", Sobre).
function circuito(N: number, L: Layout): Forma {
  const f = nova(N, 0.03, 0.9);
  const r = aleatorio(41);
  amostraCircuito ??= amostrarDesenho(desenharCircuito, 1000, 400, 2);
  const amostra = amostraCircuito;
  const largura = Math.min(L.meiaL * 2.4, 22);
  const altura = largura * amostra.proporcao;
  for (let i = 0; i < N; i++) {
    const p = amostra.pontos[Math.floor(r() * amostra.pontos.length)];
    ponto(
      f,
      i,
      (p.u - 0.5) * largura,
      -(p.v - 0.5) * altura,
      -9 + (r() - 0.5) * 0.2,
      p.bronze ? BRONZE : ION,
      p.bronze ? 0.4 : p.forte ? 0.55 : 0.22 + r() * 0.12,
    );
  }
  return f;
}

// Amostra de pontos de uma forma do logo: coordenadas normalizadas (0 a 1)
// dentro da caixa e se o ponto é bronze ou prata.
interface Amostra {
  pontos: { u: number; v: number; bronze: boolean; forte?: boolean }[];
  proporcao: number; // altura / largura
}

// Desenha as partes do logo (src/dados/logo.ts) num canvas 2D e lê os pixels:
// prata em branco, bronze em vermelho puro, para separar as cores na leitura.
function amostrar(partes: Parte[], caixa: { x: number; y: number; largura: number; altura: number }, escala: number): Amostra {
  const c = document.createElement('canvas');
  c.width = Math.ceil(caixa.largura * escala);
  c.height = Math.ceil(caixa.altura * escala);
  const ctx = c.getContext('2d');
  if (!ctx) return { pontos: [], proporcao: caixa.altura / caixa.largura };
  ctx.scale(escala, escala);
  ctx.translate(-caixa.x, -caixa.y);
  ctx.save();
  ctx.beginPath();
  ctx.rect(caixa.x - 10, caixa.y - 10, caixa.largura + 20, BASE - caixa.y + 10);
  ctx.clip(); // corta as pernas dos R na linha de base
  for (const p of partes) {
    const caminho = new Path2D(p.d);
    const cor = p.cor === 'bronze' ? '#ff0000' : '#ffffff';
    if (p.tipo === 'traco') {
      ctx.strokeStyle = cor;
      ctx.lineWidth = TRACO;
      ctx.stroke(caminho);
    } else {
      ctx.fillStyle = cor;
      ctx.fill(caminho);
    }
  }
  ctx.restore();

  const dados = ctx.getImageData(0, 0, c.width, c.height).data;
  const pontos: Amostra['pontos'] = [];
  for (let y = 0; y < c.height; y += 2) {
    for (let x = 0; x < c.width; x += 2) {
      const k = (y * c.width + x) * 4;
      if (dados[k + 3] > 128) pontos.push({ u: x / c.width, v: y / c.height, bronze: dados[k + 1] < 100 });
    }
  }
  return { pontos, proporcao: caixa.altura / caixa.largura };
}

let amostraSimbolo: Amostra | null = null;
let amostraMarca: Amostra | null = null;
function prepararAmostras(): void {
  amostraSimbolo ??= amostrar(SIMBOLO, CAIXA_SIMBOLO, 6);
  amostraMarca ??= amostrar(LETRAS.flat(), CAIXA_MARCA, 4);
}

// O símbolo do logo (o A com a ponta de lança) em partículas.
function logo(N: number, L: Layout, lado = 'esquerda'): Forma {
  const f = nova(N, 0.02, 1);
  const r = aleatorio(53);
  const amostra = amostraSimbolo!;
  // Esquerda: no espaço livre embaixo do texto de contato, fora do formulário.
  // Direita: ao lado do texto, nas chamadas do fim das páginas internas.
  const direita = lado === 'direita';
  const altura = Math.min(L.meiaA * (direita ? 0.8 : 0.36), L.meiaL * (L.estreito ? 0.8 : direita ? 0.5 : 0.3));
  const largura = altura / amostra.proporcao;
  const cx = L.estreito ? 0 : direita ? L.meiaL * 0.45 : -L.meiaL * 0.6;
  const cy = L.estreito ? -L.meiaA * 0.62 : direita ? 0 : -L.meiaA * 0.74;
  for (let i = 0; i < N; i++) {
    const p = amostra.pontos[Math.floor(r() * amostra.pontos.length)];
    ponto(
      f,
      i,
      cx + (p.u - 0.5) * largura + (r() - 0.5) * 0.03,
      cy - (p.v - 0.5) * altura + (r() - 0.5) * 0.03,
      -1 + (r() - 0.5) * 0.2,
      p.bronze ? BRONZE : PRATA,
      // As partículas somam brilho onde se acumulam: valores baixos evitam estourar
      // em branco. A prata fica mais clara no alto, como o degradê do logo.
      p.bronze ? 0.55 : 0.16 + (1 - p.v) * 0.12,
    );
  }
  return f;
}

// A palavra TRIARII do logo em partículas, no rodapé.
function texto(N: number, L: Layout): Forma {
  const f = nova(N, 0.015, 0.5);
  const r = aleatorio(67);
  const amostra = amostraMarca!;
  // Largura da palavra: 20% da tela (10% no celular), limitada pela altura da área.
  const fracao = L.estreito ? 0.1 : 0.2;
  const largura = Math.min(L.meiaL * 2 * fracao, (L.rodapeA * 0.7) / amostra.proporcao);
  const altura = largura * amostra.proporcao;
  for (let i = 0; i < N; i++) {
    const p = amostra.pontos[Math.floor(r() * amostra.pontos.length)];
    ponto(
      f,
      i,
      (p.u - 0.5) * largura + (r() - 0.5) * 0.02,
      L.rodapeY - (p.v - 0.5) * altura + (r() - 0.5) * 0.02,
      (r() - 0.5) * 0.3,
      p.bronze ? BRONZE : PRATA,
      p.bronze ? 0.9 : 0.5 + (1 - p.v) * 0.2,
    );
  }
  return f;
}

// ---------- Shaders ----------

const vertex = /* glsl */ `
  attribute vec3 aPara;
  attribute vec3 aCorDe;
  attribute vec3 aCorPara;
  attribute float aSemente;
  attribute float aTag;
  uniform float uMix;
  uniform float uTempo;
  uniform float uOnda;
  uniform float uTam;
  uniform float uPixel;
  uniform float uAspecto;
  uniform float uForca;
  uniform float uDestaque;
  uniform float uPesoDestaque;
  uniform float uVarredura;
  uniform float uPesoLinha;
  uniform vec2 uMouse;
  uniform vec3 uBronze;
  uniform vec3 uDeslocDe;
  uniform vec3 uDeslocPara;
  varying vec3 vCor;

  void main() {
    // Cada partícula parte num instante diferente: a troca de forma "escorre".
    float m = clamp(uMix * 1.5 - aSemente * 0.5, 0.0, 1.0);
    m = m * m * (3.0 - 2.0 * m);
    vec3 p = mix(position + uDeslocDe, aPara + uDeslocPara, m);

    // No meio da viagem, as partículas se soltam num redemoinho.
    float meio = sin(m * 3.14159);
    p += vec3(
      sin(aSemente * 40.0 + uTempo),
      cos(aSemente * 23.0 + uTempo * 0.8),
      sin(aSemente * 17.0)
    ) * meio * 0.9;

    float t = uTempo;
    p += vec3(
      sin(p.y * 0.8 + t * 0.6 + aSemente * 6.28) * 0.5,
      sin(p.x * 0.35 + t * 0.7 + p.z * 0.45),
      cos(p.x * 0.5 - t * 0.5 + aSemente * 6.28) * 0.5
    ) * uOnda;

    vec3 cor = mix(aCorDe, aCorPara, m);

    // Núcleo do serviço com o mouse em cima acende em bronze.
    float destaque = (1.0 - step(0.5, abs(aTag - uDestaque))) * uPesoDestaque;
    cor = mix(cor, uBronze, destaque * 0.9);

    // Varredura do processo: a hélice acende da esquerda para a direita.
    float aceso = step(p.x, uVarredura) * uPesoLinha;
    cor = mix(cor, uBronze, aceso * 0.8);

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vec4 clip = projectionMatrix * mv;
    vec2 ndc = clip.xy / clip.w;
    vec2 dir = (ndc - uMouse) * vec2(uAspecto, 1.0);
    float perto = smoothstep(0.35, 0.0, length(dir)) * uForca;
    mv.xy += normalize(dir + 1e-5) * perto * 0.9;

    gl_Position = projectionMatrix * mv;
    gl_PointSize = uTam * (1.0 + perto * 1.2 + destaque * 0.7) * uPixel * (26.0 / -mv.z);
    vCor = cor * (1.0 + perto * 0.8);
  }
`;

const fragment = /* glsl */ `
  varying vec3 vCor;
  void main() {
    float r = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.05, r);
    gl_FragColor = vec4(vCor, a);
  }
`;

export function suportaWebGL(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

export interface Palco {
  destacar: (grupo: number | null) => void;
  // Relê as seções [data-forma] da página atual (chamado a cada troca de rota).
  recarregar: () => void;
}

export function iniciarParticulas(palco: HTMLElement): Palco {
  // Menos partículas em telas estreitas e em aparelhos modestos (poucos núcleos,
  // pouca memória ou modo de economia de dados).
  const estreitoInicial = window.innerWidth < 760;
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  const modesto =
    (navigator.hardwareConcurrency || 8) <= 4 || (nav.deviceMemory ?? 8) <= 4 || nav.connection?.saveData === true;
  const N = Math.round((estreitoInicial ? 3600 : 7200) * (modesto ? 0.55 : 1));

  const renderer = new WebGLRenderer({ antialias: false, alpha: true, powerPreference: 'high-performance' });
  const pixel = Math.min(window.devicePixelRatio, modesto ? 1 : 1.5);
  renderer.setPixelRatio(pixel);
  renderer.setClearColor(0x000000, 0);
  palco.append(renderer.domElement);

  const cena = new Scene();
  const camera = new PerspectiveCamera(FOV, 1, 0.1, 100);
  camera.position.set(0, 0, DISTANCIA);

  const geometria = new BufferGeometry();
  const sementes = new Float32Array(N);
  const tags = new Float32Array(N);
  const rs = aleatorio(7);
  for (let i = 0; i < N; i++) {
    sementes[i] = rs();
    tags[i] = Math.min(3, Math.floor(i / Math.ceil(N / 4)));
  }
  geometria.setAttribute('aSemente', new BufferAttribute(sementes, 1));
  geometria.setAttribute('aTag', new BufferAttribute(tags, 1));

  const uniforms = {
    uMix: { value: 0 },
    uTempo: { value: 0 },
    uOnda: { value: 0.14 },
    uTam: { value: 1.6 },
    uPixel: { value: pixel },
    uAspecto: { value: 1 },
    uForca: { value: 0 },
    uDestaque: { value: -1 },
    uPesoDestaque: { value: 0 },
    uVarredura: { value: -999 },
    uPesoLinha: { value: 0 },
    uMouse: { value: new Vector2(0, -2) },
    uBronze: { value: BRONZE },
    uDeslocDe: { value: new Vector3() },
    uDeslocPara: { value: new Vector3() },
  };

  // Converte a borda do elemento âncora (posição na tela) em altura no mundo 3D.
  const deslocar = (f: Forma, alvo: Vector3): void => {
    if (!f.ancora) {
      alvo.set(0, 0, 0);
      return;
    }
    const r = f.ancora.el.getBoundingClientRect();
    const borda = { topo: r.top, base: r.bottom, centro: r.top + r.height / 2 }[f.ancora.borda];
    const sy = borda + f.ancora.px;
    const escala = (DISTANCIA - f.ancora.z) / DISTANCIA;
    alvo.set(0, (1 - (2 * sy) / window.innerHeight) * layout.meiaA * escala, 0);
  };
  const material = new ShaderMaterial({
    vertexShader: vertex,
    fragmentShader: fragment,
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  });
  const pontos = new Points(geometria, material);
  pontos.frustumCulled = false;
  cena.add(pontos);

  // Seções que definem cada forma, na ordem da página. A última forma é sempre o texto do rodapé.
  // Página sem seções marcadas (ex.: privacidade): um caos discreto antes do rodapé.
  let secoes: HTMLElement[] = [];
  let nomes: string[] = [];
  let processo: HTMLElement | null = null;
  let areaRodape: HTMLElement | null = null;
  const lerSecoes = (): void => {
    secoes = Array.from(document.querySelectorAll<HTMLElement>('[data-forma]'));
    nomes = secoes.length ? [...secoes.map((s) => s.dataset.forma ?? 'formacao'), 'texto'] : ['caos', 'texto'];
    processo = secoes.find((s) => s.dataset.forma === 'linha') ?? null;
    areaRodape = document.querySelector<HTMLElement>('[data-rodape-palco]');
  };
  lerSecoes();

  const gerar = (nome: string, el: HTMLElement | undefined, L: Layout): Forma => {
    switch (nome) {
      case 'nucleos':
        return nucleos(N, L, el?.dataset.formaLado, el);
      case 'caos':
        return caos(N, L);
      case 'linha': {
        const f = linha(N, L, el?.dataset.formaLado, el);
        const etapas = el?.querySelector<HTMLElement>('.processo__etapas');
        if (etapas) {
          const meio = el?.dataset.formaLado === 'meio';
          // Sempre fora do texto: no meio do vão acima das etapas (meio) ou logo abaixo delas.
          const cabeca = el?.querySelector<HTMLElement>('.secao__cabeca');
          const vao = cabeca ? etapas.getBoundingClientRect().top - cabeca.getBoundingClientRect().bottom : 92;
          f.ancora = meio
            ? { el: etapas, borda: 'topo', px: -vao / 2, z: -1 }
            : { el: etapas, borda: 'base', px: 95, z: -1 };
        }
        return f;
      }
      case 'circuito':
        return circuito(N, L);
      case 'logo':
        return logo(N, L, el?.dataset.formaLado);
      case 'texto':
        return texto(N, L);
      default:
        return formacao(N);
    }
  };

  let formas: Forma[] = [];
  let ancoras: number[] = [];
  let layout: Layout;
  let par = -1;

  const medirLayout = (): Layout => {
    const meiaA = DISTANCIA * Math.tan(((FOV / 2) * Math.PI) / 180);
    const meiaL = meiaA * (window.innerWidth / window.innerHeight);
    const alturaArea = areaRodape?.offsetHeight ?? window.innerHeight * 0.3;
    const rodapeA = (alturaArea / window.innerHeight) * 2 * meiaA;
    return { meiaA, meiaL, estreito: window.innerWidth < 760, rodapeA, rodapeY: -meiaA + rodapeA / 2 };
  };

  const gerarFormas = (): void => {
    layout = medirLayout();
    formas = nomes.map((nome, i) => gerar(nome, secoes[i], layout));
    formas.forEach((f) => {
      f.attrPos = new BufferAttribute(f.pos, 3);
      f.attrCor = new BufferAttribute(f.cor, 3);
    });
    par = -1;
  };

  const medirAncoras = (): void => {
    const fim = document.documentElement.scrollHeight - window.innerHeight;
    const base: (HTMLElement | null)[] = secoes.length ? secoes : [null];
    ancoras = base.map((el, i) =>
      i === 0 || !el ? 0 : el.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.35,
    );
    ancoras.push(fim);
    for (let i = 1; i < ancoras.length; i++) {
      ancoras[i] = Math.min(Math.max(ancoras[i], ancoras[i - 1] + 1), Math.max(fim, ancoras[i - 1] + 1));
    }
  };

  const usarPar = (i: number): void => {
    if (i === par) return;
    par = i;
    const de = formas[i];
    const para = formas[i + 1];
    geometria.setAttribute('position', de.attrPos!);
    geometria.setAttribute('aCorDe', de.attrCor!);
    geometria.setAttribute('aPara', para.attrPos!);
    geometria.setAttribute('aCorPara', para.attrCor!);
  };

  const redimensionar = (): void => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    uniforms.uAspecto.value = w / h;
    gerarFormas();
    medirAncoras();
  };
  prepararAmostras();
  redimensionar();

  let espera: number | undefined;
  const agendarRedimensionar = () => {
    window.clearTimeout(espera);
    espera = window.setTimeout(redimensionar, 200);
  };
  window.addEventListener('resize', agendarRedimensionar);
  // A altura da página muda quando fontes e imagens terminam de carregar.
  new ResizeObserver(() => medirAncoras()).observe(document.body);

  // Cursor
  const alvoMouse = new Vector2(0, -2);
  let alvoForca = 0;
  window.addEventListener('pointermove', (e) => {
    alvoMouse.set((e.clientX / window.innerWidth) * 2 - 1, -((e.clientY / window.innerHeight) * 2 - 1));
    alvoForca = e.pointerType === 'mouse' ? 1 : 0.6;
  });
  document.documentElement.addEventListener('pointerleave', () => {
    alvoForca = 0;
  });

  let grupoDestacado = -1;
  let forcaDestaque = 0;

  // O robô legionário que passeia pelo fundo (efeitos/robo.ts).
  const robo = criarRobo(cena, pixel, estreitoInicial);
  const escalaRobo = (DISTANCIA - 0.5) / DISTANCIA; // ele flutua no plano z = 0,5

  const inicio = performance.now();
  let anterior = inicio;
  const quadro = (): void => {
    requestAnimationFrame(quadro);
    const agora = performance.now();
    const dt = Math.min((agora - anterior) / 1000, 0.05);
    anterior = agora;
    if (document.hidden) return;

    robo.atualizar(
      dt,
      layout.meiaL * escalaRobo,
      layout.meiaA * escalaRobo,
      alvoForca > 0
        ? { x: alvoMouse.x * layout.meiaL * escalaRobo, y: alvoMouse.y * layout.meiaA * escalaRobo }
        : null,
    );

    uniforms.uTempo.value = (agora - inicio) / 1000;
    uniforms.uMouse.value.lerp(alvoMouse, 0.1);
    uniforms.uForca.value += (alvoForca - uniforms.uForca.value) * 0.06;

    // Em qual par de formas a rolagem está, e quanto já andou de uma para a outra.
    const y = window.scrollY;
    let i = 0;
    while (i < ancoras.length - 2 && y >= ancoras[i + 1]) i++;
    const t = limitar((y - ancoras[i]) / (ancoras[i + 1] - ancoras[i]));
    const ultimo = i === ancoras.length - 2;
    // No último trecho, a forma segura mais tempo antes de virar o texto do rodapé.
    const mistura = ultimo ? suave(0.6, 1, t) : suave(0.45, 1, t);
    usarPar(i);
    uniforms.uMix.value = mistura;

    const de = formas[i];
    const para = formas[i + 1];
    deslocar(de, uniforms.uDeslocDe.value);
    deslocar(para, uniforms.uDeslocPara.value);
    uniforms.uOnda.value = de.onda + (para.onda - de.onda) * mistura;
    uniforms.uTam.value = 1.6 * (de.tamanho + (para.tamanho - de.tamanho) * mistura);

    // Peso de cada forma especial na mistura atual.
    const peso = (nome: string) =>
      (nomes[i] === nome ? 1 - mistura : 0) + (nomes[i + 1] === nome ? mistura : 0);

    forcaDestaque += ((grupoDestacado >= 0 ? 1 : 0) - forcaDestaque) * 0.08;
    if (grupoDestacado >= 0) uniforms.uDestaque.value = grupoDestacado;
    uniforms.uPesoDestaque.value = peso('nucleos') * forcaDestaque;

    uniforms.uPesoLinha.value = peso('linha');
    if (processo) {
      const r = processo.getBoundingClientRect();
      const progresso = limitar((window.innerHeight * 0.65 - r.top) / r.height);
      uniforms.uVarredura.value = -layout.meiaL * 0.85 + progresso * layout.meiaL * 1.7;
    }

    // Leve parallax da cena inteira com o cursor.
    const m = uniforms.uMouse.value;
    pontos.rotation.y += (m.x * 0.06 - pontos.rotation.y) * 0.05;
    pontos.rotation.x += (-m.y * 0.04 - pontos.rotation.x) * 0.05;

    renderer.render(cena, camera);
  };
  quadro();

  document.documentElement.classList.add('tem-webgl');

  return {
    destacar: (grupo) => {
      grupoDestacado = grupo ?? -1;
    },
    recarregar: () => {
      lerSecoes();
      grupoDestacado = -1;
      gerarFormas();
      medirAncoras();
    },
  };
}
