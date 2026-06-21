import { useEffect, useState } from 'react';

import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ScreenHeader } from '../../components/ScreenHeader';
import { COLORS } from '../../services/theme';
import { formatCurrency } from '../../services/format';
import { useShopStore } from '../../store/useShopStore';
import { getProductById } from '../../services/catalog';

const WALLET_START = 100000000;
const PROFILE_NAME_KEY = 'fake-flipkart.profile-name';

export default function ProfileScreen() {
  const [name, setName] = useState('Guest User');
  const [draftName, setDraftName] = useState('Guest User');
  const [isSaving, setIsSaving] = useState(false);
  const walletBalance = useShopStore((state) => state.walletBalance);
  const orders = useShopStore((state) => state.orders);
  const catalog = useShopStore((state) => state.catalog);

  useEffect(() => {
    let isMounted = true;

    AsyncStorage.getItem(PROFILE_NAME_KEY)
      .then((storedName) => {
        if (!isMounted || !storedName?.trim()) {
          return;
        }

        const normalizedName = storedName.trim();
        setName(normalizedName);
        setDraftName(normalizedName);
      })
      .catch(() => {
        // Keep the default guest name if storage access fails.
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSaveName = async () => {
    const nextName = draftName.trim() || 'Guest User';
    setIsSaving(true);

    try {
      await AsyncStorage.setItem(PROFILE_NAME_KEY, nextName);
      setName(nextName);
      setDraftName(nextName);
    } finally {
      setIsSaving(false);
    }
  };

  const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
  const highestPurchase = orders.reduce<{ title: string; price: number } | null>(
    (best, order) => {
      const product = getProductById(catalog, order.productId);
      if (!product) {
        return best;
      }

      if (!best || product.price > best.price) {
        return { title: product.title, price: product.price };
      }

      return best;
    },
    null,
  )?.title ?? 'Featured Item';

  const progress = Math.max(0, Math.min(100, (totalSpent / WALLET_START) * 100));

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Profile" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileHero}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={34} color={COLORS.primary} />
          </View>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.subtitle}>Unlimited shopper mode engaged</Text>
          <View style={styles.nameEditor}>
            <TextInput
              value={draftName}
              onChangeText={setDraftName}
              placeholder="Enter your name"
              placeholderTextColor="#9CA3AF"
              style={styles.nameInput}
              returnKeyType="done"
              onSubmitEditing={handleSaveName}
            />
            <Pressable
              onPress={handleSaveName}
              style={({ pressed }) => [styles.saveButton, pressed && styles.saveButtonPressed]}
            >
              <Text style={styles.saveButtonText}>{isSaving ? 'Saving...' : 'Save Name'}</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.walletCard}>
          <Text style={styles.kicker}>Wallet Stats</Text>
          <Text style={styles.walletValue}>{formatCurrency(walletBalance)}</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.walletCaption}>
            You have spent {formatCurrency(totalSpent)} of your fake wallet.
          </Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Spending Stats</Text>
        </View>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Orders</Text>
            <Text style={styles.statValue}>{orders.length}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Money Spent</Text>
            <Text style={styles.statValue}>{formatCurrency(totalSpent)}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Highest Purchase</Text>
            <Text style={styles.statValue} numberOfLines={1}>
              {highestPurchase}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Wallet Left</Text>
            <Text style={styles.statValue}>{formatCurrency(walletBalance)}</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Achievements</Text>
        </View>
        <View style={styles.achievementCard}>
          <View style={styles.achievementRow}>
            <MaterialCommunityIcons name="trophy" size={18} color="#F59E0B" />
            <Text style={styles.achievementText}>Luxury Explorer</Text>
          </View>
          <View style={styles.achievementRow}>
            <MaterialCommunityIcons name="truck-fast-outline" size={18} color={COLORS.primary} />
            <Text style={styles.achievementText}>30 second delivery watcher</Text>
          </View>
          <View style={styles.achievementRow}>
            <MaterialCommunityIcons name="cash-multiple" size={18} color={COLORS.success} />
            <Text style={styles.achievementText}>Fake money champion</Text>
          </View>
        </View>
      </ScrollView>
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
    paddingBottom: 28,
  },
  profileHero: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 10,
  },
  avatar: {
    width: 86,
    height: 86,
    borderRadius: 28,
    backgroundColor: '#E9F1FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  name: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.text,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 13,
    color: COLORS.muted,
    fontWeight: '700',
  },
  nameEditor: {
    width: '100%',
    marginTop: 14,
    gap: 10,
  },
  nameInput: {
    width: '100%',
    minHeight: 48,
    borderRadius: 16,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '700',
  },
  saveButton: {
    minHeight: 46,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.card,
  },
  walletCard: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
    marginBottom: 18,
  },
  kicker: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: COLORS.muted,
    fontWeight: '700',
    marginBottom: 6,
  },
  walletValue: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.text,
  },
  progressBar: {
    height: 12,
    borderRadius: 999,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
    marginTop: 14,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.secondary,
    borderRadius: 999,
  },
  walletCaption: {
    marginTop: 12,
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 18,
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 18,
  },
  statCard: {
    width: '48%',
    backgroundColor: COLORS.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    minHeight: 92,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.muted,
    marginBottom: 10,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.text,
  },
  achievementCard: {
    backgroundColor: COLORS.card,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    gap: 12,
  },
  achievementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  achievementText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.text,
  },
});
