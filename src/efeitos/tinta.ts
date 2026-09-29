// Distorção líquida nos cartões de serviço. Um único canvas WebGL se muda para
// o cartão sob o mouse e desenha um fluido em bronze e íon puxado pelo cursor.
// Só roda enquanto há um cartão ativo.

const vertex = `
  attribute vec2 aPos;
  void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const fragment = `
  precision mediump float;
  uniform vec2 uRes;
  uniform vec2 uMouse;
  uniform float uTempo;
  uniform float uForca;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float ruido(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }
  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 5; i++) { v += a * ruido(p); p *= 2.02; a *= 0.5; }
    return v;
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / uRes;
    vec2 aspecto = vec2(uRes.x / uRes.y, 1.0);
    vec2 p = uv * aspecto * 2.4;
    vec2 m = uMouse * aspecto * 2.4;
    float d = distance(p, m);

    // Distorção de domínio, puxada na direção do cursor.
    vec2 q = vec2(fbm(p + uTempo * 0.15), fbm(p + vec2(5.2, 1.3) - uTempo * 0.12));
    vec2 r = vec2(
      fbm(p + 3.0 * q + vec2(1.7, 9.2) + (m - p) * 0.5 * exp(-d)),
      fbm(p + 3.0 * q + vec2(8.3, 2.8))
    );
    float f = fbm(p + 3.0 * r);

    float halo = exp(-d * 1.5);
    float anel = (sin(d * 14.0 - uTempo * 4.0) * 0.5 + 0.5) * exp(-d * 2.4);

    vec3 ion = vec3(0.184, 0.89, 0.878);
    vec3 bronze = vec3(0.851, 0.612, 0.298);
    vec3 cor = mix(ion, bronze, smoothstep(0.35, 0.75, f + halo * 0.3));
    float a = (smoothstep(0.35, 0.95, f) * 0.28 + halo * 0.3 + anel * 0.1) * uForca;
    gl_FragColor = vec4(cor * a, a);
  }
`;

function compilar(gl: WebGLRenderingContext, tipo: number, fonte: string): WebGLShader | null {
  const s = gl.createShader(tipo);
  if (!s) return null;
  gl.shaderSource(s, fonte);
  gl.compileShader(s);
  return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
}

export function iniciarTinta(seletor: string, aoDestacar: (grupo: number | null) => void): void {
  const canvas = document.createElement('canvas');
  canvas.className = 'tinta';
  canvas.setAttribute('aria-hidden', 'true');
  const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false });
  if (!gl) return;

  const vs = compilar(gl, gl.VERTEX_SHADER, vertex);
  const fs = compilar(gl, gl.FRAGMENT_SHADER, fragment);
  const programa = gl.createProgram();
  if (!vs || !fs || !programa) return;
  gl.attachShader(programa, vs);
  gl.attachShader(programa, fs);
  gl.linkProgram(programa);
  if (!gl.getProgramParameter(programa, gl.LINK_STATUS)) return;
  gl.useProgram(programa);

  // Um triângulo que cobre a tela inteira.
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(programa, 'aPos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const uRes = gl.getUniformLocation(programa, 'uRes');
  const uMouse = gl.getUniformLocation(programa, 'uMouse');
  const uTempo = gl.getUniformLocation(programa, 'uTempo');
  const uForca = gl.getUniformLocation(programa, 'uForca');

  const pixel = Math.min(window.devicePixelRatio, 1.5);
  let ativo: HTMLElement | null = null;
  let forca = 0;
  let alvoForca = 0;
  const mouse = { x: 0.5, y: 0.5, ax: 0.5, ay: 0.5 };
  let rodando = false;
  const inicio = performance.now();

  const quadro = (): void => {
    forca += (alvoForca - forca) * 0.08;
    mouse.x += (mouse.ax - mouse.x) * 0.12;
    mouse.y += (mouse.ay - mouse.y) * 0.12;
    gl.uniform2f(uMouse, mouse.x, mouse.y);
    gl.uniform1f(uTempo, (performance.now() - inicio) / 1000);
    gl.uniform1f(uForca, forca);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    if (alvoForca === 0 && forca < 0.01) {
      rodando = false;
      gl.clear(gl.COLOR_BUFFER_BIT);
      return;
    }
    requestAnimationFrame(quadro);
  };

  const ativar = (cartao: HTMLElement): void => {
    if (ativo !== cartao) {
      ativo = cartao;
      forca = 0;
      cartao.prepend(canvas);
      const w = Math.round(cartao.clientWidth * pixel);
      const h = Math.round(cartao.clientHeight * pixel);
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
      gl.uniform2f(uRes, w, h);
    }
    alvoForca = 1;
    if (!rodando) {
      rodando = true;
      requestAnimationFrame(quadro);
    }
  };

  // Eventos delegados: valem para os cartões de qualquer página, inclusive os
  // que o React monta depois de uma troca de rota.
  let sobre: HTMLElement | null = null;
  document.addEventListener('pointerover', (e) => {
    if (e.pointerType !== 'mouse') return;
    const cartao = (e.target as Element | null)?.closest<HTMLElement>(seletor) ?? null;
    if (cartao === sobre) return;
    sobre = cartao;
    if (cartao) {
      ativar(cartao);
      aoDestacar(Array.from(document.querySelectorAll(seletor)).indexOf(cartao));
    } else {
      alvoForca = 0;
      aoDestacar(null);
    }
  });
  document.addEventListener('pointermove', (e) => {
    if (!sobre) return;
    const r = sobre.getBoundingClientRect();
    mouse.ax = (e.clientX - r.left) / r.width;
    mouse.ay = 1 - (e.clientY - r.top) / r.height;
  });
}
