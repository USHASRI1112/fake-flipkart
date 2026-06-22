import { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS } from '../services/theme';
import type { Product } from '../types/shop';

type Props = {
  product: Product;
  style: object;
  imageStyle?: object;
  children?: React.ReactNode;
};

function normalizeImageUri(rawValue: string) {
  const value = String(rawValue || '').trim();

  if (!value) {
    return '';
  }

  const matchedUrl = value.match(/https?:\/\/[^"\],\s]+/);
  if (matchedUrl) {
    return matchedUrl[0].replace(/^https:\/\//, 'http://');
  }

  return value.replace(/^https:\/\//, 'http://');
}

export function ProductMedia({ product, style, imageStyle, children }: Props) {
  const [imageFailed, setImageFailed] = useState(false);
  const imageUri = normalizeImageUri(product.image);

  useEffect(() => {
    setImageFailed(false);
  }, [product.id, product.image]);

  if (imageFailed || !imageUri) {
    return (
      <View style={[styles.fallback, style]}>
        <View style={[styles.fallbackBase, imageStyle]} />
        <View style={styles.fallbackGlow} />
        <View style={styles.fallbackOrbOne} />
        <View style={styles.fallbackOrbTwo} />
        <View style={styles.fallbackCard}>
          <Ionicons name="image-outline" size={28} color={COLORS.card} />
        </View>
        <Text style={styles.fallbackTitle} numberOfLines={2}>
          {product.title}
        </Text>
        <Text style={styles.fallbackSubtitle} numberOfLines={1}>
          {product.category}
        </Text>
        {children}
      </View>
    );
  }

  return (
    <View style={style}>
      <Image
        source={{ uri: imageUri }}
        style={[StyleSheet.absoluteFillObject, imageStyle]}
        resizeMode="cover"
        onError={() => setImageFailed(true)}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  fallbackBase: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#DDEAFE',
  },
  fallbackGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(40,116,240,0.08)',
  },
  fallbackOrbOne: {
    position: 'absolute',
    width: 92,
    height: 92,
    borderRadius: 92,
    backgroundColor: 'rgba(255,255,255,0.22)',
    top: 12,
    right: 12,
  },
  fallbackOrbTwo: {
    position: 'absolute',
    width: 132,
    height: 132,
    borderRadius: 132,
    backgroundColor: 'rgba(255,255,255,0.12)',
    left: -24,
    bottom: -24,
  },
  fallbackCard: {
    width: 62,
    height: 62,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOpacity: 0.16,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  fallbackTitle: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.text,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  fallbackSubtitle: {
    marginTop: 3,
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.muted,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
});
