import { useMemo } from 'react';

import { ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

import { EmptyState } from '../../components/EmptyState';
import { ScreenHeader } from '../../components/ScreenHeader';
import { formatCurrency } from '../../services/format';
import { COLORS } from '../../services/theme';
import { useShopStore } from '../../store/useShopStore';
import { getProductById } from '../../services/catalog';

export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const catalog = useShopStore((state) => state.catalog);
  const catalogStatus = useShopStore((state) => state.catalogStatus);
  const product = useMemo(() => getProductById(catalog, id ?? ''), [catalog, id]);
  const addToCart = useShopStore((state) => state.addToCart);

  if (catalogStatus === 'loading' && !product) {
    return (
      <View style={styles.screen}>
        <ScreenHeader title="Product" onBack={() => router.back()} />
        <View style={styles.emptyWrap}>
          <EmptyState
            iconName="refresh"
            title="Loading live catalog"
            subtitle="Pulling products from DummyJSON..."
          />
        </View>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.screen}>
        <ScreenHeader title="Product" onBack={() => router.back()} />
        <View style={styles.emptyWrap}>
          <EmptyState
            iconName="cube-outline"
            title="Product not found"
            subtitle="This product may have been removed or the link is invalid."
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ScreenHeader onBack={() => router.back()} />

        <View style={styles.imageWrap}>
          <ImageBackground source={{ uri: product.image }} style={styles.image} imageStyle={styles.imageRadius}>
            <View style={styles.overlay} />
            {product.badge ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{product.badge}</Text>
              </View>
            ) : null}
          </ImageBackground>
        </View>

        <Text style={styles.title}>{product.title}</Text>
        <View style={styles.metaRow}>
          <View style={styles.ratingPill}>
            <Ionicons name="star" size={14} color="#F59E0B" />
            <Text style={styles.rating}>{product.rating.toFixed(1)}</Text>
          </View>
          <Text style={styles.category}>{product.category}</Text>
        </View>
        <Text style={styles.price}>{formatCurrency(product.price)}</Text>
        <Text style={styles.description}>{product.description}</Text>

        <View style={styles.featureRow}>
          <View style={styles.featurePill}>
            <MaterialCommunityIcons name="lightning-bolt" size={16} color={COLORS.primary} />
            <Text style={styles.featureText}>Fast checkout</Text>
          </View>
          <View style={styles.featurePill}>
            <MaterialCommunityIcons name="truck-fast" size={16} color={COLORS.primary} />
            <Text style={styles.featureText}>Fake delivery tracking</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          onPress={() => {
            addToCart(product.id);
            router.push('/cart');
          }}
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        >
          <Text style={styles.buttonText}>Add To Cart</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingBottom: 24,
  },
  imageWrap: {
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#0F172A',
    shadowOpacity: 0.1,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  image: {
    height: 300,
    width: '100%',
    justifyContent: 'space-between',
  },
  imageRadius: {
    borderRadius: 28,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  badge: {
    alignSelf: 'flex-start',
    margin: 16,
    backgroundColor: 'rgba(17,24,39,0.88)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.card,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.text,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 10,
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
  category: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  price: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.text,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
    color: COLORS.muted,
    marginHorizontal: 16,
  },
  featureRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 18,
    marginHorizontal: 16,
  },
  featurePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: COLORS.card,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  featureText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.text,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  button: {
    height: 54,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOpacity: 0.28,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  buttonPressed: {
    opacity: 0.94,
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    color: COLORS.card,
    fontSize: 16,
    fontWeight: '900',
  },
  emptyWrap: {
    paddingHorizontal: 16,
  },
});
