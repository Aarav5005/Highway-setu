import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Platform} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { theme } from '../../theme';
import { useNavigation, useRoute } from '@react-navigation/native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function OrderConfirmScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { cart, dhabaId, mechanicId } = route.params || { cart: [], dhabaId: '1' };
  const isMechanic = !!mechanicId;
  const insets = useSafeAreaInsets();

  const [eta, setEta] = useState(20);
  const [loading, setLoading] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const totalAmount = cart?.reduce((acc: number, c: any) => acc + (c.item.price * c.qty), 0) || 0;
  const taxes = Math.round(totalAmount * 0.05); // 5% tax

  const onConfirm = async () => {
    setLoading(true);
    try {
      setTimeout(() => {
        setLoading(false);
        setIsConfirmed(true);
      }, 1500);
    } catch(e) {
      setLoading(false);
    }
  };

  if (isConfirmed) {
    return (
      <View style={styles.successContainer}>
        {/* Green Hero */}
        <View style={styles.successHero}>
          <SafeAreaView style={{ alignItems: 'center', paddingTop: Platform.OS === 'android' ? 40 : 20 }}>
            <View style={styles.checkCircle}>
              <FeatherIcon name="check" size={48} color={theme.colors.success} />
            </View>
            <Text style={styles.successTitle}>Order Confirmed!</Text>
            <Text style={styles.successSub}>Booking ID: #AB123456</Text>
          </SafeAreaView>
        </View>

        {/* Overlapping Card */}
        <View style={styles.successCardWrapper}>
          <View style={styles.successCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.dhabaName}>{isMechanic ? 'Highway Auto Fix' : 'Apna Dhaba'}</Text>
              <Text style={styles.dhabaLoc}>NH 48, {isMechanic ? '1.2' : '2.4'} km away</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.itemsList}>
              {cart.map((c: any, i: number) => (
                <Text key={i} style={styles.summaryItemText}>{c.qty}x {c.item.name}</Text>
              ))}
            </View>

            <View style={styles.divider} />

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Paid (COD)</Text>
              <Text style={styles.summaryVal}>₹ {totalAmount + taxes}</Text>
            </View>
            {!isMechanic && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Pickup Ready In</Text>
                <Text style={[styles.summaryVal, {color: theme.colors.success}]}>{eta} mins</Text>
              </View>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={[styles.successActionFooter, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnOutline]}
            onPress={() => navigation.navigate('OrderTracking', { orderId: 'ord_123' })}
          >
            <Text style={[styles.actionBtnTxt, {color: theme.colors.driverPrimary}]}>Track Order</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnFilled]}
            onPress={() => navigation.popToTop()}
          >
            <Text style={[styles.actionBtnTxt, {color: theme.colors.white}]}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={{backgroundColor: theme.colors.white}}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('DriverHome')} style={{padding: 8, marginLeft: -8}}>
            <FeatherIcon name="arrow-left" size={28} color={theme.colors.text} style={styles.backIcon} />
          </TouchableOpacity>
          <Text style={styles.title}>Checkout</Text>
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.content}>

        {/* Massive ETA Selector - Only for Dhaba */}
        {!isMechanic && (
          <View style={styles.etaCard}>
            <Text style={styles.etaTitle}>When will you arrive?</Text>
            <Text style={styles.etaSub}>We'll start preparing so it's hot when you reach.</Text>

            <View style={styles.etaRow}>
              <TouchableOpacity style={styles.etaBtn} onPress={() => setEta(Math.max(5, eta - 5))}>
                <FeatherIcon name="minus" size={32} color={theme.colors.driverPrimary} />
              </TouchableOpacity>

              <View style={styles.etaDisplay}>
                <Text style={styles.etaVal}>{eta}</Text>
                <Text style={styles.etaMinText}>min</Text>
              </View>

              <TouchableOpacity style={styles.etaBtn} onPress={() => setEta(Math.min(60, eta + 5))}>
                <FeatherIcon name="plus" size={32} color={theme.colors.driverPrimary} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.summaryCard}>
          <View style={styles.cardHeaderRow}>
            <MaterialIcon name="receipt" size={20} color={theme.colors.textSecondary} />
            <Text style={styles.cardTitle}>Bill Summary</Text>
          </View>

          {cart.map((c: any, i: number) => (
            <View key={i} style={styles.itemRow}>
              <Text style={styles.itemName}>
                <Text style={{fontWeight: 'bold', color: theme.colors.driverPrimary}}>{c.qty}x </Text>
                {c.item.name}
              </Text>
              <Text style={styles.itemPrice}>₹{c.qty * c.item.price}</Text>
            </View>
          ))}

          <View style={styles.itemRow}>
            <Text style={styles.itemName}>Taxes & Charges</Text>
            <Text style={styles.itemPrice}>₹{taxes}</Text>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Grand Total</Text>
            <Text style={styles.totalVal}>₹{totalAmount + taxes}</Text>
          </View>
        </View>

        <View style={styles.codBox}>
          <View style={styles.codIconBg}>
            <MaterialIcon name="cash" size={24} color={theme.colors.success} />
          </View>
          <View style={{flex: 1}}>
            <Text style={styles.codTitle}>Cash on Delivery</Text>
            <Text style={styles.codSub}>Pay directly at the {isMechanic ? 'shop' : 'Dhaba'}</Text>
          </View>
          <FeatherIcon name="check-circle" size={24} color={theme.colors.success} />
        </View>

      </ScrollView>

      {/* Massive Place Order Button */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity style={styles.confirmBtn} onPress={onConfirm} disabled={loading}>
          {loading ? (
            <ActivityIndicator color={theme.colors.white} size="large" />
          ) : (
            <>
              <Text style={styles.confirmTxt}>{isMechanic ? 'Confirm Booking' : 'Place Order'}</Text>
              <View style={styles.confirmPriceBadge}>
                <Text style={styles.confirmPriceTxt}>₹{totalAmount + taxes}</Text>
              </View>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { flexDirection: 'row', alignItems: 'center', padding: theme.spacing.md, backgroundColor: theme.colors.white, borderBottomWidth: 1, borderBottomColor: theme.colors.borderLight },
  backIcon: { marginRight: theme.spacing.sm },
  title: { ...theme.typography.h1, color: theme.colors.text },
  content: { padding: theme.spacing.lg, paddingBottom: 100 },

  etaCard: { backgroundColor: theme.colors.surfaceCard, borderRadius: 20, padding: theme.spacing.xl, marginBottom: theme.spacing.lg, alignItems: 'center', ...theme.shadows.md, borderWidth: 1, borderColor: theme.colors.driverPrimary },
  etaTitle: { ...theme.typography.h2, color: theme.colors.text, marginBottom: 4 },
  etaSub: { ...theme.typography.body, color: theme.colors.textSecondary, textAlign: 'center', marginBottom: theme.spacing.xl },
  etaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%' },
  etaBtn: { width: 64, height: 64, backgroundColor: theme.colors.surface, borderRadius: 32, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: theme.colors.borderLight },
  etaDisplay: { alignItems: 'center', width: 120 },
  etaVal: { fontSize: 48, fontWeight: 'bold', color: theme.colors.driverPrimary, lineHeight: 56 },
  etaMinText: { ...theme.typography.h3, color: theme.colors.textSecondary },

  summaryCard: { backgroundColor: theme.colors.white, borderRadius: 16, padding: theme.spacing.lg, marginBottom: theme.spacing.lg, ...theme.shadows.sm, borderWidth: 1, borderColor: theme.colors.borderLight },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.md, paddingBottom: theme.spacing.sm, borderBottomWidth: 1, borderBottomColor: theme.colors.borderLight },
  cardTitle: { ...theme.typography.h3, color: theme.colors.text, marginLeft: 8 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: theme.spacing.md },
  itemName: { ...theme.typography.body, color: theme.colors.text },
  itemPrice: { ...theme.typography.body, color: theme.colors.text, fontWeight: 'bold' as const },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: theme.spacing.sm, paddingTop: theme.spacing.md, borderTopWidth: 2, borderTopColor: theme.colors.borderLight, borderStyle: 'dashed' },
  totalLabel: { ...theme.typography.h2, color: theme.colors.text },
  totalVal: { ...theme.typography.h1, color: theme.colors.driverPrimary },

  codBox: { backgroundColor: '#F0FDF4', padding: theme.spacing.lg, borderRadius: 16, borderWidth: 1, borderColor: theme.colors.success, flexDirection: 'row', alignItems: 'center' },
  codIconBg: { width: 48, height: 48, borderRadius: 24, backgroundColor: theme.colors.white, justifyContent: 'center', alignItems: 'center', marginRight: theme.spacing.md, ...theme.shadows.sm },
  codTitle: { ...theme.typography.h3, color: theme.colors.success },
  codSub: { ...theme.typography.body, color: theme.colors.textSecondary, marginTop: 2 },

  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: theme.spacing.lg, backgroundColor: theme.colors.white, borderTopWidth: 1, borderTopColor: theme.colors.borderLight, ...theme.shadows.lg },
  confirmBtn: { backgroundColor: theme.colors.driverPrimary, height: 64, borderRadius: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, ...theme.shadows.md },
  confirmTxt: { ...theme.typography.h2, color: theme.colors.white },
  confirmPriceBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  confirmPriceTxt: { ...theme.typography.h3, color: theme.colors.white, fontWeight: 'bold' as const },

  // Success State Styles
  successContainer: { flex: 1, backgroundColor: theme.colors.background },
  successHero: { backgroundColor: theme.colors.success, height: 340, width: '100%', alignItems: 'center' },
  checkCircle: { width: 96, height: 96, borderRadius: 48, backgroundColor: theme.colors.white, justifyContent: 'center', alignItems: 'center', marginBottom: theme.spacing.xl, ...theme.shadows.md },
  successTitle: { fontSize: 28, fontWeight: 'bold', color: theme.colors.white, marginBottom: 8 },
  successSub: { ...theme.typography.h3, color: 'rgba(255,255,255,0.9)' },

  successCardWrapper: { paddingHorizontal: theme.spacing.lg, marginTop: -60 },
  successCard: { backgroundColor: theme.colors.white, borderRadius: 20, padding: theme.spacing.xl, ...theme.shadows.lg },
  cardHeader: { alignItems: 'center', marginBottom: theme.spacing.lg },
  dhabaName: { ...theme.typography.h1, color: theme.colors.text, marginBottom: 4 },
  dhabaLoc: { ...theme.typography.body, color: theme.colors.textSecondary },
  divider: { height: 1, backgroundColor: theme.colors.borderLight, marginVertical: theme.spacing.md },
  itemsList: { paddingVertical: theme.spacing.sm },
  summaryItemText: { ...theme.typography.h3, color: theme.colors.textSecondary, marginBottom: 8, textAlign: 'center' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: theme.spacing.md, alignItems: 'center' },
  summaryLabel: { ...theme.typography.body, color: theme.colors.textSecondary },
  summaryVal: { ...theme.typography.h3, color: theme.colors.text },

  successActionFooter: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: theme.spacing.lg, flexDirection: 'row', justifyContent: 'space-between', backgroundColor: theme.colors.background },
  actionBtn: { flex: 1, height: 60, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  actionBtnOutline: { borderWidth: 2, borderColor: theme.colors.driverPrimary, marginRight: theme.spacing.sm },
  actionBtnFilled: { backgroundColor: theme.colors.driverPrimary, marginLeft: theme.spacing.sm },
  actionBtnTxt: { ...theme.typography.h3, fontWeight: 'bold' as const },
});
