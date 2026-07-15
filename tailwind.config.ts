import type { Config } from 'tailwindcss';

// ─────────────────────────────────────────────────────────────────────────────
// Design system corporativo — tema claro industrial (verde de fábrica).
//
// IMPORTANTE: os nomes dos tokens (base-50…950, action, positive, warning,
// critical, sidebar, chart) foram mantidos de propósito — são usados em
// dezenas de pontos do app. Apenas os VALORES foram redefinidos para o novo
// tema claro, então toda a interface herda a nova identidade automaticamente,
// sem precisar editar className por className. Isso preserva 100% da lógica
// existente.
//
// base-50   → fundo de página (claro)
// base-100  → fundo sutil / hover
// base-200  → bordas
// base-800  → texto secundário (usado com opacidade /50 /60 /70)
// base-900  → texto terciário forte
// base-950  → texto principal (quase preto)
// surface   → fundo de cards/painéis (branco)
// sidebar   → menu lateral em verde corporativo escuro (identidade da marca)
// action    → verde principal (botões, links, destaques)
// ─────────────────────────────────────────────────────────────────────────────
const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './features/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        base: {
          50: '#F5F7F6',
          100: '#EBEFEC',
          200: '#DCE3DF',
          800: '#57645D',
          900: '#33403A',
          950: '#152019',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          raised: '#FFFFFF',
          hover: '#F1F5F2',
          border: '#E1E7E3',
        },
        sidebar: {
          DEFAULT: '#0E3B27',
          hover: '#155038',
          active: '#1C6B47',
          border: 'rgba(255,255,255,0.08)',
        },
        action: {
          DEFAULT: '#157A42',
          hover: '#106536',
          soft: 'rgba(21,122,66,0.10)',
          contrast: '#FFFFFF',
        },
        accent: {
          DEFAULT: '#0F766E',
          soft: 'rgba(15,118,110,0.10)',
        },
        positive: {
          DEFAULT: '#15803D',
          bg: 'rgba(21,128,61,0.10)',
        },
        warning: {
          DEFAULT: '#B45309',
          bg: 'rgba(180,83,9,0.10)',
        },
        critical: {
          DEFAULT: '#C0292C',
          bg: 'rgba(192,41,44,0.10)',
        },
        chart: {
          1: '#157A42',
          2: '#0F766E',
          3: '#65A30D',
          4: '#B45309',
          5: '#0E7490',
          6: '#7C6A0A',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'monospace'],
      },
      fontSize: {
        key: ['1.75rem', { lineHeight: '1', fontWeight: '600' }],
        display: ['2.25rem', { lineHeight: '1.15', fontWeight: '700' }],
      },
      spacing: {
        touch: '4.5rem',
        sidebar: '17rem',
        'sidebar-collapsed': '4.75rem',
      },
      boxShadow: {
        panel: '0 1px 2px rgba(21,32,25,0.06), 0 1px 0 rgba(255,255,255,0.6) inset',
        elevated: '0 12px 28px -10px rgba(21,32,25,0.16), 0 1px 0 rgba(255,255,255,0.6) inset',
        glow: '0 0 0 1px rgba(21,122,66,0.30), 0 4px 16px -4px rgba(21,122,66,0.25)',
      },
      keyframes: {
        'fade-in': { '0%': { opacity: '0', transform: 'translateY(4px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        'scale-in': { '0%': { opacity: '0', transform: 'scale(0.97)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
        shimmer: { '0%': { backgroundPosition: '-400px 0' }, '100%': { backgroundPosition: '400px 0' } },
      },
      animation: {
        'fade-in': 'fade-in 0.25s ease-out',
        'scale-in': 'scale-in 0.18s ease-out',
        shimmer: 'shimmer 1.6s linear infinite',
      },
      backgroundImage: {
        'grid-fade': 'radial-gradient(circle at top left, rgba(21,122,66,0.07), transparent 45%)',
      },
    },
  },
  plugins: [],
};

export default config;
