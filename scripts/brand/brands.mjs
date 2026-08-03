/**
 * NOVUX — Definição de marca (fonte da verdade)
 *
 * Regras de família:
 *  - A logo (lettermark "N") é IDÊNTICA nas duas marcas. Só o gradiente muda.
 *  - Os neutros (background/surface/card/elevated/border/foreground) são IDÊNTICOS.
 *    É isso que faz Finance e Forge se lerem como a mesma marca.
 *  - A tipografia é IDÊNTICA.
 *  - O que muda: o par primary/accent e, por consequência, os estados que colidiriam.
 *
 * ── Sobre os tokens `-text` ─────────────────────────────────────────────
 * Cor de marca serve a dois usos com exigências diferentes de contraste:
 *
 *   FILL  (fundo de botão, badge, barra de gráfico) — limiar 3:1, e o texto
 *         por cima usa o `-foreground` correspondente. As cores de marca
 *         atendem isso e ficam INTACTAS.
 *   TEXTO (link, valor de KPI, label colorido) — limiar 4.5:1 contra a
 *         superfície. Aqui as cores de marca falham, com folga: no light,
 *         o cyan do Finance rende 2.52:1 e o warning 2.14:1.
 *
 * Forçar as cores de marca a 4.5:1 descaracterizaria a paleta (o âmbar viraria
 * marrom). Então cada cor semântica ganha um par `-text`, escurecido no light e
 * clareado no dark até passar em TODAS as superfícies do modo.
 *
 * REGRA: cor de marca preenche; token `-text` escreve.
 *   ✓ background: hsl(var(--primary));  color: hsl(var(--primary-foreground))
 *   ✓ color: hsl(var(--success-text))            → "+R$ 1.240,00"
 *   ✗ color: hsl(var(--success))                 → ilegível no light
 *
 * O pior caso NÃO é o mesmo nos dois modos: no dark é `elevated` (#1A2342),
 * no light é `secondary` (#E7EAEF) — não o card branco, que é o melhor caso.
 */

import { hexToHslExact, hslToHex, deriveTextColor } from './color.mjs'

// ── Tipografia compartilhada ────────────────────────────────────────────
export const TYPOGRAPHY = {
  googleFontsUrl:
    'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700;800&family=Syne:wght@700;800;900&family=Outfit:wght@400;600;700;800&family=Fira+Code:wght@400;500;600&display=swap',
  roles: [
    {
      role: 'Branding / Títulos',
      family: 'Syne',
      stack: "'Syne', 'Poppins', sans-serif",
      weights: [700, 800, 900],
      usage: 'Wordmark, page titles, headlines de marketing. Nunca em texto corrido.',
      sample: 'NOVUX',
      previewSize: 44,
      previewWeight: 800,
      previewTracking: '0.02em',
    },
    {
      role: 'UI / Body',
      family: 'Poppins',
      stack: "'Poppins', 'Inter', system-ui, sans-serif",
      weights: [300, 400, 500, 600, 700, 800, 900],
      usage: 'Interface inteira: labels, parágrafos, botões, navegação. É a voz padrão.',
      sample: 'Progresso consistente vale mais que intensidade esporádica.',
      previewSize: 18,
      previewWeight: 400,
      previewTracking: '0',
    },
    {
      role: 'Números / Métricas',
      family: 'Outfit',
      stack: "'Outfit', 'Poppins', sans-serif",
      weights: [400, 600, 700, 800],
      usage: 'Valores grandes de KPI. Finance: saldos. Forge: carga, séries, volume.',
      sample: '12.480',
      previewSize: 40,
      previewWeight: 700,
      previewTracking: '-0.02em',
    },
    {
      role: 'Monospace',
      family: 'Fira Code',
      stack: "'Fira Code', 'Courier New', monospace",
      weights: [400, 500, 600],
      usage: 'Números inline que precisam alinhar em coluna, IDs, código.',
      sample: 'R$ 1.240,00  ·  3×12 @ 80kg',
      previewSize: 15,
      previewWeight: 400,
      previewTracking: '0',
    },
    {
      role: 'Fallback',
      family: 'Inter',
      stack: "'Inter', system-ui, sans-serif",
      weights: [300, 400, 500, 600, 700, 800],
      usage: 'Substitui Poppins onde ela não carregar. Não usar deliberadamente.',
      sample: 'Fallback universal',
      previewSize: 18,
      previewWeight: 400,
      previewTracking: '0',
    },
  ],
}

// ── Neutros compartilhados (dark) ───────────────────────────────────────
// Onde o brand book do Finance documenta um hex canônico, o HEX é a fonte da
// verdade e o HSL é derivado dele (ver nota de reconciliação no fim do arquivo).
// Onde não há hex documentado, o HSL do index.css é mantido como está.
const NEUTRALS_DARK = {
  background: '#050816',
  foreground: [214, 32, 96],
  card: '#121933',
  'card-foreground': [214, 32, 96],
  popover: '#121933',
  'popover-foreground': [214, 32, 96],
  secondary: [228, 42, 17],
  'secondary-foreground': [215, 20, 70],
  muted: [228, 38, 19],
  // 56%, não os 48% do Finance: em 48% o texto secundário fica em 3.38:1 contra
  // a superfície elevated, bem abaixo do AA. 56% é o mínimo que passa 4.5:1
  // contra background, card E elevated.
  'muted-foreground': [215, 16, 56],
  border: [228, 35, 20],
  input: [228, 35, 20],
}

const NEUTRALS_LIGHT = {
  background: [214, 32, 97],
  foreground: [228, 22, 28],
  card: [0, 0, 100],
  'card-foreground': [228, 22, 28],
  popover: [0, 0, 100],
  'popover-foreground': [228, 22, 28],
  secondary: [215, 20, 92],
  'secondary-foreground': [228, 30, 30],
  muted: [215, 18, 94],
  // 42%, não os 46% do Finance: o pior caso no light é a superfície `secondary`
  // (#E7EAEF), não o card branco. Em 46% dá 4.00:1; 42% leva a 4.64:1.
  'muted-foreground': [215, 14, 42],
  border: [215, 20, 86],
  input: [215, 20, 86],
}

// Superfícies nomeadas do brand book (hex canônicos documentados no Finance).
const SURFACES = {
  background: '#050816',
  surface: '#0B1020',
  card: '#121933',
  elevated: '#1A2342',
  // Fundo do contêiner da logo. Estes dois hex vêm do icon.svg original do
  // Finance — é o backdrop validado do ícone, e é NEUTRO, portanto idêntico
  // nas duas marcas. Só o "N" por cima muda de cor.
  logoBackdropFrom: '#0B1020',
  logoBackdropTo: '#0F1735',
}

/** Cores semânticas que ganham uma variante `-text` derivada. */
const SEMANTIC_KEYS = ['primary', 'accent', 'success', 'warning', 'destructive']

/**
 * Normaliza uma marca:
 *  1. converte todo valor em hex para HSL exato (round-trip garantido);
 *  2. deriva os tokens `-text` a partir das cores semânticas já normalizadas.
 *
 * Derivar em vez de fixar à mão significa que mudar uma cor de marca propaga
 * para a variante de texto automaticamente — elas nunca saem de sincronia.
 */
function normalize(brand) {
  for (const mode of ['dark', 'light']) {
    const palette = Object.fromEntries(
      Object.entries(brand[mode]).map(([k, v]) => [k, typeof v === 'string' ? hexToHslExact(v) : v]),
    )

    // Superfícies onde texto colorido pode aparecer. Diferem por modo: no dark
    // a pior é `elevated`, no light é `secondary`.
    const surfaces =
      mode === 'dark'
        ? [hslToHex(palette.background), brand.surfaces.card, brand.surfaces.elevated]
        : [
            hslToHex(palette.background),
            hslToHex(palette.card),
            hslToHex(palette.secondary),
            hslToHex(palette.muted),
          ]

    for (const k of SEMANTIC_KEYS) {
      if (palette[k]) palette[`${k}-text`] = deriveTextColor(palette[k], surfaces, mode)
    }
    brand[mode] = palette
  }
  return brand
}

export const BRANDS = {
  finance: {
    id: 'finance',
    name: 'Novux Finance',
    wordmarkSuffix: 'FINANCE',
    tagline: 'Finanças pessoais com clareza',
    outDir: 'c:/all/novux-finance/brand',
    sharedWith: ['Novux Mobile (c:/all/novux-mobile) — mesmo produto, mesma marca'],
    // Gradiente do lettermark
    gradient: { from: '#16C7FF', to: '#8B5CF6' },
    dark: {
      ...NEUTRALS_DARK,
      primary: '#16C7FF',
      'primary-foreground': [228, 75, 6],
      accent: '#8B5CF6',
      'accent-foreground': [228, 75, 6],
      success: '#19D38A',
      'success-foreground': [228, 75, 6],
      warning: '#F59E0B',
      'warning-foreground': [30, 80, 8],
      destructive: '#FF5A5F',
      'destructive-foreground': [0, 0, 100],
      ring: '#16C7FF',
    },
    light: {
      ...NEUTRALS_LIGHT,
      primary: [193, 100, 40],
      'primary-foreground': [0, 0, 100],
      accent: [258, 70, 58],
      'accent-foreground': [0, 0, 100],
      success: [158, 70, 36],
      'success-foreground': [0, 0, 100],
      warning: [38, 88, 46],
      'warning-foreground': [30, 80, 8],
      destructive: [358, 85, 55],
      'destructive-foreground': [0, 0, 100],
      ring: [193, 100, 40],
    },
    surfaces: SURFACES,
    notes: [
      'Paleta VALIDADA — não alterar sem decisão de marca.',
      'Extraída de novux-finance/src/index.css e public/icon.svg.',
      'O Novux Mobile consome esta mesma identidade.',
    ],
  },

  forge: {
    id: 'forge',
    name: 'Novux Forge',
    wordmarkSuffix: 'FORGE',
    tagline: 'Treino sem achismo',
    outDir: 'c:/all/Novux Forge/brand',
    sharedWith: [],
    gradient: { from: '#FF6B2C', to: '#FF2D78' },
    dark: {
      ...NEUTRALS_DARK,
      primary: '#FF6B2C', //  ember
      'primary-foreground': [228, 75, 6],
      accent: '#FF2D78', //  magenta
      'accent-foreground': [0, 0, 100],
      success: '#19D38A', //  herdado do Finance
      'success-foreground': [228, 75, 6],
      warning: '#FFC93C', //  amarelo — afastado do laranja da marca
      'warning-foreground': [30, 80, 8],
      destructive: '#E5484D', //  vermelho dessaturado — separa da marca por croma
      'destructive-foreground': [0, 0, 100],
      ring: '#FF6B2C',
    },
    light: {
      ...NEUTRALS_LIGHT,
      primary: [18, 88, 46],
      'primary-foreground': [0, 0, 100],
      accent: [339, 85, 45],
      'accent-foreground': [0, 0, 100],
      success: [158, 70, 36],
      'success-foreground': [0, 0, 100],
      warning: [38, 88, 42],
      'warning-foreground': [0, 0, 100],
      destructive: [358, 68, 48],
      'destructive-foreground': [0, 0, 100],
      ring: [18, 88, 46],
    },
    surfaces: SURFACES,
    notes: [
      'Direção "Ember": laranja → magenta. Oposto cromático do cyan/roxo do Finance.',
      'ATENÇÃO — a marca ocupa a faixa quente, que é onde normalmente vivem warning e danger.',
      'Por isso warning foi deslocado para amarelo puro (#FFC93C) e danger para um vermelho',
      'dessaturado (#E5484D): a separação se dá por croma, não só por matiz.',
      'REGRA: no Forge, estado nunca é comunicado só por cor — sempre ícone + label junto.',
      'REGRA: primary/accent jamais em componentes de feedback (toast, alert, badge de status).',
    ],
  },
}

// Normaliza no ponto de exportação: a partir daqui todo consumidor vê apenas
// triplas HSL, e os tokens `-text` já existem.
for (const brand of Object.values(BRANDS)) normalize(brand)

/**
 * ── Nota de reconciliação hex ↔ HSL ─────────────────────────────────────
 * O brand book do Finance documentava hex canônicos (#16C7FF, #19D38A…) mas o
 * index.css guardava HSL arredondado para inteiro, que rende cores levemente
 * diferentes (#14CCFF, #1CCE8D…). Os sete tokens de marca divergiam.
 *
 * Aqui o HEX é a fonte da verdade — é ele que aparece na logo e no material de
 * marca — e o HSL é derivado com casas decimais suficientes para o round-trip
 * fechar exatamente, dentro do range válido de CSS. `hsl(194.2 99.6% 54.2%)`
 * rende #16C7FF de volta, sem desvio.
 */
