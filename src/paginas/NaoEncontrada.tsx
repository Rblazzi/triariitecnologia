export function NaoEncontrada() {
  return (
    <main id="conteudo" className="documento">
      <div className="documento__cabeca">
        <p className="rotulo">Erro 404</p>
        <h1 className="pagina__titulo">Esta página não existe.</h1>
        <p className="pagina__lead">
          O endereço pode ter mudado ou ter sido digitado errado. Volte para o início ou fale com a
          gente.
        </p>
      </div>
      <div className="hero__acoes">
        <a className="botao" href="/">
          Voltar para o início
        </a>
        <a className="link-seta link-seta--voltar" href="/#contato">
          Falar com a Triarii
        </a>
      </div>
    </main>
  );
}
