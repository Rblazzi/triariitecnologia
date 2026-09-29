import { ListaEtapas } from '../componentes/Blocos';
import { Chamada } from '../componentes/Chamada';
import { ETAPAS, PERGUNTAS } from '../dados/conteudo';

export function ComoTrabalhamos() {
  return (
    <main id="conteudo">
      <section
        className="processo processo--pagina"
        aria-labelledby="pagina-titulo"
        data-forma="linha"
        data-forma-lado="meio"
      >
        <div className="secao__cabeca">
          <p className="rotulo">Como trabalhamos</p>
          <h1 id="pagina-titulo" className="pagina__titulo">
            Do diagnóstico à sustentação.
          </h1>
          <p className="pagina__lead">
            Quatro etapas, sempre nesta ordem. Você sabe em qual estamos e o que recebe ao fim de cada
            uma.
          </p>
        </div>
        <ListaEtapas etapas={ETAPAS} detalhado />
      </section>

      <section className="faq" aria-labelledby="faq-titulo" data-forma="formacao">
        <div className="secao__cabeca">
          <p className="rotulo">Perguntas frequentes</p>
          <h2 id="faq-titulo" className="secao__titulo">
            O que costumam perguntar.
          </h2>
        </div>
        <div className="faq__lista">
          {PERGUNTAS.map((p) => (
            <details className="pergunta revelar" key={p.pergunta}>
              <summary>{p.pergunta}</summary>
              <p>{p.resposta}</p>
            </details>
          ))}
        </div>
      </section>

      <Chamada
        titulo="Vamos começar pelo diagnóstico?"
        texto="Conte o que está acontecendo e a gente responde com as próximas perguntas."
      />
    </main>
  );
}
