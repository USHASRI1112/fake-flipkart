import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '../components/EmptyState';
import { ScreenHeader } from '../components/ScreenHeader';
import { COLORS } from '../services/theme';
import { formatCurrency } from '../services/format';
import { useShopStore } from '../store/useShopStore';

type PaymentOption = {
  id: string;
  label: string;
  subtitle: string;
  available: boolean;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
};

const paymentOptions: PaymentOption[] = [
  {
    id: 'gpay',
    label: 'Google Pay',
    subtitle: 'Unavailable',
    available: false,
    icon: 'cellphone',
  },
  {
    id: 'phonepe',
    label: 'PhonePe',
    subtitle: 'Unavailable',
    available: false,
    icon: 'cellphone',
  },
  {
    id: 'paytm',
    label: 'Paytm',
    subtitle: 'Unavailable',
    available: false,
    icon: 'cellphone',
  },
  {
    id: 'card',
    label: 'Credit / Debit Card',
    subtitle: 'Unavailable',
    available: false,
    icon: 'credit-card-outline',
  },
  {
    id: 'netbanking',
    label: 'Net Banking',
    subtitle: 'Unavailable',
    available: false,
    icon: 'bank-outline',
  },
  {
    id: 'cod',
    label: 'Cash on Delivery',
    subtitle: 'Unavailable',
    available: false,
    icon: 'cash',
  },
  {
    id: 'wallet',
    label: 'App Wallet',
    subtitle: 'Available and pre-selected',
    available: true,
    icon: 'wallet-outline',
  },
];

function PaymentMethodRow({ option, selected }: { option: PaymentOption; selected: boolean }) {
  return (
    <View
      style={[
        styles.methodRow,
        option.available ? styles.methodRowAvailable : styles.methodRowDisabled,
        selected && styles.methodRowSelected,
      ]}
    >
      <View style={[styles.methodIconWrap, option.available ? styles.methodIconAvailable : styles.methodIconDisabled]}>
        <MaterialCommunityIcons
          name={option.icon}
          size={22}
          color={option.available ? COLORS.primary : COLORS.muted}
        />
      </View>
      <View style={styles.methodTextBlock}>
        <Text style={styles.methodLabel}>{option.label}</Text>
        <Text style={styles.methodSubtitle}>{option.subtitle}</Text>
      </View>
      <View style={styles.methodMeta}>
        {selected ? (
          <View style={styles.selectedPill}>
            <Text style={styles.selectedPillText}>Selected</Text>
          </View>
        ) : null}
        <Ionicons
          name={selected ? 'radio-button-on' : 'radio-button-off'}
          size={20}
          color={option.available ? COLORS.primary : COLORS.border}
        />
      </View>
    </View>
  );
}

export default function CheckoutScreen() {
  const insets = useSafeAreaInsets();
  const cart = useShopStore((state) => state.cart);
  const cartCount = useShopStore((state) => state.cartCount);
  const cartTotal = useShopStore((state) => state.cartTotal);
  const walletBalance = useShopStore((state) => state.walletBalance);
  const placeOrder = useShopStore((state) => state.placeOrder);

  const remainingBalance = Math.max(0, walletBalance - cartTotal);
  const walletOption = paymentOptions.find((option) => option.id === 'wallet');

  if (!cart.length) {
    return (
      <View style={styles.screen}>
        <ScreenHeader title="Payment" subtitle="Your cart is empty" onBack={() => router.back()} />
        <View style={styles.emptyWrap}>
          <EmptyState
            iconName="card-outline"
            title="Nothing to pay for yet"
            subtitle="Add products to cart before opening checkout."
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Payment" subtitle="Choose a payment method" onBack={() => router.back()} />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 120 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.walletHero}>
          <View style={styles.walletHeroTop}>
            <View>
              <Text style={styles.heroLabel}>Wallet Balance</Text>
              <Text style={styles.heroValue}>{formatCurrency(walletBalance)}</Text>
            </View>
            <View style={styles.walletBadge}>
              <Text style={styles.walletBadgeText}>App Wallet only</Text>
            </View>
          </View>

          <View style={styles.amountGrid}>
            <View style={styles.amountTile}>
              <Text style={styles.amountLabel}>Total amount</Text>
              <Text style={styles.amountValue}>{formatCurrency(cartTotal)}</Text>
            </View>
            <View style={styles.amountTile}>
              <Text style={styles.amountLabel}>After payment</Text>
              <Text style={styles.amountValue}>{formatCurrency(remainingBalance)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Payment methods</Text>
          <Text style={styles.sectionHint}>{cartCount} item{cartCount === 1 ? '' : 's'} in checkout</Text>
        </View>

        <View style={styles.methodCard}>
          {paymentOptions.map((option, index) => (
            <View key={option.id}>
              <PaymentMethodRow option={option} selected={option.id === walletOption?.id} />
              {index < paymentOptions.length - 1 ? <View style={styles.divider} /> : null}
            </View>
          ))}
        </View>

        <View style={styles.noticeCard}>
          <Ionicons name="lock-closed" size={18} color={COLORS.primary} />
          <Text style={styles.noticeText}>
            Other methods are shown for realism, but this demo completes payment through the app wallet.
          </Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 14 }]}>
        <Pressable
          onPress={() => {
            placeOrder();
            router.replace('/orders');
          }}
          style={({ pressed }) => [styles.payButton, pressed && styles.payButtonPressed]}
        >
          <View>
            <Text style={styles.payButtonLabel}>Pay with App Wallet</Text>
            <Text style={styles.payButtonSubLabel}>{formatCurrency(cartTotal)} will be deducted instantly</Text>
          </View>
          <Text style={styles.payButtonAmount}>{formatCurrency(cartTotal)}</Text>
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
    paddingTop: 4,
  },
  walletHero: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
    marginBottom: 16,
  },
  walletHeroTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 14,
  },
  heroLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  heroValue: {
    marginTop: 4,
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.text,
  },
  walletBadge: {
    backgroundColor: `${COLORS.secondary}CC`,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  walletBadgeText: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.text,
    textTransform: 'uppercase',
  },
  amountGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  amountTile: {
    flex: 1,
    backgroundColor: `${COLORS.background}CC`,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  amountLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.muted,
    marginBottom: 8,
  },
  amountValue: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.text,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.text,
  },
  sectionHint: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.muted,
  },
  methodCard: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  methodRowAvailable: {
    opacity: 1,
  },
  methodRowDisabled: {
    opacity: 0.55,
  },
  methodRowSelected: {
    backgroundColor: `${COLORS.secondary}26`,
  },
  methodIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodIconAvailable: {
    backgroundColor: `${COLORS.primary}14`,
  },
  methodIconDisabled: {
    backgroundColor: COLORS.background,
  },
  methodTextBlock: {
    flex: 1,
  },
  methodLabel: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.text,
  },
  methodSubtitle: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.muted,
  },
  methodMeta: {
    alignItems: 'flex-end',
    gap: 6,
  },
  selectedPill: {
    backgroundColor: `${COLORS.primary}14`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  selectedPillText: {
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    color: COLORS.primary,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: COLORS.border,
    marginLeft: 70,
  },
  noticeCard: {
    marginTop: 14,
    borderRadius: 18,
    padding: 14,
    backgroundColor: `${COLORS.primary}10`,
    borderWidth: 1,
    borderColor: `${COLORS.primary}20`,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  noticeText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  payButton: {
    minHeight: 64,
    borderRadius: 18,
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  payButtonPressed: {
    opacity: 0.94,
    transform: [{ scale: 0.985 }],
  },
  payButtonLabel: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.text,
  },
  payButtonSubLabel: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.text,
    opacity: 0.75,
  },
  payButtonAmount: {
    fontSize: 17,
    fontWeight: '900',
    color: COLORS.text,
  },
  emptyWrap: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
});
