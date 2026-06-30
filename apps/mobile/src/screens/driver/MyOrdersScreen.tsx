import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity,  Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme } from '../../theme';
import FeatherIcon from 'react-native-vector-icons/Feather';

export default function MyOrdersScreen() {
  const orders = [
    { id: 'ORD-123', dhaba: 'Apna Dhaba', date: '21 Oct, 1:30 PM', items: '2x Thali, 1x Lassi', total: '₹ 240', status: 'Delivered' },
    { id: 'ORD-124', dhaba: 'Sher-e-Punjab Dhaba', date: '19 Oct, 8:45 PM', items: '1x Paneer Butter Masala, 3x Roti', total: '₹ 320', status: 'Delivered' },
    { id: 'ORD-125', dhaba: 'Highway King', date: '15 Oct, 2:15 PM', items: '1x Dal Makhani, 2x Naan', total: '₹ 180', status: 'Cancelled' },
  ];

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.orderCard}>
      <View style={styles.cardHeader}>
        <View style={styles.dhabaInfo}>
          <Text style={styles.dhabaName}>{item.dhaba}</Text>
          <Text style={styles.dateTxt}>{item.date}</Text>
        </View>
        <Text style={styles.totalTxt}>{item.total}</Text>
      </View>

      <View style={styles.itemsRow}>
        <Text style={styles.itemsTxt} numberOfLines={1}>{item.items}</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.footerRow}>
        <View style={[styles.statusBadge, item.status === 'Cancelled' ? styles.statusBadgeError : null]}>
          <Text style={[styles.statusTxt, item.status === 'Cancelled' ? styles.statusTxtError : null]}>{item.status}</Text>
        </View>

        <TouchableOpacity style={styles.reorderBtn}>
          <FeatherIcon name="rotate-cw" size={14} color={theme.colors.driverPrimary} style={{marginRight: 4}} />
          <Text style={styles.reorderTxt}>Reorder</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={{backgroundColor: theme.colors.white}}>
        <View style={styles.header}>
          <Text style={styles.title}>My Food Orders</Text>
        </View>
      </SafeAreaView>

      <FlatList
        data={orders}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { padding: theme.spacing.md, backgroundColor: theme.colors.white, borderBottomWidth: 1, borderBottomColor: theme.colors.borderLight },
  title: { ...theme.typography.h2, color: theme.colors.text },

  listContent: { padding: theme.spacing.md },
  orderCard: { backgroundColor: theme.colors.white, borderRadius: theme.borderRadius.lg, padding: theme.spacing.md, marginBottom: theme.spacing.md, ...theme.shadows.sm, borderWidth: 1, borderColor: theme.colors.borderLight },

  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: theme.spacing.sm },
  dhabaInfo: { flex: 1 },
  dhabaName: { ...theme.typography.h3, color: theme.colors.text, marginBottom: 2 },
  dateTxt: { ...theme.typography.small, color: theme.colors.textSecondary },
  totalTxt: { ...theme.typography.h3, color: theme.colors.driverPrimary },

  itemsRow: { marginBottom: theme.spacing.md },
  itemsTxt: { ...theme.typography.body, color: theme.colors.textSecondary },

  divider: { height: 1, backgroundColor: theme.colors.borderLight, marginBottom: theme.spacing.sm },

  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusBadge: { backgroundColor: 'rgba(34, 197, 94, 0.1)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  statusBadgeError: { backgroundColor: 'rgba(239, 68, 68, 0.1)' },
  statusTxt: { ...theme.typography.small, color: theme.colors.success, fontWeight: 'bold' },
  statusTxtError: { color: theme.colors.error },

  reorderBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4, paddingHorizontal: 12, borderRadius: 16, borderWidth: 1, borderColor: theme.colors.driverPrimary },
  reorderTxt: { ...theme.typography.small, color: theme.colors.driverPrimary, fontWeight: 'bold' },
});
