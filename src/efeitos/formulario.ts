// Formulário de contato. Sem backend por enquanto: valida os campos e abre o
// programa de e-mail com a mensagem pronta. Para envio direto, troque `enviar`
// por um POST para um serviço como Formspree, Resend ou uma API própria.

const DESTINO = 'suporte.triarii@gmail.com';
const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Campo = 'nome' | 'email' | 'mensagem';

const MENSAGENS: Record<Campo, (valor: string) => string | null> = {
  nome: (v) => (v ? null : 'Informe seu nome.'),
  email: (v) => {
    if (!v) return 'Informe um e-mail para a resposta.';
    return EMAIL_VALIDO.test(v) ? null : 'Informe um e-mail válido, como nome@empresa.com.br.';
  },
  mensagem: (v) => (v ? null : 'Escreva em poucas linhas o que você precisa.'),
};

export function iniciarFormulario(form: HTMLFormElement): void {
  const status = form.querySelector<HTMLElement>('[data-status]');

  const mostrarErro = (campo: Campo, texto: string | null): void => {
    const input = form.elements.namedItem(campo) as HTMLInputElement | null;
    const erro = form.querySelector<HTMLElement>(`[data-erro-para="${campo}"]`);
    if (!input || !erro) return;
    erro.textContent = texto ?? '';
    input.setAttribute('aria-invalid', texto ? 'true' : 'false');
    if (texto) input.setAttribute('aria-describedby', erro.id || (erro.id = `erro-${campo}`));
    else input.removeAttribute('aria-describedby');
  };

  const validar = (dados: FormData): boolean => {
    let primeiroInvalido: Campo | null = null;
    (Object.keys(MENSAGENS) as Campo[]).forEach((campo) => {
      const texto = MENSAGENS[campo](String(dados.get(campo) ?? '').trim());
      mostrarErro(campo, texto);
      if (texto && !primeiroInvalido) primeiroInvalido = campo;
    });
    if (primeiroInvalido) {
      (form.elements.namedItem(primeiroInvalido) as HTMLElement).focus();
      return false;
    }
    return true;
  };

  const enviar = (dados: FormData): void => {
    const valor = (k: string) => String(dados.get(k) ?? '').trim();
    const assunto = `[Site] ${valor('servico')} — ${valor('empresa') || valor('nome')}`;
    const corpo = [
      `Nome: ${valor('nome')}`,
      `Empresa: ${valor('empresa') || '—'}`,
      `E-mail: ${valor('email')}`,
      `Assunto: ${valor('servico')}`,
      '',
      valor('mensagem'),
    ].join('\n');
    window.location.href = `mailto:${DESTINO}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;
  };

  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const dados = new FormData(form);
    if (!validar(dados)) {
      if (status) status.textContent = '';
      return;
    }
    enviar(dados);
    if (status) {
      status.textContent = `Mensagem pronta. Se o seu e-mail não abrir, escreva para ${DESTINO}.`;
    }
  });

  // Limpa o erro assim que a pessoa corrige o campo.
  form.addEventListener('input', (ev) => {
    const alvo = ev.target as HTMLInputElement;
    const campo = alvo.name as Campo;
    if (campo in MENSAGENS && alvo.getAttribute('aria-invalid') === 'true') {
      mostrarErro(campo, MENSAGENS[campo](alvo.value.trim()));
    }
  });
}
