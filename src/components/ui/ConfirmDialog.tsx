import React, { useMemo } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme';
import { ThemeColors } from '@/theme/palette';
import { radius, spacing, typography } from '@/theme';
import { Button } from './Button';

export interface ConfirmAction {
  key: string;
  label: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
}

interface Props {
  visible: boolean;
  title: string;
  message?: string;
  actions: ConfirmAction[];
  onPress: (key: string) => void;
  onRequestClose: () => void;
}

/**
 * Substitui o Alert.alert nativo (cru, sem tema) por um modal no visual do
 * app. Usado via useConfirm() em vez de renderizado diretamente — ver
 * src/providers/ConfirmDialogProvider.tsx.
 */
export function ConfirmDialog({ visible, title, message, actions, onPress, onRequestClose }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const stacked = actions.length > 2;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onRequestClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          {message && <Text style={styles.message}>{message}</Text>}
          <View style={stacked ? styles.actionsColumn : styles.actionsRow}>
            {actions.map((action) => (
              <Button
                key={action.key}
                label={action.label}
                variant={action.variant ?? 'secondary'}
                onPress={() => onPress(action.key)}
                style={stacked ? undefined : styles.actionFlex}
              />
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: colors.bg.overlay,
      justifyContent: 'center',
      padding: spacing['2xl'],
    },
    card: {
      backgroundColor: colors.bg.surface,
      borderRadius: radius.xl,
      borderWidth: 1,
      borderColor: colors.border.default,
      padding: spacing['2xl'],
      gap: spacing.md,
    },
    title: { ...typography.h3, color: colors.text.primary },
    message: { ...typography.body, color: colors.text.secondary },
    actionsRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
    actionsColumn: { gap: spacing.sm, marginTop: spacing.sm },
    actionFlex: { flex: 1 },
  });
