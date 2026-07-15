import type { PerfilUsuario, TipoMovimento } from '@prisma/client';

export type { PerfilUsuario, TipoMovimento };

export interface SessaoUsuario {
  id: string;
  nome: string;
  login: string;
  perfil: PerfilUsuario;
}

export interface ProdutoResumo {
  id: string;
  codigo: string;
  descricao: string;
  unidade: string;
  saldo: number;
  contagem: number | null;
  localizacao: string | null;
  categoria: string | null;
  fatorConversao?: number | null;
  unidadeConversao?: string | null;
}

export interface RegistrarMovimentoInput {
  produtoId: string;
  valor: number; // delta: +1, -0.5 etc.
  tipo: TipoMovimento;
  sessaoInventarioId?: string;
}

// Permissões por perfil. Centralizado aqui para nunca haver checagem divergente
// entre uma rota de API e outra.
export const PERMISSOES = {
  ADMINISTRADOR: {
    gerenciarUsuarios: true,
    editarProdutos: true,
    excluirProdutos: true,
    verAuditoria: true,
    importarExportar: true,
    registrarContagem: true,
    verRelatorios: true,
  },
  GERENTE: {
    gerenciarUsuarios: false,
    editarProdutos: true,
    excluirProdutos: false,
    verAuditoria: true,
    importarExportar: true,
    registrarContagem: true,
    verRelatorios: true,
  },
  ENCARREGADO: {
    gerenciarUsuarios: false,
    editarProdutos: false,
    excluirProdutos: false,
    verAuditoria: false,
    importarExportar: false,
    registrarContagem: true,
    verRelatorios: true,
  },
  OPERADOR: {
    gerenciarUsuarios: false,
    editarProdutos: false,
    excluirProdutos: false,
    verAuditoria: false,
    importarExportar: false,
    registrarContagem: true,
    verRelatorios: false,
  },
} as const satisfies Record<PerfilUsuario, Record<string, boolean>>;

// Rótulos e descrições exibidos na interface (gestão de usuários, badges, etc.)
export const ROTULO_PERFIL: Record<PerfilUsuario, string> = {
  ADMINISTRADOR: 'Administrador',
  GERENTE: 'Gerente',
  ENCARREGADO: 'Encarregado',
  OPERADOR: 'Operador',
};

export const DESCRICAO_PERFIL: Record<PerfilUsuario, string> = {
  ADMINISTRADOR: 'Acesso total: usuários, cadastro, auditoria e relatórios.',
  GERENTE: 'Gestão de cadastro, importação/exportação, auditoria e relatórios.',
  ENCARREGADO: 'Operação de contagem, entrada/saída e relatórios do setor.',
  OPERADOR: 'Operação de contagem e conferência no chão de fábrica.',
};

export function temPermissao(
  perfil: PerfilUsuario,
  permissao: keyof (typeof PERMISSOES)['ADMINISTRADOR']
): boolean {
  return PERMISSOES[perfil][permissao];
}
