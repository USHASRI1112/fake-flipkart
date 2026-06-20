import { useMemo } from 'react';

import { FlatList, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { EmptyState } from '../../components/EmptyState';
import { ProductCard } from '../../components/ProductCard';
import { ScreenHeader } from '../../components/ScreenHeader';
import { getCategoryTitle, getProductsForCategory } from '../../services/catalog';
import { COLORS } from '../../services/theme';
import { useShopStore } from '../../store/useShopStore';

export default function CategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const products = useShopStore((state) => state.catalog);
  const catalogStatus = useShopStore((state) => state.catalogStatus);
  const categoryProducts = useMemo(() => getProductsForCategory(products, id ?? ''), [id, products]);
  const title = getCategoryTitle(id ?? '');

  return (
    <View style={styles.screen}>
      <ScreenHeader title={title} subtitle={`${categoryProducts.length} products`} onBack={() => router.back()} />
      {catalogStatus === 'loading' && products.length === 0 ? (
        <View style={styles.emptyWrap}>
          <EmptyState
            iconName="refresh"
            title="Loading live catalog"
            subtitle="Pulling products from DummyJSON..."
          />
        </View>
      ) : categoryProducts.length === 0 ? (
        <View style={styles.emptyWrap}>
          <EmptyState
            iconName="grid-outline"
            title="No products in this category"
            subtitle="Try another category from the home screen."
          />
        </View>
      ) : (
        <FlatList
          data={categoryProducts}
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
  list: {
    paddingHorizontal: 16,
    paddingBottom: 28,
    gap: 12,
  },
  emptyWrap: {
    paddingHorizontal: 16,
  },
});
