// Informações institucionais do sistema, usadas na tela inicial de boas-vindas
// e em outros pontos que precisem exibir nome/versão/empresa de forma
// consistente. Centralizar aqui evita valores divergentes espalhados pelo app.

export const APP_NOME = 'Estoque ERP';
export const APP_NOME_COMPLETO = 'Estoque ERP · Gestão de Inventário Industrial';
export const APP_VERSAO = '2.0.0';
export const APP_DESCRICAO =
  'Plataforma corporativa para controle de estoque, contagem, movimentações e indicadores de produção, criada para uso diário no chão de fábrica.';

export const EMPRESA = {
  nome: 'Sua Empresa Ltda.',
  descricao: 'Indústria e distribuição',
  ano: new Date().getFullYear(),
};
