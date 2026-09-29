/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Chave do Web3Forms para o formulário enviar direto por e-mail (opcional).
  readonly VITE_WEB3FORMS_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
