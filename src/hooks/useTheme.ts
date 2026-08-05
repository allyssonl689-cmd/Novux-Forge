import { useColorScheme } from 'react-native';
import { useThemeStore } from '@/theme/themeStore';
import { palettes, ThemeColors, ThemeMode, ThemePreference } from '@/theme/palette';
import { typography } from '@/theme/typography';
import { spacing, radius } from '@/theme/spacing';

export interface ThemeApi {
  colors: ThemeColors;
  /** Modo efetivamente aplicado (dark/light já resolvido) */
  mode: ThemeMode;
  /** Preferência do usuário (dark/light/system) */
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
  /** Alterna rápido entre claro e escuro */
  toggle: () => void;
  gradient: [string, string];
  typography: typeof typography;
  spacing: typeof spacing;
  radius: typeof radius;
}

/**
 * Acesso reativo ao tema. Trocar a preferência (ou o tema do aparelho, quando
 * em 'system') re-renderiza todos os componentes que usam este hook.
 *
 *   const { colors } = useTheme();
 *   const styles = useMemo(() => makeStyles(colors), [colors]);
 */
export function useTheme(): ThemeApi {
  const preference = useThemeStore((s) => s.preference);
  const setPreference = useThemeStore((s) => s.setPreference);
  const toggleFrom = useThemeStore((s) => s.toggleFrom);
  const system = useColorScheme(); // 'dark' | 'light' | null

  const mode: ThemeMode =
    preference === 'system' ? (system === 'light' ? 'light' : 'dark') : preference;

  const colors = palettes[mode];

  return {
    colors,
    mode,
    preference,
    setPreference,
    toggle: () => toggleFrom(mode),
    gradient: colors.gradient,
    typography,
    spacing,
    radius,
  };
}
