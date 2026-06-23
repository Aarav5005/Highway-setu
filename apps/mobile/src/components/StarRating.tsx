import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme';

export default function StarRating({ rating, size = 16 }: { rating: number, size?: number }) {
  const fullStars = Math.floor(rating);
  const halfStar = rating - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  return (
    <View style={styles.row}>
      {[...Array(fullStars)].map((_, i) => (
        <Text key={`full-${i}`} style={{ color: theme.colors.primary, fontSize: size }}>★</Text>
      ))}
      {halfStar && <Text style={{ color: theme.colors.primary, fontSize: size }}>★</Text>}
      {[...Array(emptyStars)].map((_, i) => (
        <Text key={`empty-${i}`} style={{ color: theme.colors.border, fontSize: size }}>★</Text>
      ))}
      <Text style={[styles.text, { fontSize: size * 0.9 }]}>{rating.toFixed(1)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  text: { marginLeft: 4, color: theme.colors.textSecondary, fontWeight: '600' }
});
