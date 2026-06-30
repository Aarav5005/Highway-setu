import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { theme } from '../theme';
import StatusBadge from './StatusBadge';
import FeatherIcon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';

interface OrderCardProps {
  order: any;
  role: 'driver' | 'dhaba';
  onAction?: (action: string, orderId: string) => void;
}

export default function OrderCard({ order, role, onAction }: OrderCardProps) {
  const isDhaba = role === 'dhaba';
  const primaryColor = isDhaba ? theme.colors.dhabaPrimary : theme.colors.driverPrimary;

  return (
    <View style={styles.card}>
      {/* Top Banner indicating status visually (only for active orders) */}
      {order.status === 'pending' && <View style={[styles.statusStrip, {backgroundColor: theme.colors.warning}]} />}
      {order.status === 'accepted' && <View style={[styles.statusStrip, {backgroundColor: primaryColor}]} />}
      {order.status === 'preparing' && <View style={[styles.statusStrip, {backgroundColor: theme.colors.dhabaSecondary}]} />}
      {order.status === 'ready' && <View style={[styles.statusStrip, {backgroundColor: theme.colors.success}]} />}

      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Image
            source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }}
            style={styles.avatar}
          />
          <View>
            <Text style={styles.driverName}>{isDhaba ? (order.driver_name || 'Ramesh Kumar') : (order.dhaba_name || 'Apna Dhaba')}</Text>
            {isDhaba && (
              <View style={styles.truckBadge}>
                <FeatherIcon name="truck" size={12} color={theme.colors.textSecondary} style={{marginRight: 4}} />
                <Text style={styles.truckNum}>{order.truck_number || 'RJ 19 GA 1234'}</Text>
              </View>
            )}
            <View style={styles.timeBadge}>
              <FeatherIcon name="clock" size={12} color={theme.colors.textSecondary} style={{marginRight: 4}} />
              <Text style={styles.timeTxt}>Order Placed: {order.placed_at || '10:30 AM'}</Text>
            </View>
          </View>
        </View>
        <View style={styles.metaInfo}>
          <Text style={styles.amountTxt}>₹{order.total_amount || 450}</Text>
          <View style={styles.etaBadge}>
            <FeatherIcon name="clock" size={12} color={primaryColor} style={{marginRight: 4}} />
            <Text style={[styles.etaVal, { color: primaryColor }]}>ETA: {order.eta_minutes || 25} mins</Text>
          </View>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.itemsBox}>
        {order.items?.length ? order.items.map((it: any, i: number) => (
          <View key={i} style={styles.itemRow}>
            <Text style={styles.itemBullet}>•</Text>
            <Text style={styles.itemTxt}>{it.quantity} x {it.name}</Text>
          </View>
        )) : (
          <>
            <View style={styles.itemRow}>
               <Text style={styles.itemBullet}>•</Text>
               <Text style={styles.itemTxt}>2 x Dal Tadka</Text>
            </View>
            <View style={styles.itemRow}>
               <Text style={styles.itemBullet}>•</Text>
               <Text style={styles.itemTxt}>4 x Tawa Roti</Text>
            </View>
            <View style={styles.itemRow}>
               <Text style={styles.itemBullet}>•</Text>
               <Text style={styles.itemTxt}>1 x Paneer Sabji</Text>
            </View>
            <View style={styles.itemRow}>
               <Text style={styles.itemBullet}>•</Text>
               <Text style={styles.itemTxt}>1 x Jeera Rice</Text>
            </View>
          </>
        )}
      </View>

      {/* Massive Action Buttons for Dhaba Owners */}
      {isDhaba && (
        <View style={styles.actionContainer}>
          {order.status === 'pending' && (
            <View style={styles.actionsRow}>
              <TouchableOpacity style={[styles.btn, styles.acceptBtnOutline]} onPress={() => onAction?.('accept', order.id)}>
                <FeatherIcon name="check" size={16} color={theme.colors.success} style={{marginRight: 6}} />
                <Text style={styles.acceptTxtOutline}>Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, styles.rejectBtnOutline]} onPress={() => onAction?.('reject', order.id)}>
                <FeatherIcon name="x" size={16} color={theme.colors.error} style={{marginRight: 6}} />
                <Text style={styles.rejectTxtOutline}>Reject</Text>
              </TouchableOpacity>
            </View>
          )}

          {order.status === 'accepted' && (
            <TouchableOpacity style={[styles.fullBtn, { backgroundColor: theme.colors.dhabaSecondary }]} onPress={() => onAction?.('mark_preparing', order.id)}>
              <MaterialIcon name="pot-steam" size={28} color={theme.colors.text} style={{marginRight: 12}} />
              <Text style={[styles.fullBtnTxt, {color: theme.colors.text}]}>Start Preparing</Text>
            </TouchableOpacity>
          )}

          {order.status === 'preparing' && (
            <TouchableOpacity style={[styles.fullBtn, { backgroundColor: theme.colors.dhabaPrimary }]} onPress={() => onAction?.('mark_ready', order.id)}>
              <MaterialIcon name="bell-ring" size={28} color={theme.colors.white} style={{marginRight: 12}} />
              <Text style={styles.fullBtnTxt}>Food is Ready</Text>
            </TouchableOpacity>
          )}

          {order.status === 'ready' && (
            <TouchableOpacity style={[styles.fullBtn, { backgroundColor: theme.colors.success }]} onPress={() => onAction?.('mark_picked_up', order.id)}>
              <FeatherIcon name="check-circle" size={28} color={theme.colors.white} style={{marginRight: 12}} />
              <Text style={styles.fullBtnTxt}>Handed Over</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: theme.colors.white, borderRadius: 12, padding: theme.spacing.lg, marginBottom: theme.spacing.md, borderWidth: 1, borderColor: '#F1F5F9' },
  statusStrip: { position: 'absolute', top: 0, left: 0, right: 0, height: 4 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  userInfo: { flexDirection: 'row', alignItems: 'flex-start', flex: 1 },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: theme.spacing.md, backgroundColor: '#E2E8F0' },
  driverName: { ...theme.typography.h3, color: theme.colors.text, marginBottom: 4, fontWeight: '700' },
  truckBadge: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  truckNum: { ...theme.typography.small, color: theme.colors.textSecondary },
  timeBadge: { flexDirection: 'row', alignItems: 'center' },
  timeTxt: { ...theme.typography.small, color: theme.colors.textSecondary },

  metaInfo: { alignItems: 'flex-end' },
  amountTxt: { fontSize: 22, fontWeight: 'bold', color: theme.colors.dhabaPrimary, marginBottom: 4 },
  etaBadge: { flexDirection: 'row', alignItems: 'center' },
  etaVal: { ...theme.typography.small, fontWeight: '500' },

  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: theme.spacing.md },

  itemsBox: { marginBottom: theme.spacing.md },
  itemRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 },
  itemBullet: { ...theme.typography.body, color: theme.colors.textSecondary, marginRight: 8, fontSize: 16 },
  itemTxt: { ...theme.typography.body, color: theme.colors.textSecondary, flex: 1 },

  actionContainer: { marginTop: theme.spacing.sm },
  actionsRow: { flexDirection: 'row', gap: theme.spacing.md },
  btn: { flex: 1, paddingVertical: 12, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  rejectBtnOutline: { backgroundColor: '#FEF2F2', borderColor: theme.colors.error },
  rejectTxtOutline: { ...theme.typography.body, color: theme.colors.error, fontWeight: '600' },
  acceptBtnOutline: { backgroundColor: '#F0FDF4', borderColor: theme.colors.success },
  acceptTxtOutline: { ...theme.typography.body, color: theme.colors.success, fontWeight: '600' },

  fullBtn: { paddingVertical: 14, borderRadius: 8, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
  fullBtnTxt: { ...theme.typography.h3, color: theme.colors.white, fontWeight: 'bold' },
});

