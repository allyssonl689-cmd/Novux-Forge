/**
 * Geradores de SVG da logo Novux.
 *
 * O lettermark é o MESMO desenho nas duas marcas — traçado único em "N",
 * terminais arredondados, extraído de novux-finance/public/icon.svg.
 * Só o preenchimento (gradiente ou cor sólida) varia.
 */

// Geometria canônica em viewBox 512. Não alterar — é a assinatura da marca.
const N_PATH = 'M 128 384 L 128 128 L 384 384 L 384 128'
const N_STROKE = 44
const CORNER_RADIUS = 112 // raio do rounded square em 512 (22%)

const svgOpen = (viewBox, w, h) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}"${
    w ? ` width="${w}" height="${h}"` : ''
  } fill="none" role="img">`

const gradientDef = (id, from, to, x1 = 128, y1 = 128, x2 = 384, y2 = 384) =>
  `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="${from}"/>
      <stop offset="100%" stop-color="${to}"/>
    </linearGradient>`

const glowFilters = `<filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="10" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="softGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="18" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>`

const nStroke = (paint, extra = '') =>
  `<path d="${N_PATH}" stroke="${paint}" stroke-width="${N_STROKE}" stroke-linecap="round" stroke-linejoin="round" fill="none"${extra}/>`

/**
 * Ícone de app: rounded square escuro + lettermark com gradiente e glow.
 * É a versão primária da marca.
 */
export function iconApp(brand) {
  const { from, to } = brand.gradient
  const bgFrom = brand.surfaces.logoBackdropFrom
  const bgTo = brand.surfaces.logoBackdropTo
  return `${svgOpen('0 0 512 512')}
  <defs>
    ${gradientDef('bg', bgFrom, bgTo, 0, 0, 512, 512)}
    ${gradientDef('n', from, to)}
    ${gradientDef('bd', from, to, 0, 0, 512, 512)}
    ${glowFilters}
  </defs>
  <rect width="512" height="512" rx="${CORNER_RADIUS}" fill="url(#bg)"/>
  <rect width="512" height="512" rx="${CORNER_RADIUS}" fill="none" stroke="url(#bd)" stroke-width="2" stroke-opacity="0.35"/>
  <ellipse cx="160" cy="160" rx="120" ry="80" fill="${from}" fill-opacity="0.05"/>
  <ellipse cx="352" cy="352" rx="100" ry="80" fill="${to}" fill-opacity="0.06"/>
  <g filter="url(#softGlow)" opacity="0.4">${nStroke('url(#n)')}</g>
  <g filter="url(#glow)">${nStroke('url(#n)')}</g>
</svg>`
}

/** Ícone sem glow — para tamanhos pequenos, impressão e bordado. */
export function iconFlat(brand) {
  const { from, to } = brand.gradient
  return `${svgOpen('0 0 512 512')}
  <defs>
    ${gradientDef('bg', brand.surfaces.logoBackdropFrom, brand.surfaces.logoBackdropTo, 0, 0, 512, 512)}
    ${gradientDef('n', from, to)}
  </defs>
  <rect width="512" height="512" rx="${CORNER_RADIUS}" fill="url(#bg)"/>
  ${nStroke('url(#n)')}
</svg>`
}

/** Ícone sobre fundo claro — rounded square branco. */
export function iconOnLight(brand) {
  const { from, to } = brand.gradient
  return `${svgOpen('0 0 512 512')}
  <defs>${gradientDef('n', from, to)}</defs>
  <rect width="512" height="512" rx="${CORNER_RADIUS}" fill="#FFFFFF"/>
  ${nStroke('url(#n)')}
</svg>`
}

/** Só o lettermark, fundo transparente, gradiente da marca. */
export function markGradient(brand) {
  const { from, to } = brand.gradient
  return `${svgOpen('96 96 320 320')}
  <defs>${gradientDef('n', from, to)}</defs>
  ${nStroke('url(#n)')}
</svg>`
}

/** Lettermark em cor sólida, fundo transparente. */
export function markSolid(color) {
  return `${svgOpen('96 96 320 320')}
  ${nStroke(color)}
</svg>`
}

/** Favicon 64px — geometria reescalada, sem filtros pesados. */
export function favicon(brand) {
  const { from, to } = brand.gradient
  return `${svgOpen('0 0 64 64')}
  <defs>
    ${gradientDef('bg', brand.surfaces.logoBackdropFrom, brand.surfaces.logoBackdropTo, 0, 0, 64, 64)}
    ${gradientDef('n', from, to, 16, 16, 48, 48)}
  </defs>
  <rect width="64" height="64" rx="14" fill="url(#bg)"/>
  <path d="M 16 48 L 16 16 L 48 48 L 48 16" stroke="url(#n)" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
</svg>`
}

/**
 * Diagrama de área de proteção — a margem mínima ao redor da logo.
 * Unidade de proteção = 1/4 da altura do ícone.
 */
export function safeArea(brand) {
  const { from, to } = brand.gradient
  const pad = 128 // 512 / 4
  const total = 512 + pad * 2
  return `${svgOpen(`0 0 ${total} ${total}`)}
  <defs>
    ${gradientDef('bg', brand.surfaces.logoBackdropFrom, brand.surfaces.logoBackdropTo, pad, pad, pad + 512, pad + 512)}
    ${gradientDef('n', from, to)}
  </defs>
  <rect width="${total}" height="${total}" fill="${brand.surfaces.surface}"/>
  <rect x="${pad / 2}" y="${pad / 2}" width="${total - pad}" height="${total - pad}" fill="none" stroke="${from}" stroke-opacity="0.35" stroke-width="3" stroke-dasharray="14 12"/>
  <g transform="translate(${pad} ${pad})">
    <rect width="512" height="512" rx="${CORNER_RADIUS}" fill="url(#bg)"/>
    ${nStroke('url(#n)')}
  </g>
  <text x="${total / 2}" y="${pad / 2 - 22}" fill="${from}" fill-opacity="0.8" font-family="Poppins, sans-serif" font-size="30" font-weight="600" letter-spacing="6" text-anchor="middle">AREA DE PROTECAO = X / 4</text>
</svg>`
}

// ── Wordmark e lockups ──────────────────────────────────────────────────
// A largura do texto é medida no Chromium quando disponível (ver render.mjs).
// Sem ele, cai numa estimativa por métrica média — o desenho continua correto,
// só o viewBox fica alguns por cento folgado.

export const WORDMARK_TYPE = {
  main: { family: 'Syne', weight: 800, size: 58, tracking: 0.02 },
  suffix: { family: 'Poppins', weight: 600, size: 16, tracking: 0.34 },
}

const estimate = (text, { size, tracking }, avgRatio) =>
  text.length * size * avgRatio + text.length * size * tracking

export function estimateWidths(brand) {
  return {
    main: estimate('NOVUX', WORDMARK_TYPE.main, 0.72),
    suffix: estimate(brand.wordmarkSuffix, WORDMARK_TYPE.suffix, 0.62),
  }
}

const textEl = (text, x, y, { family, weight, size, tracking }, fill, anchor = 'start') =>
  `<text x="${x}" y="${y}" fill="${fill}" font-family="${family}, sans-serif" font-size="${size}" font-weight="${weight}" letter-spacing="${(tracking * size).toFixed(2)}" text-anchor="${anchor}">${text}</text>`

const fontImport = (url) => `<style>@import url('${url}');</style>`

/**
 * Gradiente para texto, em objectBoundingBox.
 * O gradiente do lettermark é userSpaceOnUse (amarrado à geometria 512 do "N");
 * reaproveitá-lo no wordmark faria o texto cair todo no primeiro stop.
 */
export const textGradient = (id, from, to) =>
  `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="0.6">
      <stop offset="0%" stop-color="${from}"/>
      <stop offset="100%" stop-color="${to}"/>
    </linearGradient>`

/**
 * Wordmark isolado: "NOVUX" + sufixo do produto.
 * @param paint cor/URL de gradiente para "NOVUX"
 * @param suffixColor cor do sufixo
 */
export function wordmark(brand, { paint, suffixColor, defs = '', fontsUrl }) {
  const w = brand._widths || estimateWidths(brand)
  const width = Math.ceil(Math.max(w.main, w.suffix)) + 4
  const height = 92
  return `${svgOpen(`0 0 ${width} ${height}`)}
  ${fontImport(fontsUrl)}
  <defs>${defs}</defs>
  ${textEl('NOVUX', 2, 60, WORDMARK_TYPE.main, paint)}
  ${textEl(brand.wordmarkSuffix, 4, 86, WORDMARK_TYPE.suffix, suffixColor)}
</svg>`
}

/** Lockup horizontal: ícone à esquerda, wordmark à direita. */
export function lockupHorizontal(brand, { mode = 'color', fontsUrl }) {
  const { from, to } = brand.gradient
  const w = brand._widths || estimateWidths(brand)
  const ICON = 104
  const GAP = 30
  const textW = Math.ceil(Math.max(w.main, w.suffix))
  const width = ICON + GAP + textW + 4
  const height = ICON

  const paint = mode === 'color' ? 'url(#nt)' : mode === 'light' ? '#FFFFFF' : brand.surfaces.background
  const markPaint = mode === 'color' ? 'url(#n)' : paint
  const suffixColor =
    mode === 'color' ? '#8792A8' : mode === 'light' ? '#FFFFFF' : brand.surfaces.background
  const suffixOpacity = mode === 'color' ? 1 : 0.6

  const iconBlock =
    mode === 'color'
      ? `<g transform="translate(0 0) scale(${ICON / 512})">
    <rect width="512" height="512" rx="${CORNER_RADIUS}" fill="url(#bg)"/>
    ${nStroke(markPaint)}
  </g>`
      : `<g transform="translate(0 0) scale(${ICON / 512})">${nStroke(markPaint)}</g>`

  const defs =
    mode === 'color'
      ? `<defs>
    ${gradientDef('bg', brand.surfaces.logoBackdropFrom, brand.surfaces.logoBackdropTo, 0, 0, 512, 512)}
    ${gradientDef('n', from, to)}
    ${textGradient('nt', from, to)}
  </defs>`
      : '<defs/>'

  // Bloco de texto centralizado verticalmente contra o ícone.
  const baselineMain = 60
  const baselineSuffix = 86
  const textTop = 16
  const textBottom = baselineSuffix
  const offsetY = (height - (textBottom - textTop)) / 2 - textTop

  return `${svgOpen(`0 0 ${width} ${height}`)}
  ${fontImport(fontsUrl)}
  ${defs}
  ${iconBlock}
  <g transform="translate(${ICON + GAP} ${offsetY})" opacity="1">
    ${textEl('NOVUX', 0, baselineMain, WORDMARK_TYPE.main, paint)}
    <g opacity="${suffixOpacity}">${textEl(brand.wordmarkSuffix, 2, baselineSuffix, WORDMARK_TYPE.suffix, suffixColor)}</g>
  </g>
</svg>`
}

/** Lockup vertical: ícone acima, wordmark centralizado abaixo. */
export function lockupVertical(brand, { mode = 'color', fontsUrl }) {
  const { from, to } = brand.gradient
  const w = brand._widths || estimateWidths(brand)
  const ICON = 144
  const GAP = 26
  const textW = Math.ceil(Math.max(w.main, w.suffix))
  const width = Math.max(ICON, textW) + 8
  const height = ICON + GAP + 92
  const cx = width / 2

  const paint = mode === 'color' ? 'url(#nt)' : mode === 'light' ? '#FFFFFF' : brand.surfaces.background
  const markPaint = mode === 'color' ? 'url(#n)' : paint
  const suffixColor =
    mode === 'color' ? '#8792A8' : mode === 'light' ? '#FFFFFF' : brand.surfaces.background
  const suffixOpacity = mode === 'color' ? 1 : 0.6

  const iconBlock =
    mode === 'color'
      ? `<g transform="translate(${cx - ICON / 2} 0) scale(${ICON / 512})">
    <rect width="512" height="512" rx="${CORNER_RADIUS}" fill="url(#bg)"/>
    ${nStroke(markPaint)}
  </g>`
      : `<g transform="translate(${cx - ICON / 2} 0) scale(${ICON / 512})">${nStroke(markPaint)}</g>`

  const defs =
    mode === 'color'
      ? `<defs>
    ${gradientDef('bg', brand.surfaces.logoBackdropFrom, brand.surfaces.logoBackdropTo, 0, 0, 512, 512)}
    ${gradientDef('n', from, to)}
    ${textGradient('nt', from, to)}
  </defs>`
      : '<defs/>'

  return `${svgOpen(`0 0 ${width} ${height}`)}
  ${fontImport(fontsUrl)}
  ${defs}
  ${iconBlock}
  <g transform="translate(0 ${ICON + GAP})">
    ${textEl('NOVUX', cx, 52, WORDMARK_TYPE.main, paint, 'middle')}
    <g opacity="${suffixOpacity}">${textEl(brand.wordmarkSuffix, cx, 78, WORDMARK_TYPE.suffix, suffixColor, 'middle')}</g>
  </g>
</svg>`
}
