import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Platform, Animated, Easing, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme } from '../../theme';
import { ordersApi } from '../../api/orders';
import OrderCard from '../../components/OrderCard';
import ErrorBanner from '../../components/ErrorBanner';
import FeatherIcon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';

// Helper component for interactive scaling buttons
const AnimatedPressable = ({ children, onPress, style }: any) => {
  const scale = React.useRef(new Animated.Value(1)).current;
  return (
    <TouchableOpacity
      activeOpacity={0.95}
      onPressIn={() => Animated.spring(scale, { toValue: 0.9, useNativeDriver: true }).start()}
      onPressOut={() => Animated.spring(scale, { toValue: 1, friction: 4, tension: 40, useNativeDriver: true }).start()}
      onPress={onPress}
    >
      <Animated.View style={[style, { transform: [{ scale }] }]}>
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
};

export default function DhabaHomeScreen() {
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('Pending');
  const tabs = ['Pending', 'Accepted', 'Preparing', 'Ready', 'History'];
  const [orders, setOrders] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  // Animations
  const headerColorAnim = React.useRef(new Animated.Value(isOpen ? 1 : 0)).current;
  const fade1 = React.useRef(new Animated.Value(0)).current;
  const fade2 = React.useRef(new Animated.Value(0)).current;
  const fade3 = React.useRef(new Animated.Value(0)).current;
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  // Staggered entry & pulse
  useEffect(() => {
    Animated.stagger(150, [
      Animated.timing(fade1, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(fade2, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(fade3, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // Header Color Transition
  useEffect(() => {
    Animated.timing(headerColorAnim, {
      toValue: isOpen ? 1 : 0,
      duration: 500,
      useNativeDriver: false, // color interpolation requires false
    }).start();
  }, [isOpen]);

  const headerBgColor = headerColorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.colors.white, '#F0FDF4'], // from white to subtle green
  });

  const fetchOrders = async () => {
    try {
      setError('');
      const res = await ordersApi.getDhabaOrders(activeTab.toLowerCase());
      setOrders(res.data?.data || []);
    } catch(e: any) {
      setOrders([]);
      setError(e?.response?.data?.message || 'Failed to fetch orders');
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
      <Animated.View style={{ backgroundColor: theme.colors.dhabaPrimary, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }}>
        <SafeAreaView edges={['top']}>
          <View style={styles.header}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <View style={styles.dhabaIconBg}>
              <Image source={{uri: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&q=80&w=150'}} style={{width: 50, height: 50, borderRadius: 25}} />
            </View>
            <View>
              <Text style={styles.title}>Sharma Dhaba</Text>
              <Text style={styles.subtitle}>NH 62, Jaipur - Jodhpur Highway</Text>
            </View>
          </View>
          <AnimatedPressable
            style={[styles.toggleBtn, isOpen ? styles.toggleOpen : styles.toggleClosed]}
            onPress={() => setIsOpen(!isOpen)}
          >
            <Text style={[styles.toggleTxt, !isOpen && {color: theme.colors.textSecondary}]}>{isOpen ? 'Open' : 'Closed'}</Text>
            <View style={[styles.toggleDot, isOpen ? {backgroundColor: theme.colors.success} : null]} />
          </AnimatedPressable>
        </View>
        </SafeAreaView>
      </Animated.View>

      <ErrorBanner message={error} />

      <View style={styles.statsRow}>
        <Animated.View style={[styles.statCard, { opacity: fade1, transform: [{ translateY: fade1.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }]}>
          <View style={styles.iconCircle}>
             <FeatherIcon name="shopping-bag" size={18} color={theme.colors.white} />
          </View>
          <Text style={styles.statNum}>32</Text>
          <Text style={styles.statLbl}>Today's Orders</Text>
        </Animated.View>
        <Animated.View style={[styles.statCard, { opacity: fade2, transform: [{ translateY: fade2.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }]}>
          <View style={styles.iconCircle}>
             <MaterialIcon name="currency-inr" size={18} color={theme.colors.white} />
          </View>
          <Text style={styles.statNum}>₹18,750</Text>
          <Text style={styles.statLbl}>Today's Revenue</Text>
        </Animated.View>
        <Animated.View style={[styles.statCard, { opacity: fade3, transform: [{ scale: pulseAnim }, { translateY: fade3.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }]}>
          <View style={styles.iconCircle}>
             <FeatherIcon name="clipboard" size={18} color={theme.colors.white} />
          </View>
          <Text style={[styles.statNum]}>8</Text>
          <Text style={[styles.statLbl]}>Pending Orders</Text>
        </Animated.View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroller} contentContainerStyle={{paddingHorizontal: theme.spacing.md}}>
        {tabs.map(tab => (
          <AnimatedPressable
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabTxt, activeTab === tab && styles.tabTxtActive]}>{tab}</Text>
          </AnimatedPressable>
        ))}
      </ScrollView>

      <Animated.ScrollView
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchOrders().then(()=>setRefreshing(false)); }} />}
        style={{ opacity: fade1 }} // Reuse fade1 for the list body
      >
        {orders.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconBg}>
              <FeatherIcon name="inbox" size={48} color={theme.colors.border} />
            </View>
            <Text style={styles.emptyTxt}>No {activeTab.toLowerCase()} orders</Text>
            <Text style={styles.emptySub}>Your dhaba is currently {isOpen ? 'OPEN' : 'CLOSED'}</Text>
          </View>
        ) : (
          orders.map(o => <OrderCard key={o.id} order={o} role="dhaba" onAction={handleAction} />)
        )}
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: theme.spacing.md, paddingBottom: 24 },
  dhabaIconBg: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginRight: theme.spacing.sm, borderWidth: 2, borderColor: theme.colors.white },
  title: { fontSize: 20, fontWeight: 'bold', color: theme.colors.white },
  subtitle: { ...theme.typography.small, color: 'rgba(255,255,255,0.9)', marginTop: 2 },

  toggleBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20, backgroundColor: theme.colors.white },
  toggleOpen: { },
  toggleClosed: { },
  toggleDot: { width: 14, height: 14, borderRadius: 7, marginLeft: 6 },
  toggleTxt: { fontSize: 13, color: theme.colors.success, fontWeight: 'bold', paddingLeft: 4 },

  statsRow: { flexDirection: 'row', paddingHorizontal: theme.spacing.md, gap: theme.spacing.sm, marginTop: -15, zIndex: 10 },
  statCard: { flex: 1, backgroundColor: theme.colors.white, paddingVertical: 16, paddingHorizontal: 4, borderRadius: 12, alignItems: 'center', ...theme.shadows.sm, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2, borderWidth: 1, borderColor: '#F1F5F9' },
  iconCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: theme.colors.dhabaPrimary, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  statNum: { fontSize: 20, fontWeight: 'bold', color: theme.colors.dhabaPrimary, marginBottom: 4 },
  statLbl: { fontSize: 11, color: theme.colors.text, textAlign: 'center', fontWeight: '500' },

  tabsScroller: { maxHeight: 50, backgroundColor: theme.colors.white, marginTop: theme.spacing.md },
  tab: { paddingHorizontal: 18, justifyContent: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: theme.colors.dhabaPrimary },
  tabTxt: { fontSize: 14, color: theme.colors.textSecondary, fontWeight: '600' },
  tabTxtActive: { color: theme.colors.dhabaPrimary },

  list: { padding: theme.spacing.md, paddingBottom: 100 },
  emptyState: { alignItems: 'center', marginTop: 80 },
  emptyIconBg: { width: 100, height: 100, borderRadius: 50, backgroundColor: theme.colors.white, justifyContent: 'center', alignItems: 'center', marginBottom: theme.spacing.lg, ...theme.shadows.sm },
  emptyTxt: { ...theme.typography.h2, color: theme.colors.text, marginBottom: 8 },
  emptySub: { ...theme.typography.body, color: theme.colors.textSecondary },
});
