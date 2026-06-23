import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { theme } from '../../theme';
import StatusBadge from '../../components/StatusBadge';

export default function MechanicProfileScreen() {
  const [isEdit, setIsEdit] = useState(false);
  const [profile, setProfile] = useState({
    shopName: 'Sharma Auto Works',
    canTravel: true,
    radius: 20,
    services: {
      tyre: true,
      engine: true,
      electrical: false,
      towing: true
    }
  });

  const toggleService = (key: keyof typeof profile.services) => {
    if (!isEdit) return;
    setProfile({ ...profile, services: { ...profile.services, [key]: !profile.services[key] } });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mechanic Profile</Text>
        <TouchableOpacity onPress={() => setIsEdit(!isEdit)}>
          <Text style={styles.editBtn}>{isEdit ? 'Cancel' : 'Edit'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.shopName}>{profile.shopName}</Text>
          <StatusBadge status="Verified" type="verification" />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Services Offered</Text>
          <View style={styles.serviceGrid}>
            <TouchableOpacity style={[styles.srvPill, profile.services.tyre && styles.srvActive]} onPress={() => toggleService('tyre')}>
              <Text style={[styles.srvTxt, profile.services.tyre && styles.srvTxtActive]}>Tyres</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.srvPill, profile.services.engine && styles.srvActive]} onPress={() => toggleService('engine')}>
              <Text style={[styles.srvTxt, profile.services.engine && styles.srvTxtActive]}>Engine</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.srvPill, profile.services.electrical && styles.srvActive]} onPress={() => toggleService('electrical')}>
              <Text style={[styles.srvTxt, profile.services.electrical && styles.srvTxtActive]}>Electrical</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.srvPill, profile.services.towing && styles.srvActive]} onPress={() => toggleService('towing')}>
              <Text style={[styles.srvTxt, profile.services.towing && styles.srvTxtActive]}>Towing</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Travel Capability</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Can Travel to Breakdown?</Text>
            <Switch 
              disabled={!isEdit} 
              value={profile.canTravel} 
              onValueChange={v => setProfile({...profile, canTravel: v})} 
              trackColor={{ true: theme.colors.primary }}
            />
          </View>
          {profile.canTravel && (
            <View style={[styles.row, {marginTop: 12}]}>
              <Text style={styles.label}>Max Travel Radius (km)</Text>
              <Text style={styles.value}>{profile.radius} km</Text>
            </View>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Earnings Summary</Text>
          <View style={styles.earnRow}>
            <View style={styles.earnBox}>
              <Text style={styles.earnVal}>₹3,200</Text>
              <Text style={styles.earnLbl}>This Week</Text>
            </View>
            <View style={styles.earnBox}>
              <Text style={styles.earnVal}>₹12,500</Text>
              <Text style={styles.earnLbl}>This Month</Text>
            </View>
          </View>
        </View>

        {isEdit && (
          <TouchableOpacity style={styles.saveBtn} onPress={() => setIsEdit(false)}>
            <Text style={styles.saveTxt}>Save Changes</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: theme.spacing.lg, backgroundColor: theme.colors.white },
  title: { ...theme.typography.h2, color: theme.colors.text },
  editBtn: { ...theme.typography.body, color: theme.colors.primary, fontWeight: 'bold' },
  content: { padding: theme.spacing.md },
  card: { backgroundColor: theme.colors.white, padding: theme.spacing.lg, borderRadius: theme.borderRadius.md, marginBottom: theme.spacing.md, elevation: 1 },
  shopName: { ...theme.typography.h2, color: theme.colors.text, marginBottom: 8 },
  sectionTitle: { ...theme.typography.h3, color: theme.colors.text, marginBottom: theme.spacing.lg },
  serviceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  srvPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border },
  srvActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  srvTxt: { ...theme.typography.body, color: theme.colors.textSecondary },
  srvTxtActive: { color: theme.colors.white, fontWeight: 'bold' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { ...theme.typography.body, color: theme.colors.text },
  value: { ...theme.typography.h3, color: theme.colors.primary },
  earnRow: { flexDirection: 'row', gap: theme.spacing.md },
  earnBox: { flex: 1, backgroundColor: '#e6f4ea', padding: theme.spacing.lg, borderRadius: theme.borderRadius.sm, alignItems: 'center' },
  earnVal: { ...theme.typography.h2, color: theme.colors.success },
  earnLbl: { ...theme.typography.small, color: theme.colors.textSecondary, marginTop: 4 },
  saveBtn: { backgroundColor: theme.colors.primary, padding: theme.spacing.md, borderRadius: theme.borderRadius.md, alignItems: 'center', marginTop: theme.spacing.md },
  saveTxt: { ...theme.typography.h3, color: theme.colors.white }
});
