import { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS } from '../services/theme';
import { getProductFallbackImageUri } from '../services/productImage';
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
  const fallbackUri = getProductFallbackImageUri(product);

  useEffect(() => {
    setImageFailed(false);
  }, [product.id, product.image]);

  if (imageFailed || !imageUri) {
    return (
      <View style={[styles.fallback, style]}>
        <Image
          source={{ uri: fallbackUri }}
          style={[StyleSheet.absoluteFillObject, imageStyle]}
          resizeMode="cover"
        />
        <View style={styles.fallbackGlow} />
        <Ionicons name="image-outline" size={30} color={COLORS.primary} />
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
    backgroundColor: '#EEF2FF',
    overflow: 'hidden',
  },
  fallbackGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(40,116,240,0.08)',
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
