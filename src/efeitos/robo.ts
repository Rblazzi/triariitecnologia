// O robô legionário: um assistente flutuante de partículas que circula pelo
// fundo do site, com o capacete dos triários (galea): crista em bronze, aba,
// protetor de nuca e de bochecha. No peito, a ponta de lança do logo.
// - O olho, na fenda da viseira, acompanha o cursor e pisca.
// - Flutua com um leve sobe e desce, inclinado para onde vai, e o propulsor
//   solta um rastro de partículas.
// - Quando o cursor chega perto, para, vira para ele e faz uma varredura.
// - Nas pausas, olha para os lados.
// Vive no mesmo palco WebGL das outras partículas (efeitos/particulas.ts).

import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Points,
  ShaderMaterial,
  type Scene,
} from 'three';

type RGB = [number, number, number];
const ION: RGB = [0.184, 0.89, 0.878];
const BRONZE: RGB = [0.851, 0.612, 0.298];

const ALTURA = 1.5; // altura do robô em unidades do mundo (a tela tem ~9 de altura)
const VELOCIDADE = 0.7;
const RAIO_VARREDURA = 2; // distância do cursor que faz o robô parar e analisar
const N_FUMACA = 140;
const N_FEIXE = 110;

type Ponto =
  | { tipo: 'fixo'; x: number; y: number }
  | { tipo: 'crista'; ang: number; s: number }
  | { tipo: 'olho'; ang: number; d: number }
  | { tipo: 'braco'; s: number }
  | { tipo: 'led' }
  | { tipo: 'fumaca'; k: number }
  | { tipo: 'feixe'; s: number; lado: number };

// Olho: centro da fenda da viseira, em coordenadas locais (frente = +x).
const OLHO = { x: 0.15, y: 0.225 };

function montar(r: () => number) {
  const pontos: Ponto[] = [];
  const cores: RGB[] = [];
  const brilhos: number[] = [];
  const add = (p: Ponto, cor: RGB = ION, brilho = 0.55) => {
    pontos.push(p);
    cores.push(cor);
    brilhos.push(brilho);
  };
  const linha = (x1: number, y1: number, x2: number, y2: number, n: number, cor: RGB = ION, brilho = 0.55) => {
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1);
      add({ tipo: 'fixo', x: x1 + (x2 - x1) * t, y: y1 + (y2 - y1) * t }, cor, brilho);
    }
  };
  const arco = (cx: number, cy: number, raio: number, a0: number, a1: number, n: number) => {
    for (let i = 0; i < n; i++) {
      const a = a0 + ((a1 - a0) * i) / (n - 1);
      add({ tipo: 'fixo', x: cx + Math.cos(a) * raio, y: cy + Math.sin(a) * raio });
    }
  };

  // --- Capacete (galea) ---
  arco(0, 0.3, 0.22, 0, Math.PI, 90); // cúpula
  linha(0.02, 0.3, 0.28, 0.285, 16); // aba sobre a testa
  linha(-0.22, 0.3, -0.31, 0.13, 16); // protetor de nuca, abrindo para trás
  linha(-0.31, 0.13, -0.15, 0.115, 12);
  linha(0.2, 0.3, 0.2, 0.2, 8); // frente do rosto
  linha(0.04, 0.19, 0.04, 0.13, 7); // protetor de bochecha
  linha(0.04, 0.13, 0.13, 0.095, 8);
  linha(0.13, 0.095, 0.21, 0.12, 7);
  linha(0.21, 0.12, 0.2, 0.2, 6);
  linha(0.07, 0.225, 0.205, 0.225, 14, ION, 0.3); // fenda da viseira
  // Crista em bronze: cerdas em arco sobre a cúpula
  for (let b = 0; b < 13; b++) {
    const ang = Math.PI * (0.16 + (0.68 * b) / 12);
    for (let i = 0; i < 9; i++) add({ tipo: 'crista', ang, s: i / 8 }, BRONZE, 0.75);
  }
  for (let i = 0; i < 26; i++) add({ tipo: 'crista', ang: Math.PI * (0.14 + (0.72 * i) / 25), s: 1.08 }, BRONZE, 0.55);
  // Olho
  for (let i = 0; i < 16; i++) add({ tipo: 'olho', ang: r() * Math.PI * 2, d: Math.sqrt(r()) }, BRONZE, 1);

  // --- Corpo ---
  // Tronco: retângulo arredondado
  const [cx, cy, w, h, raio] = [0, -0.07, 0.36, 0.3, 0.07];
  const lados: [number, number, number, number][] = [
    [cx - w / 2 + raio, cy + h / 2, cx + w / 2 - raio, cy + h / 2],
    [cx + w / 2, cy + h / 2 - raio, cx + w / 2, cy - h / 2 + raio],
    [cx + w / 2 - raio, cy - h / 2, cx - w / 2 + raio, cy - h / 2],
    [cx - w / 2, cy - h / 2 + raio, cx - w / 2, cy + h / 2 - raio],
  ];
  lados.forEach(([x1, y1, x2, y2]) => linha(x1, y1, x2, y2, 18));
  arco(cx + w / 2 - raio, cy + h / 2 - raio, raio, 0, Math.PI / 2, 7);
  arco(cx - w / 2 + raio, cy + h / 2 - raio, raio, Math.PI / 2, Math.PI, 7);
  arco(cx - w / 2 + raio, cy - h / 2 + raio, raio, Math.PI, Math.PI * 1.5, 7);
  arco(cx + w / 2 - raio, cy - h / 2 + raio, raio, Math.PI * 1.5, Math.PI * 2, 7);
  linha(-0.05, 0.105, 0.05, 0.105, 6); // pescoço
  // Ponta de lança do logo, no peito: contorno nítido e preenchimento suave
  linha(0.0, -0.01, -0.065, -0.13, 11, BRONZE, 0.85);
  linha(0.0, -0.01, 0.065, -0.13, 11, BRONZE, 0.85);
  linha(-0.065, -0.13, 0.065, -0.13, 11, BRONZE, 0.85);
  for (let i = 0; i < 18; i++) {
    const v = 0.25 + r() * 0.7;
    add({ tipo: 'fixo', x: (r() - 0.5) * v * 0.1, y: -0.01 - v * 0.115 }, BRONZE, 0.35);
  }
  add({ tipo: 'led' }, BRONZE, 1);
  for (let i = 0; i < 5; i++) add({ tipo: 'led' }, BRONZE, 1);
  // Braço
  for (let i = 0; i < 26; i++) add({ tipo: 'braco', s: i / 25 });
  // Propulsor
  linha(-0.08, -0.22, 0.08, -0.22, 8);
  linha(-0.08, -0.22, -0.05, -0.29, 6);
  linha(0.08, -0.22, 0.05, -0.29, 6);
  linha(-0.05, -0.29, 0.05, -0.29, 6);

  // Rastro do propulsor e feixe de varredura (posições no mundo, animadas)
  for (let k = 0; k < N_FUMACA; k++) add({ tipo: 'fumaca', k }, r() < 0.45 ? BRONZE : ION, 0.6);
  for (let i = 0; i < N_FEIXE; i++) add({ tipo: 'feixe', s: r(), lado: r() * 2 - 1 }, ION, 0.55);

  return { pontos, cores, brilhos };
}

const vertex = /* glsl */ `
  attribute vec3 aCor;
  attribute float aAlfa;
  uniform float uPixel;
  uniform float uTam;
  varying vec3 vCor;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uTam * uPixel * (26.0 / -mv.z);
    vCor = aCor * aAlfa;
  }
`;
const fragment = /* glsl */ `
  varying vec3 vCor;
  void main() {
    float r = length(gl_PointCoord - 0.5);
    gl_FragColor = vec4(vCor, smoothstep(0.5, 0.05, r));
  }
`;

export interface Robo {
  atualizar: (dt: number, meiaL: number, meiaA: number, mouse: { x: number; y: number } | null) => void;
}

export function criarRobo(cena: Scene, pixel: number, estreito: boolean): Robo {
  let semente = 777;
  const r = () => {
    semente = (semente * 16807) % 2147483647;
    return semente / 2147483647;
  };
  const { pontos, cores, brilhos } = montar(r);
  const n = pontos.length;

  const posicoes = new Float32Array(n * 3);
  const alfas = new Float32Array(n).fill(1);
  const cor = new Float32Array(n * 3);
  pontos.forEach((_, i) => cor.set(cores[i].map((c) => c * brilhos[i]), i * 3));
  const geometria = new BufferGeometry();
  const attrPos = new BufferAttribute(posicoes, 3);
  const attrAlfa = new BufferAttribute(alfas, 1);
  geometria.setAttribute('position', attrPos);
  geometria.setAttribute('aAlfa', attrAlfa);
  geometria.setAttribute('aCor', new BufferAttribute(cor, 3));
  const material = new ShaderMaterial({
    vertexShader: vertex,
    fragmentShader: fragment,
    uniforms: { uPixel: { value: pixel }, uTam: { value: 1.45 } },
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  });
  const nuvem = new Points(geometria, material);
  nuvem.frustumCulled = false;
  cena.add(nuvem);

  const escala = ALTURA * (estreito ? 0.7 : 1);
  const e = {
    x: -99,
    y: 0,
    vx: 0,
    vy: 0,
    alvoX: 0,
    alvoY: 0,
    frente: 1, // +1 olhando para a direita, -1 para a esquerda (suavizado: ele "gira")
    olhoX: 0,
    olhoY: 0,
    pausa: 0,
    tempo: 0,
    piscar: 0,
    proximaPiscada: 3,
  };
  let iniciado = false;
  // Rastro: cada partícula tem posição, velocidade e vida própria, no mundo.
  const fumaca = Array.from({ length: N_FUMACA }, () => ({ x: 0, y: -999, vx: 0, vy: 0, vida: 0, max: 1 }));
  let emitir = 0;

  const novoAlvo = (meiaL: number, meiaA: number) => {
    e.alvoX = (r() * 2 - 1) * meiaL * 0.82;
    e.alvoY = (r() * 2 - 1) * meiaA * 0.72;
  };

  return {
    atualizar(dt, meiaL, meiaA, mouse) {
      if (!iniciado) {
        e.x = -meiaL - 1.2;
        e.y = (r() - 0.5) * meiaA;
        novoAlvo(meiaL, meiaA);
        iniciado = true;
      }
      e.tempo += dt;

      // --- Decisão: varrer o cursor, pausar ou seguir o alvo ---
      let varrendo = false;
      let dMouse = Infinity;
      if (mouse) {
        dMouse = Math.hypot(mouse.x - e.x, mouse.y - e.y);
        varrendo = dMouse < RAIO_VARREDURA;
      }
      let desejoX = 0;
      let desejoY = 0;
      if (varrendo) {
        e.pausa = 0;
      } else if (e.pausa > 0) {
        e.pausa -= dt;
      } else {
        const dx = e.alvoX - e.x;
        const dy = e.alvoY - e.y;
        const d = Math.hypot(dx, dy);
        if (d < 0.35) {
          if (r() < 0.45) e.pausa = 1.4 + r() * 1.8; // para e olha em volta
          novoAlvo(meiaL, meiaA);
        } else {
          desejoX = (dx / d) * VELOCIDADE;
          desejoY = (dy / d) * VELOCIDADE;
        }
      }
      // Flutuação: a velocidade muda devagar, como quem desliza no ar.
      const inercia = Math.min(1, dt * 1.6);
      e.vx += (desejoX - e.vx) * inercia;
      e.vy += (desejoY - e.vy) * inercia;
      e.x += e.vx * dt;
      e.y += e.vy * dt;

      // Para onde olha: o cursor, quando varre; senão, para onde anda.
      let frenteAlvo = e.frente;
      if (varrendo && mouse) frenteAlvo = Math.sign(mouse.x - e.x) || e.frente;
      else if (Math.abs(e.vx) > 0.08) frenteAlvo = Math.sign(e.vx);
      const f = e.frente + (frenteAlvo - e.frente) * Math.min(1, dt * 5);
      e.frente = Math.abs(f) < 0.001 ? frenteAlvo * 0.001 : f;
      const lado = Math.sign(e.frente) || 1;

      // Olho: segue o cursor; nas pausas, olha para os lados.
      let olhoAlvoX = 0;
      let olhoAlvoY = 0;
      if (mouse) {
        const dx = (mouse.x - e.x) * lado;
        const dy = mouse.y - e.y;
        const d = Math.hypot(dx, dy) || 1;
        olhoAlvoX = (dx / d) * 0.045;
        olhoAlvoY = (dy / d) * 0.012;
      } else if (e.pausa > 0) {
        olhoAlvoX = Math.sin(e.tempo * 2.2) * 0.045;
      }
      e.olhoX += (olhoAlvoX - e.olhoX) * Math.min(1, dt * 8);
      e.olhoY += (olhoAlvoY - e.olhoY) * Math.min(1, dt * 8);

      // Piscada
      e.proximaPiscada -= dt;
      if (e.proximaPiscada <= 0) {
        e.piscar = 0.16;
        e.proximaPiscada = 2.5 + r() * 4;
      }
      e.piscar = Math.max(0, e.piscar - dt);
      const abertura = e.piscar > 0 ? Math.abs(Math.cos((e.piscar / 0.16) * Math.PI)) : 1;

      // Inclinação para onde vai, sobe e desce, e o braço balançando.
      const inclinacao = -e.vx * 0.22;
      const flutua = Math.sin(e.tempo * 2.1) * 0.06;
      const ci = Math.cos(inclinacao);
      const si = Math.sin(inclinacao);
      const bx = e.x;
      const by = e.y + flutua;
      const balanco = Math.sin(e.tempo * 2.6) * 0.18 + Math.hypot(e.vx, e.vy) * 0.3;
      const ledAceso = Math.sin(e.tempo * 4) > 0.2 ? 1 : 0.15;

      // local → espelhado pela frente → inclinado → escalado → mundo
      const mundo = (lx: number, ly: number): [number, number] => {
        const x = lx * e.frente;
        return [bx + (x * ci - ly * si) * escala, by + (x * si + ly * ci) * escala];
      };
      const [olhoMx, olhoMy] = mundo(OLHO.x + e.olhoX, OLHO.y + e.olhoY);

      // Rastro do propulsor
      emitir += dt * 170;
      const [bocaX, bocaY] = mundo(0, -0.3);
      for (const p of fumaca) {
        if (p.vida <= 0 && emitir >= 1) {
          emitir -= 1;
          p.x = bocaX + (r() - 0.5) * 0.05 * escala;
          p.y = bocaY;
          p.vx = (r() - 0.5) * 0.25 - e.vx * 0.4;
          p.vy = -0.7 - r() * 0.6;
          p.max = p.vida = 0.35 + r() * 0.45;
        }
        if (p.vida > 0) {
          p.vida -= dt;
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.vx *= 0.96;
        }
      }
      emitir = Math.min(emitir, 4);

      const intensidadeFeixe = varrendo ? 0.55 + Math.sin(e.tempo * 30) * 0.2 + r() * 0.2 : 0;

      for (let i = 0; i < n; i++) {
        const p = pontos[i];
        let wx: number;
        let wy: number;
        let alfa = 1;
        switch (p.tipo) {
          case 'fixo':
            [wx, wy] = mundo(p.x, p.y);
            break;
          case 'crista': {
            // As cerdas acompanham o movimento, como uma pluma ao vento.
            const ang = p.ang - e.vx * 0.12 * lado;
            const raio = 0.24 + p.s * 0.13;
            [wx, wy] = mundo(Math.cos(ang) * raio, 0.3 + Math.sin(ang) * raio);
            break;
          }
          case 'olho':
            [wx, wy] = mundo(
              OLHO.x + e.olhoX + Math.cos(p.ang) * p.d * 0.022,
              OLHO.y + e.olhoY + Math.sin(p.ang) * p.d * 0.016 * abertura,
            );
            alfa = 0.3 + abertura * 0.7;
            break;
          case 'braco': {
            // Ombro (na frente do tronco) → cotovelo → mão, balançando para a frente.
            const [ombroX, ombroY] = [0.18, 0.03];
            const a1 = -1.25 + balanco * 0.6;
            const cotoveloX = ombroX + Math.cos(a1) * 0.12;
            const cotoveloY = ombroY + Math.sin(a1) * 0.12;
            if (p.s < 0.5) {
              const t = p.s / 0.5;
              [wx, wy] = mundo(ombroX + (cotoveloX - ombroX) * t, ombroY + (cotoveloY - ombroY) * t);
            } else {
              const t = (p.s - 0.5) / 0.5;
              const a2 = a1 + 0.9;
              [wx, wy] = mundo(cotoveloX + Math.cos(a2) * 0.1 * t, cotoveloY + Math.sin(a2) * 0.1 * t);
            }
            break;
          }
          case 'led':
            [wx, wy] = mundo(-0.11 + (r() - 0.5) * 0.012, 0.02 + (r() - 0.5) * 0.012);
            alfa = ledAceso;
            break;
          case 'fumaca': {
            const q = fumaca[p.k];
            wx = q.x;
            wy = q.y;
            alfa = q.vida > 0 ? (q.vida / q.max) * 0.9 : 0;
            break;
          }
          default: {
            // Feixe de varredura: um cone do olho até o cursor, tremulando.
            if (!varrendo || !mouse) {
              wx = olhoMx;
              wy = olhoMy;
              alfa = 0;
              break;
            }
            const dx = mouse.x - olhoMx;
            const dy = mouse.y - olhoMy;
            const d = Math.hypot(dx, dy) || 1;
            const abrir = p.s * Math.min(0.35, d * 0.18) * p.lado;
            wx = olhoMx + dx * p.s + (-dy / d) * abrir + (r() - 0.5) * 0.02;
            wy = olhoMy + dy * p.s + (dx / d) * abrir + (r() - 0.5) * 0.02;
            alfa = intensidadeFeixe * (1 - p.s * 0.6);
          }
        }
        posicoes[i * 3] = wx;
        posicoes[i * 3 + 1] = wy;
        posicoes[i * 3 + 2] = 0.5;
        alfas[i] = alfa;
      }
      attrPos.needsUpdate = true;
      attrAlfa.needsUpdate = true;
    },
  };
}
