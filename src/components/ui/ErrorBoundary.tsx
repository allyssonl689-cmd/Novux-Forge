import React, { Component, ReactNode, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import { ThemeColors } from '@/theme/palette';
import { radius, spacing, typography } from '@/theme';
import { Button } from './Button';

interface FallbackProps {
  onRetry: () => void;
}

/**
 * UI de erro separada do boundary: um error boundary tem que ser classe
 * (só ela tem componentDidCatch), e classe não pode usar useTheme().
 */
function DefaultFallback({ onRetry }: FallbackProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={styles.center}>
      <View style={styles.iconWrap}>
        <Feather name="alert-triangle" size={26} color={colors.feedback.danger} />
      </View>
      <Text style={styles.title}>Algo deu errado</Text>
      <Text style={styles.description}>
        A tela travou de um jeito inesperado. Tentar de novo geralmente resolve.
      </Text>
      <Button label="Tentar novamente" onPress={onRetry} style={styles.retryBtn} />
    </View>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.md,
      paddingHorizontal: spacing.lg,
    },
    iconWrap: {
      width: 56,
      height: 56,
      borderRadius: radius.full,
      backgroundColor: colors.feedback.dangerDim,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: { ...typography.h3, color: colors.text.primary, textAlign: 'center' },
    description: { ...typography.body, color: colors.text.secondary, textAlign: 'center' },
    retryBtn: { marginTop: spacing.xs, alignSelf: 'stretch' },
  });

interface Props {
  children: ReactNode;
  /** fallback customizado; por padrão usa o DefaultFallback acima */
  fallback?: (props: FallbackProps) => ReactNode;
  /** chamado quando o boundary captura um erro — para log/telemetria */
  onError?: (error: Error, info: { componentStack?: string }) => void;
}

interface State {
  error: Error | null;
  /** incrementa a cada retry — usado como key para forçar remount da subárvore */
  resetCount: number;
}

/**
 * Error boundary de propósito geral. "Tentar novamente" remonta a subárvore
 * (via key) — resolve erros transitórios (rede, estado inconsistente do
 * momento); um erro determinístico no render vai voltar a aparecer, o que é
 * esperado e sinaliza que o bug precisa ser corrigido, não só re-tentado.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null, resetCount: 0 };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack?: string }) {
    this.props.onError?.(error, info);
  }

  private handleRetry = () => {
    this.setState((s) => ({ error: null, resetCount: s.resetCount + 1 }));
  };

  render() {
    if (this.state.error) {
      return this.props.fallback
        ? this.props.fallback({ onRetry: this.handleRetry })
        : <DefaultFallback onRetry={this.handleRetry} />;
    }
    return <React.Fragment key={this.state.resetCount}>{this.props.children}</React.Fragment>;
  }
}
