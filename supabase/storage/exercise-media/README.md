# exercise-media — Bucket Supabase Storage

Bucket público para GIFs e JPGs de exercícios (Camada 1 do mediaResolver).

## Estrutura de paths
{slug}/0.gif   — GIF animado preferencial
{slug}/0.jpg   — JPG estático alternativo
{slug}/1.jpg   — JPG posição final (opcional)

## Como fazer upload manual
1. Acesse o Supabase Dashboard → Storage → exercise-media
2. Crie uma pasta com o slug do exercício (ex: supino-reto-barra)
3. Faça upload do arquivo como 0.gif ou 0.jpg
4. A URL pública seguirá o padrão: {SUPABASE_URL}/storage/v1/object/public/exercise-media/{slug}/0.gif

## Cache automático via RapidAPI
O mediaResolver.ts (Camada 2) faz upload automático quando o usuário abre
o detalhe de um exercício que ainda não tem GIF no Storage.
