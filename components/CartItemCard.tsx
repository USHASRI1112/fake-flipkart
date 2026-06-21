import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { formatCurrency } from '../services/format';
import { COLORS } from '../services/theme';
import type { Product } from '../types/shop';
import { ProductMedia } from './ProductMedia';

type Props = {
  product: Product;
  quantity: number;
  onDecrease: () => void;
  onIncrease: () => void;
  onDelete: () => void;
};

export function CartItemCard({ product, quantity, onDecrease, onIncrease, onDelete }: Props) {
  return (
    <View style={styles.card}>
      <ProductMedia
        product={product}
        style={styles.image}
        imageStyle={styles.imageRadius}
      />
      <View style={styles.body}>
        <Text style={styles.title}>{product.title}</Text>
        <Text style={styles.tagline}>{product.tagline}</Text>
        <Text style={styles.price}>{formatCurrency(product.price)}</Text>
        <View style={styles.qtyRow}>
          <Pressable onPress={onDecrease} style={styles.qtyButton}>
            <Ionicons name="remove" size={18} color={COLORS.text} />
          </Pressable>
          <Text style={styles.qty}>{quantity}</Text>
          <Pressable onPress={onIncrease} style={styles.qtyButton}>
            <Ionicons name="add" size={18} color={COLORS.text} />
          </Pressable>
        </View>
        <Pressable onPress={onDelete} style={styles.deleteRow}>
          <Ionicons name="trash-outline" size={16} color={COLORS.danger} />
          <Text style={styles.deleteText}>Delete</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: COLORS.card,
    borderRadius: 22,
    padding: 12,
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
    width: 96,
    height: 96,
  },
  imageRadius: {
    borderRadius: 18,
  },
  body: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.text,
  },
  tagline: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 17,
    color: COLORS.muted,
  },
  price: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.text,
    marginTop: 6,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
  },
  qtyButton: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qty: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.text,
    minWidth: 20,
    textAlign: 'center',
  },
  deleteRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  deleteText: {
    color: COLORS.danger,
    fontWeight: '800',
    fontSize: 12,
  },
});
