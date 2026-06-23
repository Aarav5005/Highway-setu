import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../theme';
import StarRating from './StarRating';

interface DhabaCardProps {
  dhaba: any;
  onPress: () => void;
}

export default function DhabaCard({ dhaba, onPress }: DhabaCardProps) {
  const isOpen = dhaba.is_open !== false; // default true

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.header}>
        <Text style={styles.name} numberOfLines={1}>{dhaba.dhaba_name || 'Dhaba'}</Text>
        <View style={[styles.badge, { backgroundColor: isOpen ? theme.colors.success : theme.colors.error }]}>
          <Text style={styles.badgeText}>{isOpen ? 'OPEN' : 'CLOSED'}</Text>
        </View>
      </View>
      
      <View style={styles.infoRow}>
        <StarRating rating={dhaba.avg_rating || 4.0} size={14} />
        <Text style={styles.distance}> • {dhaba.distance_km || '2.5'} km away</Text>
      </View>

      <View style={styles.amenities}>
        {dhaba.amenities?.truck_parking && <Text style={styles.icon}>🅿</Text>}
        {dhaba.amenities?.ac && <Text style={styles.icon}>❄</Text>}
        {dhaba.amenities?.dormitory && <Text style={styles.icon}>🛏</Text>}
        {dhaba.amenities?.wifi && <Text style={styles.icon}>🌐</Text>}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 260,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginRight: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  name: {
    ...theme.typography.h3,
    color: theme.colors.text,
    flex: 1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
    marginLeft: theme.spacing.sm,
  },
  badgeText: {
    ...theme.typography.tiny,
    color: theme.colors.white,
    fontWeight: 'bold',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  distance: {
    ...theme.typography.small,
    color: theme.colors.textSecondary,
  },
  amenities: {
    flexDirection: 'row',
  },
  icon: {
    fontSize: 16,
    marginRight: 8,
  }
});
