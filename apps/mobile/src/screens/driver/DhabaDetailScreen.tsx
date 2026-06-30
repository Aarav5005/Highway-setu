import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, ImageBackground, Platform, Animated, Image } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { theme } from '../../theme';
import { useNavigation, useRoute } from '@react-navigation/native';
import ErrorBanner from '../../components/ErrorBanner';
import FeatherIcon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import Modal from 'react-native-modal';

// Helper for menu categories
const MENU_CATEGORIES = [
  { id: 'thali', name: 'Thalis', icon: 'food' },
  { id: 'main', name: 'Main Course', icon: 'pot-steam' },
  { id: 'bread', name: 'Breads', icon: 'bread-slice' },
  { id: 'drink', name: 'Beverages', icon: 'cup-water' },
];

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
  const [activeCategory, setActiveCategory] = useState('thali');
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const insets = useSafeAreaInsets();
  // Animation for cart pulse
  const cartScale = new Animated.Value(1);

  useEffect(() => {
    fetchData();
  }, [dhabaId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      setDhaba({
        id: dhabaId,
        dhaba_name: 'Apna Dhaba',
        highway_name: 'NH 48',
        avg_rating: 4.5,
        reviews: 230,
        distance_km: 2.4,
        is_open: true,
        close_time: '11:00 PM',
        photos: ['https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&q=80&w=800'],
        amenities: [
          { name: 'Parking', icon: 'car' },
          { name: 'Washroom', icon: 'toilet' },
          { name: 'AC Hall', icon: 'air-conditioner' },
          { name: 'Dormitory', icon: 'bed' },
          { name: 'Wi-Fi', icon: 'wifi' },
        ],
      });
      setMenu([
        { id: '1', name: 'Special Veg Thali', price: 150, category: 'thali', veg: true },
        { id: '2', name: 'Dal Makhani', price: 110, category: 'main', veg: true },
        { id: '3', name: 'Paneer Butter Masala', price: 140, category: 'main', veg: true },
        { id: '4', name: 'Tandoori Roti', price: 15, category: 'bread', veg: true },
        { id: '5', name: 'Lassi', price: 50, category: 'drink', veg: true },
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

    // Haptic/Visual feedback pulse
    Animated.sequence([
      Animated.timing(cartScale, { toValue: 1.05, duration: 100, useNativeDriver: true }),
      Animated.timing(cartScale, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  const removeFromCart = (item: any) => {
    const existing = cart.find(c => c.item.id === item.id);
    if (existing && existing.qty > 1) {
      setCart(cart.map(c => c.item.id === item.id ? { ...c, qty: c.qty - 1 } : c));
    } else {
      setCart(cart.filter(c => c.item.id !== item.id));
    }
  };

  const getQty = (itemId: string) => {
    const item = cart.find(c => c.item.id === itemId);
    return item ? item.qty : 0;
  };

  if (loading) {return <View style={styles.center}><ActivityIndicator size="large" color={theme.colors.driverPrimary} /></View>;}

  const totalAmount = cart.reduce((acc, c) => acc + (c.item.price * c.qty), 0);
  const totalItems = cart.reduce((acc, c) => acc + c.qty, 0);

  const filteredMenu = menu.filter(m => m.category === activeCategory);

  return (
    <View style={styles.container}>
      <ErrorBanner message={error} onRetry={fetchData} />

      <ScrollView bounces={false} contentContainerStyle={styles.scrollContent}>

        {/* Hero Image */}
        <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={{ height: 250 }}>
          {dhaba?.photos && dhaba.photos.length > 0 ? (
            dhaba.photos.map((photo: string, index: number) => (
              <TouchableOpacity key={index} activeOpacity={0.9} onPress={() => setSelectedPhoto(photo)}>
                <ImageBackground
                  source={{ uri: photo }}
                  style={[styles.hero, { width: 400 }]}
                  imageStyle={{ resizeMode: 'cover' }}
                >
                  <SafeAreaView style={styles.headerSafeArea}>
                    {index === 0 && (
                      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
                        <FeatherIcon name="arrow-left" size={24} color={theme.colors.white} />
                      </TouchableOpacity>
                    )}
                  </SafeAreaView>
                </ImageBackground>
              </TouchableOpacity>
            ))
          ) : (
            <ImageBackground
              source={require('../../assets/images/auth_hero_new.png')}
              style={[styles.hero, { width: 400 }]}
              imageStyle={{ resizeMode: 'cover' }}
            >
              <SafeAreaView style={styles.headerSafeArea}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
                  <FeatherIcon name="arrow-left" size={24} color={theme.colors.white} />
                </TouchableOpacity>
              </SafeAreaView>
            </ImageBackground>
          )}
        </ScrollView>


        {/* Bottom Sheet Content */}
        <View style={styles.bottomSheet}>
          <View style={styles.headerRow}>
            <View style={{flex: 1}}>
              <Text style={styles.title}>{dhaba?.dhaba_name}</Text>
              <Text style={styles.subTxt}>{dhaba?.distance_km} km • {dhaba?.highway_name}</Text>
            </View>
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingBadgeTxt}>{dhaba?.avg_rating}</Text>
              <MaterialIcon name="star" size={12} color={theme.colors.white} />
            </View>
          </View>

          <View style={styles.statusRow}>
            <Text style={styles.statusText}><Text style={{color: theme.colors.success, fontWeight: 'bold'}}>Open</Text> • Closes {dhaba?.close_time}</Text>
          </View>

          {/* Amenities Scroll */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.amenitiesScroll} contentContainerStyle={styles.amenitiesContainer}>
            {dhaba?.amenities?.map((am: any, idx: number) => (
              <View key={idx} style={styles.amenityChip}>
                <MaterialIcon name={am.icon} size={16} color={theme.colors.textSecondary} style={{marginRight: 6}} />
                <Text style={styles.amenityText}>{am.name}</Text>
              </View>
            ))}
          </ScrollView>

          <View style={styles.divider} />

          {/* Menu Categories */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll} contentContainerStyle={styles.catContainer}>
            {MENU_CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.catPill, activeCategory === cat.id && styles.catPillActive]}
                onPress={() => setActiveCategory(cat.id)}
              >
                <MaterialIcon name={cat.icon} size={18} color={activeCategory === cat.id ? theme.colors.white : theme.colors.textSecondary} style={{marginRight: 6}} />
                <Text style={[styles.catTxt, activeCategory === cat.id && styles.catTxtActive]}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Menu Items List */}
          <View style={styles.menuList}>
            {filteredMenu.map(item => {
              const qty = getQty(item.id);
              return (
                <View key={item.id} style={styles.menuItemRow}>
                  <View style={{flex: 1, paddingRight: 16}}>
                    <View style={[styles.vegTag, { borderColor: item.veg ? '#16a34a' : '#dc2626' }]}>
                      <View style={[styles.vegDot, {backgroundColor: item.veg ? '#16a34a' : '#dc2626'}]} />
                    </View>
                    <Text style={styles.menuItemName}>{item.name}</Text>
                    <Text style={styles.menuItemPrice}>₹{item.price}</Text>
                  </View>

                  {/* Large Add/Remove Controls */}
                  {qty === 0 ? (
                    <TouchableOpacity style={styles.addBtn} onPress={() => addToCart(item)}>
                      <Text style={styles.addBtnTxt}>ADD</Text>
                      <FeatherIcon name="plus" size={16} color={theme.colors.driverPrimary} />
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.qtyControl}>
                      <TouchableOpacity style={styles.qtyBtn} onPress={() => removeFromCart(item)}>
                        <FeatherIcon name="minus" size={18} color={theme.colors.white} />
                      </TouchableOpacity>
                      <Text style={styles.qtyTxt}>{qty}</Text>
                      <TouchableOpacity style={styles.qtyBtn} onPress={() => addToCart(item)}>
                        <FeatherIcon name="plus" size={18} color={theme.colors.white} />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })}
          </View>

          {/* Spacer for floating cart */}
          <View style={{height: 120 + insets.bottom}} />

        </View>
      </ScrollView>

      {/* Floating Cart Footer */}
      {cart.length > 0 && (
        <Animated.View style={[styles.floatingCartWrapper, { bottom: (Platform.OS === 'android' ? 24 : 16) + insets.bottom, transform: [{scale: cartScale}] }]}>
          <TouchableOpacity
            style={styles.floatingCart}
            activeOpacity={0.9}
            onPress={() => navigation.navigate('OrderConfirm', { cart, dhabaId })}
          >
            <View style={styles.cartInfo}>
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeTxt}>{totalItems}</Text>
              </View>
              <Text style={styles.cartTotalTxt}>₹{totalAmount} <Text style={{fontSize: 12, fontWeight: 'normal'}}>+ taxes</Text></Text>
            </View>
            <View style={styles.cartAction}>
              <Text style={styles.cartActionTxt}>Checkout</Text>
              <FeatherIcon name="arrow-right" size={20} color={theme.colors.white} />
            </View>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Full Screen Photo Modal */}
      <Modal
        isVisible={!!selectedPhoto}
        onBackdropPress={() => setSelectedPhoto(null)}
        onBackButtonPress={() => setSelectedPhoto(null)}
        style={{ margin: 0 }}
      >
        <View style={{ flex: 1, backgroundColor: 'black', justifyContent: 'center', alignItems: 'center' }}>
          <SafeAreaView style={{ position: 'absolute', top: 20, left: 20, zIndex: 10 }}>
            <TouchableOpacity onPress={() => setSelectedPhoto(null)} style={styles.iconBtn}>
              <FeatherIcon name="x" size={24} color={theme.colors.white} />
            </TouchableOpacity>
          </SafeAreaView>
          {selectedPhoto && (
            <Image source={{ uri: selectedPhoto }} style={{ width: '100%', height: '80%', resizeMode: 'contain' }} />
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingBottom: 0 },

  hero: { height: 260, width: '100%', justifyContent: 'flex-start' },
  headerSafeArea: { flexDirection: 'row', justifyContent: 'space-between', padding: theme.spacing.lg, paddingTop: Platform.OS === 'android' ? 40 : theme.spacing.lg },
  iconBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },

  bottomSheet: {
    flex: 1,
    marginTop: -30,
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
  },

  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  title: { ...theme.typography.h1, color: theme.colors.text, marginBottom: 4 },
  subTxt: { ...theme.typography.body, color: theme.colors.textSecondary },
  ratingBadge: { backgroundColor: theme.colors.warning, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  ratingBadgeTxt: { color: theme.colors.white, fontWeight: 'bold', marginRight: 4, fontSize: 14 },

  statusRow: { marginBottom: theme.spacing.md },
  statusText: { ...theme.typography.body, color: theme.colors.textSecondary },

  amenitiesScroll: { marginBottom: theme.spacing.lg, maxHeight: 40 },
  amenitiesContainer: { paddingRight: theme.spacing.lg },
  amenityChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, marginRight: 8 },
  amenityText: { ...theme.typography.small, color: theme.colors.textSecondary },

  divider: { height: 1, backgroundColor: theme.colors.borderLight, marginVertical: theme.spacing.md },

  // Menu Categories
  catScroll: { marginBottom: theme.spacing.lg, maxHeight: 50 },
  catContainer: { paddingRight: theme.spacing.lg, alignItems: 'center' },
  catPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 25, borderWidth: 1, borderColor: theme.colors.borderLight, marginRight: 10 },
  catPillActive: { backgroundColor: theme.colors.driverPrimary, borderColor: theme.colors.driverPrimary },
  catTxt: { ...theme.typography.body, color: theme.colors.textSecondary, fontWeight: '600' as const },
  catTxtActive: { color: theme.colors.white },

  // Menu Items
  menuList: { paddingBottom: theme.spacing.lg },
  menuItemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: theme.colors.surface },
  vegTag: { width: 14, height: 14, borderWidth: 1, justifyContent: 'center', alignItems: 'center', marginBottom: 6, borderRadius: 2 },
  vegDot: { width: 6, height: 6, borderRadius: 3 },
  menuItemName: { ...theme.typography.h3, color: theme.colors.text, marginBottom: 4 },
  menuItemPrice: { ...theme.typography.body, color: theme.colors.textSecondary, fontWeight: 'bold' as const },

  // Large tap targets for Add
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.colors.driverPrimary, borderRadius: 8, width: 90, height: 44 },
  addBtnTxt: { ...theme.typography.body, color: theme.colors.driverPrimary, fontWeight: 'bold' as const, marginRight: 4 },

  qtyControl: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.driverPrimary, borderRadius: 8, width: 110, height: 44, justifyContent: 'space-between', paddingHorizontal: 4 },
  qtyBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  qtyTxt: { ...theme.typography.h3, color: theme.colors.white },

  // Floating Cart
  floatingCartWrapper: { position: 'absolute', left: 16, right: 16, zIndex: 10, ...theme.shadows.lg },
  floatingCart: { backgroundColor: theme.colors.driverPrimary, borderRadius: 16, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cartInfo: { flexDirection: 'row', alignItems: 'center' },
  cartBadge: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  cartBadgeTxt: { color: theme.colors.white, fontWeight: 'bold', fontSize: 16 },
  cartTotalTxt: { ...theme.typography.h2, color: theme.colors.white },
  cartAction: { flexDirection: 'row', alignItems: 'center' },
  cartActionTxt: { ...theme.typography.h3, color: theme.colors.white, marginRight: 8 },
});

