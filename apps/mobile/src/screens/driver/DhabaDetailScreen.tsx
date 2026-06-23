import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { theme } from '../../theme';
import { useNavigation, useRoute } from '@react-navigation/native';
import { dhabasApi } from '../../api/dhabas';
import StarRating from '../../components/StarRating';
import ErrorBanner from '../../components/ErrorBanner';

export default function DhabaDetailScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const dhabaId = route.params?.dhabaId;

  const [dhaba, setDhaba] = useState<any>(null);
  const [menu, setMenu] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cart, setCart] = useState<{item: any, qty: number}[]>([]);

  useEffect(() => {
    fetchData();
  }, [dhabaId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      setDhaba({ id: dhabaId, dhaba_name: 'Sher-e-Punjab Dhaba', highway_name: 'NH-44', avg_rating: 4.5, distance_km: 2.5, is_open: true, amenities: { truck_parking: true, ac: true, dormitory: true } });
      setMenu([
        { id: '1', name: 'Dal Makhani', price: 120 },
        { id: '2', name: 'Butter Naan', price: 30 },
        { id: '3', name: 'Tandoori Roti', price: 15 },
        { id: '4', name: 'Lassi', price: 60 },
      ]);
    } catch(e) {
      setError('Failed to load dhaba details');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (item: any) => {
    const existing = cart.find(c => c.item.id === item.id);
    if (existing) {
      setCart(cart.map(c => c.item.id === item.id ? { ...c, qty: c.qty + 1 } : c));
    } else {
      setCart([...cart, { item, qty: 1 }]);
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={theme.colors.primary} /></View>;

  const totalAmount = cart.reduce((acc, c) => acc + (c.item.price * c.qty), 0);
  const totalItems = cart.reduce((acc, c) => acc + c.qty, 0);

  return (
    <View style={styles.container}>
      <ErrorBanner message={error} onRetry={fetchData} />
      <ScrollView>
        <View style={styles.imgPlaceholder}><Text style={styles.imgTxt}>Dhaba Photo</Text></View>
        
        <View style={styles.infoSec}>
          <Text style={styles.title}>{dhaba?.dhaba_name}</Text>
          <View style={styles.row}>
            <StarRating rating={dhaba?.avg_rating || 0} size={16} />
            <Text style={styles.subTxt}> • {dhaba?.highway_name} • {dhaba?.distance_km} km away</Text>
          </View>

          <View style={styles.amenities}>
            {dhaba?.amenities?.truck_parking && <Text style={styles.icon}>🅿 Parking</Text>}
            {dhaba?.amenities?.ac && <Text style={styles.icon}>❄ AC</Text>}
            {dhaba?.amenities?.dormitory && <Text style={styles.icon}>🛏 Dormitory</Text>}
          </View>
        </View>

        <View style={styles.menuSec}>
          <Text style={styles.menuTitle}>Menu</Text>
          {menu.map(item => (
            <View key={item.id} style={styles.menuItem}>
              <View>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPrice}>₹{item.price}</Text>
              </View>
              <TouchableOpacity style={styles.addBtn} onPress={() => addToCart(item)}>
                <Text style={styles.addTxt}>+</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>

      {cart.length > 0 && (
        <View style={styles.cartBar}>
          <View>
            <Text style={styles.cartItemsTxt}>{totalItems} items</Text>
            <Text style={styles.cartTotalTxt}>₹{totalAmount}</Text>
          </View>
          <TouchableOpacity 
            style={styles.checkoutBtn} 
            onPress={() => navigation.navigate('OrderConfirm', { cart, dhabaId })}
          >
            <Text style={styles.checkoutTxt}>Place Order</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  imgPlaceholder: { height: 200, backgroundColor: theme.colors.border, justifyContent: 'center', alignItems: 'center' },
  imgTxt: { color: theme.colors.textSecondary },
  infoSec: { backgroundColor: theme.colors.white, padding: theme.spacing.lg, marginBottom: theme.spacing.md },
  title: { ...theme.typography.h2, color: theme.colors.text, marginBottom: theme.spacing.xs },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.md },
  subTxt: { ...theme.typography.small, color: theme.colors.textSecondary },
  amenities: { flexDirection: 'row', flexWrap: 'wrap' },
  icon: { ...theme.typography.small, color: theme.colors.text, marginRight: theme.spacing.md, backgroundColor: theme.colors.surface, padding: 6, borderRadius: theme.borderRadius.sm },
  menuSec: { backgroundColor: theme.colors.white, padding: theme.spacing.lg },
  menuTitle: { ...theme.typography.h3, color: theme.colors.text, marginBottom: theme.spacing.md },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: theme.spacing.md, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  itemName: { ...theme.typography.body, color: theme.colors.text, fontWeight: 'bold' },
  itemPrice: { ...theme.typography.body, color: theme.colors.textSecondary },
  addBtn: { width: 40, height: 40, backgroundColor: theme.colors.surface, borderRadius: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: theme.colors.primary },
  addTxt: { fontSize: 24, color: theme.colors.primary, marginTop: -2 },
  cartBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: theme.colors.white, borderTopWidth: 1, borderTopColor: theme.colors.border, padding: theme.spacing.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 10 },
  cartItemsTxt: { ...theme.typography.small, color: theme.colors.textSecondary },
  cartTotalTxt: { ...theme.typography.h2, color: theme.colors.text },
  checkoutBtn: { backgroundColor: theme.colors.primary, paddingHorizontal: theme.spacing.xl, paddingVertical: theme.spacing.sm, borderRadius: theme.borderRadius.md },
  checkoutTxt: { ...theme.typography.h3, color: theme.colors.white }
});
