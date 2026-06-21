import { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { COLORS } from '../services/theme';

type Props = {
  onDone: () => void;
};

export function AppLaunchAnimation({ onDone }: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.92)).current;
  const lift = useRef(new Animated.Value(18)).current;
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1100,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1100,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
      ]),
    );

    pulseLoop.start();

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 420,
        useNativeDriver: false,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 7,
        tension: 65,
        useNativeDriver: false,
      }),
      Animated.timing(lift, {
        toValue: 0,
        duration: 420,
        useNativeDriver: false,
      }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 240,
        useNativeDriver: false,
      }).start(({ finished }) => {
        if (finished) {
          onDone();
        }
      });
    }, 1650);

    return () => {
      pulseLoop.stop();
      clearTimeout(timer);
    };
  }, [lift, opacity, onDone, pulse, scale]);

  const pulseScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.92, 1.08],
  });
  const pulseOpacity = pulse.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.32, 0.68, 0.32],
  });

  return (
    <Animated.View style={[styles.overlay, { opacity }]}>
      <Animated.View
        style={[
          styles.glow,
          {
            opacity: pulseOpacity,
            transform: [{ scale: pulseScale }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.card,
          {
            opacity,
            transform: [{ translateY: lift }, { scale }],
          },
        ]}
      >
        <View style={styles.brandRing}>
          <View style={styles.brandCore}>
            <MaterialCommunityIcons name="shopping-outline" size={34} color={COLORS.primary} />
          </View>
        </View>
        <Text style={styles.title}>Fake Flipkart</Text>
        <Text style={styles.subtitle}>Loaded for mobile, food, and everything in between.</Text>

        <View style={styles.chipsRow}>
          <View style={styles.chip}>
            <Text style={styles.chipText}>Mobiles</Text>
          </View>
          <View style={styles.chip}>
            <Text style={styles.chipText}>Food</Text>
          </View>
          <View style={styles.chip}>
            <Text style={styles.chipText}>Fast checkout</Text>
          </View>
        </View>

        <View style={styles.loadingRow}>
          <View style={styles.loadingDot} />
          <View style={styles.loadingTrack}>
            <Animated.View
              style={[
                styles.loadingFill,
                {
                  transform: [
                    {
                      translateX: pulse.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-36, 180],
                      }),
                    },
                  ],
                },
              ]}
            />
          </View>
          <Text style={styles.loadingText}>Opening store</Text>
        </View>
      </Animated.View>
      <Pressable style={StyleSheet.absoluteFill} onPress={onDone} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  glow: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 240,
    backgroundColor: `${COLORS.primary}14`,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 28,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 28,
    paddingHorizontal: 22,
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOpacity: 0.12,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  brandRing: {
    width: 92,
    height: 92,
    borderRadius: 92,
    backgroundColor: `${COLORS.primary}10`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandCore: {
    width: 66,
    height: 66,
    borderRadius: 66,
    backgroundColor: `${COLORS.secondary}CC`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginTop: 18,
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.text,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.muted,
    textAlign: 'center',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 18,
  },
  chip: {
    backgroundColor: `${COLORS.primary}10`,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primary,
  },
  loadingRow: {
    width: '100%',
    marginTop: 22,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
  },
  loadingTrack: {
    flex: 1,
    height: 6,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: '#E5E7EB',
  },
  loadingFill: {
    width: 72,
    height: '100%',
    borderRadius: 999,
    backgroundColor: COLORS.primary,
  },
  loadingText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.text,
  },
});
