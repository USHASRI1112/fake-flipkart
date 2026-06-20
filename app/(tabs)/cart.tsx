import { StyleSheet, Text, View, Pressable, ScrollView } from 'react-native';
import { router } from 'expo-router';

import { CartItemCard } from '../../components/CartItemCard';
import { EmptyState } from '../../components/EmptyState';
import { ScreenHeader } from '../../components/ScreenHeader';
import { COLORS } from '../../services/theme';
import { formatCurrency } from '../../services/format';
import { useShopStore } from '../../store/useShopStore';
import { getProductById } from '../../services/catalog';

export default function CartScreen() {
  const cart = useShopStore((state) => state.cart);
  const cartCount = useShopStore((state) => state.cartCount);
  const cartTotal = useShopStore((state) => state.cartTotal);
  const walletBalance = useShopStore((state) => state.walletBalance);
  const catalog = useShopStore((state) => state.catalog);
  const updateQuantity = useShopStore((state) => state.updateQuantity);
  const removeFromCart = useShopStore((state) => state.removeFromCart);
  const placeOrder = useShopStore((state) => state.placeOrder);

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Cart" rightLabel={`${cartCount} items`} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {cart.length === 0 ? (
          <EmptyState
            iconName="cart-outline"
            title="Your cart is empty"
            subtitle="Start shopping for something ridiculously expensive."
          />
        ) : (
          cart.map((item) => {
            const product = getProductById(catalog, item.productId);
            if (!product) {
              return null;
            }

            return (
              <CartItemCard
                key={item.productId}
                product={product}
                quantity={item.quantity}
                onDecrease={() => updateQuantity(product.id, -1)}
                onIncrease={() => updateQuantity(product.id, 1)}
                onDelete={() => removeFromCart(product.id)}
              />
            );
          })
        )}

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Price Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Items</Text>
            <Text style={styles.summaryValue}>{cartCount}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total</Text>
            <Text style={styles.summaryValue}>{formatCurrency(cartTotal)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Wallet Remaining</Text>
            <Text style={styles.summaryValue}>{formatCurrency(walletBalance)}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          onPress={() => {
            if (!cart.length) {
              return;
            }
            placeOrder();
            router.push('/orders');
          }}
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        >
          <Text style={styles.buttonText}>Place Order</Text>
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
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  summaryCard: {
    backgroundColor: COLORS.card,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: 8,
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.text,
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 13,
    color: COLORS.muted,
    fontWeight: '700',
  },
  summaryValue: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '900',
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
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: {
    opacity: 0.94,
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '900',
  },
});
