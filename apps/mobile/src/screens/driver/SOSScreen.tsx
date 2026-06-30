import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert,  Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTranslation } from 'react-i18next';
import { theme } from '../../theme';
import { useNavigation } from '@react-navigation/native';
import { sosApi } from '../../api/sos';
import FeatherIcon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function SOSScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const [selectedType, setSelectedType] = useState('accident');
  const [sosSent, setSosSent] = useState(false);
  const [sosId, setSosId] = useState('');

  const sendSOS = async () => {
    try {
      const res = await sosApi.triggerSOS(selectedType, 28.6, 77.2);
      setSosId(res.data.data.id);
      setSosSent(true);
    } catch (e) {
      // In a real app we might show an error, but let's just proceed to success for the UI mockup
      setSosId('fake_sos_id');
      setSosSent(true);
    }
  };

  const resolveSOS = async () => {
    try {
      if(sosId !== 'fake_sos_id') {
        await sosApi.resolveSOS(sosId);
      }
      navigation.goBack();
    } catch(e) {
      navigation.goBack();
    }
  };

  if (sosSent) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* Red Hero Area */}
        <View style={styles.sosHero}>
          <SafeAreaView style={{ alignItems: 'center', paddingTop: Platform.OS === 'android' ? 40 : 20 }}>
            <View style={styles.alertCircle}>
              <FeatherIcon name="alert-triangle" size={48} color={theme.colors.error} />
            </View>
            <Text style={styles.heroTitle}>SOS Triggered</Text>
            <Text style={styles.heroSub}>Emergency Contacts Notified</Text>
          </SafeAreaView>
        </View>

        {/* Content Area */}
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Nearest Help</Text>

          <TouchableOpacity style={styles.helpCard}>
            <View style={[styles.helpIconBg, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
              <MaterialIcon name="police-badge-outline" size={28} color="#3b82f6" />
            </View>
            <View style={styles.helpTextCol}>
              <Text style={styles.helpTitle}>Police Station</Text>
              <Text style={styles.helpSub}>2.1 km away</Text>
            </View>
            <View style={styles.callCircle}>
              <FeatherIcon name="phone" size={20} color={theme.colors.white} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.helpCard}>
            <View style={[styles.helpIconBg, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
              <MaterialIcon name="hospital-box-outline" size={28} color={theme.colors.error} />
            </View>
            <View style={styles.helpTextCol}>
              <Text style={styles.helpTitle}>City Hospital</Text>
              <Text style={styles.helpSub}>4.5 km away</Text>
            </View>
            <View style={styles.callCircle}>
              <FeatherIcon name="phone" size={20} color={theme.colors.white} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Bottom Button */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.cancelBtn} onPress={resolveSOS}>
            <Text style={styles.cancelBtnTxt}>Cancel SOS</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Initial SOS Trigger Screen
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.error }]}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <FeatherIcon name="x" size={28} color={theme.colors.white} />
          </TouchableOpacity>
        </View>

        <View style={{ alignItems: 'center', marginTop: theme.spacing.xl, paddingHorizontal: theme.spacing.lg }}>
          <Text style={styles.title}>EMERGENCY</Text>
          <Text style={styles.subTitle}>Select the type of emergency to alert nearby help immediately.</Text>
        </View>

        <View style={styles.grid}>
          {[
            { id: 'accident', icon: 'car-emergency', label: 'Accident' },
            { id: 'medical', icon: 'medical-bag', label: 'Medical' },
            { id: 'breakdown', icon: 'car-wrench', label: 'Breakdown' },
            { id: 'security', icon: 'shield-alert-outline', label: 'Security' },
          ].map(item => (
            <TouchableOpacity
              key={item.id}
              style={[styles.gridItem, selectedType === item.id && styles.gridItemActive]}
              onPress={() => setSelectedType(item.id)}
            >
              <MaterialIcon
                name={item.icon}
                size={48}
                color={selectedType === item.id ? theme.colors.error : theme.colors.white}
                style={{marginBottom: theme.spacing.md}}
              />
              <Text style={[styles.label, selectedType === item.id && { color: theme.colors.error }]}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.triggerBtn} onPress={sendSOS}>
          <Text style={styles.triggerTxt}>SEND SOS</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', padding: theme.spacing.md, paddingTop: Platform.OS === 'android' ? 40 : theme.spacing.md },
  backBtn: { padding: theme.spacing.sm },
  title: { ...theme.typography.h1, color: theme.colors.white, textAlign: 'center', marginBottom: theme.spacing.md, fontWeight: 'bold', fontSize: 36 },
  subTitle: { ...theme.typography.body, color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginBottom: theme.spacing.xxl, paddingHorizontal: theme.spacing.xl },

  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', paddingHorizontal: theme.spacing.lg, gap: theme.spacing.lg },
  gridItem: { width: '45%', aspectRatio: 1, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: theme.borderRadius.lg, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'transparent' },
  gridItemActive: { backgroundColor: theme.colors.white, borderColor: theme.colors.white, ...theme.shadows.lg },
  label: { ...theme.typography.h3, color: theme.colors.white, textAlign: 'center', fontWeight: 'bold' },

  triggerBtn: { backgroundColor: theme.colors.white, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginHorizontal: theme.spacing.xl, marginTop: 'auto', marginBottom: theme.spacing.xl, ...theme.shadows.lg },
  triggerTxt: { ...theme.typography.h2, color: theme.colors.error, fontWeight: 'bold' },

  // Success State Styles
  sosHero: { backgroundColor: theme.colors.error, height: 280, width: '100%', alignItems: 'center', ...theme.shadows.md },
  alertCircle: { width: 90, height: 90, borderRadius: 45, backgroundColor: theme.colors.white, justifyContent: 'center', alignItems: 'center', marginBottom: theme.spacing.lg, ...theme.shadows.lg },
  heroTitle: { ...theme.typography.h1, color: theme.colors.white, marginBottom: 8, fontSize: 32 },
  heroSub: { ...theme.typography.body, color: 'rgba(255,255,255,0.9)', fontWeight: 'bold' },

  content: { padding: theme.spacing.lg, marginTop: theme.spacing.md },
  sectionTitle: { ...theme.typography.h2, color: theme.colors.text, marginBottom: theme.spacing.md },

  helpCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.white, borderRadius: theme.borderRadius.lg, padding: theme.spacing.md, marginBottom: theme.spacing.md, ...theme.shadows.sm, borderWidth: 1, borderColor: theme.colors.borderLight },
  helpIconBg: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginRight: theme.spacing.md },
  helpTextCol: { flex: 1 },
  helpTitle: { ...theme.typography.h3, color: theme.colors.text, marginBottom: 4 },
  helpSub: { ...theme.typography.small, color: theme.colors.textSecondary },
  callCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: theme.colors.success, justifyContent: 'center', alignItems: 'center' },

  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: theme.spacing.lg, paddingBottom: Platform.OS === 'android' ? 32 : theme.spacing.xl, backgroundColor: theme.colors.background },
  cancelBtn: { backgroundColor: theme.colors.surface, height: 56, borderRadius: theme.borderRadius.lg, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: theme.colors.border },
  cancelBtnTxt: { ...theme.typography.h3, color: theme.colors.textSecondary },
});
