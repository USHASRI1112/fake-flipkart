import { Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORS } from '../services/theme';

type Props = {
  page: number;
  totalPages: number;
  onChangePage: (page: number) => void;
};

function getVisiblePages(page: number, totalPages: number) {
  if (totalPages <= 4) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set<number>([1, totalPages]);
  for (let offset = -1; offset <= 1; offset += 1) {
    const candidate = page + offset;
    if (candidate >= 1 && candidate <= totalPages) {
      pages.add(candidate);
    }
  }

  return [...pages].sort((a, b) => a - b);
}

export function PaginationBar({ page, totalPages, onChangePage }: Props) {
  const visiblePages = getVisiblePages(page, totalPages);

  if (totalPages <= 1) {
    return null;
  }

  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={() => onChangePage(Math.max(1, page - 1))}
        disabled={page === 1}
        style={({ pressed }) => [
          styles.control,
          (pressed || page === 1) && page !== 1 ? styles.pressed : null,
          page === 1 && styles.disabled,
        ]}
      >
        <Text style={styles.controlText}>Prev</Text>
      </Pressable>

      {visiblePages.map((item, index) => {
        const previous = visiblePages[index - 1];
        const isGap = previous !== undefined && item - previous > 1;

        return (
          <View key={`${item}-${index}`} style={styles.pageGroup}>
            {isGap ? <Text style={styles.ellipsis}>...</Text> : null}
            <Pressable
              onPress={() => onChangePage(item)}
              style={({ pressed }) => [
                styles.pageButton,
                item === page && styles.pageButtonActive,
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.pageText, item === page && styles.pageTextActive]}>
                {item}
              </Text>
            </Pressable>
          </View>
        );
      })}

      <Pressable
        onPress={() => onChangePage(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        style={({ pressed }) => [
          styles.control,
          (pressed || page === totalPages) && page !== totalPages ? styles.pressed : null,
          page === totalPages && styles.disabled,
        ]}
      >
        <Text style={styles.controlText}>Next</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    flexWrap: 'wrap',
    paddingVertical: 16,
  },
  pageGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pageButton: {
    minWidth: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  pageButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  pageText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.text,
  },
  pageTextActive: {
    color: COLORS.card,
  },
  control: {
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  controlText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.text,
  },
  ellipsis: {
    color: COLORS.muted,
    fontWeight: '900',
    marginHorizontal: 2,
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.5,
  },
});

