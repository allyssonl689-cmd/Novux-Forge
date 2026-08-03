/** Conversões de cor e geração de escalas. Sem dependências. */

const clamp = (n, min, max) => Math.min(max, Math.max(min, n))
const round = (n, d = 0) => {
  const f = 10 ** d
  return Math.round(n * f) / f
}

/** [h, s, l] com s/l em 0-100 → "#RRGGBB" */
export function hslToHex([h, s, l]) {
  const S = s / 100
  const L = l / 100
  const k = (n) => (n + h / 30) % 12
  const a = S * Math.min(L, 1 - L)
  const f = (n) => L - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  const to = (v) =>
    clamp(Math.round(v * 255), 0, 255)
      .toString(16)
      .padStart(2, '0')
  return `#${to(f(0))}${to(f(8))}${to(f(4))}`.toUpperCase()
}

/**
 * "#RRGGBB" → [h, s, l] em 0-100, com casas decimais suficientes para que
 * hslToHex(hexToHsl(x)) === x.
 *
 * Arredondar para inteiro perde até 2 pontos por canal — foi o que fez o
 * brand book do Finance documentar #16C7FF enquanto o CSS rendia #14CCFF.
 * CSS aceita decimais em hsl(), então não há motivo para arredondar.
 */
export function hexToHslExact(hex) {
  const [h, s, l] = hexToHsl(hex)
  // Busca local: parte do valor arredondado e refina cada componente até o
  // round-trip fechar. Converge em poucas iterações para qualquer sRGB.
  const target = hex.toUpperCase()
  let best = [h, s, l]
  if (hslToHex(best) === target) return best

  // Os candidatos precisam ser CSS válido: s e l em 0-100, h em 0-360.
  // hsl(358 100.5% 67.7%) fecharia o round-trip aqui, mas o navegador clampa
  // a saturação para 100% e devolve outra cor.
  const D = [0, 0.1, -0.1, 0.2, -0.2, 0.3, -0.3, 0.4, -0.4, 0.5, -0.5, 0.7, -0.7]
  for (const dh of D) {
    for (const ds of D) {
      for (const dl of D) {
        const cand = [round((h + dh + 360) % 360, 2), round(s + ds, 2), round(l + dl, 2)]
        if (cand[1] < 0 || cand[1] > 100 || cand[2] < 0 || cand[2] > 100) continue
        if (hslToHex(cand) === target) return cand
      }
    }
  }
  return best
}

/** "#RRGGBB" → [h, s, l] com s/l em 0-100 */
export function hexToHsl(hex) {
  const m = hex.replace('#', '')
  const r = parseInt(m.slice(0, 2), 16) / 255
  const g = parseInt(m.slice(2, 4), 16) / 255
  const b = parseInt(m.slice(4, 6), 16) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const d = max - min
  const l = (max + min) / 2
  let h = 0
  let s = 0
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1))
    if (max === r) h = ((g - b) / d) % 6
    else if (max === g) h = (b - r) / d + 2
    else h = (r - g) / d + 4
    h *= 60
    if (h < 0) h += 360
  }
  return [round(h), round(s * 100), round(l * 100)]
}

export const hslCss = ([h, s, l]) => `${h} ${s}% ${l}%`

/** Luminância relativa (WCAG 2.1) */
function luminance(hex) {
  const m = hex.replace('#', '')
  const ch = [0, 2, 4].map((i) => {
    const v = parseInt(m.slice(i, i + 2), 16) / 255
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2]
}

/** Razão de contraste WCAG entre dois hex. 4.5 = mínimo AA para texto normal. */
export function contrast(a, b) {
  const la = luminance(a)
  const lb = luminance(b)
  return round((Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05), 2)
}

/**
 * Escala 50→900 a partir de uma cor base (que vira o passo 500).
 * Claros ganham lightness e perdem saturação; escuros perdem lightness.
 */
export function scale(hex) {
  const [h, s, l] = hexToHsl(hex)
  const steps = {
    50: [0.94, 0.62],
    100: [0.88, 0.72],
    200: [0.78, 0.84],
    300: [0.66, 0.94],
    400: [0.55, 1.0],
    500: [null, null], // a própria base
    600: [0.44, 0.98],
    700: [0.35, 0.92],
    800: [0.26, 0.84],
    900: [0.17, 0.74],
  }
  const out = {}
  for (const [step, [targetL, satMul]] of Object.entries(steps)) {
    if (targetL === null) {
      out[step] = hslToHex([h, s, l])
      continue
    }
    out[step] = hslToHex([h, clamp(s * satMul, 0, 100), clamp(targetL * 100, 0, 100)])
  }
  return out
}

/**
 * Deriva a variante de TEXTO de uma cor de marca: mesmo matiz e saturação,
 * lightness ajustada até atingir `target` contra a superfície de pior caso.
 *
 * Escurece no light, clareia no dark. Se a cor base já passa, devolve ela
 * mesma — no dark isso é o caso comum.
 *
 * @param baseHsl  [h, s, l] da cor de marca
 * @param surfaces array de hex das superfícies onde a cor pode aparecer
 * @param mode     'dark' | 'light'
 * @returns [h, s, l] — nunca null: se nem o extremo atingir o alvo, devolve o extremo
 */
export function deriveTextColor(baseHsl, surfaces, mode, target = 4.5) {
  const [h, s, l] = baseHsl
  const worst = (hex) => Math.min(...surfaces.map((sf) => contrast(hex, sf)))
  if (worst(hslToHex(baseHsl)) >= target) return baseHsl

  const step = mode === 'dark' ? 0.5 : -0.5
  const limit = mode === 'dark' ? 97 : 8
  for (let t = l + step; mode === 'dark' ? t <= limit : t >= limit; t += step) {
    const cand = [h, s, round(t, 2)]
    if (worst(hslToHex(cand)) >= target) return cand
  }
  return [h, s, limit]
}

/** Interpola dois hex no espaço sRGB. t em 0..1 */
export function mix(a, b, t) {
  const pa = a.replace('#', '')
  const pb = b.replace('#', '')
  const ch = [0, 2, 4].map((i) => {
    const va = parseInt(pa.slice(i, i + 2), 16)
    const vb = parseInt(pb.slice(i, i + 2), 16)
    return Math.round(va + (vb - va) * t)
      .toString(16)
      .padStart(2, '0')
  })
  return `#${ch.join('')}`.toUpperCase()
}
