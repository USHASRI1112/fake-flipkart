import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { formatCurrency } from '../services/format';
import { COLORS } from '../services/theme';
import type { Product } from '../types/shop';
import { ProductMedia } from './ProductMedia';

type Props = {
  product: Product;
  compact?: boolean;
  grid?: boolean;
  onPress?: () => void;
};

export function ProductCard({ product, compact, grid, onPress }: Props) {
  const handlePress = () => {
    if (onPress) {
      onPress();
      return;
    }

    router.push(`/product/${product.id}`);
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        grid ? styles.gridCard : compact ? styles.compactCard : styles.card,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.imageWrap}>
        <ProductMedia
          product={product}
          style={grid ? styles.gridImage : compact ? styles.compactImage : styles.image}
          imageStyle={styles.imageRadius}
        >
          <View style={styles.overlay} />
          {product.badge ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{product.badge}</Text>
            </View>
          ) : null}
        </ProductMedia>
      </View>
      <View style={grid ? styles.gridBody : compact ? styles.compactBody : styles.body}>
        <Text style={styles.title} numberOfLines={1}>
          {product.title}
        </Text>
        <Text style={styles.tagline} numberOfLines={2}>
          {product.tagline}
        </Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>{formatCurrency(product.price)}</Text>
          <View style={styles.ratingPill}>
            <Ionicons name="star" size={12} color="#F59E0B" />
            <Text style={styles.rating}>{product.rating.toFixed(1)}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 200,
    backgroundColor: COLORS.card,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 12,
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  compactCard: {
    width: 180,
    backgroundColor: COLORS.card,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 12,
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  gridCard: {
    flex: 1,
    minWidth: 0,
    backgroundColor: COLORS.card,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 0,
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  imageWrap: {
    padding: 10,
  },
  image: {
    height: 140,
    width: '100%',
    justifyContent: 'space-between',
  },
  compactImage: {
    height: 120,
    width: '100%',
    justifyContent: 'space-between',
  },
  gridImage: {
    height: 120,
    width: '100%',
    justifyContent: 'space-between',
  },
  imageRadius: {
    borderRadius: 18,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 18,
  },
  badge: {
    alignSelf: 'flex-start',
    margin: 10,
    backgroundColor: 'rgba(40,116,240,0.92)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.card,
  },
  body: {
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  compactBody: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  gridBody: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.text,
  },
  tagline: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 17,
    color: COLORS.muted,
  },
  priceRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.text,
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 999,
  },
  rating: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.text,
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.99 }],
  },
});
