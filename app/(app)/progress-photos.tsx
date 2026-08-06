import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBodyMeasurements, useProgressPhotoUrl } from '@/features/profile/useBodyMeasurements';
import { BodyMeasurement } from '@/types/workout';
import { useTheme } from '@/theme';
import { ThemeColors } from '@/theme/palette';
import { radius, spacing, typography } from '@/theme';

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function BigPhoto({ measurement }: { measurement: BodyMeasurement | null }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { data: url } = useProgressPhotoUrl(measurement?.photo_path ?? null);

  return (
    <View style={styles.bigPhotoWrapper}>
      <View style={styles.bigPhotoFrame}>
        {measurement && !url && <ActivityIndicator color={colors.text.tertiary} />}
        {measurement && url && (
          <Image source={{ uri: url }} style={styles.bigPhoto} contentFit="cover" />
        )}
        {!measurement && <Feather name="image" size={28} color={colors.text.tertiary} />}
      </View>
      {measurement && (
        <>
          <Text style={styles.bigPhotoWeight}>{measurement.weight_kg} kg</Text>
          <Text style={styles.bigPhotoDate}>{formatDate(measurement.measured_at)}</Text>
        </>
      )}
    </View>
  );
}

export default function ProgressPhotosScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { data: measurements = [], isLoading } = useBodyMeasurements();

  const withPhoto = useMemo(
    () => measurements.filter((m) => m.photo_path).slice().reverse(), // cronológico
    [measurements],
  );

  const [beforeId, setBeforeId] = useState<string | null>(null);
  const [afterId, setAfterId] = useState<string | null>(null);

  const before = withPhoto.find((m) => m.id === beforeId) ?? withPhoto[0] ?? null;
  const after = withPhoto.find((m) => m.id === afterId) ?? withPhoto[withPhoto.length - 1] ?? null;
  const delta = before && after ? after.weight_kg - before.weight_kg : null;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn} hitSlop={8}>
          <Feather name="arrow-left" size={22} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Fotos de progresso</Text>
        <View style={styles.headerBtn} />
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.accent.default} />
        </View>
      ) : withPhoto.length === 0 ? (
        <View style={styles.center}>
          <Feather name="image" size={32} color={colors.text.tertiary} />
          <Text style={styles.emptyText}>
            Nenhuma foto registrada ainda. Adicione uma foto ao registrar seu peso na tela de Progresso.
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.compareRow}>
            <BigPhoto measurement={before} />
            <Feather name="arrow-right" size={18} color={colors.text.tertiary} />
            <BigPhoto measurement={after} />
          </View>

          {delta !== null && (
            <View style={styles.deltaRow}>
              <Text style={styles.deltaText}>
                {delta > 0 ? '+' : ''}{delta.toFixed(1)} kg entre as duas fotos
              </Text>
            </View>
          )}

          <Text style={styles.sectionLabel}>Antes</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbRow}>
            {withPhoto.map((m) => (
              <ThumbButton key={m.id} measurement={m} active={m.id === before?.id} onPress={() => setBeforeId(m.id)} />
            ))}
          </ScrollView>

          <Text style={styles.sectionLabel}>Depois</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbRow}>
            {withPhoto.map((m) => (
              <ThumbButton key={m.id} measurement={m} active={m.id === after?.id} onPress={() => setAfterId(m.id)} />
            ))}
          </ScrollView>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function ThumbButton({
  measurement,
  active,
  onPress,
}: {
  measurement: BodyMeasurement;
  active: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { data: url } = useProgressPhotoUrl(measurement.photo_path);

  return (
    <TouchableOpacity
      style={[styles.thumbBtn, active && styles.thumbBtnActive]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {url && <Image source={{ uri: url }} style={styles.thumbImg} contentFit="cover" />}
    </TouchableOpacity>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.bg.base },

    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.default,
    },
    headerBtn: { width: 38, alignItems: 'center' },
    headerTitle: { ...typography.subheading, color: colors.text.primary },

    center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, paddingHorizontal: spacing['2xl'] },
    emptyText: { ...typography.body, color: colors.text.secondary, textAlign: 'center' },

    scroll: { padding: spacing['2xl'], gap: spacing.md, paddingBottom: spacing['4xl'] },

    compareRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    bigPhotoWrapper: { flex: 1, alignItems: 'center', gap: 2 },
    bigPhotoFrame: {
      width: '100%',
      aspectRatio: 3 / 4,
      borderRadius: radius.lg,
      backgroundColor: colors.bg.elevated,
      borderWidth: 1,
      borderColor: colors.border.default,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    bigPhoto: { width: '100%', height: '100%' },
    bigPhotoWeight: { ...typography.subheading, color: colors.text.primary, marginTop: spacing.xs },
    bigPhotoDate: { ...typography.bodySmall, color: colors.text.tertiary },

    deltaRow: { alignItems: 'center', marginTop: spacing.xs },
    deltaText: { ...typography.label, color: colors.accent.default },

    sectionLabel: { ...typography.label, color: colors.text.secondary, marginTop: spacing.lg },
    thumbRow: { gap: spacing.sm, paddingVertical: spacing.xs },
    thumbBtn: {
      width: 52,
      height: 52,
      borderRadius: radius.md,
      backgroundColor: colors.bg.elevated,
      borderWidth: 2,
      borderColor: 'transparent',
      overflow: 'hidden',
    },
    thumbBtnActive: { borderColor: colors.accent.default },
    thumbImg: { width: '100%', height: '100%' },
  });
