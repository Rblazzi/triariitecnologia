// REVISAR: texto-base. Confirme com o jurídico e preencha os campos entre colchetes.
export function Privacidade() {
  return (
    <main id="conteudo" className="documento">
      <div className="documento__cabeca">
        <p className="rotulo">Documento</p>
        <h1 className="secao__titulo">Política de privacidade</h1>
        <p className="documento__data">Última atualização: [dd/mm/aaaa]</p>
      </div>

      <div className="documento__corpo">
        <section className="revelar">
          <h2>Quem somos</h2>
          <p>
            Este site é mantido pela Triarii Tecnologia, CNPJ [00.000.000/0000-00], com sede em
            [endereço]. Somos a controladora dos dados pessoais enviados por aqui, nos termos da Lei
            Geral de Proteção de Dados (Lei nº 13.709/2018).
          </p>
        </section>

        <section className="revelar">
          <h2>Quais dados coletamos</h2>
          <p>Pelo formulário de contato, coletamos apenas o que você preenche:</p>
          <ul>
            <li>nome;</li>
            <li>empresa (opcional);</li>
            <li>e-mail;</li>
            <li>assunto e mensagem.</li>
          </ul>
          <p>
            O site não usa cookies de rastreamento nem ferramentas de publicidade. Se isso mudar, esta
            política será atualizada antes.
          </p>
        </section>

        <section className="revelar">
          <h2>Para que usamos</h2>
          <p>
            Usamos seus dados só para responder ao seu contato e, se você quiser, preparar uma
            proposta. A base legal é o procedimento preliminar a um contrato, a seu pedido (art. 7º, V,
            da LGPD).
          </p>
          <p>Não vendemos, alugamos nem compartilhamos seus dados para fins de marketing.</p>
          <p>
            Para entregar a mensagem no nosso e-mail, o formulário usa o serviço Web3Forms, que atua só
            como intermediário do envio. As fontes e demais arquivos do site são servidos pelo próprio
            site, sem enviar seus dados a outros serviços.
          </p>
        </section>

        <section className="revelar">
          <h2>Por quanto tempo guardamos</h2>
          <p>
            Guardamos a conversa enquanto ela for necessária para o atendimento e por até [12 meses]
            depois do último contato, a não ser que exista um contrato entre nós ou uma obrigação legal
            que exija prazo maior.
          </p>
        </section>

        <section className="revelar">
          <h2>Seus direitos</h2>
          <p>A qualquer momento, você pode pedir para:</p>
          <ul>
            <li>confirmar se tratamos seus dados e acessá-los;</li>
            <li>corrigir dados incompletos ou desatualizados;</li>
            <li>excluir seus dados;</li>
            <li>saber com quem eles foram compartilhados, se for o caso.</li>
          </ul>
          <p>
            Para isso, escreva para{' '}
            <a href="mailto:suporte.triarii@gmail.com">suporte.triarii@gmail.com</a>. Respondemos em
            até 15 dias.
          </p>
        </section>

        <section className="revelar">
          <h2>Segurança</h2>
          <p>
            O site é servido por conexão criptografada (HTTPS), e o acesso às mensagens recebidas é
            restrito à equipe que faz o atendimento.
          </p>
        </section>
      </div>

      <a className="link-seta link-seta--voltar" href="/">
        Voltar para o início
      </a>
    </main>
  );
}
