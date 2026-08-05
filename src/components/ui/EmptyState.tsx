import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import { ThemeColors } from '@/theme/palette';
import { radius, spacing, typography } from '@/theme';

interface Props {
  icon: React.ComponentProps<typeof Feather>['name'];
  title: string;
  description?: string;
  /** botões de ação — 0, 1 ou 2, empilhados e esticados */
  children?: React.ReactNode;
}

/**
 * Estado vazio padrão: ícone em círculo, título, descrição opcional e ações.
 * Extraído do padrão repetido nas telas de fichas/exercícios/histórico —
 * usar isto em vez de remontar o mesmo bloco em cada tela.
 */
export function EmptyState({ icon, title, description, children }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={styles.center}>
      <View style={styles.iconWrap}>
        <Feather name={icon} size={26} color={colors.accent.default} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
      {children ? <View style={styles.actions}>{children}</View> : null}
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
      backgroundColor: colors.accent.dim,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: { ...typography.h3, color: colors.text.primary, textAlign: 'center' },
    description: { ...typography.body, color: colors.text.secondary, textAlign: 'center' },
    actions: { alignSelf: 'stretch', gap: spacing.sm, marginTop: spacing.xs },
  });
