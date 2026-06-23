import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../theme';
import StatusBadge from './StatusBadge';
import AmountDisplay from './AmountDisplay';

interface OrderCardProps {
  order: any;
  role: 'driver' | 'dhaba';
  onAction?: (action: string, orderId: string) => void;
}

export default function OrderCard({ order, role, onAction }: OrderCardProps) {
  const isDhaba = role === 'dhaba';
  
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.driverName}>{order.driver_name || 'Driver'}</Text>
          <Text style={styles.truckNum}>{order.truck_number || 'TRUCK-123'}</Text>
        </View>
        <StatusBadge status={order.status} />
      </View>

      <View style={styles.itemsBox}>
        {order.items?.map((it: any, i: number) => (
          <Text key={i} style={styles.itemTxt}>{it.quantity}x {it.name}</Text>
        ))}
      </View>

      <View style={styles.footer}>
        <View>
          <AmountDisplay amount={order.total_amount || 0} />
          <Text style={styles.cod}>Cash on Delivery</Text>
        </View>
        <View style={styles.etaBox}>
          <Text style={styles.etaLbl}>ETA</Text>
          <Text style={styles.etaVal}>{order.eta_minutes || 20} min</Text>
        </View>
      </View>

      {isDhaba && order.status === 'pending' && (
        <View style={styles.actionsRow}>
          <TouchableOpacity style={[styles.btn, styles.rejectBtn]} onPress={() => onAction?.('reject', order.id)}>
            <Text style={styles.rejectTxt}>Reject</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.acceptBtn]} onPress={() => onAction?.('accept', order.id)}>
            <Text style={styles.acceptTxt}>Accept</Text>
          </TouchableOpacity>
        </View>
      )}

      {isDhaba && order.status === 'accepted' && (
        <TouchableOpacity style={styles.fullBtn} onPress={() => onAction?.('mark_preparing', order.id)}>
          <Text style={styles.fullBtnTxt}>Mark Preparing</Text>
        </TouchableOpacity>
      )}

      {isDhaba && order.status === 'preparing' && (
        <TouchableOpacity style={styles.fullBtn} onPress={() => onAction?.('mark_ready', order.id)}>
          <Text style={styles.fullBtnTxt}>Mark Ready</Text>
        </TouchableOpacity>
      )}

      {isDhaba && order.status === 'ready' && (
        <TouchableOpacity style={styles.fullBtn} onPress={() => onAction?.('mark_picked_up', order.id)}>
          <Text style={styles.fullBtnTxt}>Mark Picked Up</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: theme.colors.white, borderRadius: theme.borderRadius.md, padding: theme.spacing.md, marginBottom: theme.spacing.md, borderWidth: 1, borderColor: theme.colors.border, elevation: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: theme.spacing.md },
  driverName: { ...theme.typography.h3, color: theme.colors.text },
  truckNum: { ...theme.typography.small, color: theme.colors.textSecondary, marginTop: 2 },
  itemsBox: { backgroundColor: theme.colors.background, padding: theme.spacing.sm, borderRadius: theme.borderRadius.sm, marginBottom: theme.spacing.md },
  itemTxt: { ...theme.typography.body, color: theme.colors.text, marginBottom: 2 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: theme.spacing.md },
  cod: { ...theme.typography.tiny, color: theme.colors.textSecondary, marginTop: 2 },
  etaBox: { alignItems: 'flex-end' },
  etaLbl: { ...theme.typography.tiny, color: theme.colors.textSecondary },
  etaVal: { ...theme.typography.h3, color: theme.colors.primary },
  actionsRow: { flexDirection: 'row', gap: theme.spacing.md },
  btn: { flex: 1, paddingVertical: theme.spacing.md, borderRadius: theme.borderRadius.sm, alignItems: 'center' },
  rejectBtn: { backgroundColor: '#ffebe6' },
  rejectTxt: { ...theme.typography.body, color: theme.colors.error, fontWeight: 'bold' },
  acceptBtn: { backgroundColor: theme.colors.success },
  acceptTxt: { ...theme.typography.body, color: theme.colors.white, fontWeight: 'bold' },
  fullBtn: { backgroundColor: theme.colors.primary, paddingVertical: theme.spacing.md, borderRadius: theme.borderRadius.sm, alignItems: 'center', marginTop: theme.spacing.md },
  fullBtnTxt: { ...theme.typography.body, color: theme.colors.white, fontWeight: 'bold' }
});
