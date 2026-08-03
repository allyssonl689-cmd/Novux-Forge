/** Gera o brandbook.html — material visual autocontido (logos + paleta + tipografia). */
import { hslToHex, hslCss, contrast, scale } from './color.mjs'

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const SEMANTIC_ORDER = [
  ['primary', 'Cor de ação. Botões primários, links, foco, o gradiente da marca.'],
  ['accent', 'Apoio da marca. Segundo stop do gradiente, destaques, gráficos.'],
  ['success', 'Confirmação, meta batida, saldo positivo.'],
  ['warning', 'Atenção sem bloqueio.'],
  ['destructive', 'Erro, exclusão, perda.'],
]

const TEXT_ORDER = [
  ['primary-text', 'A cor de ação quando ela vira texto: link, valor destacado.'],
  ['accent-text', 'Apoio da marca como texto.'],
  ['success-text', 'Valor positivo, meta batida — escrito, não preenchido.'],
  ['warning-text', 'Aviso escrito em linha.'],
  ['destructive-text', 'Mensagem de erro, valor negativo.'],
]

const NEUTRAL_ORDER = [
  ['background', 'Fundo da aplicação.'],
  ['card', 'Superfície de cartão / painel.'],
  ['secondary', 'Botão secundário, chip.'],
  ['muted', 'Fundo sutil, divisores.'],
  ['border', 'Bordas e inputs.'],
  ['foreground', 'Texto principal.'],
  ['muted-foreground', 'Texto secundário.'],
]

// Tokens de superfície: existem para ficar ATRÁS do conteúdo. Medir o contraste
// deles contra o background é ruído — o fundo contra si mesmo dá sempre 1:1.
const SURFACE_TOKENS = new Set(['background', 'card', 'popover', 'secondary', 'muted', 'border', 'input'])

/**
 * @param kind 'text' → cobrado a 4.5:1 (AA para texto normal)
 *             'fill' → cobrado a 3:1 (AA para componentes de UI); é assim que
 *                      as cores de marca são usadas, então cobrá-las a 4.5:1
 *                      geraria alarme falso
 */
function swatch(name, hsl, bgHex, note, kind = 'text') {
  const hex = hslToHex(hsl)
  let badge = ''
  if (!SURFACE_TOKENS.has(name)) {
    const ratio = contrast(hex, bgHex)
    const min = kind === 'fill' ? 3 : 4.5
    const label = ratio >= min ? (kind === 'fill' ? 'ok p/ fill' : 'AA') : 'abaixo'
    const cls = ratio >= min ? 'ok' : ratio >= 3 ? 'warn' : 'bad'
    badge = `<span class="ratio ${cls}">${ratio}:1 · ${label}</span>`
  }
  return `<div class="sw">
    <div class="chip" style="background:${hex}"></div>
    <div class="meta">
      <b>${esc(name)}</b>
      <code>${hex}</code>
      <code class="dim">hsl(${hslCss(hsl)})</code>
      ${badge}
      ${note ? `<p>${esc(note)}</p>` : ''}
    </div>
  </div>`
}

function scaleRow(label, hex) {
  const s = scale(hex)
  const cells = Object.entries(s)
    .map(
      ([step, c]) =>
        `<div class="step"><div class="chip sm" style="background:${c}"></div><span>${step}</span><code>${c}</code></div>`,
    )
    .join('')
  return `<div class="scale"><h4>${esc(label)}</h4><div class="steps">${cells}</div></div>`
}

export function brandbookHtml(brand, svgs, typography) {
  const bgHex = hslToHex(brand.dark.background)
  const cardHex = hslToHex(brand.dark.card)

  // Todo contraste é medido contra a superfície de PIOR caso do modo — que não é
  // a mesma nos dois. No dark é `elevated`; no light é `secondary` (o card branco
  // é o melhor caso, não o pior).
  const worstDark = brand.surfaces.elevated
  const worstLight = hslToHex(brand.light.secondary)

  const semantic = SEMANTIC_ORDER.map(([k, note]) =>
    swatch(k, brand.dark[k], worstDark, note, 'fill'),
  ).join('')
  const textTokens = TEXT_ORDER.filter(([k]) => brand.dark[k])
    .map(([k, note]) => swatch(k, brand.dark[k], worstDark, note, 'text'))
    .join('')
  const textTokensLight = TEXT_ORDER.filter(([k]) => brand.light[k])
    .map(([k]) => swatch(k, brand.light[k], worstLight, null, 'text'))
    .join('')
  const neutrals = NEUTRAL_ORDER.map(([k, note]) =>
    swatch(k, brand.dark[k], worstDark, note, 'text'),
  ).join('')
  const light = [...SEMANTIC_ORDER, ...NEUTRAL_ORDER]
    .filter(([k]) => brand.light[k])
    .map(([k]) => swatch(k, brand.light[k], worstLight, null, SEMANTIC_ORDER.some(([s]) => s === k) ? 'fill' : 'text'))
    .join('')

  const scales = [
    scaleRow('Primary', hslToHex(brand.dark.primary)),
    scaleRow('Accent', hslToHex(brand.dark.accent)),
  ].join('')

  const fonts = typography.roles
    .map(
      (r) => `<div class="font">
      <div class="fmeta">
        <b>${esc(r.family)}</b>
        <span class="tag">${esc(r.role)}</span>
        <code class="dim">${esc(r.stack)}</code>
        <code class="dim">pesos: ${r.weights.join(' · ')}</code>
        <p>${esc(r.usage)}</p>
      </div>
      <div class="fsample" style="font-family:${r.stack};font-size:${r.previewSize}px;font-weight:${r.previewWeight};letter-spacing:${r.previewTracking}">${esc(r.sample)}</div>
    </div>`,
    )
    .join('')

  const logoCard = (title, svg, sub, onLight = false) =>
    `<figure class="logo${onLight ? ' onlight' : ''}">
      <div class="canvas">${svg}</div>
      <figcaption><b>${esc(title)}</b><span>${esc(sub)}</span></figcaption>
    </figure>`

  const logos = [
    logoCard('Ícone de app', svgs['icon.svg'], 'Primária. Stores, launcher, avatar.'),
    logoCard('Ícone flat', svgs['icon-flat.svg'], 'Sem glow. Tamanhos pequenos, impressão.'),
    logoCard('Ícone sobre claro', svgs['icon-on-light.svg'], 'Fundos claros.', true),
    logoCard('Lettermark', svgs['mark-gradient.svg'], 'Sem contêiner. Sobre superfície da marca.'),
    logoCard('Mono claro', svgs['mark-mono-light.svg'], 'Uma cor. Fundos escuros/fotos.'),
    logoCard('Mono escuro', svgs['mark-mono-dark.svg'], 'Uma cor. Fundos claros.', true),
    logoCard('Lockup horizontal', svgs['lockup-horizontal.svg'], 'Uso padrão em headers e docs.'),
    logoCard('Lockup vertical', svgs['lockup-vertical.svg'], 'Splash, capas, espaços estreitos.'),
    logoCard('Favicon', svgs['favicon.svg'], '64px otimizado, sem filtros.'),
    logoCard('Área de proteção', svgs['safe-area.svg'], 'Margem mínima = 1/4 da altura do ícone.'),
  ].join('')

  const notes = brand.notes.map((n) => `<li>${esc(n)}</li>`).join('')
  const shared = brand.sharedWith.length
    ? `<div class="callout"><b>Compartilhada com</b><ul>${brand.sharedWith.map((s) => `<li>${esc(s)}</li>`).join('')}</ul></div>`
    : ''

  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(brand.name)} — Brandbook</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${typography.googleFontsUrl}">
<style>
  :root{
    --bg:${bgHex}; --card:${cardHex}; --fg:${hslToHex(brand.dark.foreground)};
    --mut:${hslToHex(brand.dark['muted-foreground'])}; --bd:${hslToHex(brand.dark.border)};
    --p:${hslToHex(brand.dark.primary)}; --a:${hslToHex(brand.dark.accent)};
  }
  *{box-sizing:border-box}
  body{margin:0;background:var(--bg);color:var(--fg);font-family:'Poppins','Inter',system-ui,sans-serif;-webkit-font-smoothing:antialiased;line-height:1.55}
  .wrap{max-width:1180px;margin:0 auto;padding:72px 28px 120px}
  header{display:flex;align-items:center;gap:26px;padding-bottom:36px;border-bottom:1px solid var(--bd);margin-bottom:56px;flex-wrap:wrap}
  header .hlogo{width:96px;flex:none}
  header .hlogo svg{width:100%;height:auto;display:block}
  h1{font-family:'Syne',sans-serif;font-weight:800;font-size:clamp(30px,5vw,46px);letter-spacing:-.02em;margin:0}
  header p{margin:6px 0 0;color:var(--mut)}
  .grad{background:linear-gradient(120deg,var(--p),var(--a));-webkit-background-clip:text;background-clip:text;color:transparent}
  section{margin:0 0 72px}
  h2{font-family:'Syne',sans-serif;font-size:13px;font-weight:800;letter-spacing:.22em;text-transform:uppercase;color:var(--mut);margin:0 0 22px;padding-bottom:12px;border-bottom:1px solid var(--bd)}
  h3{font-size:17px;font-weight:600;margin:36px 0 16px}
  h4{font-size:13px;font-weight:600;margin:0 0 10px;color:var(--mut)}
  code{font-family:'Fira Code',monospace;font-size:12px}
  .dim{color:var(--mut)}

  .logos{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:18px}
  .logo{margin:0;background:var(--card);border:1px solid var(--bd);border-radius:16px;overflow:hidden}
  .logo .canvas{display:flex;align-items:center;justify-content:center;padding:30px;min-height:170px;background:${brand.surfaces.surface}}
  .logo.onlight .canvas{background:#EEF1F6}
  .logo .canvas svg{max-width:100%;max-height:120px;height:auto;display:block}
  figcaption{padding:14px 16px;border-top:1px solid var(--bd);display:flex;flex-direction:column;gap:3px}
  figcaption b{font-size:14px;font-weight:600}
  figcaption span{font-size:12px;color:var(--mut)}

  .sws{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:14px}
  .sw{display:flex;gap:14px;align-items:flex-start;background:var(--card);border:1px solid var(--bd);border-radius:14px;padding:14px}
  .chip{width:52px;height:52px;border-radius:11px;flex:none;box-shadow:inset 0 0 0 1px rgba(255,255,255,.09)}
  .chip.sm{width:100%;height:34px;border-radius:8px}
  .meta{display:flex;flex-direction:column;gap:2px;min-width:0}
  .meta b{font-size:13px;font-weight:600}
  .meta p{margin:5px 0 0;font-size:11.5px;color:var(--mut);line-height:1.45}
  .ratio{font-size:10.5px;font-family:'Fira Code',monospace;margin-top:3px}
  .ratio.ok{color:${hslToHex(brand.dark.success)}}
  .ratio.warn{color:${hslToHex(brand.dark.warning)}}
  .ratio.bad{color:${hslToHex(brand.dark.destructive)}}

  .scale{margin-bottom:26px}
  .steps{display:grid;grid-template-columns:repeat(10,1fr);gap:6px}
  .step{display:flex;flex-direction:column;gap:4px;font-size:10px;color:var(--mut);text-align:center}
  .step code{font-size:8.5px}
  @media(max-width:760px){.steps{grid-template-columns:repeat(5,1fr)}}

  .font{display:grid;grid-template-columns:270px 1fr;gap:26px;align-items:center;background:var(--card);border:1px solid var(--bd);border-radius:16px;padding:22px;margin-bottom:14px}
  .fmeta{display:flex;flex-direction:column;gap:3px}
  .fmeta b{font-size:19px;font-weight:600}
  .fmeta p{margin:7px 0 0;font-size:12px;color:var(--mut);line-height:1.45}
  .tag{font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--p);font-weight:600}
  .fsample{color:var(--fg);word-break:break-word}
  @media(max-width:760px){.font{grid-template-columns:1fr}}

  .callout,.rules{background:var(--card);border:1px solid var(--bd);border-left:3px solid var(--p);border-radius:12px;padding:18px 22px}
  .callout ul,.rules ul{margin:8px 0 0;padding-left:18px}
  .callout li,.rules li{font-size:13px;color:var(--mut);margin-bottom:5px}
  .rules{margin-top:18px}
</style>
</head>
<body>
<div class="wrap">
  <header>
    <div class="hlogo">${svgs['icon.svg']}</div>
    <div>
      <h1>Novux <span class="grad">${esc(brand.wordmarkSuffix.toLowerCase().replace(/^./, (c) => c.toUpperCase()))}</span></h1>
      <p>${esc(brand.tagline)} · Identidade visual</p>
    </div>
  </header>

  <section>
    <h2>Logo</h2>
    <div class="logos">${logos}</div>
    <div class="rules">
      <b>Regras de uso</b>
      <ul>
        <li>O lettermark "N" é idêntico em todos os produtos Novux — nunca redesenhar, reesticar ou trocar os terminais arredondados.</li>
        <li>Respeitar a área de proteção (1/4 da altura do ícone) em qualquer aplicação.</li>
        <li>Abaixo de 32px, usar o favicon ou a versão flat — o glow satura e some.</li>
        <li>Sobre foto ou fundo de cor arbitrária, usar a versão monocromática, nunca a com gradiente.</li>
        <li>Não aplicar sombra, contorno, rotação ou efeito próprio sobre a logo.</li>
      </ul>
    </div>
  </section>

  <section>
    <h2>Cores — Dark (padrão)</h2>
    <h3>Semânticas — cores de preenchimento</h3>
    <div class="sws">${semantic}</div>
    <h3>Neutros — compartilhados com todos os produtos Novux</h3>
    <div class="sws">${neutrals}</div>
    <p class="dim" style="font-size:12px;margin-top:14px">Contraste medido contra <code>${worstDark}</code> (<code>elevated</code>), a superfície de pior caso no dark.</p>
  </section>

  <section>
    <h2>Cores de texto</h2>
    <div class="rules" style="margin:0 0 22px">
      <b>Cor de marca preenche; token <code>-text</code> escreve.</b>
      <ul>
        <li>Uma cor de marca como <b>fundo</b> (botão, badge, barra de gráfico) precisa de 3:1 — e o texto por cima usa o <code>-foreground</code> dela. As cores acima atendem isso.</li>
        <li>A mesma cor como <b>texto</b> precisa de 4.5:1, e aí ela falha: no light, <code>primary</code> do Finance rende 2.52:1 e <code>warning</code>, 2.14:1.</li>
        <li>Escurecer as cores de marca até 4.5:1 descaracterizaria a paleta — o âmbar viraria marrom. Por isso existe um par <code>-text</code> por cor semântica.</li>
      </ul>
      <p style="margin:12px 0 0;font-size:12.5px;color:var(--mut)">
        <code style="color:var(--fg)">background: hsl(var(--primary)); color: hsl(var(--primary-foreground))</code> &nbsp;✓<br>
        <code style="color:var(--fg)">color: hsl(var(--success-text))</code> &nbsp;✓ &nbsp;&nbsp; <code>color: hsl(var(--success))</code> &nbsp;✗ ilegível no light
      </p>
    </div>
    <h3>Dark</h3>
    <div class="sws">${textTokens}</div>
    <h3>Light</h3>
    <div class="sws">${textTokensLight}</div>
  </section>

  <section>
    <h2>Cores — Light</h2>
    <div class="sws">${light}</div>
    <p class="dim" style="font-size:12px;margin-top:14px">Contraste medido contra <code>${worstLight}</code> (<code>secondary</code>), a superfície de pior caso no light — o card branco é o melhor caso, não o pior.</p>
  </section>

  <section>
    <h2>Escalas</h2>
    ${scales}
  </section>

  <section>
    <h2>Tipografia</h2>
    ${fonts}
  </section>

  <section>
    <h2>Notas da marca</h2>
    <div class="callout"><b>${esc(brand.name)}</b><ul>${notes}</ul></div>
    ${shared}
  </section>
</div>
</body>
</html>`
}
