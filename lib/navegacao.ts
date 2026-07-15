import {
  ClipboardList,
  History,
  LayoutDashboard,
  Package,
  Users,
  ArrowLeftRight,
  ShieldCheck,
  FileBarChart2,
  type LucideIcon,
} from 'lucide-react';

export type Permissao = 'verAuditoria' | 'gerenciarUsuarios' | 'verRelatorios' | null;

export interface LinkNavegacao {
  href: string;
  label: string;
  descricao: string;
  icon: LucideIcon;
  permissao: Permissao;
}

export interface SecaoNavegacao {
  titulo: string;
  links: LinkNavegacao[];
}

// Fonte única da navegação do app: usada pela Sidebar (desktop), pelo menu
// mobile e pela tela institucional de boas-vindas ("acesso rápido"). Manter
// em um só lugar evita que as três listas fiquem divergentes.
export const SECOES_NAVEGACAO: SecaoNavegacao[] = [
  {
    titulo: 'Visão geral',
    links: [
      {
        href: '/dashboard',
        label: 'Dashboard',
        descricao: 'Indicadores e visão executiva do estoque',
        icon: LayoutDashboard,
        permissao: null,
      },
    ],
  },
  {
    titulo: 'Operação',
    links: [
      {
        href: '/contagem',
        label: 'Contagem',
        descricao: 'Conferência de saldo produto a produto',
        icon: ClipboardList,
        permissao: null,
      },
      {
        href: '/movimentacao',
        label: 'Entrada / Saída',
        descricao: 'Lançamento de movimentações de estoque',
        icon: ArrowLeftRight,
        permissao: null,
      },
      {
        href: '/historico',
        label: 'Histórico',
        descricao: 'Linha do tempo de todas as movimentações',
        icon: History,
        permissao: null,
      },
    ],
  },
  {
    titulo: 'Cadastro',
    links: [
      {
        href: '/produtos',
        label: 'Produtos',
        descricao: 'Cadastro e manutenção de itens de estoque',
        icon: Package,
        permissao: null,
      },
    ],
  },
  {
    titulo: 'Gestão',
    links: [
      {
        href: '/relatorios',
        label: 'Relatórios',
        descricao: 'Relatórios gerenciais e valorização de estoque',
        icon: FileBarChart2,
        permissao: 'verRelatorios',
      },
      {
        href: '/auditoria',
        label: 'Auditoria',
        descricao: 'Trilha de alterações de cadastro do sistema',
        icon: ShieldCheck,
        permissao: 'verAuditoria',
      },
      {
        href: '/usuarios',
        label: 'Usuários',
        descricao: 'Gestão de contas e permissões de acesso',
        icon: Users,
        permissao: 'gerenciarUsuarios',
      },
    ],
  },
];

// Lista plana (sem seções), usada pelo menu mobile.
export const LINKS_NAVEGACAO: LinkNavegacao[] = SECOES_NAVEGACAO.flatMap((s) => s.links);
