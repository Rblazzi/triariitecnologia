import { CartaoServico } from '../componentes/Blocos';
import { Chamada } from '../componentes/Chamada';
import { SERVICOS } from '../dados/conteudo';

export function Servicos() {
  return (
    <main id="conteudo">
      <section
        className="servicos servicos--pagina"
        aria-labelledby="pagina-titulo"
        data-forma="nucleos"
        data-forma-lado="direita"
      >
        <div className="secao__cabeca">
          <p className="rotulo rotulo--claro">Serviços</p>
          <h1 id="pagina-titulo" className="pagina__titulo">
            Quatro frentes, uma equipe que conversa entre si.
          </h1>
          <p className="pagina__lead">
            Você pode contratar uma frente só ou juntar várias no mesmo projeto. Quem desenvolve
            conversa com quem cuida da infraestrutura e dos dados, e isso aparece no resultado.
          </p>
        </div>
        <div className="servicos__grade">
          {SERVICOS.map((s) => (
            <CartaoServico key={s.tag} servico={s} detalhado />
          ))}
        </div>
      </section>

      <Chamada
        titulo="Não sabe qual frente precisa?"
        texto="Tudo bem. Conte o que está acontecendo e a gente ajuda a descobrir por onde começar."
      />
    </main>
  );
}
