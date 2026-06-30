import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../theme';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../store/authStore';
import { useTripStore } from '../../store/tripStore';
import { tripsApi } from '../../api/trips';
import ErrorBanner from '../../components/ErrorBanner';
import FeatherIcon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { BackHandler } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

// ─── Pre-built Routes with Dummy POI Data ───────────────────────────────
const PREBUILT_ROUTES = [
  {
    id: 'jodhpur-jaipur',
    from: 'Jodhpur',
    to: 'Jaipur',
    highway: 'NH-48',
    distanceKm: 330,
    estimatedHours: 5,
    fromCoords: { lat: 26.2389, lng: 73.0243 },
    toCoords: { lat: 26.9124, lng: 75.7873 },
    color: '#288140',
    icon: 'navigation',
    dhabas: [
      { id: 'd1', dhaba_name: 'Shree Balaji Dhaba', lat: 26.1012, lng: 74.3188, avg_rating: '4.2', amenities: { truck_parking: true, ac: true }, distance_from_start: 45, is_open: true },
      { id: 'd2', dhaba_name: 'Highway King Dhaba', lat: 26.4499, lng: 74.6399, avg_rating: '4.5', amenities: { dormitory: true, wifi: true, truck_parking: true }, distance_from_start: 120, is_open: true },
      { id: 'd3', dhaba_name: 'Rajputana Bhojnalya', lat: 26.5888, lng: 74.8544, avg_rating: '3.9', amenities: { shower: true, toilet: true }, distance_from_start: 200, is_open: true },
    ],
    mechanics: [
      { id: 'm1', shop_name: 'Sharma Tyre Works', lat: 26.6505, lng: 74.0302, services: ['Tyre', 'Puncture', 'Alignment'], can_travel: false, phone: '+919876543210', distance_from_start: 80 },
      { id: 'm2', shop_name: 'Rajdhani Auto Garage', lat: 26.6233, lng: 75.3781, services: ['Engine', 'Brakes', 'Electrical'], can_travel: true, phone: '+919876543211', distance_from_start: 250 },
    ],
  },
  {
    id: 'delhi-sasaram',
    from: 'Delhi',
    to: 'Sasaram',
    highway: 'NH-2 (GT Road)',
    distanceKm: 890,
    estimatedHours: 14,
    fromCoords: { lat: 28.6139, lng: 77.2090 },
    toCoords: { lat: 25.0052, lng: 84.0310 },
    color: '#1E3A8A',
    icon: 'truck',
    dhabas: [
      { id: 'd4', dhaba_name: 'Purvanchal Dhaba', lat: 27.1767, lng: 78.0081, avg_rating: '4.0', amenities: { truck_parking: true, toilet: true }, distance_from_start: 200, is_open: true },
    ],
    mechanics: [
      { id: 'm3', shop_name: 'GT Road Motors', lat: 26.4499, lng: 80.3319, services: ['Engine', 'Brakes'], can_travel: false, phone: '+919876543212', distance_from_start: 480 },
    ],
  },
];

export default function TripPlannerScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuthStore();
  const { setActiveTrip } = useTripStore();

  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState('');

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (navigation.canGoBack()) {
          navigation.goBack();
          return true; // prevent default behavior
        }
        return false;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [navigation])
  );

  const onSelectRoute = async (route: typeof PREBUILT_ROUTES[0]) => {
    setLoading(route.id);
    setError('');
    try {
      const res = await tripsApi.startTrip(
        `${route.from}, Rajasthan`,
        `${route.to}`,
        route.fromCoords,
        route.toCoords
      );

      const tripData = res.data.data;

      setActiveTrip({
        id: tripData.trip_id,
        driverId: user?.id || 'unknown',
        fromLocation: route.from,
        toLocation: route.to,
        status: 'active',
        startedAt: new Date().toISOString(),
        routePolyline: tripData.route_polyline,
        distanceKm: route.distanceKm,
        estimatedHours: route.estimatedHours,
        dhabas: tripData.dhabas || [],
        mechanics: tripData.mechanics || [],
      });

      navigation.navigate('Map');
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Could not start trip. Check your connection.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <FeatherIcon name="arrow-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>Plan Your Trip</Text>
          <Text style={styles.subtitle}>Select a route to begin</Text>
        </View>
      </View>

      <ErrorBanner message={error} />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* Route Cards */}
        {PREBUILT_ROUTES.map((route) => (
          <TouchableOpacity
            key={route.id}
            style={styles.routeCard}
            onPress={() => onSelectRoute(route)}
            disabled={loading !== null}
            activeOpacity={0.7}
          >
            {/* Route Header */}
            <View style={styles.routeHeader}>
              <View style={[styles.routeIconBg, { backgroundColor: route.color + '15' }]}>
                <FeatherIcon name={route.icon} size={28} color={route.color} />
              </View>
              <View style={styles.routeTextCol}>
                <View style={styles.routeNameRow}>
                  <Text style={styles.routeFrom}>{route.from}</Text>
                  <FeatherIcon name="arrow-right" size={18} color={theme.colors.textSecondary} style={{ marginHorizontal: 8 }} />
                  <Text style={styles.routeTo}>{route.to}</Text>
                </View>
                <View style={styles.hwBadge}>
                  <Text style={styles.hwBadgeText}>{route.highway}</Text>
                </View>
              </View>
            </View>

            {/* Route Stats Row */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <FeatherIcon name="map" size={16} color={theme.colors.textSecondary} />
                <Text style={styles.statValue}>{route.distanceKm} km</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <FeatherIcon name="clock" size={16} color={theme.colors.textSecondary} />
                <Text style={styles.statValue}>~{route.estimatedHours}h</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <FeatherIcon name="coffee" size={16} color={theme.colors.dhabaPrimary} />
                <Text style={styles.statValue}>{route.dhabas.length} Dhabas</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <FeatherIcon name="tool" size={16} color={theme.colors.mechanicPrimary} />
                <Text style={styles.statValue}>{route.mechanics.length} Mechanics</Text>
              </View>
            </View>

            {/* Start Button */}
            <View style={[styles.startBtn, { backgroundColor: route.color }]}>
              {loading === route.id ? (
                <ActivityIndicator color={theme.colors.white} />
              ) : (
                <>
                  <FeatherIcon name="play" size={20} color={theme.colors.white} />
                  <Text style={styles.startBtnText}>Start Journey</Text>
                </>
              )}
            </View>
          </TouchableOpacity>
        ))}

        {/* Info Card */}
        <View style={styles.infoCard}>
          <MaterialIcon name="information-outline" size={20} color={theme.colors.textSecondary} />
          <Text style={styles.infoText}>
            More routes coming soon. These routes show verified dhabas and mechanics along the highway for your safety.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },

  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.md, paddingBottom: theme.spacing.md },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: theme.colors.surface, justifyContent: 'center', alignItems: 'center', marginRight: theme.spacing.md },
  title: { ...theme.typography.h1, color: theme.colors.text },
  subtitle: { ...theme.typography.small, color: theme.colors.textSecondary, marginTop: 2 },

  container: { padding: theme.spacing.lg, paddingBottom: 40 },

  routeCard: {
    backgroundColor: theme.colors.surfaceCard,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    ...theme.shadows.md,
  },

  routeHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.lg },
  routeIconBg: { width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: theme.spacing.md },
  routeTextCol: { flex: 1 },
  routeNameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  routeFrom: { ...theme.typography.h2, color: theme.colors.text },
  routeTo: { ...theme.typography.h2, color: theme.colors.text },
  hwBadge: { alignSelf: 'flex-start', backgroundColor: theme.colors.surface, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 },
  hwBadgeText: { ...theme.typography.small, color: theme.colors.textSecondary, fontWeight: '600' as const },

  statsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md, padding: theme.spacing.md, marginBottom: theme.spacing.lg },
  statItem: { flexDirection: 'row', alignItems: 'center' },
  statValue: { ...theme.typography.small, color: theme.colors.text, fontWeight: '600' as const, marginLeft: 4 },
  statDivider: { width: 1, height: 16, backgroundColor: theme.colors.border },

  startBtn: { flexDirection: 'row', height: 52, borderRadius: theme.borderRadius.md, justifyContent: 'center', alignItems: 'center' },
  startBtnText: { ...theme.typography.h3, color: theme.colors.white, marginLeft: 8 },

  infoCard: { flexDirection: 'row', backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md, padding: theme.spacing.md, marginTop: theme.spacing.md },
  infoText: { ...theme.typography.small, color: theme.colors.textSecondary, flex: 1, marginLeft: theme.spacing.sm, lineHeight: 18 },
});
