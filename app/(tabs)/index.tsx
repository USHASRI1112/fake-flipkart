import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CategoryCard } from '../../components/CategoryCard';
import { EmptyState } from '../../components/EmptyState';
import { ProductCard } from '../../components/ProductCard';
import { COLORS } from '../../services/theme';
import { useShopStore } from '../../store/useShopStore';
import { getCatalogCategories, getLuxuryProducts, getTrendingProducts } from '../../services/catalog';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const catalog = useShopStore((state) => state.catalog);
  const catalogStatus = useShopStore((state) => state.catalogStatus);
  const categories = getCatalogCategories(catalog);
  const trendingProducts = getTrendingProducts(catalog);
  const luxuryProducts = getLuxuryProducts(catalog);

  if (catalogStatus === 'loading' && catalog.length === 0) {
    return (
      <View style={styles.loadingWrap}>
        <EmptyState
          iconName="refresh"
          title="Loading local catalog"
          subtitle="Loading products from the cached catalog..."
        />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 12 }]}
      showsVerticalScrollIndicator={false}
    >
      <Pressable onPress={() => router.push('/search')} style={styles.searchHero}>
        <Ionicons name="search" size={20} color={COLORS.primary} />
        <Text style={styles.searchText}>Search Products</Text>
        <View style={styles.searchPill}>
          <Text style={styles.searchPillText}>Fast browsing</Text>
        </View>
      </Pressable>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <Text style={styles.sectionLink}>Explore all</Text>
      </View>
      <View style={styles.categoryGrid}>
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Trending Products</Text>
        <Text style={styles.sectionLink}>Swipe for more</Text>
      </View>
      <FlatList
        data={trendingProducts}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalList}
        renderItem={({ item }) => <ProductCard product={item} compact />}
      />

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Top Deals</Text>
        <Text style={styles.sectionLink}>Best picks</Text>
      </View>
      <FlatList
        data={luxuryProducts}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalList}
        renderItem={({ item }) => <ProductCard product={item} compact />}
      />
      {catalogStatus === 'loading' ? (
        <Text style={styles.loadingText}>Loading more products...</Text>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 28,
  },
  searchHero: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  searchText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  searchPill: {
    backgroundColor: `${COLORS.secondary}CC`,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  searchPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.text,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.text,
  },
  sectionLink: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 18,
  },
  horizontalList: {
    paddingBottom: 4,
    gap: 12,
  },
  loadingText: {
    marginTop: 12,
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  loadingWrap: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
  },
});
