import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import { formatCurrency } from '../services/format';
import { COLORS } from '../services/theme';
import type { Order, Product } from '../types/shop';

type Props = {
  order: Order;
  product: Product;
  onDone: () => void;
};

const ROUTE = [
  { x: 28, y: 170 },
  { x: 74, y: 145 },
  { x: 118, y: 122 },
  { x: 158, y: 96 },
  { x: 208, y: 90 },
  { x: 252, y: 58 },
];

const MAP_LINES = [
  { left: 18, top: 34, width: 240, angle: -12 },
  { left: 24, top: 82, width: 212, angle: 8 },
  { left: 30, top: 136, width: 204, angle: -6 },
  { left: 42, top: 188, width: 182, angle: 10 },
];

const ORDER_STATUS_LABELS = [
  'Order Placed',
  'Preparing',
  'Packed',
  'Shipped',
  'Out For Delivery',
  'Delivered',
] as const;

const DELIVERY_DURATION_MS = 45000;

function RouteSegment({
  from,
  to,
  accent = false,
}: {
  from: { x: number; y: number };
  to: { x: number; y: number };
  accent?: boolean;
}) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const width = Math.sqrt(dx * dx + dy * dy);
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

  return (
    <View
      style={[
        styles.routeSegment,
        {
          width,
          left: from.x,
          top: from.y - 2,
          transform: [{ rotate: `${angle}deg` }],
          backgroundColor: accent ? COLORS.primary : '#CBD5E1',
        },
      ]}
    />
  );
}

export function OrderDeliveryCelebration({ order, product, onDone }: Props) {
  const progress = useRef(new Animated.Value(0)).current;
  const deliveryOpacity = useRef(new Animated.Value(0)).current;
  const deliveryScale = useRef(new Animated.Value(0.9)).current;
  const completionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [delivered, setDelivered] = useState(false);

  const routePoints = useMemo(() => ROUTE, []);
  const statusLabel = ORDER_STATUS_LABELS[order.statusIndex] ?? ORDER_STATUS_LABELS[0];
  const isDelivered = delivered || order.statusIndex >= 5;

  useEffect(() => {
    if (completionTimer.current) {
      clearTimeout(completionTimer.current);
      completionTimer.current = null;
    }

    if (isDelivered) {
      setDelivered(true);
      progress.stopAnimation();
      progress.setValue(1);
      Animated.parallel([
        Animated.timing(deliveryOpacity, {
          toValue: 1,
          duration: 240,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
        Animated.spring(deliveryScale, {
          toValue: 1,
          friction: 7,
          tension: 58,
          useNativeDriver: false,
        }),
      ]).start();
      completionTimer.current = setTimeout(onDone, 1400);
      return;
    }

    setDelivered(false);
    deliveryOpacity.setValue(0);
    deliveryScale.setValue(0.9);

    progress.stopAnimation();
    progress.setValue(0);

    Animated.timing(progress, {
      toValue: 1,
      duration: DELIVERY_DURATION_MS,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (!finished) {
        return;
      }

      setDelivered(true);
      Animated.parallel([
        Animated.timing(deliveryOpacity, {
          toValue: 1,
          duration: 260,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
        Animated.spring(deliveryScale, {
          toValue: 1,
          friction: 7,
          tension: 58,
          useNativeDriver: false,
        }),
      ]).start();

      completionTimer.current = setTimeout(onDone, 1300);
    });
  }, [deliveryOpacity, deliveryScale, isDelivered, onDone, order.id, progress]);

  useEffect(
    () => () => {
      progress.stopAnimation();
      deliveryOpacity.stopAnimation();
      deliveryScale.stopAnimation();
      if (completionTimer.current) {
        clearTimeout(completionTimer.current);
      }
    },
    [deliveryOpacity, deliveryScale, progress],
  );

  const bikeX = progress.interpolate({
    inputRange: [0, 0.2, 0.4, 0.6, 0.8, 1],
    outputRange: routePoints.map((point) => point.x),
  });
  const bikeY = progress.interpolate({
    inputRange: [0, 0.2, 0.4, 0.6, 0.8, 1],
    outputRange: routePoints.map((point) => point.y),
  });
  const bikeScale = progress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.96, 1, 1.02],
  });
  const bikeVisible = !isDelivered;
  const progressFillWidth = isDelivered ? '100%' : '78%';
  const summaryNote = isDelivered
    ? 'Your order reached the destination and was marked delivered.'
    : 'The courier is taking a realistic curved route before confirming delivery.';

  return (
    <View style={styles.wrap}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.kicker}>Live delivery</Text>
          <Text style={styles.title}>Your order is on the way</Text>
        </View>
        <View style={styles.statusPill}>
          <Text style={styles.statusPillText}>{statusLabel}</Text>
        </View>
      </View>

      <View style={styles.mapCard}>
        <View style={styles.mapGrid} />
        {MAP_LINES.map((line, index) => (
          <View
            key={`${line.left}-${line.top}-${index}`}
            style={[
              styles.mapStreet,
              {
                left: line.left,
                top: line.top,
                width: line.width,
                transform: [{ rotate: `${line.angle}deg` }],
              },
            ]}
          />
        ))}
        <RouteSegment from={routePoints[0]} to={routePoints[1]} />
        <RouteSegment from={routePoints[1]} to={routePoints[2]} />
        <RouteSegment from={routePoints[2]} to={routePoints[3]} accent />
        <RouteSegment from={routePoints[3]} to={routePoints[4]} accent />
        <RouteSegment from={routePoints[4]} to={routePoints[5]} accent />

        {routePoints.map((point, index) => (
          <View
            key={`${point.x}-${point.y}`}
            style={[
              styles.routeDot,
              {
                left: point.x - 4,
                top: point.y - 4,
                backgroundColor: index < routePoints.length - 1 ? COLORS.primary : COLORS.success,
              },
            ]}
          />
        ))}

        <View style={styles.originPin}>
          <MaterialCommunityIcons name="warehouse" size={16} color={COLORS.primary} />
          <Text style={styles.pinText}>Warehouse</Text>
        </View>

        <View style={styles.destinationPin}>
          <MaterialCommunityIcons name="home-map-marker" size={16} color={COLORS.success} />
          <Text style={styles.pinText}>You</Text>
        </View>

        {bikeVisible ? (
          <Animated.View
            style={[
              styles.bike,
              {
                transform: [{ translateX: bikeX }, { translateY: bikeY }, { scale: bikeScale }],
              },
            ]}
          >
            <MaterialCommunityIcons name="bike-fast" size={30} color={COLORS.primary} />
          </Animated.View>
        ) : null}

        <Animated.View
          style={[
            styles.deliveryBadge,
            {
              opacity: deliveryOpacity,
              transform: [{ scale: deliveryScale }],
            },
          ]}
        >
          <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />
          <Text style={styles.deliveryBadgeText}>Delivered successfully</Text>
        </Animated.View>
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryIcon}>
            <Ionicons name="bag-handle-outline" size={18} color={COLORS.primary} />
          </View>
          <View style={styles.summaryBody}>
            <Text style={styles.summaryTitle}>{product.title}</Text>
            <Text style={styles.summarySubtitle}>
              {order.quantity} item{order.quantity === 1 ? '' : 's'} • {formatCurrency(order.total)}
            </Text>
          </View>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: progressFillWidth }]} />
        </View>
        <Text style={styles.summaryNote}>{summaryNote}</Text>
      </View>

      <Pressable onPress={onDone} style={({ pressed }) => [styles.dismissButton, pressed && styles.dismissPressed]}>
        <Text style={styles.dismissText}>{isDelivered ? 'Continue to orders' : 'Skip animation'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 14,
  },
  kicker: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: COLORS.muted,
  },
  title: {
    marginTop: 4,
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.text,
  },
  statusPill: {
    backgroundColor: `${COLORS.success}14`,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.success,
  },
  mapCard: {
    height: 220,
    borderRadius: 22,
    backgroundColor: '#F8FAFC',
    overflow: 'hidden',
    marginBottom: 14,
  },
  mapGrid: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    opacity: 0.65,
  },
  mapStreet: {
    position: 'absolute',
    height: 1,
    borderRadius: 999,
    backgroundColor: '#E2E8F0',
  },
  routeSegment: {
    position: 'absolute',
    height: 5,
    borderRadius: 999,
  },
  routeDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  originPin: {
    position: 'absolute',
    left: 10,
    top: 152,
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  destinationPin: {
    position: 'absolute',
    right: 10,
    top: 28,
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  pinText: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.text,
  },
  bike: {
    position: 'absolute',
    marginLeft: -14,
    marginTop: -16,
  },
  deliveryBadge: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  deliveryBadgeText: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.text,
  },
  summaryCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  summaryIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${COLORS.primary}10`,
  },
  summaryBody: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.text,
  },
  summarySubtitle: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.muted,
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: COLORS.success,
  },
  summaryNote: {
    marginTop: 10,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
    color: COLORS.muted,
  },
  dismissButton: {
    alignSelf: 'center',
    borderRadius: 999,
    backgroundColor: `${COLORS.primary}10`,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  dismissPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  dismissText: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.primary,
  },
});
