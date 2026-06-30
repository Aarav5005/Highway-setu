import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Alert, ScrollView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../theme';
import { useNavigation } from '@react-navigation/native';
import { useTripStore } from '../../store/tripStore';
import { tripsApi } from '../../api/trips';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { useLocation } from '../../hooks/useLocation';
import FeatherIcon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { BackHandler } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');
const MAP_HEIGHT = height * 0.42;

const decodePolyline = (t: string, e: number = 5) => {
  if (!t) {return [];}
  let [n, r, i, s, o, u, a, f] = [0, 0, 0, 0, 0, 0, 0, 0];
  const l: { latitude: number; longitude: number }[] = [];
  const c = Math.pow(10, e || 5);
  for (; n < t.length; ) {
    for (i = 0, s = 0; o = t.charCodeAt(n++) - 63, i |= (31 & o) << s, s += 5, o >= 32; ){}
    a += 1 & i ? ~(i >> 1) : i >> 1;
    for (i = 0, s = 0; o = t.charCodeAt(n++) - 63, i |= (31 & o) << s, s += 5, o >= 32; ){}
    f += 1 & i ? ~(i >> 1) : i >> 1;
    l.push({ latitude: a / c, longitude: f / c });
  }
  return l;
};

// Amenity icons map
const AMENITY_ICONS: Record<string, { icon: string; label: string }> = {
  truck_parking: { icon: 'truck', label: 'Parking' },
  ac: { icon: 'wind', label: 'AC' },
  dormitory: { icon: 'moon', label: 'Rest' },
  wifi: { icon: 'wifi', label: 'WiFi' },
  shower: { icon: 'droplet', label: 'Shower' },
  toilet: { icon: 'home', label: 'Toilet' },
};

export default function MapScreen() {
  const navigation = useNavigation<any>();
  const { activeTrip, clearTrip } = useTripStore();
  const mapRef = useRef<MapView>(null);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

  const { coords: currentLocation, granted } = useLocation(true);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (navigation.canGoBack()) {
          navigation.goBack();
          return true;
        }
        return false;
      };
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [navigation])
  );

  const routeCoordinates = useMemo(() => {
    if (activeTrip?.routePolyline) {
      return decodePolyline(activeTrip.routePolyline);
    }
    return [];
  }, [activeTrip?.routePolyline]);

  useEffect(() => {
    if (activeTrip && currentLocation && granted) {
      tripsApi.updateLocation(activeTrip.id, currentLocation.lat, currentLocation.lng).catch(() => {});
    }
  }, [currentLocation, activeTrip, granted]);

  useEffect(() => {
    if (routeCoordinates.length > 0 && mapRef.current) {
      setTimeout(() => {
        mapRef.current?.fitToCoordinates(routeCoordinates, {
          edgePadding: { top: 40, right: 40, bottom: 40, left: 40 },
          animated: true,
        });
      }, 500);
    }
  }, [routeCoordinates]);

  const centerOnPOI = (lat: number, lng: number, id: string) => {
    setHighlightedId(id);
    mapRef.current?.animateToRegion({
      latitude: lat,
      longitude: lng,
      latitudeDelta: 0.15,
      longitudeDelta: 0.15,
    }, 400);
  };

  const onEndTrip = () => {
    Alert.alert('End Trip', 'Are you sure you want to end this trip?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm',
        style: 'destructive',
        onPress: async () => {
          if (activeTrip) {
            try {
              await tripsApi.endTrip(activeTrip.id);
              clearTrip();
              navigation.navigate('Home');
            } catch (e) {
              Alert.alert('Error', 'Could not end trip');
            }
          }
        },
      },
    ]);
  };

  if (!activeTrip) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconBg}>
          <FeatherIcon name="map" size={48} color={theme.colors.border} />
        </View>
        <Text style={styles.emptyTitle}>No Active Trip</Text>
        <Text style={styles.emptySub}>Start a journey from the Trip Planner</Text>
        <TouchableOpacity style={styles.planBtn} onPress={() => navigation.replace('TripPlanner')}>
          <FeatherIcon name="navigation" size={20} color={theme.colors.white} />
          <Text style={styles.planBtnText}>Plan a Trip</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const dhabas = activeTrip.dhabas || [];
  const mechanics = activeTrip.mechanics || [];

  return (
    <View style={styles.container}>
      {/* ─── Top Half: Map ─── */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={{
            latitude: currentLocation?.lat || 28.6139,
            longitude: currentLocation?.lng || 77.2090,
            latitudeDelta: 2,
            longitudeDelta: 2,
          }}
          showsUserLocation={true}
          followsUserLocation={false}
          showsMyLocationButton={false}
          showsCompass={false}
        >
          {routeCoordinates.length > 0 && (
            <Polyline
              coordinates={routeCoordinates}
              strokeColor={theme.colors.driverPrimary}
              strokeWidth={4}
            />
          )}

          {/* Dhaba markers */}
          {dhabas.map((d: any) => (
            <Marker
              key={d.id}
              coordinate={{ latitude: d.lat, longitude: d.lng }}
              onPress={() => centerOnPOI(d.lat, d.lng, d.id)}
              tracksViewChanges={false}
            >
              <View style={styles.markerWrap}>
                <View style={[styles.markerDot, { backgroundColor: theme.colors.dhabaPrimary }, highlightedId === d.id && styles.markerHighlight]}>
                  <MaterialIcon name="silverware-fork-knife" size={14} color={theme.colors.white} />
                </View>
              </View>
            </Marker>
          ))}

          {/* Mechanic markers */}
          {mechanics.map((m: any) => (
            <Marker
              key={m.id}
              coordinate={{ latitude: m.lat, longitude: m.lng }}
              onPress={() => centerOnPOI(m.lat, m.lng, m.id)}
              tracksViewChanges={false}
            >
              <View style={styles.markerWrap}>
                <View style={[styles.markerDot, { backgroundColor: theme.colors.info }, highlightedId === m.id && styles.markerHighlight]}>
                  <FeatherIcon name="tool" size={14} color={theme.colors.white} />
                </View>
              </View>
            </Marker>
          ))}
        </MapView>

        {/* Floating location button */}
        <TouchableOpacity
          style={styles.locationBtn}
          onPress={() => {
            if (currentLocation) {
              mapRef.current?.animateToRegion({
                latitude: currentLocation.lat,
                longitude: currentLocation.lng,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }, 300);
            }
          }}
        >
          <MaterialIcon name="crosshairs-gps" size={22} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      {/* ─── Bottom Half: Scrollable POI List ─── */}
      <View style={styles.bottomPanel}>
        {/* Drag Handle */}
        <View style={styles.handleBar}>
          <View style={styles.handle} />
        </View>

        {/* Trip Info Bar */}
        <View style={styles.tripInfoBar}>
          <View style={styles.tripInfoLeft}>
            <View style={styles.tripDot} />
            <Text style={styles.tripInfoText} numberOfLines={1}>
              {activeTrip.fromLocation} → {activeTrip.toLocation}
            </Text>
          </View>
          <View style={styles.tripInfoRight}>
            <Text style={styles.tripInfoDist}>{activeTrip.distanceKm || '—'} km</Text>
            {activeTrip.estimatedHours && (
              <Text style={styles.tripInfoTime}>~{activeTrip.estimatedHours}h</Text>
            )}
          </View>
        </View>

        <ScrollView style={styles.poiScroll} showsVerticalScrollIndicator={false}>

          {/* Dhabas Section */}
          {dhabas.length > 0 && (
            <View style={styles.poiSection}>
              <View style={styles.poiSectionHeader}>
                <FeatherIcon name="coffee" size={18} color={theme.colors.dhabaPrimary} />
                <Text style={styles.poiSectionTitle}>Dhabas Along Route</Text>
                <View style={styles.poiCount}>
                  <Text style={styles.poiCountText}>{dhabas.length}</Text>
                </View>
              </View>

              {dhabas.map((d: any) => (
                <TouchableOpacity
                  key={d.id}
                  style={[styles.poiCard, highlightedId === d.id && styles.poiCardHighlight]}
                  onPress={() => navigation.navigate('DhabaDetail', { dhabaId: d.id })}
                  activeOpacity={0.7}
                >
                  <View style={[styles.poiIconBg, { backgroundColor: '#FEF3C7' }]}>
                    <MaterialIcon name="silverware-fork-knife" size={22} color={theme.colors.dhabaPrimary} />
                  </View>
                  <View style={styles.poiInfo}>
                    <Text style={styles.poiName}>{d.dhaba_name}</Text>
                    <View style={styles.poiMetaRow}>
                      <MaterialIcon name="star" size={14} color={theme.colors.warning} />
                      <Text style={styles.poiRating}>{d.avg_rating}</Text>
                      <Text style={styles.poiDist}>• {d.distance_from_start} km from start</Text>
                    </View>
                    {d.amenities && (
                      <View style={styles.amenitiesRow}>
                        {Object.entries(d.amenities).filter(([_, v]) => v).map(([key]) => (
                          AMENITY_ICONS[key] ? (
                            <View key={key} style={styles.amenityChip}>
                              <FeatherIcon name={AMENITY_ICONS[key].icon} size={12} color={theme.colors.textSecondary} />
                              <Text style={styles.amenityText}>{AMENITY_ICONS[key].label}</Text>
                            </View>
                          ) : null
                        ))}
                      </View>
                    )}
                  </View>
                  <View style={styles.poiAction}>
                    <Text style={[styles.poiActionTxt, {color: theme.colors.dhabaPrimary}]}>View</Text>
                    <FeatherIcon name="chevron-right" size={16} color={theme.colors.dhabaPrimary} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Mechanics Section */}
          {mechanics.length > 0 && (
            <View style={styles.poiSection}>
              <View style={styles.poiSectionHeader}>
                <FeatherIcon name="tool" size={18} color={theme.colors.info} />
                <Text style={styles.poiSectionTitle}>Mechanics Along Route</Text>
                <View style={[styles.poiCount, { backgroundColor: '#DBEAFE' }]}>
                  <Text style={[styles.poiCountText, { color: theme.colors.info }]}>{mechanics.length}</Text>
                </View>
              </View>

              {mechanics.map((m: any) => (
                <TouchableOpacity
                  key={m.id}
                  style={[styles.poiCard, highlightedId === m.id && styles.poiCardHighlight]}
                  onPress={() => navigation.navigate('MechanicDetail', { mechanicId: m.id })}
                  activeOpacity={0.7}
                >
                  <View style={[styles.poiIconBg, { backgroundColor: theme.colors.infoLight }]}>
                    <FeatherIcon name="tool" size={22} color={theme.colors.info} />
                  </View>
                  <View style={styles.poiInfo}>
                    <Text style={styles.poiName}>{m.shop_name}</Text>
                    <View style={styles.poiMetaRow}>
                      <Text style={styles.poiDist}>{m.distance_from_start} km from start</Text>
                    </View>
                    <View style={styles.amenitiesRow}>
                      {(m.services || []).map((s: string) => (
                        <View key={s} style={[styles.amenityChip, { backgroundColor: '#EFF6FF' }]}>
                          <Text style={[styles.amenityText, { color: theme.colors.info }]}>{s}</Text>
                        </View>
                      ))}
                      {m.can_travel && (
                        <View style={[styles.amenityChip, { backgroundColor: '#D1FAE5' }]}>
                          <FeatherIcon name="truck" size={11} color={theme.colors.success} />
                          <Text style={[styles.amenityText, { color: theme.colors.success }]}>Can Travel</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <View style={styles.poiAction}>
                    <Text style={[styles.poiActionTxt, {color: theme.colors.info}]}>Book</Text>
                    <FeatherIcon name="chevron-right" size={16} color={theme.colors.info} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Bottom spacer for buttons */}
          <View style={{ height: 120 + insets.bottom }} />
        </ScrollView>

        {/* Action Buttons */}
        <View style={[styles.actionBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <TouchableOpacity style={styles.endTripBtn} onPress={onEndTrip}>
            <FeatherIcon name="square" size={18} color={theme.colors.white} />
            <Text style={styles.endTripText}>End Trip</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sosBtn} onPress={() => navigation.navigate('SOS')}>
            <MaterialIcon name="phone-alert" size={20} color={theme.colors.white} />
            <Text style={styles.sosBtnText}>SOS</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },

  // Empty state
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: theme.spacing.xl, backgroundColor: theme.colors.background },
  emptyIconBg: { width: 96, height: 96, borderRadius: 48, backgroundColor: theme.colors.surface, justifyContent: 'center', alignItems: 'center', marginBottom: theme.spacing.lg },
  emptyTitle: { ...theme.typography.h2, color: theme.colors.text, marginBottom: theme.spacing.xs },
  emptySub: { ...theme.typography.body, color: theme.colors.textSecondary, marginBottom: theme.spacing.xl },
  planBtn: { flexDirection: 'row', backgroundColor: theme.colors.driverPrimary, paddingHorizontal: theme.spacing.xl, paddingVertical: theme.spacing.md, borderRadius: theme.borderRadius.lg, alignItems: 'center' },
  planBtnText: { ...theme.typography.h3, color: theme.colors.white, marginLeft: 8 },

  // Map section
  mapContainer: { height: MAP_HEIGHT, position: 'relative' },
  map: { width, height: MAP_HEIGHT },
  locationBtn: { position: 'absolute', bottom: 16, right: 16, width: 44, height: 44, borderRadius: 22, backgroundColor: theme.colors.white, justifyContent: 'center', alignItems: 'center', ...theme.shadows.md },

  // Markers
  markerWrap: { alignItems: 'center' },
  markerDot: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: theme.colors.white, ...theme.shadows.sm },
  markerHighlight: { transform: [{ scale: 1.3 }], borderWidth: 3 },

  // Bottom panel
  bottomPanel: { flex: 1, backgroundColor: theme.colors.background, borderTopLeftRadius: theme.borderRadius.xl, borderTopRightRadius: theme.borderRadius.xl, marginTop: -16, ...theme.shadows.lg },
  handleBar: { alignItems: 'center', paddingTop: 10, paddingBottom: 4 },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: theme.colors.border },

  // Trip info bar
  tripInfoBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.md, borderBottomWidth: 1, borderBottomColor: theme.colors.borderLight },
  tripInfoLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: theme.spacing.md },
  tripDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.success, marginRight: 8 },
  tripInfoText: { ...theme.typography.h3, color: theme.colors.text, flex: 1 },
  tripInfoRight: { alignItems: 'flex-end' },
  tripInfoDist: { ...theme.typography.body, color: theme.colors.text, fontWeight: '700' as const },
  tripInfoTime: { ...theme.typography.small, color: theme.colors.textSecondary },

  // POI list
  poiScroll: { flex: 1 },
  poiSection: { paddingHorizontal: theme.spacing.lg, marginTop: theme.spacing.md },
  poiSectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.md },
  poiSectionTitle: { ...theme.typography.h3, color: theme.colors.text, marginLeft: 8, flex: 1 },
  poiCount: { backgroundColor: '#FEF3C7', paddingHorizontal: 10, paddingVertical: 2, borderRadius: 12 },
  poiCountText: { ...theme.typography.small, color: theme.colors.dhabaPrimary, fontWeight: '700' as const },

  poiCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceCard,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    ...theme.shadows.sm,
  },
  poiCardHighlight: { borderColor: theme.colors.driverPrimary, borderWidth: 2 },
  poiIconBg: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: theme.spacing.md },
  poiInfo: { flex: 1 },
  poiName: { ...theme.typography.body, color: theme.colors.text, fontWeight: '700' as const, marginBottom: 2 },
  poiMetaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  poiRating: { ...theme.typography.small, color: theme.colors.text, fontWeight: '600' as const, marginLeft: 3, marginRight: 4 },
  poiDist: { ...theme.typography.small, color: theme.colors.textSecondary },
  amenitiesRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 2 },
  amenityChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginRight: 4, marginTop: 2 },
  amenityText: { ...theme.typography.tiny, color: theme.colors.textSecondary, marginLeft: 3 },
  poiAction: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface, paddingHorizontal: 8, paddingVertical: 6, borderRadius: 20 },
  poiActionTxt: { ...theme.typography.small, fontWeight: '700' as const, marginRight: 2 },

  // Action buttons
  actionBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.md, borderTopWidth: 1, borderTopColor: theme.colors.borderLight, backgroundColor: theme.colors.white },
  endTripBtn: { flex: 1, flexDirection: 'row', height: 50, backgroundColor: theme.colors.error, borderRadius: theme.borderRadius.md, justifyContent: 'center', alignItems: 'center', marginRight: theme.spacing.sm },
  endTripText: { ...theme.typography.h3, color: theme.colors.white, marginLeft: 8 },
  sosBtn: { width: 80, height: 50, flexDirection: 'row', backgroundColor: theme.colors.sosRed, borderRadius: theme.borderRadius.md, justifyContent: 'center', alignItems: 'center' },
  sosBtnText: { ...theme.typography.h3, color: theme.colors.white, marginLeft: 4 },
});
