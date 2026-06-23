import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { theme } from '../../theme';
import { ordersApi } from '../../api/orders';
import OrderCard from '../../components/OrderCard';

export default function DhabaHomeScreen() {
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('Pending');
  const tabs = ['Pending', 'Accepted', 'Preparing', 'Ready', 'History'];
  const [orders, setOrders] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async () => {
    try {
      const res = await ordersApi.getDhabaOrders(activeTab.toLowerCase());
      setOrders(res.data?.data || []);
    } catch(e) {
      setOrders([
        { id: '1', driver_name: 'Raj Singh', truck_number: 'PB10AB1234', status: activeTab.toLowerCase(), total_amount: 350, eta_minutes: 15, items: [{name: 'Dal Makhani', quantity: 2}] }
      ]);
    }
  };

  useEffect(() => {
    fetchOrders();
    const timer = setInterval(fetchOrders, 10000);
    return () => clearInterval(timer);
  }, [activeTab]);

  const handleAction = async (action: string, orderId: string) => {
    console.log(`Action: ${action} on ${orderId}`);
    if (action === 'accept') {
      setOrders(orders.filter(o => o.id !== orderId));
    } else if (action.startsWith('mark')) {
      setOrders(orders.filter(o => o.id !== orderId));
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Sher-e-Punjab Dhaba</Text>
          <Text style={styles.subtitle}>NH-44 Highway</Text>
        </View>
        <TouchableOpacity style={[styles.toggleBtn, isOpen ? styles.toggleOpen : styles.toggleClosed]} onPress={() => setIsOpen(!isOpen)}>
          <Text style={styles.toggleTxt}>{isOpen ? 'OPEN' : 'CLOSED'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNum}>24</Text>
          <Text style={styles.statLbl}>Today's Orders</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNum}>₹4,500</Text>
          <Text style={styles.statLbl}>Revenue</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNum, {color: theme.colors.primary}]}>3</Text>
          <Text style={styles.statLbl}>Pending</Text>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroller}>
        {tabs.map(tab => (
          <TouchableOpacity key={tab} style={[styles.tab, activeTab === tab && styles.tabActive]} onPress={() => setActiveTab(tab)}>
            <Text style={[styles.tabTxt, activeTab === tab && styles.tabTxtActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView 
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchOrders().then(()=>setRefreshing(false)); }} />}
      >
        {orders.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={{fontSize: 60, marginBottom: 16}}>🍽️</Text>
            <Text style={styles.emptyTxt}>No {activeTab.toLowerCase()} orders</Text>
            <Text style={styles.emptySub}>Your dhaba is currently {isOpen ? 'OPEN' : 'CLOSED'}</Text>
          </View>
        ) : (
          orders.map(o => <OrderCard key={o.id} order={o} role="dhaba" onAction={handleAction} />)
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: theme.spacing.lg, backgroundColor: theme.colors.white, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  title: { ...theme.typography.h2, color: theme.colors.text },
  subtitle: { ...theme.typography.small, color: theme.colors.textSecondary },
  toggleBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  toggleOpen: { backgroundColor: theme.colors.success },
  toggleClosed: { backgroundColor: theme.colors.error },
  toggleTxt: { ...theme.typography.small, color: theme.colors.white, fontWeight: 'bold' },
  statsRow: { flexDirection: 'row', padding: theme.spacing.md },
  statCard: { flex: 1, backgroundColor: theme.colors.white, marginHorizontal: 4, padding: theme.spacing.md, borderRadius: theme.borderRadius.md, alignItems: 'center', elevation: 1 },
  statNum: { ...theme.typography.h2, color: theme.colors.text, marginBottom: 4 },
  statLbl: { ...theme.typography.tiny, color: theme.colors.textSecondary, textAlign: 'center' },
  tabsScroller: { maxHeight: 50, borderBottomWidth: 1, borderBottomColor: theme.colors.border, backgroundColor: theme.colors.white },
  tab: { paddingHorizontal: theme.spacing.lg, justifyContent: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: theme.colors.primary },
  tabTxt: { ...theme.typography.body, color: theme.colors.textSecondary },
  tabTxtActive: { color: theme.colors.primary, fontWeight: 'bold' },
  list: { padding: theme.spacing.md, paddingBottom: 100 },
  emptyState: { alignItems: 'center', marginTop: 60 },
  emptyTxt: { ...theme.typography.h2, color: theme.colors.textSecondary, marginBottom: 8 },
  emptySub: { ...theme.typography.body, color: theme.colors.textSecondary }
});
