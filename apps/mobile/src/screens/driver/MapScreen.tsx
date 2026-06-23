import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { theme } from '../../theme';
import { useNavigation } from '@react-navigation/native';
import { useTripStore } from '../../store/tripStore';
import { tripsApi } from '../../api/trips';
import SOSButton from '../../components/SOSButton';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';

export default function MapScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const { activeTrip, clearTrip } = useTripStore();
  const mapRef = useRef<MapView>(null);
  
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
  const [dhabas, setDhabas] = useState<any[]>([]); // Mock markers
  const [bottomSheetData, setBottomSheetData] = useState<any>(null);

  useEffect(() => {
    const watchId = Geolocation.watchPosition(
      (pos) => {
        setCurrentLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        if (activeTrip) {
           tripsApi.updateLocation(activeTrip.id, pos.coords.latitude, pos.coords.longitude).catch(e => console.log(e));
        }
      },
      (e) => console.log(e),
      { enableHighAccuracy: true, distanceFilter: 50, interval: 30000, fastestInterval: 10000 }
    );
    
    if (activeTrip) {
      setDhabas([{ id: '1', name: 'Sher-e-Punjab Dhaba', rating: 4.5, lat: 30.7, lng: 76.7, type: 'dhaba' }]);
    }

    return () => Geolocation.clearWatch(watchId);
  }, [activeTrip]);

  const onEndTrip = () => {
    Alert.alert("End Trip", "Are you sure you want to end this trip?", [
      { text: "Cancel", style: "cancel" },
      { text: "Confirm", onPress: async () => {
          if (activeTrip) {
            try {
              await tripsApi.endTrip(activeTrip.id);
              clearTrip();
              navigation.navigate('Home');
            } catch(e) {
              Alert.alert("Error", "Could not end trip");
            }
          }
      }}
    ]);
  };

  if (!activeTrip) {
    return (
      <View style={styles.center}><Text>No active trip.</Text></View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: currentLocation?.lat || 28.6139,
          longitude: currentLocation?.lng || 77.2090,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation={true}
        followsUserLocation={true}
      >
        {dhabas.map(d => (
          <Marker
            key={d.id}
            coordinate={{ latitude: d.lat, longitude: d.lng }}
            title={d.name}
            pinColor={theme.colors.primary}
            onPress={() => setBottomSheetData(d)}
          />
        ))}
      </MapView>

      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}><Text style={styles.backTxt}>←</Text></TouchableOpacity>
        <View style={styles.topInfo}>
          <Text style={styles.routeTxt}>{activeTrip.fromLocation} ➔ {activeTrip.toLocation}</Text>
          <Text style={styles.distTxt}>45 km remaining</Text>
        </View>
        <TouchableOpacity style={styles.endBtn} onPress={onEndTrip}><Text style={styles.endTxt}>End</Text></TouchableOpacity>
      </View>

      {bottomSheetData && (
        <View style={styles.bottomSheet}>
          <View style={styles.bsHeader}>
            <Text style={styles.bsTitle}>{bottomSheetData.name}</Text>
            <TouchableOpacity onPress={() => setBottomSheetData(null)}><Text style={{fontSize: 20}}>✕</Text></TouchableOpacity>
          </View>
          <Text style={styles.bsSub}>2.5 km away • ⭐ {bottomSheetData.rating}</Text>
          <TouchableOpacity 
            style={styles.bsBtn} 
            onPress={() => navigation.navigate('DhabaDetail', { dhabaId: bottomSheetData.id })}
          >
            <Text style={styles.bsBtnTxt}>View Menu & Order</Text>
          </TouchableOpacity>
        </View>
      )}

      {!bottomSheetData && <SOSButton />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  map: { width: Dimensions.get('window').width, height: Dimensions.get('window').height },
  topBar: { position: 'absolute', top: 50, left: 16, right: 16, backgroundColor: theme.colors.white, borderRadius: theme.borderRadius.md, padding: theme.spacing.md, flexDirection: 'row', alignItems: 'center', elevation: 5 },
  backBtn: { marginRight: theme.spacing.md },
  backTxt: { fontSize: 24, fontWeight: 'bold' },
  topInfo: { flex: 1 },
  routeTxt: { ...theme.typography.body, color: theme.colors.text, fontWeight: 'bold' },
  distTxt: { ...theme.typography.small, color: theme.colors.primary },
  endBtn: { backgroundColor: theme.colors.border, paddingHorizontal: 12, paddingVertical: 6, borderRadius: theme.borderRadius.sm },
  endTxt: { ...theme.typography.small, color: theme.colors.text, fontWeight: 'bold' },
  bottomSheet: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: theme.colors.white, borderTopLeftRadius: theme.borderRadius.lg, borderTopRightRadius: theme.borderRadius.lg, padding: theme.spacing.lg, elevation: 20 },
  bsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.xs },
  bsTitle: { ...theme.typography.h2, color: theme.colors.text },
  bsSub: { ...theme.typography.body, color: theme.colors.textSecondary, marginBottom: theme.spacing.lg },
  bsBtn: { backgroundColor: theme.colors.primary, padding: theme.spacing.md, borderRadius: theme.borderRadius.md, alignItems: 'center' },
  bsBtnTxt: { ...theme.typography.h3, color: theme.colors.white }
});
