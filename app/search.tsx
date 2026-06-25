import { useEffect, useMemo, useState } from 'react';

import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '../components/EmptyState';
import { PaginationBar } from '../components/PaginationBar';
import { ProductCard } from '../components/ProductCard';
import { COLORS } from '../services/theme';
import { useShopStore } from '../store/useShopStore';

const PAGE_SIZE = 12;

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const insets = useSafeAreaInsets();
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

  useEffect(() => {
    setPage(1);
  }, [query]);

  const visibleProducts = useMemo(
    () => filteredProducts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filteredProducts, page],
  );
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
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
            title="Loading local catalog"
            subtitle="Loading products from the cached catalog..."
          />
        </View>
      ) : null}

      {catalogStatus !== 'loading' && filteredProducts.length === 0 ? (
        <View style={styles.emptyWrap}>
          <EmptyState
            iconName="search"
            title="No products found"
            subtitle="Try clothing, footwear, or jewellery."
          />
        </View>
      ) : (
        <FlatList
          data={visibleProducts}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => <ProductCard product={item} grid />}
          ListFooterComponent={<PaginationBar page={page} totalPages={totalPages} onChangePage={setPage} />}
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
  columnWrapper: {
    gap: 12,
  },
  emptyWrap: {
    paddingHorizontal: 16,
  },
});
