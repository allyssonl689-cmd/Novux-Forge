# architecture_spec.md
> Fonte única de verdade para o projeto de app mobile de musculação.
> Leia este arquivo **inteiro** antes de criar qualquer arquivo, pasta, componente ou query.

---

## 1. VISÃO GERAL DO PRODUTO

**Nome do app:** `Novux Forge`
**Plataforma:** iOS + Android via Expo (React Native)
**Posicionamento:** App premium de tracking de treinos de musculação — nível Hevy / Strong / Boostcamp
**Público-alvo:** 18–40 anos, praticantes de musculação intermediários a avançados

### Funcionalidades do Escopo Inicial (MVP)
1. Autenticação (e-mail + senha via Supabase Auth)
2. Tela Home com resumo da semana e próximo treino
3. Tela de Histórico de treinos
4. Tela de Execução de Treino Ativo com cronômetro
5. Biblioteca de Exercícios com cards instrutivos
6. Criação e edição de Fichas de Treino (workouts)

---

## 2. STACK TECNOLÓGICA

### Frontend
| Camada | Tecnologia | Versão |
|---|---|---|
| Framework | React Native via Expo SDK | 51+ |
| Linguagem | TypeScript | 5.x (strict mode) |
| Navegação | Expo Router v3 (file-based) | 3.x |
| Estado global | Zustand | 4.x |
| Servidor de estado / cache | TanStack Query (React Query) | 5.x |
| Formulários | React Hook Form + Zod | latest |
| Estilo | StyleSheet nativo + design tokens | — |
| Armazenamento seguro | expo-secure-store | latest |
| Fontes | @expo-google-fonts/plus-jakarta-sans | latest |
| Ícones | @expo/vector-icons (Feather) | latest |
| Blur/Glass | expo-blur (somente em telas estáticas) | latest |
| Animações | react-native-reanimated v3 | 3.x |
| Haptics | expo-haptics | latest |

### Backend
| Camada | Tecnologia |
|---|---|
| BaaS | Supabase |
| Banco de dados | PostgreSQL (via Supabase) |
| Autenticação | Supabase Auth (e-mail + senha) |
| Armazenamento de arquivos | Supabase Storage (avatares + GIFs de exercícios) |
| Segurança de dados | Row Level Security (RLS) em todas as tabelas |
| Variáveis de ambiente | expo-constants + .env via EAS |
| Fonte de exercícios (base) | Free Exercise DB — GitHub (MIT, 873 exercícios, gratuito) |
| Fonte de GIFs (opcional) | ExerciseDB via RapidAPI (pago, com cache em Storage) |

### Pacotes adicionais de mídia
| Pacote | Função |
|---|---|
| `expo-image` | Renderização de GIF/JPG com cache nativo e placeholder |
| `expo-file-system` | Download de GIF para cache local (offline) |

---

## 3. IDENTIDADE VISUAL

### 3.1 Conceito
**Modelo Híbrido:** base **Neon Athletic** (Conceito C) com glassmorphism sutil do **Premium Midnight** (Conceito B) em seções estáticas (Home/Dashboard apenas — nunca em listas ou telas de treino ativo).

### 3.2 Paleta de Cores

```typescript
// src/theme/colors.ts

export const colors = {
  // Backgrounds
  bg: {
    base:     '#07080C',   // fundo principal do app
    surface:  '#0F1018',   // cards, modais, bottom sheets
    elevated: '#181A26',   // inputs, itens de lista
    overlay:  'rgba(7,8,12,0.85)', // overlays e modais escuros
  },

  // Accent principal — Neon Cyan
  accent: {
    default:  '#00FFD4',
    glow:     'rgba(0,255,212,0.22)',
    dim:      'rgba(0,255,212,0.12)',
    border:   'rgba(0,255,212,0.25)',
  },

  // Accent secundário — Amber (PRs, streaks, conquistas)
  amber: {
    default:  '#F5C842',
    dim:      'rgba(245,200,66,0.12)',
    border:   'rgba(245,200,66,0.25)',
  },

  // Feedback
  feedback: {
    success:  '#2DD4A4',
    danger:   '#FF4757',
    warning:  '#FF9F43',
    info:     '#4D9EFF',
  },

  // Texto
  text: {
    primary:   '#EEEEF5',
    secondary: '#7A7D96',
    tertiary:  '#3D4060',
    inverse:   '#07080C',
  },

  // Bordas
  border: {
    default: 'rgba(255,255,255,0.06)',
    subtle:  'rgba(255,255,255,0.04)',
    strong:  'rgba(255,255,255,0.12)',
  },
} as const;
```

### 3.3 Tipografia

**Família única:** `Plus Jakarta Sans` (variable, 200–800, com itálico)

```typescript
// src/theme/typography.ts

export const typography = {
  // Papéis tipográficos
  display: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 52,
    lineHeight: 52,
    letterSpacing: -2,
  },
  h1: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.5,
  },
  h2: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.3,
  },
  h3: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: -0.2,
  },
  subheading: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: 0,
  },
  body: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 14,
    lineHeight: 22,
    letterSpacing: 0,
  },
  bodySmall: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 12,
    lineHeight: 18,
    letterSpacing: 0,
  },
  label: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 2,
    textTransform: 'uppercase' as const,
  },
  labelSmall: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 9,
    lineHeight: 14,
    letterSpacing: 2.5,
    textTransform: 'uppercase' as const,
  },
  caption: {
    fontFamily: 'PlusJakartaSans_300Light',
    fontSize: 12,
    lineHeight: 18,
    letterSpacing: 0,
  },

  // Pesos para uso avulso
  weights: {
    light:     'PlusJakartaSans_300Light',
    regular:   'PlusJakartaSans_400Regular',
    medium:    'PlusJakartaSans_500Medium',
    semiBold:  'PlusJakartaSans_600SemiBold',
    bold:      'PlusJakartaSans_700Bold',
    extraBold: 'PlusJakartaSans_800ExtraBold',
  },
} as const;
```

**Instalação (já incluir no setup):**
```bash
npx expo install @expo-google-fonts/plus-jakarta-sans expo-font
```

**Pesos a carregar no `_layout.tsx`:**
```typescript
import {
  PlusJakartaSans_300Light,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/plus-jakarta-sans';
```

### 3.4 Espaçamento e Raios

```typescript
// src/theme/spacing.ts

export const spacing = {
  xs:  4,
  sm:  8,
  md:  12,
  lg:  16,
  xl:  20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 56,
} as const;

export const radius = {
  sm:   6,
  md:   10,
  lg:   14,
  xl:   18,
  '2xl': 22,
  full: 9999,
} as const;
```

### 3.5 Uso do Glassmorphism
- ✅ **Permitido:** Somente em `Home` e `Dashboard` — cards de "próximo treino" e "stats da semana"
- ❌ **Proibido:** Telas de treino ativo, listas de exercícios, inputs de carga/reps
- **Implementação:** `expo-blur` com `BlurView intensity={18}` + background `rgba(255,255,255,0.03)`

### 3.6 Mídia Instrutiva de Exercícios

#### Estratégia em 3 camadas (ordem de prioridade)

```
Camada 1 — Supabase Storage (fonte primária)
  → GIFs e JPGs hospedados no bucket "exercise-media" (controle total)
  → URL pública: {SUPABASE_URL}/storage/v1/object/public/exercise-media/{slug}/{0.gif|0.jpg|1.jpg}
  → Se existir no Storage → usa direto, não consulta API externa

Camada 2 — ExerciseDB via RapidAPI (enriquecimento sob demanda)
  → Acionado somente se Camada 1 não tiver o GIF do exercício
  → Baixa o GIF, faz upload automático no Supabase Storage (cache permanente)
  → A partir daí, a Camada 1 sempre responde — API externa nunca mais é chamada
  → Requer: RAPIDAPI_KEY configurada nas variáveis de ambiente

Camada 3 — Free Exercise DB via GitHub (fallback garantido)
  → Imagens JPG estáticas (pose inicial + pose final)
  → URL: https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/{id}/{0|1}.jpg
  → 873 exercícios, gratuito, MIT license, sem autenticação
  → Sempre disponível — último recurso se Camadas 1 e 2 falharem
```

#### Lógica de resolução de mídia (`src/lib/mediaResolver.ts`)

```typescript
// src/lib/mediaResolver.ts

import * as FileSystem from 'expo-file-system';
import { supabase } from './supabase';

const FREE_DB_BASE =
  'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises';

export type MediaResult = {
  type: 'gif' | 'jpg';
  uri: string;         // URI final para renderizar no <Image />
  source: 'storage' | 'rapidapi' | 'free-db';
};

/**
 * Resolve a melhor mídia disponível para um exercício.
 * Percorre as 3 camadas em ordem e retorna a primeira que funcionar.
 */
export async function resolveExerciseMedia(
  slug: string,           // ex: "supino-reto-barra"
  freeDbId: string,       // ex: "Barbell_Bench_Press_-_Medium_Grip"
  rapidApiId?: string,    // ex: "0009" — opcional
): Promise<MediaResult> {

  // ── CAMADA 1: Supabase Storage ──────────────────────────
  const storageGifPath = `${slug}/0.gif`;
  const { data: storageGif } = supabase.storage
    .from('exercise-media')
    .getPublicUrl(storageGifPath);

  if (await urlExists(storageGif.publicUrl)) {
    return { type: 'gif', uri: storageGif.publicUrl, source: 'storage' };
  }

  const storageJpgPath = `${slug}/0.jpg`;
  const { data: storageJpg } = supabase.storage
    .from('exercise-media')
    .getPublicUrl(storageJpgPath);

  if (await urlExists(storageJpg.publicUrl)) {
    return { type: 'jpg', uri: storageJpg.publicUrl, source: 'storage' };
  }

  // ── CAMADA 2: ExerciseDB RapidAPI (com cache automático) ─
  if (rapidApiId && process.env.EXPO_PUBLIC_RAPIDAPI_KEY) {
    try {
      const gifUri = await fetchAndCacheRapidApiGif(rapidApiId, slug);
      if (gifUri) return { type: 'gif', uri: gifUri, source: 'rapidapi' };
    } catch {
      // falhou silenciosamente → cai na Camada 3
    }
  }

  // ── CAMADA 3: Free Exercise DB (fallback estático) ───────
  const fallbackUri = `${FREE_DB_BASE}/${freeDbId}/0.jpg`;
  return { type: 'jpg', uri: fallbackUri, source: 'free-db' };
}

/**
 * Busca o GIF no RapidAPI e faz upload no Supabase Storage (cache permanente).
 * Retorna a URL pública do Storage após o upload.
 */
async function fetchAndCacheRapidApiGif(
  rapidApiId: string,
  slug: string,
): Promise<string | null> {
  const response = await fetch(
    `https://exercisedb.p.rapidapi.com/exercises/exercise/${rapidApiId}`,
    {
      headers: {
        'X-RapidAPI-Key': process.env.EXPO_PUBLIC_RAPIDAPI_KEY!,
        'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com',
      },
    },
  );

  if (!response.ok) return null;

  const exercise = await response.json();
  const gifUrl: string = exercise.gifUrl;
  if (!gifUrl) return null;

  // Baixa o GIF para o filesystem temporário do dispositivo
  const localPath = `${FileSystem.cacheDirectory}${slug}.gif`;
  const download = await FileSystem.downloadAsync(gifUrl, localPath);
  if (download.status !== 200) return null;

  // Lê o arquivo como base64 e faz upload no Supabase Storage
  const base64 = await FileSystem.readAsStringAsync(localPath, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const byteArray = Uint8Array.from(atob(base64), c => c.charCodeAt(0));

  const { error } = await supabase.storage
    .from('exercise-media')
    .upload(`${slug}/0.gif`, byteArray, {
      contentType: 'image/gif',
      upsert: true,
    });

  if (error) return null;

  // Retorna a URL pública do Storage (Camada 1 responderá nas próximas chamadas)
  const { data } = supabase.storage
    .from('exercise-media')
    .getPublicUrl(`${slug}/0.gif`);

  return data.publicUrl;
}

/** Verifica se uma URL retorna 200 sem baixar o conteúdo */
async function urlExists(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: 'HEAD' });
    return res.ok;
  } catch {
    return false;
  }
}
```

#### Componente de mídia (`src/components/workout/ExerciseMedia.tsx`)

```typescript
// src/components/workout/ExerciseMedia.tsx
// Renderiza GIF ou JPG com fallback visual e estado de loading

import { Image } from 'expo-image';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, radius } from '@/theme';
import { resolveExerciseMedia, MediaResult } from '@/lib/mediaResolver';

interface Props {
  slug: string;
  freeDbId: string;
  rapidApiId?: string;
  width?: number;
  height?: number;
}

export function ExerciseMedia({ slug, freeDbId, rapidApiId, width = 320, height = 220 }: Props) {
  const [media, setMedia] = useState<MediaResult | null>(null);

  useEffect(() => {
    resolveExerciseMedia(slug, freeDbId, rapidApiId).then(setMedia);
  }, [slug, freeDbId, rapidApiId]);

  return (
    <View style={[styles.container, { width, height }]}>
      <Image
        source={{ uri: media?.uri }}
        style={styles.image}
        contentFit="cover"
        // expo-image faz cache nativo e suporta GIF animado nativamente
        cachePolicy="memory-disk"
        // Placeholder cinza enquanto carrega
        placeholder={{ color: colors.bg.elevated }}
        transition={300}
      />
      {/* Badge de fonte apenas em desenvolvimento */}
      {__DEV__ && media && (
        <View style={styles.badge}>
          {/* source: 'storage' | 'rapidapi' | 'free-db' */}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.bg.elevated,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
  },
});
```

#### Bucket Supabase Storage — configuração

```sql
-- Criar bucket público "exercise-media" via SQL (ou pelo dashboard)
insert into storage.buckets (id, name, public)
values ('exercise-media', 'exercise-media', true);

-- Política: qualquer autenticado pode ler
create policy "exercise-media: leitura pública"
  on storage.objects for select
  using (bucket_id = 'exercise-media');

-- Política: somente service_role pode fazer upload (via Edge Function ou admin)
-- No cliente, o upload do cache do RapidAPI usa a anon key com permissão de insert
create policy "exercise-media: insert para cache"
  on storage.objects for insert
  with check (bucket_id = 'exercise-media' and auth.role() = 'authenticated');
```

#### Campo `free_db_id` na tabela `exercises`

O campo `free_db_id` mapeia o exercício do banco para o ID correspondente no Free Exercise DB (usado na Camada 3). O campo `rapid_api_id` é opcional e ativa a Camada 2.

> Esses campos já estão incluídos na migration SQL atualizada na seção 6.2.

---

## 4. ESTRUTURA DE PASTAS

```
/
├── app/                          # Expo Router — rotas file-based
│   ├── _layout.tsx               # Root layout: fontes, providers, tema
│   ├── (auth)/                   # Grupo de rotas não autenticadas
│   │   ├── _layout.tsx
│   │   ├── sign-in.tsx
│   │   └── sign-up.tsx
│   └── (app)/                    # Grupo de rotas autenticadas
│       ├── _layout.tsx           # Tab Navigator (3 abas)
│       ├── index.tsx             # Aba: Home / Dashboard
│       ├── history/
│       │   ├── _layout.tsx
│       │   └── index.tsx         # Aba: Histórico
│       ├── exercises/
│       │   ├── _layout.tsx
│       │   ├── index.tsx         # Aba: Biblioteca de Exercícios
│       │   └── [id].tsx          # Detalhe de exercício
│       └── workout/
│           ├── active.tsx        # Tela de Treino Ativo (modal full-screen)
│           └── [id].tsx          # Detalhe de treino do histórico
│
├── src/
│   ├── theme/                    # Design tokens
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   ├── spacing.ts
│   │   └── index.ts              # Re-exporta tudo: import { colors } from '@/theme'
│   │
│   ├── components/               # Componentes reutilizáveis
│   │   ├── ui/                   # Átomos: Button, Input, Badge, Divider
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Badge.tsx
│   │   │   └── index.ts
│   │   ├── workout/              # Moléculas específicas de treino
│   │   │   ├── ExerciseCard.tsx
│   │   │   ├── ExerciseMedia.tsx # GIF/JPG com fallback em 3 camadas
│   │   │   ├── SetRow.tsx
│   │   │   ├── WorkoutTimer.tsx
│   │   │   ├── StatCard.tsx
│   │   │   └── index.ts
│   │   └── layout/               # Shell, SafeArea, ScreenHeader
│   │       ├── ScreenHeader.tsx
│   │       ├── SafeScreen.tsx
│   │       └── index.ts
│   │
│   ├── features/                 # Lógica de domínio por feature
│   │   ├── auth/
│   │   │   ├── useAuth.ts        # Hook de autenticação
│   │   │   ├── authStore.ts      # Zustand store de auth
│   │   │   └── authService.ts    # Chamadas ao Supabase Auth
│   │   ├── exercises/
│   │   │   ├── useExercises.ts   # TanStack Query hooks
│   │   │   └── exerciseService.ts
│   │   ├── workouts/
│   │   │   ├── useWorkouts.ts
│   │   │   ├── workoutService.ts
│   │   │   └── activeWorkoutStore.ts  # Zustand: estado do treino em andamento
│   │   └── history/
│   │       ├── useHistory.ts
│   │       └── historyService.ts
│   │
│   ├── lib/                      # Infraestrutura e helpers
│   │   ├── supabase.ts           # Client Supabase configurado
│   │   ├── secureStorage.ts      # Wrapper do expo-secure-store
│   │   ├── queryClient.ts        # TanStack Query client config
│   │   ├── mediaResolver.ts      # Resolução de mídia em 3 camadas (GIF/JPG)
│   │   └── utils.ts              # Helpers genéricos (formatTime, formatKg…)
│   │
│   ├── types/                    # Tipos TypeScript globais
│   │   ├── database.ts           # Tipos gerados do schema Supabase
│   │   ├── workout.ts            # Tipos de domínio de treino
│   │   └── index.ts
│   │
│   └── hooks/                    # Hooks utilitários globais
│       ├── useTimer.ts           # Cronômetro do treino ativo
│       ├── useHaptics.ts         # Feedback tátil
│       └── useTheme.ts           # Acesso ao tema
│
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql   # Schema completo + RLS
│   ├── seed/
│   │   └── exercises_seed.sql        # 15+ exercícios iniciais
│   └── storage/
│       └── exercise-media/           # Bucket público (GIFs e JPGs curados)
│           └── README.md             # Instruções de upload manual
│
├── assets/
│   ├── images/
│   └── fonts/                    # (vazio — fontes via expo-google-fonts)
│
├── .env.example                  # Template de variáveis de ambiente
├── app.config.ts                 # Configuração Expo (lê .env)
├── tsconfig.json                 # TypeScript com path aliases
├── babel.config.js
└── package.json
```

---

## 5. PATH ALIASES (tsconfig.json)

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*":            ["src/*"],
      "@/theme":        ["src/theme/index.ts"],
      "@/components/*": ["src/components/*"],
      "@/features/*":   ["src/features/*"],
      "@/lib/*":        ["src/lib/*"],
      "@/types/*":      ["src/types/*"],
      "@/hooks/*":      ["src/hooks/*"]
    }
  }
}
```

---

## 6. BANCO DE DADOS — SCHEMA SUPABASE

### 6.1 Diagrama de Entidades

```
users (auth.users estendido)
  └── workouts (fichas de treino)
        └── workout_exercises (exercícios de uma ficha)
  └── workout_logs (sessões realizadas)
        └── exercise_logs (execução por exercício)
              └── set_logs (cada série registrada)

exercises (tabela global, pública — seed + user-created)
```

### 6.2 Migration SQL Completa

```sql
-- ============================================================
-- 001_initial_schema.sql
-- Executar via: supabase db push
-- ============================================================

-- Habilitar extensão UUID
create extension if not exists "uuid-ossp";

-- ============================================================
-- TABELA: profiles
-- Extensão da auth.users do Supabase
-- ============================================================
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  username      text unique,
  display_name  text,
  avatar_url    text,
  body_weight   numeric(5,2),           -- kg, opcional
  created_at    timestamptz default now() not null,
  updated_at    timestamptz default now() not null
);

comment on table public.profiles is 'Perfil público estendido do usuário';

-- Trigger: cria profile automaticamente ao cadastrar
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- TABELA: exercises
-- Catálogo global de exercícios (público + criados pelo usuário)
-- ============================================================
create table public.exercises (
  id              uuid primary key default uuid_generate_v4(),
  name            text not null,
  slug            text unique not null,             -- ex: "supino-reto-barra"
  muscle_group    text not null,                    -- ex: "Peito"
  muscles_worked  text[] default '{}',              -- ex: ["Tríceps", "Ombro Anterior"]
  equipment       text not null,                    -- ex: "Barra", "Halter", "Cabo", "Máquina", "Peso Corporal"
  category        text not null,                    -- ex: "Empurrão", "Puxada", "Pernas", "Core"
  difficulty      text default 'intermediate',      -- beginner | intermediate | advanced
  instructions    text[] default '{}',              -- passo a passo como array de strings
  tips            text[] default '{}',              -- dicas de execução
  is_public       boolean default true,             -- false = criado pelo usuário
  created_by      uuid references auth.users(id),   -- null = exercício oficial

  -- ── Campos de mídia instrutiva ──────────────────────────
  free_db_id      text,   -- ID no Free Exercise DB (Camada 3 do mediaResolver)
                          -- ex: "Barbell_Bench_Press_-_Medium_Grip"
  rapid_api_id    text,   -- ID no ExerciseDB RapidAPI (Camada 2, opcional)
                          -- ex: "0009"
  -- Nota: GIFs/JPGs da Camada 1 ficam em Supabase Storage
  -- bucket "exercise-media", path: "{slug}/0.gif" ou "{slug}/0.jpg"

  created_at      timestamptz default now() not null
);

comment on table public.exercises is 'Catálogo de exercícios — públicos e criados por usuários';
comment on column public.exercises.free_db_id is 'ID no Free Exercise DB (github: yuhonas/free-exercise-db) — usado como fallback de mídia';
comment on column public.exercises.rapid_api_id is 'ID no ExerciseDB (RapidAPI) — usado para buscar GIF animado sob demanda com cache no Storage';

-- ============================================================
-- TABELA: workouts
-- Fichas de treino do usuário
-- ============================================================
create table public.workouts (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,                        -- ex: "Hipertrofia — Push A"
  description text,
  category    text,                                 -- ex: "Push", "Pull", "Legs", "Full Body"
  is_active   boolean default true,
  sort_order  integer default 0,
  created_at  timestamptz default now() not null,
  updated_at  timestamptz default now() not null
);

comment on table public.workouts is 'Fichas de treino criadas pelo usuário';

-- ============================================================
-- TABELA: workout_exercises
-- Exercícios de uma ficha, com configuração padrão de séries
-- ============================================================
create table public.workout_exercises (
  id                uuid primary key default uuid_generate_v4(),
  workout_id        uuid not null references public.workouts(id) on delete cascade,
  exercise_id       uuid not null references public.exercises(id),
  sort_order        integer default 0,
  default_sets      integer default 3,
  default_reps      integer default 10,
  default_weight_kg numeric(6,2),
  rest_seconds      integer default 90,
  notes             text,
  created_at        timestamptz default now() not null
);

comment on table public.workout_exercises is 'Exercícios de cada ficha com configuração padrão';

-- ============================================================
-- TABELA: workout_logs
-- Registro de cada sessão de treino realizada
-- ============================================================
create table public.workout_logs (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  workout_id    uuid references public.workouts(id) on delete set null,  -- null se ficha deletada
  name          text not null,              -- snapshot do nome da ficha no momento
  started_at    timestamptz not null,
  finished_at   timestamptz,               -- null = treino em andamento
  duration_secs integer,                   -- calculado ao finalizar
  total_volume_kg numeric(10,2) default 0, -- calculado ao finalizar
  notes         text,
  created_at    timestamptz default now() not null
);

comment on table public.workout_logs is 'Sessões de treino realizadas — histórico imutável';

-- ============================================================
-- TABELA: exercise_logs
-- Registro de cada exercício dentro de uma sessão
-- ============================================================
create table public.exercise_logs (
  id             uuid primary key default uuid_generate_v4(),
  workout_log_id uuid not null references public.workout_logs(id) on delete cascade,
  exercise_id    uuid not null references public.exercises(id),
  exercise_name  text not null,             -- snapshot do nome
  sort_order     integer default 0,
  notes          text,
  created_at     timestamptz default now() not null
);

comment on table public.exercise_logs is 'Exercícios executados em cada sessão de treino';

-- ============================================================
-- TABELA: set_logs
-- Registro de cada série individual
-- ============================================================
create table public.set_logs (
  id               uuid primary key default uuid_generate_v4(),
  exercise_log_id  uuid not null references public.exercise_logs(id) on delete cascade,
  set_number       integer not null,
  weight_kg        numeric(6,2),            -- null = peso corporal
  reps             integer,
  duration_secs    integer,                 -- para exercícios isométricos
  rpe              numeric(3,1),            -- Rate of Perceived Exertion: 1–10
  is_warmup        boolean default false,
  is_personal_record boolean default false,
  completed_at     timestamptz default now() not null
);

comment on table public.set_logs is 'Cada série registrada — granularidade máxima do tracking';

-- ============================================================
-- ÍNDICES DE PERFORMANCE
-- ============================================================
create index idx_workouts_user_id         on public.workouts(user_id);
create index idx_workout_exercises_wid    on public.workout_exercises(workout_id);
create index idx_workout_logs_user_id     on public.workout_logs(user_id);
create index idx_workout_logs_started_at  on public.workout_logs(started_at desc);
create index idx_exercise_logs_wlog_id    on public.exercise_logs(workout_log_id);
create index idx_set_logs_exlog_id        on public.set_logs(exercise_log_id);
create index idx_exercises_muscle_group   on public.exercises(muscle_group);
create index idx_exercises_is_public      on public.exercises(is_public);
```

### 6.3 Row Level Security (RLS)

```sql
-- ============================================================
-- RLS — Row Level Security
-- Garante isolamento total por usuário
-- ============================================================

-- Habilitar RLS em todas as tabelas
alter table public.profiles          enable row level security;
alter table public.exercises         enable row level security;
alter table public.workouts          enable row level security;
alter table public.workout_exercises enable row level security;
alter table public.workout_logs      enable row level security;
alter table public.exercise_logs     enable row level security;
alter table public.set_logs          enable row level security;

-- ── PROFILES ─────────────────────────────────────────────
create policy "profiles: usuário vê o próprio perfil"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles: usuário edita o próprio perfil"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ── EXERCISES ────────────────────────────────────────────
-- Exercícios públicos: qualquer autenticado pode ler
create policy "exercises: leitura pública para autenticados"
  on public.exercises for select
  using (auth.role() = 'authenticated' and (is_public = true or created_by = auth.uid()));

-- Exercícios privados: só o criador pode inserir/editar/deletar
create policy "exercises: insert pelo próprio usuário"
  on public.exercises for insert
  with check (auth.uid() = created_by);

create policy "exercises: update pelo criador"
  on public.exercises for update
  using (auth.uid() = created_by)
  with check (auth.uid() = created_by);

create policy "exercises: delete pelo criador"
  on public.exercises for delete
  using (auth.uid() = created_by);

-- ── WORKOUTS ─────────────────────────────────────────────
create policy "workouts: select próprio usuário"
  on public.workouts for select
  using (auth.uid() = user_id);

create policy "workouts: insert próprio usuário"
  on public.workouts for insert
  with check (auth.uid() = user_id);

create policy "workouts: update próprio usuário"
  on public.workouts for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "workouts: delete próprio usuário"
  on public.workouts for delete
  using (auth.uid() = user_id);

-- ── WORKOUT_EXERCISES ────────────────────────────────────
-- Acesso via JOIN com workouts (user_id)
create policy "workout_exercises: acesso via workout do usuário"
  on public.workout_exercises for all
  using (
    exists (
      select 1 from public.workouts w
      where w.id = workout_id and w.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.workouts w
      where w.id = workout_id and w.user_id = auth.uid()
    )
  );

-- ── WORKOUT_LOGS ─────────────────────────────────────────
create policy "workout_logs: select próprio usuário"
  on public.workout_logs for select
  using (auth.uid() = user_id);

create policy "workout_logs: insert próprio usuário"
  on public.workout_logs for insert
  with check (auth.uid() = user_id);

create policy "workout_logs: update próprio usuário"
  on public.workout_logs for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "workout_logs: delete próprio usuário"
  on public.workout_logs for delete
  using (auth.uid() = user_id);

-- ── EXERCISE_LOGS ────────────────────────────────────────
create policy "exercise_logs: acesso via workout_log do usuário"
  on public.exercise_logs for all
  using (
    exists (
      select 1 from public.workout_logs wl
      where wl.id = workout_log_id and wl.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.workout_logs wl
      where wl.id = workout_log_id and wl.user_id = auth.uid()
    )
  );

-- ── SET_LOGS ─────────────────────────────────────────────
create policy "set_logs: acesso via exercise_log do usuário"
  on public.set_logs for all
  using (
    exists (
      select 1 from public.exercise_logs el
      join public.workout_logs wl on wl.id = el.workout_log_id
      where el.id = exercise_log_id and wl.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.exercise_logs el
      join public.workout_logs wl on wl.id = el.workout_log_id
      where el.id = exercise_log_id and wl.user_id = auth.uid()
    )
  );
```

### 6.4 Seed de Exercícios (15 exercícios)

```sql
-- ============================================================
-- exercises_seed.sql — 15 exercícios populares
-- Campos free_db_id e rapid_api_id mapeiam para as APIs externas
-- ============================================================

insert into public.exercises
  (name, slug, muscle_group, muscles_worked, equipment, category,
   difficulty, instructions, tips, free_db_id, rapid_api_id)
values

-- ── PEITO ────────────────────────────────────────────────

('Supino Reto com Barra',
 'supino-reto-barra', 'Peito',
 ARRAY['Tríceps','Ombro Anterior'],
 'Barra', 'Empurrão', 'intermediate',
 ARRAY[
   'Deite no banco com os pés apoiados no chão.',
   'Segure a barra com pegada levemente mais larga que os ombros.',
   'Desça a barra de forma controlada até tocar levemente no peito.',
   'Empurre a barra para cima até estender os cotovelos completamente.',
   'Mantenha as escápulas retraídas durante todo o movimento.'
 ],
 ARRAY['Cotovelos a 45–75° do tronco','Não solte a barra bruscamente','Expire ao subir'],
 'Barbell_Bench_Press_-_Medium_Grip', '0025'),

('Supino Inclinado com Halteres',
 'supino-inclinado-halteres', 'Peito',
 ARRAY['Feixe Clavicular do Peitoral','Ombro Anterior'],
 'Halter', 'Empurrão', 'intermediate',
 ARRAY[
   'Ajuste o banco a 30–45°.',
   'Segure um halter em cada mão na altura do peito, com as palmas voltadas para frente.',
   'Pressione os halteres para cima até que os braços estejam quase estendidos.',
   'Desça de forma controlada até o nível do peito.'
 ],
 ARRAY['Ângulo de 30° ativa mais o peitoral que 45°','Gire levemente os pulsos ao subir'],
 'Dumbbell_Incline_Bench_Press', '0303'),

('Crucifixo com Halteres',
 'crucifixo-halteres', 'Peito',
 ARRAY['Peitoral Menor'],
 'Halter', 'Empurrão', 'intermediate',
 ARRAY[
   'Deite no banco plano com um halter em cada mão.',
   'Estenda os braços acima do peito com leve flexão nos cotovelos.',
   'Abra os braços em arco, descendo os halteres até a altura dos ombros.',
   'Traga de volta como se abraçasse uma árvore grande.'
 ],
 ARRAY['Mantenha a leve flexão nos cotovelos constante','Foque no alongamento no ponto mais baixo'],
 'Dumbbell_Flyes', '0284'),

-- ── COSTAS ───────────────────────────────────────────────

('Puxada Frontal na Máquina',
 'puxada-frontal-maquina', 'Costas',
 ARRAY['Bíceps','Romboides'],
 'Máquina', 'Puxada', 'beginner',
 ARRAY[
   'Sente-se e posicione as coxas sob o apoio.',
   'Segure a barra com pegada pronada, mais larga que os ombros.',
   'Puxe a barra em direção à parte superior do peito, trazendo os cotovelos para baixo.',
   'Pause um segundo ao final e retorne de forma controlada.'
 ],
 ARRAY['Incline levemente o tronco para trás','Não balance o corpo para puxar mais carga'],
 'Front_Lat_Pulldown', '0320'),

('Remada Curvada com Barra',
 'remada-curvada-barra', 'Costas',
 ARRAY['Bíceps','Trapézio','Lombar'],
 'Barra', 'Puxada', 'intermediate',
 ARRAY[
   'Segure a barra com pegada pronada e incline o tronco a ~45°.',
   'Mantenha a coluna neutra com o core ativado.',
   'Puxe a barra em direção ao abdômen inferior, retraindo as escápulas.',
   'Desça a barra até os braços estarem estendidos.'
 ],
 ARRAY['Evite usar a lombar para puxar','Cotovelos próximos ao corpo para foco no dorsal'],
 'Barbell_Bent_Over_Row', '0032'),

('Puxada com Pegada Supinada',
 'puxada-supinada', 'Costas',
 ARRAY['Bíceps','Infraespinal'],
 'Barra', 'Puxada', 'intermediate',
 ARRAY[
   'Segure a barra com pegada supinada (palmas para você), na largura dos ombros.',
   'Puxe o peito em direção à barra, trazendo os cotovelos ao lado do tronco.',
   'Desça de forma controlada até os braços estenderem completamente.'
 ],
 ARRAY['Pegada supinada recrutará mais bíceps que a pronada'],
 'Underhand_Cable_Pulldowns', '0651'),

-- ── OMBROS ───────────────────────────────────────────────

('Desenvolvimento Militar com Barra',
 'desenvolvimento-militar-barra', 'Ombro',
 ARRAY['Tríceps','Trapézio Superior'],
 'Barra', 'Empurrão', 'intermediate',
 ARRAY[
   'Em pé (ou sentado), segure a barra na frente do pescoço, na altura dos ombros.',
   'Pressione a barra para cima até os braços estenderem.',
   'Desça de forma controlada até o ponto de partida.'
 ],
 ARRAY['Core contraído para proteger a lombar','Não hiperestenda o pescoço ao subir'],
 'Barbell_Military_Press', '0052'),

('Elevação Lateral com Halteres',
 'elevacao-lateral-halteres', 'Ombro',
 ARRAY['Deltóide Médio'],
 'Halter', 'Empurrão', 'beginner',
 ARRAY[
   'Em pé, segure um halter em cada mão ao lado do corpo.',
   'Eleve os braços lateralmente até a altura dos ombros, com leve flexão no cotovelo.',
   'Desça de forma controlada.'
 ],
 ARRAY['Incline levemente o tronco para frente','Controle a descida — o excêntrico importa'],
 'Dumbbell_Lateral_Raise', '0290'),

-- ── PERNAS ───────────────────────────────────────────────

('Agachamento Livre com Barra',
 'agachamento-livre-barra', 'Quadríceps',
 ARRAY['Glúteos','Isquiotibiais','Core','Lombar'],
 'Barra', 'Pernas', 'intermediate',
 ARRAY[
   'Posicione a barra nos trapézios ou no nível dos ombros (low bar).',
   'Afaste os pés na largura dos ombros, pontas voltadas levemente para fora.',
   'Desça controlando o joelho alinhado com o segundo dedo do pé.',
   'Desça até a dobra do quadril ficar abaixo do nível do joelho (full squat).',
   'Empurre o chão e suba mantendo o peito alto.'
 ],
 ARRAY['Respire fundo antes de descer (Valsalva)','Não deixe os joelhos colapsarem para dentro'],
 'Barbell_Full_Squat', '0043'),

('Leg Press 45°',
 'leg-press-45', 'Quadríceps',
 ARRAY['Glúteos','Isquiotibiais'],
 'Máquina', 'Pernas', 'beginner',
 ARRAY[
   'Ajuste o banco e posicione os pés na plataforma na largura dos ombros.',
   'Desbloqueie a máquina e desça a plataforma de forma controlada.',
   'Desça até os joelhos formarem ~90°.',
   'Empurre de volta sem travar os joelhos no topo.'
 ],
 ARRAY['Pés mais altos = mais glúteos; mais baixos = mais quadríceps','Não eleve os glúteos do banco'],
 'Leg_Press', '0388'),

('Stiff com Halteres',
 'stiff-halteres', 'Isquiotibiais',
 ARRAY['Glúteos','Lombar'],
 'Halter', 'Pernas', 'intermediate',
 ARRAY[
   'Em pé, segure um halter em cada mão à frente das coxas.',
   'Incline o tronco para frente com a coluna neutra, descendo os halteres.',
   'Sinta o alongamento nos isquiotibiais até ~45–60°.',
   'Contraia os glúteos ao retornar à posição inicial.'
 ],
 ARRAY['Joelhos levemente flexionados','Não arredonde a lombar','Desça somente até onde a flexibilidade permitir'],
 'Dumbbell_Romanian_Deadlift', '0329'),

('Cadeira Extensora',
 'cadeira-extensora', 'Quadríceps',
 ARRAY[],
 'Máquina', 'Pernas', 'beginner',
 ARRAY[
   'Ajuste o encosto e o apoio de tornozelo.',
   'Estenda as pernas até quase travar os joelhos.',
   'Retorne de forma lenta e controlada.',
   'Mantenha os glúteos apoiados durante o movimento.'
 ],
 ARRAY['Movimento de isolamento — ideal para finalizar o treino de pernas'],
 'Leg_Extensions', '0389'),

-- ── BÍCEPS / TRÍCEPS ─────────────────────────────────────

('Rosca Direta com Barra',
 'rosca-direta-barra', 'Bíceps',
 ARRAY['Braquial','Braquiorradial'],
 'Barra', 'Puxada', 'beginner',
 ARRAY[
   'Em pé, segure a barra com pegada supinada na largura dos ombros.',
   'Mantenha os cotovelos junto ao tronco.',
   'Flexione os cotovelos, trazendo a barra até a altura dos ombros.',
   'Desça de forma controlada.'
 ],
 ARRAY['Não balance o tronco','Cotovelos fixos = isolamento máximo'],
 'Barbell_Curl', '0037'),

('Tríceps Testa com Barra EZ',
 'triceps-testa-barra-ez', 'Tríceps',
 ARRAY[],
 'Barra', 'Empurrão', 'intermediate',
 ARRAY[
   'Deite no banco e segure a barra EZ com pegada pronada.',
   'Com os braços estendidos acima do peito, incline-os levemente para trás.',
   'Flexione os cotovelos até a barra quase tocar a testa.',
   'Estenda os cotovelos retornando à posição inicial.'
 ],
 ARRAY['Cotovelos apontando para o teto','Não abra os cotovelos para os lados'],
 'EZ-Bar_Skullcrusher', '0275'),

-- ── CORE ─────────────────────────────────────────────────

('Prancha Abdominal',
 'prancha-abdominal', 'Core',
 ARRAY['Transverso Abdominal','Lombar','Glúteos'],
 'Peso Corporal', 'Core', 'beginner',
 ARRAY[
   'Apoie os antebraços e as pontas dos pés no chão.',
   'Mantenha o corpo em linha reta da cabeça aos calcanhares.',
   'Contraia o abdômen e os glúteos durante toda a duração.',
   'Respire normalmente e evite prender o ar.'
 ],
 ARRAY['Não deixe os quadris subir ou afundar','Olhe para baixo para manter o pescoço neutro'],
 'Plank', null);  -- sem GIF no RapidAPI, usa Camada 3
```

---

## 7. CONFIGURAÇÃO DO CLIENTE SUPABASE

```typescript
// src/lib/supabase.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

// Adapter que usa SecureStore para tokens de auth (mais seguro que AsyncStorage)
const SecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

const supabaseUrl  = Constants.expoConfig?.extra?.supabaseUrl  as string;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: SecureStoreAdapter,        // ← tokens armazenados com criptografia
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,          // false para React Native
  },
});
```

---

## 8. VARIÁVEIS DE AMBIENTE

```bash
# .env.example
EXPO_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Opcional — ativa Camada 2 do mediaResolver (GIFs animados via ExerciseDB)
# Sem esta chave, o app funciona normalmente com JPGs estáticos (Camada 3)
EXPO_PUBLIC_RAPIDAPI_KEY=sua_chave_aqui
```

```typescript
// app.config.ts
import type { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'Novux Forge',
  slug: 'novux-forge',
  version: '1.0.0',
  extra: {
    supabaseUrl:     process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    rapidApiKey:     process.env.EXPO_PUBLIC_RAPIDAPI_KEY ?? null, // opcional
  },
};

export default config;
```

---

## 9. NAVEGAÇÃO — ESTRUTURA DE ABAS

```typescript
// app/(app)/_layout.tsx — Tab Navigator
// Abas: Histórico | Home (central) | Exercícios

tabs = [
  { name: 'history',   title: 'Histórico',   icon: 'clock'      },
  { name: 'index',     title: 'Home',        icon: 'home'        },   // aba central
  { name: 'exercises', title: 'Exercícios',  icon: 'book-open'  },
]

// Tela de Treino Ativo = modal stack sobre as abas (não é aba)
// Acessada via: router.push('/workout/active')
```

---

## 10. ESTADO GLOBAL — ZUSTAND STORES

### activeWorkoutStore (crítico para a tela de treino ativo)

```typescript
// src/features/workouts/activeWorkoutStore.ts

interface SetEntry {
  id: string;
  setNumber: number;
  weightKg: number | null;
  reps: number | null;
  completed: boolean;
  isPersonalRecord: boolean;
}

interface ActiveExercise {
  exerciseId: string;
  exerciseName: string;
  sortOrder: number;
  sets: SetEntry[];
}

interface ActiveWorkoutState {
  workoutLogId: string | null;
  workoutName: string;
  startedAt: Date | null;
  exercises: ActiveExercise[];
  currentExerciseIndex: number;
  isActive: boolean;

  // Actions
  startWorkout:      (workoutId: string, workoutName: string) => Promise<void>;
  updateSet:         (exerciseIndex: number, setIndex: number, data: Partial<SetEntry>) => void;
  completeSet:       (exerciseIndex: number, setIndex: number) => void;
  addSet:            (exerciseIndex: number) => void;
  finishWorkout:     () => Promise<void>;
  discardWorkout:    () => void;
}
```

---

## 11. REGRAS DE NEGÓCIO CRÍTICAS

1. **Treino Ativo é exclusivo:** apenas um `workout_log` pode ter `finished_at = null` por usuário simultaneamente.
2. **Snapshots de nome:** `workout_logs.name` e `exercise_logs.exercise_name` sempre gravam o nome no momento da execução — mesmo que a ficha seja editada depois, o histórico preserva a versão original.
3. **Volume calculado no finish:** `workout_logs.total_volume_kg` é calculado na finalização somando `weight_kg × reps` de todos os `set_logs` do treino.
4. **PR automático:** ao salvar um `set_log`, verificar se `weight_kg` supera o máximo histórico para aquele exercício + usuário. Se sim, `is_personal_record = true`.
5. **Séries de aquecimento:** `set_logs.is_warmup = true` não contabilizam no volume total.
6. **Dados biométricos opcionais:** `profiles.body_weight` e todos os campos de `set_logs` com `weight_kg = null` são válidos (ex: peso corporal como carga).
7. **Resolução de mídia em cascata:** o `mediaResolver` sempre percorre Camada 1 → 2 → 3 nessa ordem. Nunca chamar a RapidAPI se o GIF já existir no Supabase Storage. O cache é permanente — um GIF buscado uma vez nunca gera nova chamada à API externa.
8. **GIF só é buscado sob demanda:** a Camada 2 (RapidAPI) é acionada somente quando o usuário abre a tela de detalhe do exercício — nunca em listagens ou durante treino ativo (evita consumo desnecessário de cota).

---

## 12. SEGURANÇA — CHECKLIST

- [x] RLS habilitado em todas as tabelas
- [x] Tokens de auth armazenados via `expo-secure-store` (criptografado pelo SO)
- [x] Nenhuma chave secreta exposta no frontend — apenas `anon key` pública
- [x] `service_role` nunca usado no cliente — apenas server-side (Edge Functions)
- [x] Políticas RLS usam `auth.uid()` — nunca confiam em dados passados pelo cliente
- [x] `profiles` ligado a `auth.users` via cascade delete — dados removidos com a conta
- [x] Bucket `exercise-media` é público para leitura — sem exposição de dados de usuário
- [x] `EXPO_PUBLIC_RAPIDAPI_KEY` é opcional — app funciona sem ela (Camada 3 garante fallback)
- [x] GIFs do RapidAPI são cacheados no Storage próprio — app nunca fica refém de CDN externo

---

## 13. DEPENDÊNCIAS INICIAIS (package.json relevante)

```bash
# Instalação base do projeto
npx create-expo-app@latest novux-forge --template blank-typescript
cd novux-forge

# Navegação
npx expo install expo-router react-native-safe-area-context react-native-screens

# Supabase
npx expo install @supabase/supabase-js @react-native-async-storage/async-storage expo-secure-store

# Fontes
npx expo install expo-font @expo-google-fonts/plus-jakarta-sans

# UI / Animação
npx expo install react-native-reanimated expo-blur expo-haptics @expo/vector-icons

# Mídia instrutiva (GIF/JPG com cache nativo)
npx expo install expo-image expo-file-system

# Estado e Forms
npm install zustand @tanstack/react-query react-hook-form zod

# Utilitários
npx expo install expo-constants expo-status-bar
```

---

## 14. CONVENÇÕES DE CÓDIGO

- **Componentes:** PascalCase, um componente por arquivo
- **Hooks:** camelCase prefixado com `use` — ex: `useTimer`, `useWorkouts`
- **Tipos:** PascalCase, sufixo descritivo — ex: `WorkoutLog`, `ExerciseEntry`
- **Constantes:** SCREAMING_SNAKE_CASE — ex: `DEFAULT_REST_SECONDS`
- **Funções de serviço:** camelCase, verbo + entidade — ex: `createWorkoutLog`, `fetchExercises`
- **Arquivos de estilo:** StyleSheet no mesmo arquivo do componente (sem CSS-in-JS externo)
- **Imports:** sempre usar path aliases `@/` — nunca imports relativos com `../../`
- **Comentários:** em português para lógica de negócio, inglês para comentários técnicos

---

## 15. ORDEM DE IMPLEMENTAÇÃO RECOMENDADA

```
Fase 1 — Fundação
  [1] Scaffolding do projeto Expo com Expo Router
  [2] Configurar tsconfig com aliases
  [3] Criar src/theme/ completo (colors, typography, spacing)
  [4] Configurar Supabase client + SecureStore
  [5] Executar migrations SQL no Supabase Dashboard
  [6] Criar bucket "exercise-media" no Supabase Storage (público)
  [7] Executar seed de exercícios (com free_db_id e rapid_api_id)
  [8] Implementar mediaResolver.ts (3 camadas) + ExerciseMedia component

Fase 2 — Auth
  [9]  Telas sign-in e sign-up
  [10] authStore (Zustand) + listener de sessão
  [11] Redirect automático autenticado/não-autenticado

Fase 3 — Shell do App
  [12] Tab Navigator com 3 abas
  [13] SafeScreen + ScreenHeader components
  [14] Tela Home (esqueleto)

Fase 4 — Biblioteca de Exercícios
  [15] Hook useExercises (TanStack Query)
  [16] Tela de lista com busca e filtro por grupo muscular
  [17] Tela de detalhe com ExerciseMedia (GIF/JPG) + instruções

Fase 5 — Treino Ativo
  [18] activeWorkoutStore (Zustand) com toda a lógica de estado
  [19] useTimer hook (cronômetro)
  [20] Tela workout/active.tsx completa (modal full-screen)
  [21] Persistência no Supabase ao finalizar

Fase 6 — Histórico
  [22] Hook useHistory (TanStack Query)
  [23] Tela de lista do histórico
  [24] Tela de detalhe de sessão passada
```

---

*Documento gerado em: Junho/2025*
*Status: APROVADO v1.2 — nome definitivo Novux Forge — pronto para uso no Claude Code*
