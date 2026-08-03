/**
 * Rasterização e medição de texto via Chromium (Playwright).
 *
 * O Playwright não é dependência deste projeto — é resolvido a partir dos
 * repositórios vizinhos. Se não houver, o build continua e apenas os PNGs
 * são pulados, com aviso explícito (nunca em silêncio).
 */
import { pathToFileURL } from 'node:url'
import { existsSync } from 'node:fs'

const CANDIDATE_PATHS = [
  'c:/all/novux-finance/node_modules/playwright/index.js',
  'c:/all/Novux Forge/node_modules/playwright/index.js',
  'c:/all/novux-mobile/node_modules/playwright/index.js',
]

// Ordem de tentativa: o Chromium empacotado do Playwright, depois navegadores
// Chromium já instalados no sistema. Qualquer um renderiza SVG identicamente,
// e os canais do sistema evitam um download de ~150MB.
const LAUNCH_ATTEMPTS = [
  { label: 'chromium (playwright)', opts: {} },
  { label: 'msedge', opts: { channel: 'msedge' } },
  { label: 'chrome', opts: { channel: 'chrome' } },
]

export async function openChromium() {
  const found = CANDIDATE_PATHS.find((p) => existsSync(p))
  if (!found) return null

  let chromium
  try {
    // playwright é CJS — o namespace ESM entrega tudo sob `default`.
    const mod = await import(pathToFileURL(found).href)
    chromium = mod.chromium ?? mod.default?.chromium
    if (!chromium) throw new Error('export `chromium` não encontrado')
  } catch (err) {
    console.warn(`  ! Playwright não carregou (${err.message}). PNGs serão pulados.`)
    return null
  }

  const failures = []
  for (const attempt of LAUNCH_ATTEMPTS) {
    try {
      const browser = await chromium.launch(attempt.opts)
      const page = await browser.newPage({ deviceScaleFactor: 1 })
      return new Renderer(browser, page, `${found} · ${attempt.label}`)
    } catch (err) {
      failures.push(`${attempt.label}: ${err.message.split('\n')[0]}`)
    }
  }
  console.warn(`  ! Nenhum navegador pôde ser aberto. PNGs serão pulados.`)
  for (const f of failures) console.warn(`      ${f}`)
  console.warn(`      Para resolver: npx playwright install chromium`)
  return null
}

class Renderer {
  constructor(browser, page, source) {
    this.browser = browser
    this.page = page
    this.source = source
    this._fontsLoaded = false
  }

  async loadFonts(googleFontsUrl) {
    this.fontsUrl = googleFontsUrl
    await this.page.setContent(
      `<!doctype html><html><head><link rel="stylesheet" href="${googleFontsUrl}"></head><body></body></html>`,
      { waitUntil: 'networkidle' },
    )
    try {
      await this.page.evaluate(() => document.fonts.ready)
      this._fontsLoaded = true
    } catch {
      this._fontsLoaded = false
    }
    return this._fontsLoaded
  }

  /**
   * Mede a largura renderizada de cada spec.
   * @param specs [{ key, text, family, weight, size, tracking }]
   * @returns { [key]: widthPx }
   */
  async measure(specs) {
    return this.page.evaluate(async (list) => {
      // `document.fonts.ready` numa página sem texto resolve na hora: uma webfont
      // só é baixada quando algum elemento a usa. Sem forçar o load aqui, a medição
      // sai com a métrica do fallback e o viewBox corta o wordmark.
      await Promise.all(
        list.map((s) =>
          document.fonts.load(`${s.weight} ${s.size}px "${s.family}"`, s.text).catch(() => {}),
        ),
      )
      await document.fonts.ready

      const out = {}
      const host = document.createElement('div')
      host.style.cssText = 'position:absolute;visibility:hidden;white-space:pre;'
      document.body.appendChild(host)
      for (const s of list) {
        const el = document.createElement('span')
        el.style.cssText = `font-family:'${s.family}',sans-serif;font-weight:${s.weight};font-size:${s.size}px;letter-spacing:${s.tracking * s.size}px;white-space:pre;`
        el.textContent = s.text
        host.appendChild(el)
        // letter-spacing adiciona espaço APÓS o último glifo — descontar.
        out[s.key] = Math.ceil(el.getBoundingClientRect().width - s.tracking * s.size)
        host.removeChild(el)
      }
      host.remove()
      return out
    }, specs)
  }

  /**
   * SVG string → PNG Buffer, com fundo transparente.
   *
   * O SVG é injetado INLINE, não via <img>. Um SVG carregado como imagem roda
   * em modo isolado e não pode buscar recursos externos — as webfonts do
   * wordmark não carregariam e o arquivo sairia em branco.
   */
  async toPng(svg, width, height) {
    const w = Math.max(1, Math.round(width))
    const h = Math.max(1, Math.round(height))
    await this.page.setViewportSize({ width: w, height: h })
    await this.page.setContent(
      `<!doctype html><html><head>
        ${this.fontsUrl ? `<link rel="stylesheet" href="${this.fontsUrl}">` : ''}
        <style>
          html,body{margin:0;padding:0;background:transparent;overflow:hidden;}
          body > svg{display:block;width:${w}px;height:${h}px;}
        </style>
      </head><body>${svg}</body></html>`,
      { waitUntil: 'networkidle' },
    )
    try {
      await this.page.evaluate(() => document.fonts.ready)
    } catch {
      /* sem webfonts — segue com fonte de sistema */
    }
    return this.page.screenshot({ omitBackground: true, type: 'png' })
  }

  async close() {
    await this.browser.close()
  }
}
