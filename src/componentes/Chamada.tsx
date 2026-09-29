// Chamada do fim das páginas internas: texto à esquerda, logo de partículas à direita.
export function Chamada({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <section className="chamada" aria-labelledby="chamada-titulo" data-forma="logo" data-forma-lado="direita">
      <div className="chamada__texto">
        <p className="rotulo">Próximo passo</p>
        <h2 id="chamada-titulo" className="secao__titulo">
          {titulo}
        </h2>
        <p>{texto}</p>
        <a className="botao" href="/#contato">
          Pedir orçamento
        </a>
      </div>
    </section>
  );
}
