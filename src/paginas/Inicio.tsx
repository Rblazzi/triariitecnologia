import { Fragment, useEffect, useRef } from 'react';
import { CartaoServico, ListaEtapas, ListaSituacoes } from '../componentes/Blocos';
import { SimboloTriarii } from '../componentes/LogoTriarii';
import { CONTATO, ETAPAS, SERVICOS, SITUACOES } from '../dados/conteudo';
import { executarAbertura } from '../efeitos/abertura';
import { estado } from '../efeitos/estado';
import { iniciarFormacao } from '../efeitos/formacao';
import { iniciarFormulario } from '../efeitos/formulario';
import { iniciarSelo } from '../efeitos/selo';

// Palavras do título, cada uma numa máscara para subir de baixo na entrada.
const TITULO = ['A', 'linha', 'que', 'segura', 'o', 'projeto', 'quando', 'ele'];

export function Inicio() {
  const formacao = useRef<HTMLDivElement>(null);
  const selo = useRef<HTMLDivElement>(null);
  const form = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const { reduzido, lenis } = estado;
    if (lenis && document.documentElement.classList.contains('tem-abertura')) lenis.stop();
    executarAbertura({ reduzido, aoTerminar: () => estado.lenis?.start() });

    const desligar: (() => void)[] = [];
    if (formacao.current) desligar.push(iniciarFormacao(formacao.current));
    if (selo.current && !reduzido) desligar.push(iniciarSelo(selo.current, lenis));
    if (form.current) iniciarFormulario(form.current);
    return () => desligar.forEach((d) => d());
  }, []);

  return (
    <main id="conteudo">
      <section className="hero" aria-labelledby="hero-titulo" data-forma="formacao">
        <div className="hero__texto">
          <p className="rotulo">Res ad triarios rediit</p>
          <h1 id="hero-titulo" className="hero__titulo" aria-label="A linha que segura o projeto quando ele aperta.">
            {TITULO.map((palavra) => (
              <Fragment key={palavra}>
                <span className="palavra" aria-hidden="true">
                  <span>{palavra}</span>
                </span>{' '}
              </Fragment>
            ))}
            <span className="palavra" aria-hidden="true">
              <span className="destaque">aperta.</span>
            </span>
          </h1>
          <div className="hero__lado">
            <div className="selo" ref={selo} aria-hidden="true">
              <svg className="selo__texto" viewBox="0 0 120 120">
                <defs>
                  <path id="selo-circulo" d="M60,60 m-47,0 a47,47 0 1,1 94,0 a47,47 0 1,1 -94,0" />
                </defs>
                <text>
                  <textPath href="#selo-circulo" textLength="292" lengthAdjust="spacing">
                    Res ad triarios rediit • Triarii Tecnologia •
                  </textPath>
                </text>
              </svg>
              <SimboloTriarii className="selo__centro" />
            </div>
            <p className="hero__lead">
              Desenvolvimento, infraestrutura, dados e consultoria para empresas que não podem parar.
              Entramos no começo ou no meio do caminho e ficamos até entregar.
            </p>
            <div className="hero__acoes">
              <a className="botao" href="#contato">
                Pedir orçamento
              </a>
              <a className="link-seta" href="#servicos">
                Conhecer os serviços
              </a>
            </div>
          </div>
        </div>

        <figure className="formacao" aria-label="Ilustração de um deploy em três etapas: build, testes e publicação">
          <div className="formacao__campo" ref={formacao} aria-hidden="true" />
          <figcaption className="formacao__legenda">
            <span className="formacao__status" aria-hidden="true">
              <span className="ponto" />
              <span className="formacao__prompt">$ triarii deploy --prod</span>
              <span data-deploy-status>no ar · deploy concluído</span>
            </span>
            <span>Da primeira linha de código ao sistema no ar.</span>
          </figcaption>
        </figure>
      </section>

      <section id="servicos" className="servicos" aria-labelledby="servicos-titulo" data-forma="nucleos">
        <div className="secao__cabeca">
          <p className="rotulo rotulo--claro">O que fazemos</p>
          <h2 id="servicos-titulo" className="secao__titulo">
            Quatro frentes, uma equipe que conversa entre si.
          </h2>
          <a className="link-mais" href="/servicos">
            Ver os serviços em detalhe
          </a>
        </div>
        <div className="servicos__grade">
          {SERVICOS.map((s) => (
            <CartaoServico key={s.tag} servico={s} />
          ))}
        </div>
      </section>

      <section id="situacoes" className="situacoes" aria-labelledby="situacoes-titulo" data-forma="caos">
        <div className="secao__cabeca">
          <p className="rotulo">Quando costumam nos chamar</p>
          <h2 id="situacoes-titulo" className="secao__titulo">
            Talvez você já tenha dito uma destas.
          </h2>
          <a className="link-mais" href="/quando-nos-chamar">
            Ver mais situações
          </a>
        </div>
        <ListaSituacoes situacoes={SITUACOES.filter((s) => s.naHome)} />
      </section>

      <section id="processo" className="processo" aria-labelledby="processo-titulo" data-forma="linha">
        <div className="secao__cabeca">
          <p className="rotulo">Como trabalhamos</p>
          <h2 id="processo-titulo" className="secao__titulo">
            Do diagnóstico à sustentação.
          </h2>
          <a className="link-mais" href="/como-trabalhamos">
            Ver cada etapa em detalhe
          </a>
        </div>
        <ListaEtapas etapas={ETAPAS} />
      </section>

      <section id="nome" className="nome" aria-labelledby="nome-titulo" data-forma="circuito">
        <p className="rotulo">Por que Triarii</p>
        <h2 id="nome-titulo" className="nome__titulo">
          Na legião romana, os triários eram a terceira linha.
        </h2>
        <div className="nome__texto">
          <p>
            Os soldados mais experientes ficavam no fundo da formação e só avançavam quando a batalha
            apertava. Daí o ditado <em>res ad triarios rediit</em>: “chegou a vez dos triários”.
          </p>
          <p>
            É esse o papel que queremos ter no seu projeto. Menos promessa na apresentação, mais
            presença quando o problema aparece.
          </p>
          <a className="link-mais" href="/sobre">
            Conhecer a Triarii
          </a>
        </div>
      </section>

      <section id="contato" className="contato" aria-labelledby="contato-titulo" data-forma="logo">
        <div className="contato__intro">
          <p className="rotulo rotulo--claro">Contato</p>
          <h2 id="contato-titulo" className="secao__titulo">
            Conte o que está acontecendo.
          </h2>
          <p>
            Um parágrafo basta. Respondemos em até um dia útil com as próximas perguntas ou uma
            proposta de conversa.
          </p>
          <ul className="contato__canais">
            <li>
              <a href={`mailto:${CONTATO.email}`}>{CONTATO.email}</a>
            </li>
            <li>
              <a href={CONTATO.whatsapp} rel="noopener">
                WhatsApp
              </a>
            </li>
          </ul>
        </div>

        <form className="form" ref={form} noValidate>
          <div className="campo">
            <label htmlFor="f-nome">Seu nome</label>
            <input id="f-nome" name="nome" autoComplete="name" required />
            <p className="campo__erro" data-erro-para="nome" />
          </div>
          <div className="campo">
            <label htmlFor="f-empresa">Empresa</label>
            <input id="f-empresa" name="empresa" autoComplete="organization" />
          </div>
          <div className="campo">
            <label htmlFor="f-email">E-mail</label>
            <input id="f-email" name="email" type="email" autoComplete="email" required />
            <p className="campo__erro" data-erro-para="email" />
          </div>
          <div className="campo">
            <label htmlFor="f-servico">Assunto</label>
            <select id="f-servico" name="servico">
              {SERVICOS.map((s) => (
                <option key={s.tag}>{s.nome}</option>
              ))}
              <option>Ainda não sei</option>
            </select>
          </div>
          <div className="campo campo--largo">
            <label htmlFor="f-mensagem">O que está acontecendo?</label>
            <textarea id="f-mensagem" name="mensagem" rows={5} required />
            <p className="campo__erro" data-erro-para="mensagem" />
          </div>
          <div className="form__rodape">
            <button className="botao" type="submit">
              Enviar mensagem
            </button>
            <p className="form__status" role="status" data-status />
            <p className="form__aviso">
              Usamos seus dados só para responder a este contato. Veja a{' '}
              <a href="/privacidade">política de privacidade</a>.
            </p>
          </div>
        </form>
      </section>
    </main>
  );
}
