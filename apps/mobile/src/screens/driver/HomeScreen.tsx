import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';
import { useTripStore } from '../../store/tripStore';
import { tripsApi } from '../../api/trips';
import { dhabasApi } from '../../api/dhabas';
import { theme } from '../../theme';
import DhabaCard from '../../components/DhabaCard';
import SOSButton from '../../components/SOSButton';
import { useNavigation } from '@react-navigation/native';
import Geolocation from 'react-native-geolocation-service';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { Platform } from 'react-native';

export default function HomeScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const { user } = useAuthStore();
  const { activeTrip } = useTripStore();
  
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({ totalTrips: 0, kmDriven: 0, points: 0 });
  const [dhabas, setDhabas] = useState<any[]>([]);
  const [recentTrips, setRecentTrips] = useState<any[]>([]);

  const fetchDashboardData = async () => {
    try {
      // Mock stats for now until backend hookups are perfect
      setStats({ totalTrips: 12, kmDriven: 450, points: 150 });
      setRecentTrips([
        { id: '1', from: 'Delhi', to: 'Chandigarh', date: 'Oct 12', dist: 250 },
        { id: '2', from: 'Chandigarh', to: 'Ludhiana', date: 'Oct 10', dist: 100 }
      ]);
      fetchNearbyDhabas();
    } catch (e) {
      console.log('Error fetching stats');
    }
  };

  const fetchNearbyDhabas = async () => {
    if (Platform.OS === 'android') {
      const granted = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
      if (granted === RESULTS.GRANTED) {
        Geolocation.getCurrentPosition(
          async (pos) => {
            try {
              const res = await dhabasApi.getNearbyDhabas(pos.coords.latitude, pos.coords.longitude, 50);
              setDhabas(res.data.data || []);
            } catch (e) {}
          },
          (error) => console.log(error),
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
      }
    }
  };

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
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>{getGreeting()}, {user?.name || 'Driver'} 🚛</Text>
          <View style={styles.headerRight}>
            <Text style={styles.iconBtn}>🔔</Text>
            <Text style={styles.iconBtn}>🌐</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{stats.totalTrips}</Text>
            <Text style={styles.statLabel}>Total Trips</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{stats.kmDriven}</Text>
            <Text style={styles.statLabel}>KM Driven</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{stats.points}</Text>
            <Text style={styles.statLabel}>Loyalty Points</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.startBtn} onPress={() => navigation.navigate('TripPlanner')}>
          <Text style={styles.startBtnText}>🚛 START NEW TRIP</Text>
        </TouchableOpacity>

        {activeTrip && (
          <View style={styles.activeTripCard}>
            <Text style={styles.activeTripLabel}>Trip in progress</Text>
            <Text style={styles.activeTripRoute}>{activeTrip.fromLocation} ➔ {activeTrip.toLocation}</Text>
            <TouchableOpacity style={styles.continueBtn} onPress={() => navigation.navigate('Map')}>
              <Text style={styles.continueBtnText}>Continue Trip</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nearby Dhabas</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            {dhabas.map((d, i) => (
              <DhabaCard key={i} dhaba={d} onPress={() => navigation.navigate('DhabaDetail', { dhabaId: d.id })} />
            ))}
            {dhabas.length === 0 && <Text style={{ color: theme.colors.textSecondary }}>Searching for dhabas...</Text>}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Trips</Text>
            <Text style={styles.viewAll}>View all</Text>
          </View>
          {recentTrips.map((t, i) => (
            <View key={i} style={styles.tripListItem}>
              <View>
                <Text style={styles.tripListRoute}>{t.from} ➔ {t.to}</Text>
                <Text style={styles.tripListDate}>{t.date}</Text>
              </View>
              <Text style={styles.tripListDist}>{t.dist} km</Text>
            </View>
          ))}
        </View>

      </ScrollView>

      <SOSButton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  scrollContent: { padding: theme.spacing.md, paddingBottom: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.lg },
  greeting: { ...theme.typography.h3, color: theme.colors.text },
  headerRight: { flexDirection: 'row' },
  iconBtn: { fontSize: 24, marginLeft: theme.spacing.md },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: theme.spacing.lg },
  statCard: { flex: 1, backgroundColor: theme.colors.white, borderRadius: theme.borderRadius.md, padding: theme.spacing.md, marginHorizontal: theme.spacing.xs, alignItems: 'center', borderWidth: 1, borderColor: theme.colors.border },
  statNum: { ...theme.typography.h2, color: theme.colors.primary, marginBottom: theme.spacing.xs },
  statLabel: { ...theme.typography.tiny, color: theme.colors.textSecondary },
  startBtn: { backgroundColor: theme.colors.primary, height: 64, borderRadius: theme.borderRadius.lg, justifyContent: 'center', alignItems: 'center', marginBottom: theme.spacing.lg },
  startBtnText: { ...theme.typography.h3, color: theme.colors.white },
  activeTripCard: { backgroundColor: theme.colors.surface, borderWidth: 2, borderColor: theme.colors.primary, borderRadius: theme.borderRadius.md, padding: theme.spacing.md, marginBottom: theme.spacing.lg },
  activeTripLabel: { ...theme.typography.small, color: theme.colors.primaryDark, fontWeight: 'bold', marginBottom: theme.spacing.xs },
  activeTripRoute: { ...theme.typography.h3, color: theme.colors.text, marginBottom: theme.spacing.md },
  continueBtn: { backgroundColor: theme.colors.primary, paddingVertical: theme.spacing.sm, borderRadius: theme.borderRadius.sm, alignItems: 'center' },
  continueBtnText: { ...theme.typography.body, color: theme.colors.white, fontWeight: 'bold' },
  section: { marginBottom: theme.spacing.xl },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.md },
  sectionTitle: { ...theme.typography.h2, color: theme.colors.text, marginBottom: theme.spacing.md },
  viewAll: { ...theme.typography.small, color: theme.colors.primary, fontWeight: 'bold' },
  horizontalScroll: { paddingBottom: theme.spacing.sm },
  tripListItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: theme.spacing.md, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  tripListRoute: { ...theme.typography.body, color: theme.colors.text, fontWeight: 'bold', marginBottom: 4 },
  tripListDate: { ...theme.typography.small, color: theme.colors.textSecondary },
  tripListDist: { ...theme.typography.body, color: theme.colors.textSecondary, fontWeight: 'bold' },
});
