/**
 * Paleta Novux "Ember" — traduzida de brand/tokens/colors.json.
 * Fonte única de verdade das cores; consumida via useTheme() (runtime dark/light).
 *
 * Mapeamento de papéis (mantém os nomes de token que o app já usa, para não
 * quebrar os componentes existentes):
 *   accent  = cor de AÇÃO primária da marca (laranja #FF6B2C) — botões, links, foco
 *   amber   = destaque quente/gold (streak, PR, "em andamento") = warning #FFC93C
 *   feedback= estados semânticos (success/warning/danger/info)
 *   gradient= laranja → magenta, o gesto de marca
 *
 * REGRA da marca: estado nunca é comunicado só por cor (sempre ícone + label),
 * e accent/gradient nunca em componentes de feedback (toast, badge de status).
 */

/** Modo resolvido (o que efetivamente pinta a tela) */
export type ThemeMode = 'dark' | 'light';

/** Preferência do usuário — 'system' segue o tema do aparelho */
export type ThemePreference = 'dark' | 'light' | 'system';

export interface ThemeColors {
  bg: {
    base: string;
    surface: string;
    card: string;
    elevated: string;
    overlay: string;
  };
  accent: {
    default: string;
    glow: string;
    dim: string;
    border: string;
    /** cor do texto/ícone sobre um fundo accent sólido */
    on: string;
  };
  /** segunda cor da marca (magenta) — usada pontualmente e nos gradientes */
  magenta: {
    default: string;
    dim: string;
    border: string;
  };
  amber: {
    default: string;
    dim: string;
    border: string;
  };
  feedback: {
    success: string;
    danger: string;
    warning: string;
    info: string;
    successDim: string;
    dangerDim: string;
  };
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    /** texto sobre fundo accent sólido (= accent.on) */
    inverse: string;
  };
  border: {
    default: string;
    subtle: string;
    strong: string;
  };
  /** [de, para] do gradiente da marca (laranja → magenta) */
  gradient: [string, string];
}

// ─── DARK (padrão) ───────────────────────────────────────────────────────────
const dark: ThemeColors = {
  bg: {
    base: '#050816',
    surface: '#0B1020',
    card: '#121933',
    elevated: '#1A2342',
    overlay: 'rgba(5,8,22,0.85)',
  },
  accent: {
    default: '#FF6B2C',
    glow: 'rgba(255,107,44,0.22)',
    dim: 'rgba(255,107,44,0.12)',
    border: 'rgba(255,107,44,0.30)',
    on: '#04081B',
  },
  magenta: {
    default: '#FF2D78',
    dim: 'rgba(255,45,120,0.12)',
    border: 'rgba(255,45,120,0.30)',
  },
  amber: {
    default: '#FFC93C',
    dim: 'rgba(255,201,60,0.12)',
    border: 'rgba(255,201,60,0.28)',
  },
  feedback: {
    success: '#19D38A',
    danger: '#E5484D',
    warning: '#FFC93C',
    info: '#4D9EFF',
    successDim: 'rgba(25,211,138,0.12)',
    dangerDim: 'rgba(229,72,77,0.12)',
  },
  text: {
    primary: '#F2F4F8',
    secondary: '#7D8CA1',
    tertiary: '#4A5578',
    inverse: '#04081B',
  },
  border: {
    default: 'rgba(255,255,255,0.07)',
    subtle: 'rgba(255,255,255,0.04)',
    strong: 'rgba(255,255,255,0.14)',
  },
  gradient: ['#FF6B2C', '#FF2D78'],
};

// ─── LIGHT ───────────────────────────────────────────────────────────────────
const light: ThemeColors = {
  bg: {
    base: '#F5F7FA',
    surface: '#FFFFFF',
    card: '#FFFFFF',
    elevated: '#EDEFF2',
    overlay: 'rgba(20,26,44,0.45)',
  },
  accent: {
    default: '#DD4C0E',
    glow: 'rgba(221,76,14,0.16)',
    dim: 'rgba(221,76,14,0.10)',
    border: 'rgba(221,76,14,0.28)',
    on: '#FFFFFF',
  },
  magenta: {
    default: '#D41155',
    dim: 'rgba(212,17,85,0.10)',
    border: 'rgba(212,17,85,0.28)',
  },
  amber: {
    default: '#C9840D',
    dim: 'rgba(201,132,13,0.12)',
    border: 'rgba(201,132,13,0.30)',
  },
  feedback: {
    success: '#1C9C6D',
    danger: '#CE272D',
    warning: '#C9840D',
    info: '#2563EB',
    successDim: 'rgba(28,156,109,0.12)',
    dangerDim: 'rgba(206,39,45,0.12)',
  },
  text: {
    primary: '#383E57',
    secondary: '#5C697A',
    tertiary: '#97A1B0',
    inverse: '#FFFFFF',
  },
  border: {
    default: '#D4DAE2',
    subtle: '#E7EAEF',
    strong: '#B7C0CC',
  },
  gradient: ['#DD4C0E', '#D41155'],
};

export const palettes: Record<ThemeMode, ThemeColors> = { dark, light };

/** Palette default (dark) — para usos estáticos que não reagem à troca de tema */
export const colors = dark;
