import { useEffect, useMemo, useState } from 'react';

import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { EmptyState } from '../../components/EmptyState';
import { PaginationBar } from '../../components/PaginationBar';
import { ProductCard } from '../../components/ProductCard';
import { ScreenHeader } from '../../components/ScreenHeader';
import {
  filterCategoryProducts,
  getCategorySubcategories,
  getCategoryTitle,
} from '../../services/catalog';
import { COLORS } from '../../services/theme';
import { useShopStore } from '../../store/useShopStore';

const PAGE_SIZE = 12;

export default function CategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [subcategoryId, setSubcategoryId] = useState('all');
  const products = useShopStore((state) => state.catalog);
  const catalogStatus = useShopStore((state) => state.catalogStatus);
  const title = getCategoryTitle(id ?? '');

  const subcategories = useMemo(
    () => getCategorySubcategories(products, id ?? ''),
    [id, products],
  );

  const filteredProducts = useMemo(
    () =>
      filterCategoryProducts(products, id ?? '', {
        subcategoryId,
        query: searchQuery,
      }),
    [id, products, searchQuery, subcategoryId],
  );

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const visibleProducts = useMemo(
    () => filteredProducts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filteredProducts, page],
  );

  useEffect(() => {
    setPage(1);
    setSubcategoryId('all');
    setSearchQuery('');
  }, [id]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, subcategoryId]);

  return (
    <View style={styles.screen}>
      <ScreenHeader
        title={title}
        subtitle={`${filteredProducts.length} products`}
        onBack={() => router.back()}
      />

      {catalogStatus === 'loading' && products.length === 0 ? (
        <View style={styles.emptyWrap}>
          <EmptyState
            iconName="refresh"
            title="Loading local catalog"
            subtitle="Loading products from the cached catalog..."
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
          ListHeaderComponent={
            <View>
              <View style={styles.searchWrap}>
                <View style={styles.searchInputWrap}>
                  <TextInput
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder={`Search ${title.toLowerCase()}...`}
                    placeholderTextColor="#9CA3AF"
                    style={styles.searchInput}
                  />
                </View>
              </View>

              <View style={styles.sectionGap}>
                <Text style={styles.filterLabel}>Subcategories</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.chipRow}
                >
                  <Pressable
                    onPress={() => setSubcategoryId('all')}
                    style={({ pressed }) => [
                      styles.chip,
                      subcategoryId === 'all' && styles.chipActive,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text style={[styles.chipText, subcategoryId === 'all' && styles.chipTextActive]}>
                      All
                    </Text>
                  </Pressable>

                  {subcategories.map((subcategory) => (
                    <Pressable
                      key={subcategory.id}
                      onPress={() => setSubcategoryId(subcategory.id)}
                      style={({ pressed }) => [
                        styles.chip,
                        subcategoryId === subcategory.id && styles.chipActive,
                        pressed && styles.pressed,
                      ]}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          subcategoryId === subcategory.id && styles.chipTextActive,
                        ]}
                      >
                        {subcategory.name} ({subcategory.count})
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>

              {filteredProducts.length === 0 ? (
                <View style={styles.inlineEmpty}>
                  <EmptyState
                    iconName="grid-outline"
                    title="No products found"
                    subtitle="Try another subcategory or search term."
                  />
                </View>
              ) : null}
            </View>
          }
          ListFooterComponent={
            filteredProducts.length > 0 ? (
              <PaginationBar page={page} totalPages={totalPages} onChangePage={setPage} />
            ) : null
          }
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
  searchWrap: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 8,
  },
  sectionGap: {
    marginBottom: 10,
  },
  filterLabel: {
    paddingHorizontal: 16,
    marginBottom: 8,
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  searchInputWrap: {
    height: 46,
    borderRadius: 14,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  searchInput: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
  chipRow: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 2,
    gap: 8,
  },
  chip: {
    height: 38,
    borderRadius: 999,
    paddingHorizontal: 14,
    justifyContent: 'center',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.text,
  },
  chipTextActive: {
    color: COLORS.card,
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
  inlineEmpty: {
    paddingHorizontal: 0,
    paddingBottom: 8,
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
});
