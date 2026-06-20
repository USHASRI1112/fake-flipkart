import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { COLORS } from '../services/theme';
import type { Category } from '../types/shop';

type Props = {
  category: Category;
};

export function CategoryCard({ category }: Props) {
  return (
    <Pressable
      onPress={() => router.push(`/category/${category.id}`)}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={[styles.icon, { backgroundColor: `${category.tint}15` }]}>
        <MaterialIcons name={category.icon as keyof typeof MaterialIcons.glyphMap} size={24} color={category.tint} />
      </View>
      <Text style={styles.label}>{category.name}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '23%',
    backgroundColor: COLORS.card,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  icon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.99 }],
  },
});
