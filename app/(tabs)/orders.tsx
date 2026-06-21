import { FlatList, StyleSheet, View } from 'react-native';

import { EmptyState } from '../../components/EmptyState';
import { OrderCard } from '../../components/OrderCard';
import { ScreenHeader } from '../../components/ScreenHeader';
import { getProductById } from '../../services/catalog';
import { COLORS } from '../../services/theme';
import { useShopStore } from '../../store/useShopStore';

export default function OrdersScreen() {
  const orders = useShopStore((state) => state.orders);
  const catalog = useShopStore((state) => state.catalog);
  console.log('OrdersScreen', orders, catalog);

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Orders" rightLabel={`${orders.length} placed`} />
      {orders.length === 0 ? (
        <View style={styles.emptyWrap}>
          <EmptyState
            iconName="cube-outline"
            title="No orders yet"
            subtitle="Place your first order and watch the fake tracking animate."
          />
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const product = getProductById(catalog, item.productId) ?? catalog[0];
            if (!product) {
              return null;
            }
            return <OrderCard order={item} product={product} />;
          }}
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
  },
  emptyWrap: {
    paddingHorizontal: 16,
  },
});
