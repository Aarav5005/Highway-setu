import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { theme } from '../../theme';
import StatusBadge from '../../components/StatusBadge';

export default function DhabaProfileScreen() {
  const [isEdit, setIsEdit] = useState(false);
  
  const [profile, setProfile] = useState({
    name: 'Sher-e-Punjab Dhaba',
    highway: 'NH-44',
    fssai: '12345678901234',
    parking: true,
    ac: true,
    dormitory: false
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dhaba Profile</Text>
        <TouchableOpacity onPress={() => setIsEdit(!isEdit)}>
          <Text style={styles.editBtn}>{isEdit ? 'Cancel' : 'Edit'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Basic Info</Text>
          
          <Text style={styles.label}>Dhaba Name</Text>
          {isEdit ? <TextInput style={styles.input} value={profile.name} onChangeText={t => setProfile({...profile, name: t})} /> : <Text style={styles.value}>{profile.name}</Text>}
          
          <Text style={styles.label}>Highway Name</Text>
          {isEdit ? <TextInput style={styles.input} value={profile.highway} onChangeText={t => setProfile({...profile, highway: t})} /> : <Text style={styles.value}>{profile.highway}</Text>}

          <Text style={styles.label}>FSSAI Number</Text>
          <Text style={styles.value}>{profile.fssai}</Text>
          
          <View style={{marginTop: 8}}>
            <StatusBadge status="Verified" type="verification" />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Amenities</Text>
          
          <TouchableOpacity style={styles.checkboxRow} disabled={!isEdit} onPress={() => setProfile({...profile, parking: !profile.parking})}>
            <View style={[styles.checkbox, profile.parking && styles.checkboxActive]} />
            <Text style={styles.checkboxLbl}>Truck Parking 🅿️</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.checkboxRow} disabled={!isEdit} onPress={() => setProfile({...profile, ac: !profile.ac})}>
            <View style={[styles.checkbox, profile.ac && styles.checkboxActive]} />
            <Text style={styles.checkboxLbl}>AC Seating ❄️</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.checkboxRow} disabled={!isEdit} onPress={() => setProfile({...profile, dormitory: !profile.dormitory})}>
            <View style={[styles.checkbox, profile.dormitory && styles.checkboxActive]} />
            <Text style={styles.checkboxLbl}>Dormitory / Beds 🛏️</Text>
          </TouchableOpacity>
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
  sectionTitle: { ...theme.typography.h3, color: theme.colors.text, marginBottom: theme.spacing.lg, borderBottomWidth: 1, borderBottomColor: theme.colors.border, paddingBottom: 8 },
  label: { ...theme.typography.small, color: theme.colors.textSecondary, marginBottom: 4 },
  value: { ...theme.typography.body, color: theme.colors.text, marginBottom: theme.spacing.md, fontWeight: '500' },
  input: { borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.borderRadius.sm, padding: theme.spacing.sm, marginBottom: theme.spacing.md, fontSize: 16 },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.md },
  checkbox: { width: 24, height: 24, borderWidth: 2, borderColor: theme.colors.border, borderRadius: 4, marginRight: 12 },
  checkboxActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  checkboxLbl: { ...theme.typography.body, color: theme.colors.text },
  saveBtn: { backgroundColor: theme.colors.primary, padding: theme.spacing.md, borderRadius: theme.borderRadius.md, alignItems: 'center', marginTop: theme.spacing.md },
  saveTxt: { ...theme.typography.h3, color: theme.colors.white }
});
