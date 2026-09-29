import { GradePrincipios, ListaSituacoes } from '../componentes/Blocos';
import { Chamada } from '../componentes/Chamada';
import { COMO_ENTRAMOS, SITUACOES } from '../dados/conteudo';

export function QuandoNosChamar() {
  return (
    <main id="conteudo">
      <section className="situacoes" aria-labelledby="pagina-titulo" data-forma="caos">
        <div className="secao__cabeca">
          <p className="rotulo">Quando nos chamar</p>
          <h1 id="pagina-titulo" className="pagina__titulo">
            Talvez você já tenha dito uma destas.
          </h1>
          <p className="pagina__lead">
            Quase ninguém chama a gente quando tudo vai bem. Estas são as situações mais comuns, e o
            que fazemos em cada uma.
          </p>
        </div>
        <ListaSituacoes situacoes={SITUACOES} />
      </section>

      <section className="principios" aria-labelledby="entrada-titulo" data-forma="circuito">
        <div className="secao__cabeca">
          <p className="rotulo">Como a gente entra</p>
          <h2 id="entrada-titulo" className="secao__titulo">
            Primeiro entender, depois mexer.
          </h2>
        </div>
        <GradePrincipios itens={COMO_ENTRAMOS} />
      </section>

      <Chamada
        titulo="Reconheceu a sua situação?"
        texto="Conte o que está acontecendo. Um parágrafo basta para a gente começar."
      />
    </main>
  );
}
