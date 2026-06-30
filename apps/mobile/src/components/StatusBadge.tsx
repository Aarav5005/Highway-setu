import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme';

interface StatusBadgeProps {
  status: string;
  type?: 'order' | 'verification' | 'open';
}

export default function StatusBadge({ status, type = 'order' }: StatusBadgeProps) {
  const getColors = () => {
    const s = status.toLowerCase();
    if (s === 'pending' || s === 'preparing') {return { bg: theme.colors.surface, text: theme.colors.primary };}
    if (s === 'accepted' || s === 'ready' || s === 'picked up' || s === 'verified' || s === 'open' || s === 'active') {return { bg: '#e6f4ea', text: theme.colors.success };}
    if (s === 'rejected' || s === 'cancelled' || s === 'closed') {return { bg: '#ffebe6', text: theme.colors.error };}
    return { bg: theme.colors.border, text: theme.colors.textSecondary };
  };

  const { bg, text } = getColors();

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.text, { color: text }]}>{status.toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: theme.borderRadius.sm, alignSelf: 'flex-start' },
  text: { ...theme.typography.tiny, fontWeight: 'bold' },
});
