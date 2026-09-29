import { GradePrincipios } from '../componentes/Blocos';
import { Chamada } from '../componentes/Chamada';
import { NO_QUE_ACREDITAMOS } from '../dados/conteudo';

export function Sobre() {
  return (
    <main id="conteudo">
      <section className="nome nome--pagina" aria-labelledby="pagina-titulo" data-forma="circuito">
        <p className="rotulo">Sobre a Triarii</p>
        <h1 id="pagina-titulo" className="pagina__titulo">
          Na legião romana, os triários eram a terceira linha.
        </h1>
        <div className="nome__texto">
          <p>
            A formação romana tinha três linhas. Os <em>hastati</em>, mais jovens, abriam o combate.
            Os <em>principes</em> vinham logo atrás. E os <em>triarii</em>, os veteranos, esperavam no
            fundo.
          </p>
          <p>
            Quando as duas primeiras linhas não davam conta, a terceira avançava. Daí o ditado{' '}
            <em>res ad triarios rediit</em>: “chegou a vez dos triários”.
          </p>
          <p>
            É esse o papel que queremos ter no seu projeto. Menos promessa na apresentação, mais
            presença quando o problema aparece.
          </p>
          <p>
            Por isso o nosso logo é a própria formação: duas linhas de contorno e uma terceira, sólida,
            embaixo.
          </p>
        </div>
      </section>

      <section className="principios" aria-labelledby="principios-titulo" data-forma="formacao">
        <div className="secao__cabeca">
          <p className="rotulo">No que acreditamos</p>
          <h2 id="principios-titulo" className="secao__titulo">
            Três ideias que guiam o trabalho.
          </h2>
        </div>
        <GradePrincipios itens={NO_QUE_ACREDITAMOS} />
      </section>

      <Chamada
        titulo="Chegou a vez da terceira linha?"
        texto="Conte o que está acontecendo. A gente responde em até um dia útil."
      />
    </main>
  );
}
