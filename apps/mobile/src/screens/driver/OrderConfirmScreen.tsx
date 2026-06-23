import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { theme } from '../../theme';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ordersApi } from '../../api/orders';

export default function OrderConfirmScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { cart, dhabaId } = route.params;

  const [eta, setEta] = useState(20);
  const [loading, setLoading] = useState(false);

  const totalAmount = cart.reduce((acc: number, c: any) => acc + (c.item.price * c.qty), 0);

  const onConfirm = async () => {
    setLoading(true);
    try {
      setTimeout(() => {
        navigation.navigate('OrderTracking', { orderId: 'ord_123' });
      }, 1000);
    } catch(e) {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.backBtn}>←</Text></TouchableOpacity>
        <Text style={styles.title}>Confirm Order</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.summaryCard}>
          <Text style={styles.cardTitle}>Order Summary</Text>
          {cart.map((c: any, i: number) => (
            <View key={i} style={styles.itemRow}>
              <Text style={styles.itemName}>{c.qty}x {c.item.name}</Text>
              <Text style={styles.itemPrice}>₹{c.qty * c.item.price}</Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalVal}>₹{totalAmount}</Text>
          </View>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.cardTitle}>When will you arrive?</Text>
          <View style={styles.etaRow}>
            <TouchableOpacity style={styles.etaBtn} onPress={() => setEta(Math.max(5, eta - 5))}><Text style={styles.etaTxt}>-</Text></TouchableOpacity>
            <Text style={styles.etaVal}>{eta} min</Text>
            <TouchableOpacity style={styles.etaBtn} onPress={() => setEta(Math.min(60, eta + 5))}><Text style={styles.etaTxt}>+</Text></TouchableOpacity>
          </View>
        </View>

        <View style={styles.codBox}>
          <Text style={styles.codTitle}>💵 Cash on Delivery</Text>
          <Text style={styles.codSub}>Pay ₹{totalAmount} cash when you pick up your order.</Text>
        </View>

      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.confirmBtn} onPress={onConfirm} disabled={loading}>
          {loading ? <ActivityIndicator color={theme.colors.white}/> : <Text style={styles.confirmTxt}>Place Order (₹{totalAmount})</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { flexDirection: 'row', alignItems: 'center', padding: theme.spacing.lg, backgroundColor: theme.colors.white, marginTop: theme.spacing.md },
  backBtn: { fontSize: 24, marginRight: theme.spacing.md, color: theme.colors.text },
  title: { ...theme.typography.h2, color: theme.colors.text },
  content: { padding: theme.spacing.md },
  summaryCard: { backgroundColor: theme.colors.white, borderRadius: theme.borderRadius.md, padding: theme.spacing.md, marginBottom: theme.spacing.md, elevation: 1 },
  cardTitle: { ...theme.typography.h3, color: theme.colors.text, marginBottom: theme.spacing.md },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: theme.spacing.sm },
  itemName: { ...theme.typography.body, color: theme.colors.textSecondary },
  itemPrice: { ...theme.typography.body, color: theme.colors.text },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: theme.spacing.sm, paddingTop: theme.spacing.sm, borderTopWidth: 1, borderTopColor: theme.colors.border },
  totalLabel: { ...theme.typography.h3, color: theme.colors.text },
  totalVal: { ...theme.typography.h2, color: theme.colors.primary },
  etaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  etaBtn: { width: 50, height: 50, backgroundColor: theme.colors.surface, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  etaTxt: { fontSize: 24, color: theme.colors.primary },
  etaVal: { ...theme.typography.h2, color: theme.colors.text, marginHorizontal: theme.spacing.xl },
  codBox: { backgroundColor: '#e6f4ea', padding: theme.spacing.md, borderRadius: theme.borderRadius.md, borderWidth: 1, borderColor: theme.colors.success },
  codTitle: { ...theme.typography.h3, color: theme.colors.success, marginBottom: theme.spacing.xs },
  codSub: { ...theme.typography.small, color: theme.colors.textSecondary },
  bottomBar: { padding: theme.spacing.lg, backgroundColor: theme.colors.white, elevation: 10 },
  confirmBtn: { backgroundColor: theme.colors.primary, height: 56, borderRadius: theme.borderRadius.md, justifyContent: 'center', alignItems: 'center' },
  confirmTxt: { ...theme.typography.h3, color: theme.colors.white }
});
