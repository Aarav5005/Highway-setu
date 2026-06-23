import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { theme } from '../../theme';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../store/authStore';
import { useTripStore } from '../../store/tripStore';
import Geolocation from 'react-native-geolocation-service';
import { tripsApi } from '../../api/trips';
import ErrorBanner from '../../components/ErrorBanner';

export default function TripPlannerScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const { user } = useAuthStore();
  const { setActiveTrip } = useTripStore();
  
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [coords, setCoords] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    Geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setFrom('Current Location'); // Reverse geocode in real app
      },
      (e) => console.log(e),
      { enableHighAccuracy: true }
    );
  }, []);

  const onStartTrip = async () => {
    if (!to) {
      setError('Please enter a destination');
      return;
    }
    if (!coords) {
      setError('Waiting for GPS location...');
      return;
    }

    setLoading(true);
    setError('');
    try {
      // Mocking Geocoding for "to" -> lat, lng
      const toCoords = { lat: coords.lat + 0.5, lng: coords.lng + 0.5 };
      
      const res = await tripsApi.startTrip(from, to, coords, toCoords);
      const tripData = res.data.data;
      
      setActiveTrip({
        id: tripData.id,
        driverId: tripData.driver_id,
        fromLocation: tripData.from_location,
        toLocation: tripData.to_location,
        status: 'active',
        startedAt: tripData.started_at
      });

      navigation.navigate('Map');
    } catch (e) {
      setError('Failed to start trip. Please check connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ErrorBanner message={error} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.backBtn}>←</Text></TouchableOpacity>
        <Text style={styles.title}>Plan Your Trip</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>From</Text>
        <TextInput style={styles.input} value={from} onChangeText={setFrom} placeholder="Current Location" />

        <Text style={styles.label}>To / Destination</Text>
        <TextInput style={styles.input} value={to} onChangeText={setTo} placeholder="Search destination..." />
      </View>

      <View style={styles.truckInfo}>
        <Text style={styles.truckLabel}>Truck Details</Text>
        <Text style={styles.truckValue}>Truck No: PB10XX1234</Text>
        <Text style={styles.truckValue}>Type: Multi-Axle</Text>
      </View>

      <TouchableOpacity style={styles.btn} onPress={onStartTrip} disabled={loading}>
        {loading ? <ActivityIndicator color={theme.colors.white}/> : <Text style={styles.btnText}>Find Route & Start Trip</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.white, padding: theme.spacing.lg },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.xl, marginTop: theme.spacing.md },
  backBtn: { fontSize: 24, marginRight: theme.spacing.md, color: theme.colors.text },
  title: { ...theme.typography.h2, color: theme.colors.text },
  form: { marginBottom: theme.spacing.xl },
  label: { ...theme.typography.small, color: theme.colors.textSecondary, marginBottom: theme.spacing.xs },
  input: { height: 50, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.borderRadius.sm, paddingHorizontal: theme.spacing.md, marginBottom: theme.spacing.lg, fontSize: 16, color: theme.colors.text },
  truckInfo: { backgroundColor: theme.colors.surface, padding: theme.spacing.md, borderRadius: theme.borderRadius.md, marginBottom: theme.spacing.xl },
  truckLabel: { ...theme.typography.small, color: theme.colors.textSecondary, marginBottom: theme.spacing.xs },
  truckValue: { ...theme.typography.body, color: theme.colors.text, fontWeight: 'bold', marginBottom: 2 },
  btn: { backgroundColor: theme.colors.primary, height: 56, borderRadius: theme.borderRadius.md, justifyContent: 'center', alignItems: 'center' },
  btnText: { ...theme.typography.h3, color: theme.colors.white }
});
