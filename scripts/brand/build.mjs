#!/usr/bin/env node
/**
 * NOVUX — Build da identidade visual.
 *
 *   node scripts/brand/build.mjs                 # gera as duas marcas (SVG + tokens + brandbook + PNG)
 *   node scripts/brand/build.mjs --brand=forge   # só uma
 *   node scripts/brand/build.mjs --no-png        # pula rasterização (mais rápido)
 *   node scripts/brand/build.mjs --dry-run       # lista o que seria escrito, sem escrever
 *
 * Saída: <projeto>/brand/  — ver README.md gerado lá dentro.
 */
import { mkdir, writeFile, rm } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'

import { BRANDS, TYPOGRAPHY } from './brands.mjs'
import { hslToHex, hslCss, contrast, scale } from './color.mjs'
import * as L from './logos.mjs'
import { brandbookHtml } from './brandbook.mjs'
import { openChromium } from './render.mjs'

// ── CLI ─────────────────────────────────────────────────────────────────
const argv = process.argv.slice(2)
const flag = (n) => argv.includes(`--${n}`)
const opt = (n, d) => {
  const hit = argv.find((a) => a.startsWith(`--${n}=`))
  return hit ? hit.split('=').slice(1).join('=') : d
}

const DRY = flag('dry-run')
const WANT_PNG = !flag('no-png')
const ONLY = opt('brand', 'all')

// ── Tamanhos de PNG ─────────────────────────────────────────────────────
const ICON_SIZES = [16, 32, 48, 64, 96, 128, 180, 192, 256, 384, 512, 1024]
const MARK_SIZES = [128, 256, 512, 1024]
const LOCKUP_SCALES = [1, 2, 3]

// ── Helpers de escrita ──────────────────────────────────────────────────
let written = 0
async function put(file, content) {
  if (DRY) {
    console.log(`    · ${path.relative(process.cwd(), file).replace(/\\/g, '/')}`)
    written++
    return
  }
  await mkdir(path.dirname(file), { recursive: true })
  await writeFile(file, content)
  written++
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/**
 * rm recursivo com retry.
 * No Windows, indexador e antivírus seguram diretórios por alguns instantes
 * depois de uma escrita, e o rmdir estoura EBUSY/EPERM.
 */
async function rmWithRetry(dir, attempts = 5) {
  for (let i = 0; i < attempts; i++) {
    try {
      await rm(dir, { recursive: true, force: true })
      return
    } catch (err) {
      if (!['EBUSY', 'EPERM', 'ENOTEMPTY'].includes(err.code) || i === attempts - 1) throw err
      await sleep(200 * (i + 1))
    }
  }
}

// ── Tokens ──────────────────────────────────────────────────────────────
function colorsJson(brand) {
  const expand = (mode) =>
    Object.fromEntries(
      Object.entries(brand[mode]).map(([k, hsl]) => [
        k,
        { hex: hslToHex(hsl), hsl: hslCss(hsl), hslArray: hsl },
      ]),
    )
  return JSON.stringify(
    {
      $schema: 'https://novux.brand/tokens.schema.json',
      brand: brand.name,
      id: brand.id,
      generatedBy: 'scripts/brand/build.mjs',
      gradient: brand.gradient,
      surfaces: brand.surfaces,
      scales: {
        primary: scale(hslToHex(brand.dark.primary)),
        accent: scale(hslToHex(brand.dark.accent)),
      },
      dark: expand('dark'),
      light: expand('light'),
      notes: brand.notes,
    },
    null,
    2,
  )
}

function tokensCss(brand) {
  // O `:` faz parte da chave no padding — alinhar sem ele produzia declarações
  // sem dois-pontos, que o navegador descarta silenciosamente.
  const decl = (name, value, width = 26) => `    ${`--${name}:`.padEnd(width)}${value};`
  const block = (mode) =>
    Object.entries(brand[mode])
      .map(([k, hsl]) => decl(k, hslCss(hsl)))
      .join('\n')
  return `/* ${brand.name} — design tokens
 * GERADO por scripts/brand/build.mjs — não editar à mão.
 * Fonte da verdade: scripts/brand/brands.mjs
 *
 * Os valores são triplas HSL cruas, para consumo via hsl(var(--token) / <alpha>).
 */
:root {
${block('dark')}
${decl('radius', '1rem')}

    /* Gradiente da marca */
${decl('brand-gradient-from', brand.gradient.from)}
${decl('brand-gradient-to', brand.gradient.to)}
${decl('brand-gradient', `linear-gradient(135deg, ${brand.gradient.from}, ${brand.gradient.to})`)}
}

.light {
${block('light')}
}
`
}

function tailwindTokens(brand) {
  const keys = Object.keys(brand.dark)
  const entries = keys
    .filter((k) => !k.endsWith('-foreground'))
    .map((k) => {
      const fg = `${k}-foreground`
      if (keys.includes(fg)) {
        return `    '${k}': { DEFAULT: 'hsl(var(--${k}))', foreground: 'hsl(var(--${fg}))' },`
      }
      return `    '${k}': 'hsl(var(--${k}))',`
    })
    .join('\n')

  return `/* ${brand.name} — fragmento de tema Tailwind.
 * GERADO por scripts/brand/build.mjs — não editar à mão.
 * Uso:  const brand = require('./brand/tokens/tailwind.tokens.cjs')
 *       theme: { extend: { colors: brand.colors, fontFamily: brand.fontFamily } }
 */
module.exports = {
  colors: {
${entries}
  },
  fontFamily: {
    sans:    [${TYPOGRAPHY.roles.find((r) => r.role.includes('UI')).stack.split(',').map((s) => `'${s.trim().replace(/'/g, '')}'`).join(', ')}],
    display: ['Syne', 'Poppins', 'sans-serif'],
    numeric: ['Outfit', 'Poppins', 'sans-serif'],
    mono:    ['Fira Code', 'Courier New', 'monospace'],
  },
  backgroundImage: {
    'brand-gradient': 'linear-gradient(135deg, ${brand.gradient.from}, ${brand.gradient.to})',
  },
}
`
}

function typographyJson() {
  return JSON.stringify({ generatedBy: 'scripts/brand/build.mjs', ...TYPOGRAPHY }, null, 2)
}

function fontsCss() {
  const roleCss = TYPOGRAPHY.roles
    .map((r) => `/* ${r.role} — ${r.usage} */\n.font-${r.family.toLowerCase().replace(/\s+/g, '-')} { font-family: ${r.stack}; }`)
    .join('\n\n')
  return `/* Novux — sistema tipográfico (idêntico em todos os produtos).
 * GERADO por scripts/brand/build.mjs — não editar à mão.
 */
@import url('${TYPOGRAPHY.googleFontsUrl}');

body {
  font-family: ${TYPOGRAPHY.roles.find((r) => r.role.includes('UI')).stack};
  font-variant-numeric: tabular-nums;
  -webkit-font-smoothing: antialiased;
}

h1, h2, h3, h4, h5, h6 {
  font-family: ${TYPOGRAPHY.roles.find((r) => r.role.includes('UI')).stack};
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.2;
}

/* Wordmark, page titles */
.display { font-family: 'Syne', 'Poppins', sans-serif; font-weight: 800; letter-spacing: -0.02em; }
/* Valores de KPI */
.val     { font-family: 'Outfit', 'Poppins', sans-serif; font-weight: 700; letter-spacing: -0.02em; }
/* Números inline */
.mono    { font-family: 'Fira Code', 'Courier New', monospace; font-size: 0.95em; }

${roleCss}
`
}

function readme(brand, hasPng) {
  const c = (k) => `\`${hslToHex(brand.dark[k])}\``
  const sharedBlock = brand.sharedWith.length
    ? `\n## Compartilhada com\n\n${brand.sharedWith.map((s) => `- ${s}`).join('\n')}\n`
    : ''
  return `# ${brand.name} — Identidade visual

> Gerado por \`scripts/brand/build.mjs\` (no repositório Novux Forge).
> **Não editar os arquivos desta pasta à mão** — eles são sobrescritos a cada build.
> Para mudar a marca, edite \`scripts/brand/brands.mjs\` e rode o build de novo.

Abra **[brandbook.html](./brandbook.html)** no navegador para o material visual completo.

## Estrutura

\`\`\`
brand/
  brandbook.html          material visual (logos + paleta + tipografia + regras)
  logo/
    svg/                  todas as variações, vetoriais
    png/                  ${hasPng ? 'rasterizações prontas (ícones, marks, lockups)' : '(não gerado — Chromium indisponível neste build)'}
  tokens/
    colors.json           todos os tokens em hex + hsl, escalas 50-900
    colors.css            custom properties (:root dark, .light)
    tailwind.tokens.cjs   fragmento de theme.extend para Tailwind
    typography.json       papéis tipográficos em dados
  fonts/
    fonts.css             @import + classes utilitárias
\`\`\`

## Cores-chave

| Papel | Hex |
|---|---|
| Primary | ${c('primary')} |
| Accent | ${c('accent')} |
| Background | \`${brand.surfaces.background}\` |
| Card | \`${brand.surfaces.card}\` |
| Success | ${c('success')} |
| Warning | ${c('warning')} |
| Destructive | ${c('destructive')} |

Gradiente da marca: \`${brand.gradient.from}\` → \`${brand.gradient.to}\`

## Tipografia

${TYPOGRAPHY.roles.map((r) => `- **${r.family}** — ${r.role}. ${r.usage}`).join('\n')}

## Consumo

**CSS puro / Vite**
\`\`\`css
@import './brand/tokens/colors.css';
@import './brand/fonts/fonts.css';
\`\`\`

**Tailwind**
\`\`\`js
const brand = require('./brand/tokens/tailwind.tokens.cjs')
module.exports = { theme: { extend: { colors: brand.colors, fontFamily: brand.fontFamily } } }
\`\`\`

**React Native / Expo** — consuma \`tokens/colors.json\` (campo \`.hex\`) diretamente.

## Notas

${brand.notes.map((n) => `- ${n}`).join('\n')}
${sharedBlock}`
}

// ── Build de uma marca ──────────────────────────────────────────────────
async function buildBrand(brand, renderer) {
  console.log(`\n▸ ${brand.name}`)
  console.log(`  destino: ${brand.outDir}`)

  const parent = path.dirname(brand.outDir)
  if (!existsSync(parent)) {
    console.warn(`  ! Projeto não encontrado em ${parent} — pulando.`)
    return
  }

  // Medição real do texto quando o Chromium estiver disponível.
  if (renderer) {
    // Repõe a página de medição: sem isso, medir depende do que o build anterior
    // deixou no DOM.
    await renderer.loadFonts(TYPOGRAPHY.googleFontsUrl)
    const m = await renderer.measure([
      { key: 'main', text: 'NOVUX', ...L.WORDMARK_TYPE.main },
      { key: 'suffix', text: brand.wordmarkSuffix, ...L.WORDMARK_TYPE.suffix },
    ])
    brand._widths = m
  } else {
    brand._widths = L.estimateWidths(brand)
    if (!DRY) console.warn('  ! Sem Chromium: largura do wordmark estimada (viewBox pode ficar folgado).')
  }

  const fontsUrl = TYPOGRAPHY.googleFontsUrl
  const gradDefs = L.textGradient('n', brand.gradient.from, brand.gradient.to)

  const svgs = {
    'icon.svg': L.iconApp(brand),
    'icon-flat.svg': L.iconFlat(brand),
    'icon-on-light.svg': L.iconOnLight(brand),
    'mark-gradient.svg': L.markGradient(brand),
    'mark-mono-light.svg': L.markSolid('#FFFFFF'),
    'mark-mono-dark.svg': L.markSolid(brand.surfaces.background),
    'favicon.svg': L.favicon(brand),
    'safe-area.svg': L.safeArea(brand),
    'wordmark.svg': L.wordmark(brand, {
      paint: 'url(#n)',
      suffixColor: '#8792A8',
      defs: gradDefs,
      fontsUrl,
    }),
    'wordmark-mono-light.svg': L.wordmark(brand, {
      paint: '#FFFFFF',
      suffixColor: '#FFFFFF',
      fontsUrl,
    }),
    'wordmark-mono-dark.svg': L.wordmark(brand, {
      paint: brand.surfaces.background,
      suffixColor: brand.surfaces.background,
      fontsUrl,
    }),
    'lockup-horizontal.svg': L.lockupHorizontal(brand, { mode: 'color', fontsUrl }),
    'lockup-horizontal-mono-light.svg': L.lockupHorizontal(brand, { mode: 'light', fontsUrl }),
    'lockup-horizontal-mono-dark.svg': L.lockupHorizontal(brand, { mode: 'dark', fontsUrl }),
    'lockup-vertical.svg': L.lockupVertical(brand, { mode: 'color', fontsUrl }),
    'lockup-vertical-mono-light.svg': L.lockupVertical(brand, { mode: 'light', fontsUrl }),
    'lockup-vertical-mono-dark.svg': L.lockupVertical(brand, { mode: 'dark', fontsUrl }),
  }

  // Limpa apenas o que este build vai regravar, para não deixar variações órfãs.
  // logo/png só entra na lista quando os PNGs serão de fato regerados — senão
  // um build --no-page destruiria rasterizações válidas.
  const willRenderPng = Boolean(renderer) && WANT_PNG
  const toClean = ['logo/svg', 'tokens', 'fonts', ...(willRenderPng ? ['logo/png'] : [])]
  if (!DRY) {
    for (const sub of toClean) {
      const dir = path.join(brand.outDir, sub)
      if (existsSync(dir)) await rmWithRetry(dir)
    }
  }

  for (const [name, svg] of Object.entries(svgs)) {
    await put(path.join(brand.outDir, 'logo/svg', name), svg)
  }
  console.log(`  ✓ ${Object.keys(svgs).length} SVGs`)

  await put(path.join(brand.outDir, 'tokens/colors.json'), colorsJson(brand))
  await put(path.join(brand.outDir, 'tokens/colors.css'), tokensCss(brand))
  await put(path.join(brand.outDir, 'tokens/tailwind.tokens.cjs'), tailwindTokens(brand))
  await put(path.join(brand.outDir, 'tokens/typography.json'), typographyJson())
  await put(path.join(brand.outDir, 'fonts/fonts.css'), fontsCss())
  console.log('  ✓ tokens + fontes')

  // ── PNGs ──
  let pngCount = 0
  if (renderer && WANT_PNG && !DRY) {
    const dir = path.join(brand.outDir, 'logo/png')
    const vb = (svg) => svg.match(/viewBox="([^"]+)"/)[1].split(/\s+/).map(Number)

    for (const size of ICON_SIZES) {
      const src = size <= 64 ? svgs['favicon.svg'] : svgs['icon.svg']
      await put(path.join(dir, `icon-${size}.png`), await renderer.toPng(src, size, size))
      pngCount++
    }
    for (const size of MARK_SIZES) {
      for (const [file, svg] of [
        ['mark-gradient', svgs['mark-gradient.svg']],
        ['mark-mono-light', svgs['mark-mono-light.svg']],
        ['mark-mono-dark', svgs['mark-mono-dark.svg']],
      ]) {
        await put(path.join(dir, `${file}-${size}.png`), await renderer.toPng(svg, size, size))
        pngCount++
      }
    }
    for (const name of [
      'lockup-horizontal',
      'lockup-horizontal-mono-light',
      'lockup-horizontal-mono-dark',
      'lockup-vertical',
      'lockup-vertical-mono-light',
      'lockup-vertical-mono-dark',
      'wordmark',
    ]) {
      const svg = svgs[`${name}.svg`]
      const [, , w, h] = vb(svg)
      for (const s of LOCKUP_SCALES) {
        await put(
          path.join(dir, `${name}@${s}x.png`),
          await renderer.toPng(svg, Math.round(w * s), Math.round(h * s)),
        )
        pngCount++
      }
    }
    // Ícone de app maskable (Android/PWA) — 1024 com safe area embutida.
    await put(path.join(dir, 'icon-maskable-1024.png'), await renderer.toPng(svgs['safe-area.svg'], 1024, 1024))
    pngCount++
    console.log(`  ✓ ${pngCount} PNGs`)
  } else if (WANT_PNG && !DRY) {
    console.warn('  ! PNGs PULADOS — Chromium/Playwright não disponível.')
  }

  await put(path.join(brand.outDir, 'brandbook.html'), brandbookHtml(brand, svgs, TYPOGRAPHY))
  await put(path.join(brand.outDir, 'README.md'), readme(brand, pngCount > 0))
  console.log('  ✓ brandbook.html + README.md')

  // Relatório de contraste — falhas não travam o build, mas aparecem.
  //
  // Só os tokens usados COMO TEXTO entram aqui. As cores de marca (primary,
  // accent, success…) são de preenchimento e vivem sob o limiar 3:1; auditá-las
  // a 4.5:1 produziria avisos que ninguém deve agir sobre. Ver a nota `-text`
  // em brands.mjs.
  //
  // As superfícies do pior caso diferem por modo: no dark é `elevated`, no light
  // é `secondary` — o card branco é o melhor caso, não o pior.
  const TEXT_TOKENS = [
    'foreground',
    'muted-foreground',
    'primary-text',
    'accent-text',
    'success-text',
    'warning-text',
    'destructive-text',
  ]
  for (const mode of ['dark', 'light']) {
    const palette = brand[mode]
    const surfaces =
      mode === 'dark'
        ? {
            background: hslToHex(palette.background),
            card: brand.surfaces.card,
            elevated: brand.surfaces.elevated,
          }
        : {
            background: hslToHex(palette.background),
            card: hslToHex(palette.card),
            secondary: hslToHex(palette.secondary),
            muted: hslToHex(palette.muted),
          }
    const risky = TEXT_TOKENS.filter((k) => palette[k])
      .map((k) => {
        const hex = hslToHex(palette[k])
        const worst = Object.entries(surfaces)
          .map(([s, sHex]) => [s, contrast(hex, sHex)])
          .sort((a, b) => a[1] - b[1])[0]
        return [k, worst]
      })
      .filter(([, [, r]]) => r < 4.5)
    if (risky.length) {
      console.warn(
        `  ⚠ ${mode}: token de texto abaixo de 4.5:1 — ${risky
          .map(([k, [s, r]]) => `${k} ${r}:1 sobre ${s}`)
          .join(', ')}`,
      )
    } else {
      console.log(`  ✓ ${mode}: todos os tokens de texto passam AA (4.5:1) em todas as superfícies`)
    }
  }
}

// ── Main ────────────────────────────────────────────────────────────────
const targets = ONLY === 'all' ? Object.values(BRANDS) : [BRANDS[ONLY]].filter(Boolean)
if (!targets.length) {
  console.error(`Marca desconhecida: "${ONLY}". Disponíveis: ${Object.keys(BRANDS).join(', ')}, all`)
  process.exit(1)
}

console.log(`NOVUX — build de identidade visual${DRY ? '  [DRY RUN]' : ''}`)

let renderer = null
if (!DRY) {
  renderer = await openChromium()
  if (renderer) {
    const ok = await renderer.loadFonts(TYPOGRAPHY.googleFontsUrl)
    console.log(`Chromium: ${renderer.source}${ok ? ' (webfonts carregadas)' : ' (SEM webfonts — offline?)'}`)
    if (!ok) console.warn('! Wordmark sairá com fonte de sistema. Verifique a conexão.')
  } else {
    console.warn('! Playwright não encontrado. SVGs e tokens serão gerados; PNGs, não.')
  }
}

try {
  for (const b of targets) await buildBrand(b, renderer)
} finally {
  if (renderer) await renderer.close()
}

console.log(`\n${DRY ? 'Seriam escritos' : 'Escritos'} ${written} arquivos.`)
if (!DRY) {
  for (const b of targets) {
    if (existsSync(b.outDir)) console.log(`  → ${b.outDir.replace(/\\/g, '/')}/brandbook.html`)
  }
}
