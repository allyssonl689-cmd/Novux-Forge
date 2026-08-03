# Novux Forge — Identidade visual

> Gerado por `scripts/brand/build.mjs` (no repositório Novux Forge).
> **Não editar os arquivos desta pasta à mão** — eles são sobrescritos a cada build.
> Para mudar a marca, edite `scripts/brand/brands.mjs` e rode o build de novo.

Abra **[brandbook.html](./brandbook.html)** no navegador para o material visual completo.

## Estrutura

```
brand/
  brandbook.html          material visual (logos + paleta + tipografia + regras)
  logo/
    svg/                  todas as variações, vetoriais
    png/                  rasterizações prontas (ícones, marks, lockups)
  tokens/
    colors.json           todos os tokens em hex + hsl, escalas 50-900
    colors.css            custom properties (:root dark, .light)
    tailwind.tokens.cjs   fragmento de theme.extend para Tailwind
    typography.json       papéis tipográficos em dados
  fonts/
    fonts.css             @import + classes utilitárias
```

## Cores-chave

| Papel | Hex |
|---|---|
| Primary | `#FF6B2C` |
| Accent | `#FF2D78` |
| Background | `#050816` |
| Card | `#121933` |
| Success | `#19D38A` |
| Warning | `#FFC93C` |
| Destructive | `#E5484D` |

Gradiente da marca: `#FF6B2C` → `#FF2D78`

## Tipografia

- **Syne** — Branding / Títulos. Wordmark, page titles, headlines de marketing. Nunca em texto corrido.
- **Poppins** — UI / Body. Interface inteira: labels, parágrafos, botões, navegação. É a voz padrão.
- **Outfit** — Números / Métricas. Valores grandes de KPI. Finance: saldos. Forge: carga, séries, volume.
- **Fira Code** — Monospace. Números inline que precisam alinhar em coluna, IDs, código.
- **Inter** — Fallback. Substitui Poppins onde ela não carregar. Não usar deliberadamente.

## Consumo

**CSS puro / Vite**
```css
@import './brand/tokens/colors.css';
@import './brand/fonts/fonts.css';
```

**Tailwind**
```js
const brand = require('./brand/tokens/tailwind.tokens.cjs')
module.exports = { theme: { extend: { colors: brand.colors, fontFamily: brand.fontFamily } } }
```

**React Native / Expo** — consuma `tokens/colors.json` (campo `.hex`) diretamente.

## Notas

- Direção "Ember": laranja → magenta. Oposto cromático do cyan/roxo do Finance.
- ATENÇÃO — a marca ocupa a faixa quente, que é onde normalmente vivem warning e danger.
- Por isso warning foi deslocado para amarelo puro (#FFC93C) e danger para um vermelho
- dessaturado (#E5484D): a separação se dá por croma, não só por matiz.
- REGRA: no Forge, estado nunca é comunicado só por cor — sempre ícone + label junto.
- REGRA: primary/accent jamais em componentes de feedback (toast, alert, badge de status).
