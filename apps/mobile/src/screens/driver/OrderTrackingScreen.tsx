import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { theme } from '../../theme';
import { useNavigation, useRoute } from '@react-navigation/native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import FeatherIcon from 'react-native-vector-icons/Feather';

export default function OrderTrackingScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { orderId } = route.params || { orderId: 'ord_123' };

  const [statusIndex, setStatusIndex] = useState(1); // 'Preparing'
  const statuses = ['Accepted', 'Preparing', 'Ready', 'Picked Up'];

  useEffect(() => {
    const timer = setInterval(() => {
      setStatusIndex(prev => {
        if (prev < statuses.length - 1) {return prev + 1;}
        clearInterval(timer);
        return prev;
      });
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const isPickedUp = statusIndex === 3;

  if (isPickedUp) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.success, justifyContent: 'center', alignItems: 'center' }]}>
        <View style={styles.successIconWrapper}>
          <FeatherIcon name="check" size={60} color={theme.colors.success} />
        </View>
        <Text style={[styles.title, { color: theme.colors.white, marginTop: 20 }]}>Order Picked Up!</Text>
        <Text style={[styles.sub, { color: 'rgba(255,255,255,0.9)', marginBottom: 40 }]}>You earned 10 loyalty points!</Text>
        <TouchableOpacity style={styles.btnWhite} onPress={() => navigation.popToTop()}>
          <Text style={styles.btnWhiteTxt}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Background Map */}
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: 28.6139,
          longitude: 77.2090,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
      />

      {/* Top Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity onPress={() => navigation.popToTop()} style={styles.iconBtn}>
          <FeatherIcon name="x" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order #{orderId.substring(0,6)}</Text>
        <View style={{width: 40}} />
      </View>

      {/* Bottom Sheet */}
      <View style={styles.bottomSheet}>
        <View style={styles.bsHeader}>
          <Text style={styles.bsTitle}>Order Status</Text>
          <Text style={styles.bsSubTitle}>Estimated Time: <Text style={{color: theme.colors.text, fontWeight: 'bold'}}>15 mins</Text></Text>
        </View>

        <View style={styles.pipeline}>
          {statuses.map((st, i) => {
            const isActive = i === statusIndex;
            const isCompleted = i < statusIndex;

            return (
              <View key={i} style={styles.statusRow}>
                <View style={styles.timelineCol}>
                  <View style={[styles.dot, isCompleted ? styles.dotCompleted : (isActive ? styles.dotActive : null)]}>
                    {(isCompleted || isActive) && <FeatherIcon name="check" size={12} color={theme.colors.white} />}
                  </View>
                  {i < statuses.length - 1 && <View style={[styles.line, isCompleted ? styles.lineCompleted : null]} />}
                </View>

                <View style={styles.statusTextCol}>
                  <Text style={[styles.statusTxt, (isActive || isCompleted) ? styles.statusTxtActive : null]}>{st}</Text>
                  {isActive && <Text style={styles.statusSubTxt}>Your food is currently being prepared by the dhaba.</Text>}
                </View>
              </View>
            );
          })}
        </View>

        <TouchableOpacity style={styles.callBtn}>
          <FeatherIcon name="phone" size={20} color={theme.colors.driverPrimary} style={{marginRight: 8}} />
          <Text style={styles.callBtnTxt}>Call Apna Dhaba</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  map: { width: Dimensions.get('window').width, height: Dimensions.get('window').height },

  topHeader: { position: 'absolute', top: Platform.OS === 'android' ? 40 : 60, left: 16, right: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.white, justifyContent: 'center', alignItems: 'center', ...theme.shadows.sm },
  headerTitle: { ...theme.typography.h3, color: theme.colors.text, backgroundColor: theme.colors.white, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, overflow: 'hidden', ...theme.shadows.sm },

  bottomSheet: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: theme.colors.white, borderTopLeftRadius: theme.borderRadius.xl, borderTopRightRadius: theme.borderRadius.xl, padding: theme.spacing.lg, paddingBottom: Platform.OS === 'android' ? 32 : theme.spacing.lg, ...theme.shadows.lg },
  bsHeader: { marginBottom: theme.spacing.lg },
  bsTitle: { ...theme.typography.h2, color: theme.colors.text, marginBottom: 4 },
  bsSubTitle: { ...theme.typography.body, color: theme.colors.textSecondary },

  pipeline: { marginBottom: theme.spacing.xl },
  statusRow: { flexDirection: 'row', minHeight: 60 },
  timelineCol: { width: 30, alignItems: 'center' },
  dot: { width: 24, height: 24, borderRadius: 12, backgroundColor: theme.colors.border, justifyContent: 'center', alignItems: 'center', zIndex: 2 },
  dotCompleted: { backgroundColor: theme.colors.driverPrimary },
  dotActive: { backgroundColor: theme.colors.warning, borderWidth: 4, borderColor: 'rgba(245, 158, 11, 0.3)' }, // warning color for active
  line: { position: 'absolute', top: 24, bottom: -4, width: 2, backgroundColor: theme.colors.border, zIndex: 1 },
  lineCompleted: { backgroundColor: theme.colors.driverPrimary },

  statusTextCol: { flex: 1, paddingLeft: theme.spacing.sm, paddingTop: 2 },
  statusTxt: { ...theme.typography.body, color: theme.colors.textSecondary, fontWeight: 'bold' },
  statusTxtActive: { color: theme.colors.text },
  statusSubTxt: { ...theme.typography.small, color: theme.colors.textSecondary, marginTop: 4 },

  callBtn: { flexDirection: 'row', height: 56, borderRadius: theme.borderRadius.lg, borderWidth: 1, borderColor: theme.colors.driverPrimary, justifyContent: 'center', alignItems: 'center' },
  callBtnTxt: { ...theme.typography.h3, color: theme.colors.driverPrimary },

  successIconWrapper: { width: 100, height: 100, borderRadius: 50, backgroundColor: theme.colors.white, justifyContent: 'center', alignItems: 'center' },
  title: { ...theme.typography.h1, color: theme.colors.text },
  sub: { ...theme.typography.body, color: theme.colors.textSecondary },
  btnWhite: { backgroundColor: theme.colors.white, paddingHorizontal: 32, paddingVertical: 16, borderRadius: theme.borderRadius.lg },
  btnWhiteTxt: { ...theme.typography.h3, color: theme.colors.success },
});
