// Formulário de contato.
// - Com VITE_WEB3FORMS_KEY definida (arquivo .env ou variável na hospedagem), a
//   mensagem é enviada direto para o e-mail de contato pelo Web3Forms, sem backend.
//   Crie a chave grátis em https://web3forms.com usando o e-mail que vai receber.
// - Sem a chave, abre o programa de e-mail da pessoa com a mensagem pronta.
// Proteções: campo-isca contra robôs, bloqueio de envio duplo, intervalo mínimo
// entre envios e limite de tamanho em todos os campos.

import { CONTATO } from '../dados/conteudo';

const CHAVE = import.meta.env.VITE_WEB3FORMS_KEY as string | undefined;
const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const INTERVALO_MS = 20_000;

type Campo = 'nome' | 'email' | 'mensagem';

const MENSAGENS: Record<Campo, (valor: string) => string | null> = {
  nome: (v) => (v ? null : 'Informe seu nome.'),
  email: (v) => {
    if (!v) return 'Informe um e-mail para a resposta.';
    return EMAIL_VALIDO.test(v) ? null : 'Informe um e-mail válido, como nome@empresa.com.br.';
  },
  mensagem: (v) => {
    if (!v) return 'Escreva em poucas linhas o que você precisa.';
    return v.length < 10 ? 'Conte um pouco mais: pelo menos uma frase.' : null;
  },
};

export function iniciarFormulario(form: HTMLFormElement): void {
  const status = form.querySelector<HTMLElement>('[data-status]');
  const botao = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  const textoBotao = botao?.textContent ?? 'Enviar mensagem';
  let ultimoEnvio = 0;

  const avisar = (texto: string, tipo: 'ok' | 'erro' | '' = ''): void => {
    if (!status) return;
    status.textContent = texto;
    status.dataset.tipo = tipo;
  };

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

  const valor = (dados: FormData, k: string) => String(dados.get(k) ?? '').trim();
  const assuntoDe = (dados: FormData) =>
    `[Site] ${valor(dados, 'servico')} — ${valor(dados, 'empresa') || valor(dados, 'nome')}`;

  const abrirEmail = (dados: FormData): void => {
    const corpo = [
      `Nome: ${valor(dados, 'nome')}`,
      `Empresa: ${valor(dados, 'empresa') || '—'}`,
      `E-mail: ${valor(dados, 'email')}`,
      `Assunto: ${valor(dados, 'servico')}`,
      '',
      valor(dados, 'mensagem'),
    ].join('\n');
    window.location.href = `mailto:${CONTATO.email}?subject=${encodeURIComponent(assuntoDe(dados))}&body=${encodeURIComponent(corpo)}`;
    avisar(`Mensagem pronta no seu programa de e-mail. Se ele não abrir, escreva para ${CONTATO.email}.`, 'ok');
  };

  const enviarDireto = async (dados: FormData): Promise<void> => {
    const resposta = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        access_key: CHAVE,
        subject: assuntoDe(dados),
        from_name: 'Site Triarii',
        replyto: valor(dados, 'email'),
        nome: valor(dados, 'nome'),
        empresa: valor(dados, 'empresa') || '—',
        email: valor(dados, 'email'),
        assunto: valor(dados, 'servico'),
        mensagem: valor(dados, 'mensagem'),
        botcheck: '',
      }),
    });
    const json = (await resposta.json().catch(() => ({}))) as { success?: boolean };
    if (!resposta.ok || !json.success) throw new Error('falha no envio');
  };

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    if (botao?.disabled) return;
    const dados = new FormData(form);

    // Campo-isca: invisível para pessoas; robôs costumam preenchê-lo.
    if (valor(dados, 'site')) return;

    if (!validar(dados)) {
      avisar('');
      return;
    }
    if (Date.now() - ultimoEnvio < INTERVALO_MS) {
      avisar('Sua mensagem acabou de ser enviada. Aguarde alguns segundos para mandar outra.', 'erro');
      return;
    }

    if (!CHAVE) {
      abrirEmail(dados);
      return;
    }

    if (botao) {
      botao.disabled = true;
      botao.textContent = 'Enviando…';
    }
    avisar('');
    try {
      await enviarDireto(dados);
      ultimoEnvio = Date.now();
      form.reset();
      avisar('Mensagem enviada. Respondemos no e-mail que você informou.', 'ok');
    } catch {
      avisar(`Não foi possível enviar agora. Tente de novo ou escreva para ${CONTATO.email}.`, 'erro');
    } finally {
      if (botao) {
        botao.disabled = false;
        botao.textContent = textoBotao;
      }
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
