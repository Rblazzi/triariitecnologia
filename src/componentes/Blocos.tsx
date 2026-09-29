// Blocos de conteúdo usados tanto na home (resumo) quanto nas páginas internas (detalhe).

import type { Etapa, Principio, Servico, Situacao } from '../dados/conteudo';

export function CartaoServico({ servico, detalhado = false }: { servico: Servico; detalhado?: boolean }) {
  const Titulo = detalhado ? 'h2' : 'h3';
  return (
    <article className="servico revelar">
      <span className="servico__tag">{servico.tag}</span>
      <Titulo className="servico__nome">{servico.nome}</Titulo>
      <p className="servico__desc">{servico.descricao}</p>
      <ul className="servico__lista">
        {servico.itens.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      {detalhado && (
        <dl className="servico__extra">
          <dt>Você recebe</dt>
          <dd>{servico.recebe}</dd>
          <dt>{servico.rotuloTecnologias}</dt>
          <dd className="servico__tec">{servico.tecnologias.join(' · ')}</dd>
        </dl>
      )}
    </article>
  );
}

export function ListaSituacoes({ situacoes }: { situacoes: Situacao[] }) {
  return (
    <dl className="situacoes__lista">
      {situacoes.map((s) => (
        <div className="situacao revelar" key={s.frase}>
          <dt>“{s.frase}”</dt>
          <dd>{s.resposta}</dd>
        </div>
      ))}
    </dl>
  );
}

export function ListaEtapas({ etapas, detalhado = false }: { etapas: Etapa[]; detalhado?: boolean }) {
  const Titulo = detalhado ? 'h2' : 'h3';
  return (
    <ol className="processo__etapas">
      {etapas.map((e) => (
        <li className="etapa revelar" key={e.nome}>
          <Titulo className="etapa__nome">{e.nome}</Titulo>
          <p>{e.resumo}</p>
          {detalhado && (
            <>
              <p className="etapa__recebe">Você recebe</p>
              <ul className="etapa__lista">
                {e.recebe.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </>
          )}
        </li>
      ))}
    </ol>
  );
}

export function GradePrincipios({ itens }: { itens: Principio[] }) {
  return (
    <div className="principios__grade">
      {itens.map((p) => (
        <article className="principio revelar" key={p.titulo}>
          <h3>{p.titulo}</h3>
          <p>{p.texto}</p>
        </article>
      ))}
    </div>
  );
}
