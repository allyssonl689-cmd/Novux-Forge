import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme';

interface Props extends ViewProps {
  children: React.ReactNode;
}

export function SafeScreen({ children, style, ...rest }: Props) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.container, style]} {...rest}>
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg.base },
  container: { flex: 1, backgroundColor: colors.bg.base },
});
