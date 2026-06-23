import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { theme } from '../../theme';
import { useNavigation } from '@react-navigation/native';
import { sosApi } from '../../api/sos';

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
      Alert.alert('Error', 'Failed to send SOS');
    }
  };

  const resolveSOS = async () => {
    try {
      await sosApi.resolveSOS(sosId);
      navigation.goBack();
    } catch(e) {
      Alert.alert('Error', 'Failed to resolve SOS');
    }
  };

  if (sosSent) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.white }]}>
        <Text style={[styles.title, { color: theme.colors.error }]}>Alert Sent!</Text>
        <Text style={styles.sub}>Alert sent to 5 people nearby</Text>
        
        <View style={styles.numbersBox}>
          <TouchableOpacity style={styles.numBtn}><Text style={styles.numTxt}>📞 Police: 112</Text></TouchableOpacity>
          <TouchableOpacity style={styles.numBtn}><Text style={styles.numTxt}>🚑 Ambulance: 108</Text></TouchableOpacity>
          <TouchableOpacity style={styles.numBtn}><Text style={styles.numTxt}>🛣 Helpline: 1033</Text></TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.safeBtn} onPress={resolveSOS}>
          <Text style={styles.safeTxt}>I AM SAFE</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>←</Text></TouchableOpacity>
      <Text style={styles.title}>EMERGENCY / आपातकाल</Text>

      <View style={styles.grid}>
        {[
          { id: 'accident', icon: '🚗', label: 'Accident\nदुर्घटना' },
          { id: 'medical', icon: '❤️', label: 'Medical\nचिकित्सा' },
          { id: 'breakdown', icon: '🔧', label: 'Breakdown\nखराबी' },
          { id: 'security', icon: '🔒', label: 'Security\nसुरक्षा' }
        ].map(item => (
          <TouchableOpacity 
            key={item.id} 
            style={[styles.gridItem, selectedType === item.id && styles.gridItemActive]}
            onPress={() => setSelectedType(item.id)}
          >
            <Text style={styles.icon}>{item.icon}</Text>
            <Text style={[styles.label, selectedType === item.id && { color: theme.colors.white }]}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.triggerBtn} onPress={sendSOS}>
        <Text style={styles.triggerTxt}>SEND EMERGENCY ALERT</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffebe6', padding: theme.spacing.lg, paddingTop: 60 },
  back: { fontSize: 32, color: theme.colors.error, marginBottom: theme.spacing.md },
  title: { ...theme.typography.h1, color: theme.colors.error, textAlign: 'center', marginBottom: theme.spacing.xxl, fontWeight: 'bold' },
  sub: { ...theme.typography.body, color: theme.colors.textSecondary, textAlign: 'center', marginBottom: theme.spacing.xl },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: theme.spacing.xxl },
  gridItem: { width: '48%', backgroundColor: theme.colors.white, borderRadius: theme.borderRadius.md, padding: theme.spacing.md, alignItems: 'center', marginBottom: theme.spacing.md, borderWidth: 2, borderColor: 'transparent' },
  gridItemActive: { backgroundColor: theme.colors.error, borderColor: theme.colors.error },
  icon: { fontSize: 40, marginBottom: theme.spacing.sm },
  label: { ...theme.typography.body, color: theme.colors.text, textAlign: 'center', fontWeight: 'bold' },
  triggerBtn: { backgroundColor: theme.colors.error, height: 72, borderRadius: theme.borderRadius.lg, justifyContent: 'center', alignItems: 'center', marginTop: 'auto', marginBottom: theme.spacing.xl },
  triggerTxt: { ...theme.typography.h3, color: theme.colors.white, fontWeight: 'bold' },
  numbersBox: { backgroundColor: theme.colors.surface, padding: theme.spacing.md, borderRadius: theme.borderRadius.md, marginBottom: theme.spacing.xl },
  numBtn: { padding: theme.spacing.md, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  numTxt: { ...theme.typography.h3, color: theme.colors.text },
  safeBtn: { backgroundColor: theme.colors.success, height: 64, borderRadius: theme.borderRadius.lg, justifyContent: 'center', alignItems: 'center', marginTop: 'auto', marginBottom: theme.spacing.xl },
  safeTxt: { ...theme.typography.h3, color: theme.colors.white, fontWeight: 'bold' }
});
