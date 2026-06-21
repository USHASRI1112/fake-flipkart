import { Image, ImageBackground, StyleSheet, Text, View } from 'react-native';

import { formatCurrency } from '../services/format';
import { COLORS } from '../services/theme';
import type { Order, OrderStatus, Product } from '../types/shop';
import { StatusChip } from './StatusChip';
import { ProductMedia } from './ProductMedia';

const ORDER_STATUSES: OrderStatus[] = [
  'Order Placed',
  'Preparing',
  'Packed',
  'Shipped',
  'Out For Delivery',
  'Delivered',
];

type Props = {
  order: Order;
  product: Product;
};

export function OrderCard({ order, product }: Props) {
  const status = ORDER_STATUSES[order.statusIndex];
  console.log('OrderCard', order, product, status);
  return (
    <View style={styles.card}>
      {/* <ProductMedia
        product={product}
        style={styles.image}
        imageStyle={styles.imageRadius}
      /> */}
      <Image source={{uri: product.image}} style={styles.imageRadius} />
      <View style={styles.body}>
        <Text style={styles.title}>{product.title}</Text>
        <Text style={styles.price}>
          {formatCurrency(order.total)} x {order.quantity}
        </Text>
        <Text style={styles.date}>{order.placedAt}</Text>
        <StatusChip status={status} />
        <View style={styles.timeline}>
          {ORDER_STATUSES.map((stage, index) => {
            const reached = index <= order.statusIndex;
            return (
              <View key={stage} style={styles.timelineStep}>
                <View style={[styles.timelineDot, { backgroundColor: reached ? COLORS.primary : '#D1D5DB' }]} />
                {index < ORDER_STATUSES.length - 1 ? (
                  <View
                    style={[
                      styles.timelineLine,
                      { backgroundColor: index < order.statusIndex ? COLORS.primary : '#D1D5DB' },
                    ]}
                  />
                ) : null}
              </View>
            );
          })}
        </View>
        <Text style={styles.timelineLabel}>{status}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  image: {
    height: 160,
    width: '100%',
  },
  imageRadius: {
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
  },
  body: {
    padding: 14,
  },
  title: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.text,
  },
  price: {
    marginTop: 4,
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.text,
  },
  date: {
    marginTop: 4,
    fontSize: 12,
    color: COLORS.muted,
    fontWeight: '700',
  },
  timeline: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  timelineStep: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  timelineDot: {
    width: 11,
    height: 11,
    borderRadius: 999,
  },
  timelineLine: {
    flex: 1,
    height: 2,
    marginHorizontal: 4,
    borderRadius: 999,
  },
  timelineLabel: {
    marginTop: 10,
    fontSize: 12,
    color: COLORS.text,
    fontWeight: '800',
  },
});
