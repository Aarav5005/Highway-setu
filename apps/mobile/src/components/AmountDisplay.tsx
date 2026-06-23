import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';
import { theme } from '../theme';

export default function AmountDisplay({ amount, label, style }: { amount: number, label?: string, style?: TextStyle }) {
  return (
    <Text style={[styles.text, style]}>
      {label && <Text style={styles.label}>{label} </Text>}
      ₹{amount.toLocaleString('en-IN')}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: { ...theme.typography.h3, color: theme.colors.text },
  label: { ...theme.typography.body, color: theme.colors.textSecondary }
});
