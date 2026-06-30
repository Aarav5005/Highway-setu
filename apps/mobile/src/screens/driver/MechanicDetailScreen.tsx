import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, ImageBackground, Platform, Animated, Image } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Modal from 'react-native-modal';

import { useTranslation } from 'react-i18next';
import { theme } from '../../theme';
import { useNavigation, useRoute } from '@react-navigation/native';
import ErrorBanner from '../../components/ErrorBanner';
import FeatherIcon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';

// Helper for menu categories
const SERVICE_CATEGORIES = [
  { id: 'repair', name: 'Repairs', icon: 'wrench' },
  { id: 'tyre', name: 'Tyre & Wheel', icon: 'tire' },
  { id: 'towing', name: 'Towing', icon: 'tow-truck' },
];

export default function MechanicDetailScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const mechanicId = route.params?.mechanicId;

  const [mechanic, setMechanic] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cart, setCart] = useState<{item: any, qty: number}[]>([]);
  const [activeCategory, setActiveCategory] = useState('repair');
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

  // Animation for cart pulse
  const cartScale = new Animated.Value(1);

  useEffect(() => {
    fetchData();
  }, [mechanicId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      setMechanic({
        id: mechanicId,
        shop_name: 'Highway Auto Fix',
        highway_name: 'NH 48',
        avg_rating: 4.8,
        reviews: 110,
        distance_km: 1.2,
        is_open: true,
        close_time: '24/7',
        photos: ['https://images.unsplash.com/photo-1597816828557-0db79f6e625a?auto=format&fit=crop&q=80&w=800'],
        amenities: [
          { name: 'On-site Repair', icon: 'tool' },
          { name: 'Towing', icon: 'truck' },
          { name: 'Battery Jump', icon: 'zap' },
        ],
      });
      setServices([
        { id: '1', name: 'Engine Diagnostic', price: 500, category: 'repair', veg: true },
        { id: '2', name: 'Brake Pad Change', price: 800, category: 'repair', veg: true },
        { id: '3', name: 'Flat Tyre Fix', price: 150, category: 'tyre', veg: true },
        { id: '4', name: 'Wheel Alignment', price: 400, category: 'tyre', veg: true },
        { id: '5', name: 'Emergency Towing (per km)', price: 100, category: 'towing', veg: true },
      ]);
    } catch(e) {
      setError('Failed to load mechanic details');
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

  const filteredMenu = services.filter(m => m.category === activeCategory);

  return (
    <View style={styles.container}>
      <ErrorBanner message={error} onRetry={fetchData} />

      <ScrollView bounces={false} contentContainerStyle={styles.scrollContent}>

        {/* Photos Carousel */}
        <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={{ height: 250 }}>
          {mechanic?.photos && mechanic.photos.length > 0 ? (
            mechanic.photos.map((photo: string, index: number) => (
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
              <Text style={styles.title}>{mechanic?.shop_name}</Text>
              <Text style={styles.subTxt}>{mechanic?.distance_km} km • {mechanic?.highway_name}</Text>
            </View>
            <View style={[styles.ratingBadge, {backgroundColor: theme.colors.mechanicPrimary}]}>
              <Text style={styles.ratingBadgeTxt}>{mechanic?.avg_rating}</Text>
              <MaterialIcon name="star" size={12} color={theme.colors.white} />
            </View>
          </View>

          <View style={styles.statusRow}>
            <Text style={styles.statusText}><Text style={{color: theme.colors.success, fontWeight: 'bold'}}>Available</Text> • Closes {mechanic?.close_time}</Text>
          </View>

          {/* Amenities Scroll */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.amenitiesScroll} contentContainerStyle={styles.amenitiesContainer}>
            {mechanic?.amenities?.map((am: any, idx: number) => (
              <View key={idx} style={styles.amenityChip}>
                <FeatherIcon name={am.icon} size={14} color={theme.colors.textSecondary} style={{marginRight: 6}} />
                <Text style={styles.amenityText}>{am.name}</Text>
              </View>
            ))}
          </ScrollView>

          <View style={styles.divider} />

          {/* Menu Categories */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll} contentContainerStyle={styles.catContainer}>
            {SERVICE_CATEGORIES.map(cat => (
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
                    <View style={styles.vegTag}>
                      <FeatherIcon name="tool" size={12} color={theme.colors.mechanicPrimary} />
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
            style={[styles.floatingCart, {backgroundColor: theme.colors.mechanicPrimary}]}
            activeOpacity={0.9}
            onPress={() => navigation.navigate('OrderConfirm', { cart, mechanicId })}
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
  vegTag: { width: 20, height: 20, backgroundColor: theme.colors.surface, justifyContent: 'center', alignItems: 'center', marginBottom: 6, borderRadius: 10 },
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
  floatingCart: { backgroundColor: theme.colors.mechanicPrimary, borderRadius: 16, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cartInfo: { flexDirection: 'row', alignItems: 'center' },
  cartBadge: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  cartBadgeTxt: { color: theme.colors.white, fontWeight: 'bold', fontSize: 16 },
  cartTotalTxt: { ...theme.typography.h2, color: theme.colors.white },
  cartAction: { flexDirection: 'row', alignItems: 'center' },
  cartActionTxt: { ...theme.typography.h3, color: theme.colors.white, marginRight: 8 },
});

