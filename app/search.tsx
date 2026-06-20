import { useMemo, useState } from 'react';

import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { EmptyState } from '../components/EmptyState';
import { ProductCard } from '../components/ProductCard';
import { COLORS } from '../services/theme';
import { useShopStore } from '../store/useShopStore';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const products = useShopStore((state) => state.catalog);
  const catalogStatus = useShopStore((state) => state.catalogStatus);

  const filteredProducts = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return products;
    }

    return products.filter((product) => {
      const haystack = [product.title, product.category, product.tagline, product.description]
        .join(' ')
        .toLowerCase();
      return haystack.includes(normalized);
    });
  }, [products, query]);

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </Pressable>
        <View style={styles.searchInputWrap}>
          <Ionicons name="search" size={18} color={COLORS.muted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search products..."
            placeholderTextColor="#9CA3AF"
            style={styles.searchInput}
            autoFocus
          />
        </View>
      </View>

      {catalogStatus === 'loading' && products.length === 0 ? (
        <View style={styles.emptyWrap}>
          <EmptyState
            iconName="refresh"
            title="Loading live catalog"
            subtitle="Pulling products from DummyJSON..."
          />
        </View>
      ) : null}

      {catalogStatus !== 'loading' && filteredProducts.length === 0 ? (
        <View style={styles.emptyWrap}>
          <EmptyState
            iconName="search"
            title="No products found"
            subtitle="Try Lamborghini, Rolex, or iPhone."
          />
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => <ProductCard product={item} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
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
  searchInputWrap: {
    flex: 1,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 28,
    gap: 12,
  },
  emptyWrap: {
    paddingHorizontal: 16,
  },
});
