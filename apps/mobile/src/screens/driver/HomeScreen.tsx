import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ImageBackground, Alert, Animated, Easing, BackHandler, ToastAndroid, Platform } from 'react-native';
import Reanimated, { useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming, withSpring } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';

import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';
import { useTripStore } from '../../store/tripStore';
import { tripsApi } from '../../api/trips';
import { dhabasApi } from '../../api/dhabas';
import { theme } from '../../theme';
import DhabaCard from '../../components/DhabaCard';
import SOSButton from '../../components/SOSButton';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useLocation } from '../../hooks/useLocation';
import Icon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const AnimatedPressable = ({ children, onPress, style }: any) => {
  const scale = React.useRef(new Animated.Value(1)).current;
  return (
    <AnimatedTouchable
      activeOpacity={0.95}
      onPressIn={() => Animated.spring(scale, { toValue: 0.95, useNativeDriver: true }).start()}
      onPressOut={() => Animated.spring(scale, { toValue: 1, friction: 4, tension: 40, useNativeDriver: true }).start()}
      onPress={onPress}
      style={[style, { transform: [{ scale }] }]}
    >
      {children}
    </AnimatedTouchable>
  );
};

export default function HomeScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const { user } = useAuthStore();
  const { activeTrip } = useTripStore();

  const [refreshing, setRefreshing] = useState(false);
  const [dhabas, setDhabas] = useState<any[]>([]);
  const [recentTrips, setRecentTrips] = useState<any[]>([]);

  // Use centralized location hook
  const { coords, granted } = useLocation(false);

  // Animations
  const scrollY = React.useRef(new Animated.Value(0)).current;
  const fade1 = React.useRef(new Animated.Value(0)).current;
  const fade2 = React.useRef(new Animated.Value(0)).current;
  const fade3 = React.useRef(new Animated.Value(0)).current;
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Staggered entry
    Animated.stagger(150, [
      Animated.timing(fade1, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(fade2, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(fade3, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();

    // Pulse animation for Start Trip
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.02, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // Handle hardware back button
  const backPressCount = React.useRef(0);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (backPressCount.current > 0) {
          BackHandler.exitApp();
          return true;
        }

        backPressCount.current = 1;
        if (Platform.OS === 'android') {
          ToastAndroid.show('Press back again to exit', ToastAndroid.SHORT);
        }

        setTimeout(() => {
          backPressCount.current = 0;
        }, 2000);

        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => subscription.remove();
    }, [])
  );

  // Reanimated Truck Animation
  const truckTranslateY = useSharedValue(0);
  useEffect(() => {
    truckTranslateY.value = withRepeat(
      withSequence(
        withTiming(-3, { duration: 300 }),
        withTiming(0, { duration: 300 })
      ),
      -1, // infinite loop
      true // reverse
    );
  }, []);

  const animatedTruckStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: truckTranslateY.value }],
    };
  });

  const parallaxTranslateY = scrollY.interpolate({
    inputRange: [0, 300],
    outputRange: [0, -100], // moves up slower than scroll
    extrapolate: 'clamp',
  });

  const parallaxOpacity = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const fetchDashboardData = async () => {
    try {
      setRecentTrips([
        { id: '1', from: 'Delhi', to: 'Jaipur', date: '12 May 2024', dist: 432 },
        { id: '2', from: 'Agra', to: 'Jaipur', date: '05 May 2024', dist: 240 },
      ]);
    } catch (e) {
      console.log('Error fetching stats');
    }
  };

  useEffect(() => {
    if (granted && coords) {
      const fetchNearbyDhabas = async () => {
        try {
          const res = await dhabasApi.getNearbyDhabas(coords.lat, coords.lng, 50);
          setDhabas(res.data.data || []);
        } catch (e) {}
      };
      fetchNearbyDhabas();
    }
  }, [coords, granted]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) {return 'Good Morning,';}
    if (hour < 18) {return 'Good Afternoon,';}
    return 'Good Evening,';
  };

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        bounces={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
        scrollEventThrottle={16}
      >
        {/* Hero Section */}
        <Animated.View style={[styles.heroWrapper, { transform: [{ translateY: parallaxTranslateY }], opacity: parallaxOpacity }]}>
          <ImageBackground
            source={require('../../assets/images/auth_hero_new.png')}
            style={styles.hero}
            imageStyle={{ resizeMode: 'cover' }}
          >
          <LinearGradient
            colors={['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.3)', 'transparent']}
            style={styles.heroOverlay}
          >
            <SafeAreaView>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.logoRow}>
                  <Text style={styles.headerLogoText}>Highway</Text>
                  <Text style={[styles.headerLogoText, { color: theme.colors.primary }]}>Setu</Text>
                </View>
                <TouchableOpacity style={styles.bellIcon} onPress={() => Alert.alert('Notifications', 'No new notifications right now.')}>
                  <Icon name="bell" size={20} color={theme.colors.white} />
                  <View style={styles.notificationDot} />
                </TouchableOpacity>
              </View>

              {/* Greeting */}
              <View style={styles.greetingContainer}>
                <Text style={styles.greetingSub}>{getGreeting()}</Text>
                <Text style={styles.greetingMain}>{user?.name || 'Ravi Kumar'} 👋</Text>
              </View>
            </SafeAreaView>
          </LinearGradient>
        </ImageBackground>
      </Animated.View>

        {/* Content Section overlapping hero */}
        <Animated.View style={[styles.contentWrapper, { opacity: fade1, transform: [{ translateY: fade1.interpolate({ inputRange: [0, 1], outputRange: [50, 0] }) }] }]}>

          {/* Start Trip Card */}
          <View style={styles.startTripWrapper}>
            <AnimatedPressable
              style={{ transform: [{ scale: pulseAnim }] }}
              onPress={() => navigation.navigate('TripPlanner')}
            >
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.primaryDark]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={styles.startTripBtn}
              >
                <View style={styles.startTripIconWrapper}>
                  <Reanimated.View style={animatedTruckStyle}>
                    <Icon name="truck" size={24} color={theme.colors.primary} />
                  </Reanimated.View>
                </View>
                <View style={styles.startTripTextWrapper}>
                  <Text style={styles.startTripTitle}>Start New Trip</Text>
                  <Text style={styles.startTripSub}>Plan your next journey</Text>
                </View>
                <Icon name="chevron-right" size={24} color={theme.colors.white} />
              </LinearGradient>
            </AnimatedPressable>
          </View>

          {activeTrip && (
            <AnimatedPressable style={styles.activeTripCard} onPress={() => navigation.navigate('Map')}>
              <View style={styles.activeTripHeader}>
                <View style={styles.liveIndicator} />
                <Text style={styles.activeTripLabel}>Trip in Progress</Text>
              </View>
              <Text style={styles.activeTripRoute}>{activeTrip.fromLocation} ➔ {activeTrip.toLocation}</Text>
              <View style={styles.continueBtn}>
                <Text style={styles.continueBtnText}>Continue Trip</Text>
              </View>
            </AnimatedPressable>
          )}

          {/* Nearby For You */}
          <Animated.View style={[styles.section, { opacity: fade2, transform: [{ translateY: fade2.interpolate({ inputRange: [0, 1], outputRange: [50, 0] }) }] }]}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Nearby for You</Text>
              <Text style={styles.viewAll}>View all</Text>
            </View>

            <View style={styles.nearbyGrid}>
              <AnimatedPressable
                style={styles.nearbyCard}
                onPress={() => navigation.navigate('Map')}
              >
                <LinearGradient colors={[theme.colors.primaryLight, '#FFD4B8']} style={styles.nearbyIconBg}>
                  <Icon name="coffee" size={24} color={theme.colors.primary} />
                </LinearGradient>
                <View style={styles.nearbyTextContainer}>
                  <Text style={styles.nearbyTitle}>Dhabas</Text>
                  <Text style={styles.nearbySub}>12 Nearby</Text>
                </View>
              </AnimatedPressable>

              <AnimatedPressable
                style={styles.nearbyCard}
                onPress={() => navigation.navigate('Map')}
              >
                <LinearGradient colors={[theme.colors.infoLight, '#C7D9FB']} style={styles.nearbyIconBg}>
                  <Icon name="tool" size={24} color={theme.colors.info} />
                </LinearGradient>
                <View style={styles.nearbyTextContainer}>
                  <Text style={styles.nearbyTitle}>Mechanics</Text>
                  <Text style={styles.nearbySub}>8 Nearby</Text>
                </View>
              </AnimatedPressable>
            </View>
          </Animated.View>

          {/* Recent Trips */}
          <Animated.View style={[styles.section, { opacity: fade3, transform: [{ translateY: fade3.interpolate({ inputRange: [0, 1], outputRange: [50, 0] }) }] }]}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Trips</Text>
              <Text style={styles.viewAll}>View all</Text>
            </View>

            {recentTrips.map((t, i) => (
              <AnimatedPressable
                key={i}
                style={styles.recentTripCard}
                onPress={() => navigation.navigate('Trips')}
              >
                <View style={styles.recentTripIconBg}>
                  <MaterialIcon name="truck-outline" size={24} color={theme.colors.text} />
                </View>
                <View style={styles.recentTripTextContainer}>
                  <Text style={styles.recentTripRoute}>{t.from} ➔ {t.to}</Text>
                  <Text style={styles.recentTripDate}>{t.date} • {t.dist} km</Text>
                </View>
                <Icon name="chevron-right" size={20} color={theme.colors.textMuted} />
              </AnimatedPressable>
            ))}
          </Animated.View>

        </Animated.View>
      </Animated.ScrollView>

      <SOSButton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  scrollContent: { paddingBottom: 100 },

  heroWrapper: { width: '100%', height: 260, position: 'absolute', top: 0, left: 0 },
  hero: { width: '100%', height: '100%' },
  heroOverlay: { flex: 1, paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.lg },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: theme.spacing.md },
  logoRow: { flexDirection: 'row', alignItems: 'center' },
  headerLogoText: { ...theme.typography.h2, color: theme.colors.white, fontWeight: 'bold' },
  bellIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  notificationDot: { position: 'absolute', top: 10, right: 12, width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.error },

  greetingContainer: { marginTop: theme.spacing.xl },
  greetingSub: { ...theme.typography.body, color: theme.colors.white, opacity: 0.9 },
  greetingMain: { ...theme.typography.h1, color: theme.colors.white, fontSize: 28, marginTop: 4 },

  contentWrapper: {
    flex: 1,
    marginTop: 220, // push down below the absolute hero
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    minHeight: 800,
  },

  startTripWrapper: {
    backgroundColor: theme.colors.surfaceCard,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.xl,
    shadowColor: theme.colors.primaryDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
  },
  startTripBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
  },
  startTripIconWrapper: { width: 48, height: 48, borderRadius: 24, backgroundColor: theme.colors.white, justifyContent: 'center', alignItems: 'center', marginRight: theme.spacing.md },
  startTripTextWrapper: { flex: 1 },
  startTripTitle: { ...theme.typography.h3, color: theme.colors.white },
  startTripSub: { ...theme.typography.small, color: theme.colors.white, opacity: 0.8, marginTop: 2 },

  activeTripCard: { backgroundColor: theme.colors.surfaceCard, borderWidth: 1, borderColor: theme.colors.driverPrimary, borderRadius: theme.borderRadius.lg, padding: theme.spacing.md, marginBottom: theme.spacing.xl, ...theme.shadows.sm },
  activeTripHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.sm },
  liveIndicator: { width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.error, marginRight: 6 },
  activeTripLabel: { ...theme.typography.small, color: theme.colors.driverPrimary, fontWeight: 'bold' },
  activeTripRoute: { ...theme.typography.h2, color: theme.colors.text, marginBottom: theme.spacing.md },
  continueBtn: { backgroundColor: theme.colors.driverPrimary, paddingVertical: theme.spacing.md, borderRadius: theme.borderRadius.md, alignItems: 'center' },
  continueBtnText: { ...theme.typography.h3, color: theme.colors.white },

  section: { marginBottom: theme.spacing.xl },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.md },
  sectionTitle: { ...theme.typography.h3, color: theme.colors.text },
  viewAll: { ...theme.typography.small, color: theme.colors.driverPrimary, fontWeight: 'bold' },

  nearbyGrid: { flexDirection: 'row', justifyContent: 'space-between', gap: theme.spacing.md },
  nearbyCard: { flex: 1, flexDirection: 'column', alignItems: 'flex-start', backgroundColor: theme.colors.surfaceCard, padding: theme.spacing.lg, borderRadius: theme.borderRadius.xl, borderWidth: 1, borderColor: '#F3F4F6', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  nearbyIconBg: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginBottom: theme.spacing.md },
  nearbyTextContainer: { flex: 1 },
  nearbyTitle: { ...theme.typography.h3, color: theme.colors.text, marginBottom: 4 },
  nearbySub: { ...theme.typography.small, color: theme.colors.textSecondary },

  recentTripCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surfaceCard, padding: theme.spacing.md, borderRadius: theme.borderRadius.lg, marginBottom: theme.spacing.md, ...theme.shadows.sm },
  recentTripIconBg: { width: 48, height: 48, borderRadius: theme.borderRadius.md, backgroundColor: theme.colors.surface, justifyContent: 'center', alignItems: 'center', marginRight: theme.spacing.md },
  recentTripTextContainer: { flex: 1 },
  recentTripRoute: { ...theme.typography.h3, color: theme.colors.text, marginBottom: 4 },
  recentTripDate: { ...theme.typography.small, color: theme.colors.textSecondary },
});
