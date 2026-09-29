import { useId } from 'react';
import { BASE, CAIXA_MARCA, CAIXA_SIMBOLO, CORES, LETRAS, SIMBOLO, TRACO, type Parte } from '../dados/logo';

// Degradês prata e bronze do logo. Os ids são únicos por instância: com o
// mesmo id repetido, um logo escondido (display: none) apagaria as cores dos outros.
function Degrades({ id, caixa }: { id: string; caixa: { y: number; altura: number } }) {
  const y1 = caixa.y;
  const y2 = caixa.y + caixa.altura;
  return (
    <defs>
      <linearGradient id={`${id}-prata`} gradientUnits="userSpaceOnUse" x1="0" y1={y1} x2="0" y2={y2}>
        <stop offset="0" stopColor={CORES.prata[0]} />
        <stop offset="0.55" stopColor={CORES.prata[1]} />
        <stop offset="1" stopColor={CORES.prata[2]} />
      </linearGradient>
      <linearGradient id={`${id}-bronze`} gradientUnits="userSpaceOnUse" x1="0" y1={y1 + caixa.altura * 0.4} x2="0" y2={y2}>
        <stop offset="0" stopColor={CORES.bronze[0]} />
        <stop offset="1" stopColor={CORES.bronze[1]} />
      </linearGradient>
      {/* Corta as pernas dos R na linha de base */}
      <clipPath id={`${id}-base`}>
        <rect x="-10" y="-10" width={CAIXA_MARCA.largura + 20} height={BASE + 10} />
      </clipPath>
    </defs>
  );
}

function Formas({ partes, id }: { partes: Parte[]; id: string }) {
  return (
    <>
      {partes.map((p, i) => {
        const cor = `url(#${id}-${p.cor})`;
        return p.tipo === 'preenchido' ? (
          <path key={i} className={p.classe} d={p.d} fill={cor} />
        ) : (
          <path
            key={i}
            className={p.classe}
            d={p.d}
            fill="none"
            stroke={cor}
            strokeWidth={TRACO}
            clipPath={`url(#${id}-base)`}
          />
        );
      })}
    </>
  );
}

// Logo completo: TRIARII em prata e, opcionalmente, TECNOLOGIA entre linhas bronze.
export function LogoTriarii({ className = '', comSubtitulo = false }: { className?: string; comSubtitulo?: boolean }) {
  const id = useId().replace(/:/g, '');
  const c = CAIXA_MARCA;
  return (
    <span className={`logo ${className}`}>
      <svg className="logo__marca" viewBox={`${c.x} ${c.y} ${c.largura} ${c.altura}`} aria-hidden="true">
        <Degrades id={id} caixa={c} />
        {LETRAS.map((partes, i) => (
          <g key={i} className="logo__grupo">
            <Formas partes={partes} id={id} />
          </g>
        ))}
      </svg>
      {comSubtitulo && (
        <span className="logo__sub" aria-hidden="true">
          Tecnologia
        </span>
      )}
    </span>
  );
}

// Símbolo: só o A com a ponta de lança em bronze.
export function SimboloTriarii({ className = '' }: { className?: string }) {
  const id = useId().replace(/:/g, '');
  const c = CAIXA_SIMBOLO;
  return (
    <svg className={`simbolo ${className}`} viewBox={`${c.x} ${c.y} ${c.largura} ${c.altura}`} aria-hidden="true">
      <Degrades id={id} caixa={c} />
      <Formas partes={SIMBOLO} id={id} />
    </svg>
  );
}
