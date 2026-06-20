import { StyleSheet, Text, View } from 'react-native';

import { ORDER_STATUS_COLORS } from '../services/theme';
import type { OrderStatus } from '../types/shop';

type Props = {
  status: OrderStatus;
};

export function StatusChip({ status }: Props) {
  return (
    <View style={[styles.chip, { backgroundColor: `${ORDER_STATUS_COLORS[status]}15` }]}>
      <View style={[styles.dot, { backgroundColor: ORDER_STATUS_COLORS[status] }]} />
      <Text style={[styles.text, { color: ORDER_STATUS_COLORS[status] }]}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },
  text: {
    fontSize: 12,
    fontWeight: '900',
  },
});
