import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS } from '../services/theme';

type Props = {
  iconName: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
};

export function EmptyState({ iconName, title, subtitle }: Props) {
  return (
    <View style={styles.card}>
      <Ionicons name={iconName} size={44} color={COLORS.primary} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 34,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },
  title: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.text,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 20,
    color: COLORS.muted,
    textAlign: 'center',
  },
});

