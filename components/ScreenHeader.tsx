import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS } from '../services/theme';

type Props = {
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  rightLabel?: string;
};

export function ScreenHeader({ title, subtitle, onBack, rightLabel }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        {onBack ? (
          <Pressable onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={22} color={COLORS.text} />
          </Pressable>
        ) : (
          <View style={styles.backButtonPlaceholder} />
        )}
        <View style={styles.titleBlock}>
          {title ? <Text style={styles.title}>{title}</Text> : null}
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {rightLabel ? <Text style={styles.rightLabel}>{rightLabel}</Text> : <View style={styles.rightLabelPlaceholder} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  backButtonPlaceholder: {
    width: 44,
    height: 44,
  },
  titleBlock: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.text,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 13,
    color: COLORS.muted,
    fontWeight: '700',
  },
  rightLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
  },
  rightLabelPlaceholder: {
    width: 44,
  },
});

