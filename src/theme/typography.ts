/**
 * Sistema tipográfico Novux (brand/tokens/typography.json).
 *
 *   Syne     — marca / títulos de página. Wordmark e headlines. Nunca texto corrido.
 *   Poppins  — UI / body. Interface inteira: labels, parágrafos, botões, navegação.
 *   Outfit   — números / métricas. Valores grandes de KPI (carga, séries, volume).
 *   Fira Code— monospace. Números inline que alinham em coluna, IDs.
 *
 * Os papéis abaixo mapeiam para os nomes já usados no app (display/h1/.../label),
 * então os componentes existentes não mudam de API — só de fonte.
 */

// Nomes das fontes conforme registrados no useFonts (app/_layout.tsx)
export const fonts = {
  // Syne — marca
  brand:        'Syne_800ExtraBold',
  brandBold:    'Syne_700Bold',
  // Poppins — UI
  light:        'Poppins_300Light',
  regular:      'Poppins_400Regular',
  medium:       'Poppins_500Medium',
  semiBold:     'Poppins_600SemiBold',
  bold:         'Poppins_700Bold',
  extraBold:    'Poppins_800ExtraBold',
  // Outfit — números/KPI
  numRegular:   'Outfit_400Regular',
  numSemiBold:  'Outfit_600SemiBold',
  numBold:      'Outfit_700Bold',
  numExtraBold: 'Outfit_800ExtraBold',
  // Fira Code — mono
  mono:         'FiraCode_500Medium',
} as const;

export const typography = {
  // Título de marca / hero (Syne) — uso pontual: telas de marca, splash, headline
  display: {
    fontFamily: fonts.brand,
    fontSize: 48,
    lineHeight: 50,
    letterSpacing: -1,
  },
  // Títulos de página (Poppins bold, tracking negativo como no brandbook)
  h1: {
    fontFamily: fonts.bold,
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.6,
  },
  h2: {
    fontFamily: fonts.bold,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.4,
  },
  h3: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: -0.3,
  },
  subheading: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.1,
  },
  body: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 22,
    letterSpacing: 0,
  },
  bodySmall: {
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 18,
    letterSpacing: 0,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 1.5,
    textTransform: 'uppercase' as const,
  },
  labelSmall: {
    fontFamily: fonts.medium,
    fontSize: 9,
    lineHeight: 14,
    letterSpacing: 2,
    textTransform: 'uppercase' as const,
  },
  caption: {
    fontFamily: fonts.light,
    fontSize: 12,
    lineHeight: 18,
    letterSpacing: 0,
  },

  // ── Papéis numéricos (Outfit) — para KPIs e valores de treino ──
  metric: {
    fontFamily: fonts.numBold,
    fontSize: 40,
    lineHeight: 44,
    letterSpacing: -1,
  },
  metricSmall: {
    fontFamily: fonts.numSemiBold,
    fontSize: 22,
    lineHeight: 26,
    letterSpacing: -0.5,
  },
  mono: {
    fontFamily: fonts.mono,
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0,
  },

  weights: {
    light:     fonts.light,
    regular:   fonts.regular,
    medium:    fonts.medium,
    semiBold:  fonts.semiBold,
    bold:      fonts.bold,
    extraBold: fonts.extraBold,
  },
} as const;
