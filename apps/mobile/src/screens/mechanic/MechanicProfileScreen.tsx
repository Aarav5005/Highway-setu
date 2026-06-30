import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Image, Alert} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme } from '../../theme';
import StatusBadge from '../../components/StatusBadge';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { launchImageLibrary } from 'react-native-image-picker';
import { apiClient } from '../../api/client';
import { profileApi } from '../../api/profile';
import { useAuthStore } from '../../store/authStore';
import PhotoUploadSection from '../../components/PhotoUploadSection';

export default function MechanicProfileScreen() {
  const [isEdit, setIsEdit] = useState(false);
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>({
    shopName: 'Sharma Auto Works',
    canTravel: true,
    radius: 20,
    services: {
      tyre: true,
      engine: true,
      electrical: false,
      towing: true,
    },
    photos: [],
  });

  React.useEffect(() => {
    if (user?.id) {
      profileApi.getMechanicProfile(user.id)
        .then(res => {
          setProfile(res.data.data);
          setLoading(false);
        })
        .catch(err => {
          console.error('Failed to load profile', err);
          setLoading(false);
        });
    }
  }, [user?.id]);

  const handleUploadPhoto = async (formData: FormData) => {
    if (!user?.id) {return;}
    try {
      const res = await profileApi.uploadMechanicPhotos(user.id, formData);
      setProfile(res.data.data);
      Alert.alert('Success', 'Photos uploaded successfully!');
    } catch(e) {
      console.error(e);
      Alert.alert('Error', 'Failed to upload photo');
    }
  };

  const handleDeletePhoto = async (photoUrl: string) => {
    if (!user?.id) {return;}
    try {
      const res = await profileApi.deleteMechanicPhoto(user.id, photoUrl);
      setProfile(res.data.data);
    } catch(e) {
      console.error(e);
      Alert.alert('Error', 'Failed to delete photo');
    }
  };

  const toggleService = (key: keyof typeof profile.services) => {
    if (!isEdit) {return;}
    setProfile({ ...profile, services: { ...profile.services, [key]: !profile.services[key] } });
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={{backgroundColor: theme.colors.white}}>
        <View style={styles.header}>
          <Text style={styles.title}>Mechanic Profile</Text>
          <TouchableOpacity onPress={() => setIsEdit(!isEdit)} style={styles.editBtnBox}>
            <FeatherIcon name={isEdit ? 'x' : 'edit-2'} size={16} color={theme.colors.mechanicPrimary} style={{marginRight: 4}} />
            <Text style={styles.editBtn}>{isEdit ? 'Cancel' : 'Edit'}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start'}}>
            <View>
              <Text style={styles.shopName}>{profile.shopName}</Text>
              <Text style={{color: theme.colors.textSecondary, marginBottom: 8}}>NH-44 Highway</Text>
            </View>
            <View style={styles.mechanicIconBg}>
              <FeatherIcon name="tool" size={24} color={theme.colors.mechanicPrimary} />
            </View>
          </View>
          <StatusBadge status="Verified" type="verification" />
        </View>

        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <FeatherIcon name="list" size={20} color={theme.colors.mechanicPrimary} style={{marginRight: 8}} />
            <Text style={styles.sectionTitle}>Services Offered</Text>
          </View>
          <View style={styles.serviceGrid}>
            <TouchableOpacity style={[styles.srvPill, profile.services.tyre && styles.srvActive]} onPress={() => toggleService('tyre')} disabled={!isEdit}>
              {profile.services.tyre && <FeatherIcon name="check" size={14} color={theme.colors.white} style={{marginRight: 4}} />}
              <Text style={[styles.srvTxt, profile.services.tyre && styles.srvTxtActive]}>Tyres</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.srvPill, profile.services.engine && styles.srvActive]} onPress={() => toggleService('engine')} disabled={!isEdit}>
              {profile.services.engine && <FeatherIcon name="check" size={14} color={theme.colors.white} style={{marginRight: 4}} />}
              <Text style={[styles.srvTxt, profile.services.engine && styles.srvTxtActive]}>Engine</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.srvPill, profile.services.electrical && styles.srvActive]} onPress={() => toggleService('electrical')} disabled={!isEdit}>
              {profile.services.electrical && <FeatherIcon name="check" size={14} color={theme.colors.white} style={{marginRight: 4}} />}
              <Text style={[styles.srvTxt, profile.services.electrical && styles.srvTxtActive]}>Electrical</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.srvPill, profile.services.towing && styles.srvActive]} onPress={() => toggleService('towing')} disabled={!isEdit}>
              {profile.services.towing && <FeatherIcon name="check" size={14} color={theme.colors.white} style={{marginRight: 4}} />}
              <Text style={[styles.srvTxt, profile.services.towing && styles.srvTxtActive]}>Towing</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <FeatherIcon name="map" size={20} color={theme.colors.mechanicPrimary} style={{marginRight: 8}} />
            <Text style={styles.sectionTitle}>Travel Capability</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Can Travel to Breakdown?</Text>
            <Switch
              disabled={!isEdit}
              value={profile.canTravel}
              onValueChange={v => setProfile({...profile, canTravel: v})}
              trackColor={{ true: theme.colors.mechanicPrimary, false: theme.colors.borderLight }}
              thumbColor={theme.colors.white}
            />
          </View>
          {profile.canTravel && (
            <View style={[styles.row, {marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: theme.colors.borderLight}]}>
              <Text style={styles.label}>Max Travel Radius</Text>
              <Text style={styles.value}>{profile.radius} km</Text>
            </View>
          )}
        </View>

        <PhotoUploadSection
          photos={profile.photos || []}
          rolePrimary={theme.colors.mechanicPrimary}
          onUpload={handleUploadPhoto}
          onDelete={handleDeletePhoto}
        />

        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <FeatherIcon name="pie-chart" size={20} color={theme.colors.mechanicPrimary} style={{marginRight: 8}} />
            <Text style={styles.sectionTitle}>Earnings Summary</Text>
          </View>
          <View style={styles.earnRow}>
            <View style={styles.earnBox}>
              <Text style={styles.earnVal}>₹ 3,200</Text>
              <Text style={styles.earnLbl}>This Week</Text>
            </View>
            <View style={styles.earnBox}>
              <Text style={styles.earnVal}>₹ 12,500</Text>
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

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: theme.spacing.md, backgroundColor: theme.colors.white, borderBottomWidth: 1, borderBottomColor: theme.colors.borderLight },
  title: { ...theme.typography.h2, color: theme.colors.text },
  editBtnBox: { flexDirection: 'row', alignItems: 'center', padding: 8, backgroundColor: theme.colors.mechanicPrimary + '15', borderRadius: 20 },
  editBtn: { ...theme.typography.body, color: theme.colors.mechanicPrimary, fontWeight: 'bold' },

  content: { padding: theme.spacing.md },

  card: { backgroundColor: theme.colors.white, padding: theme.spacing.lg, borderRadius: theme.borderRadius.lg, marginBottom: theme.spacing.md, ...theme.shadows.sm, borderWidth: 1, borderColor: theme.colors.borderLight },
  shopName: { ...theme.typography.h2, color: theme.colors.text, marginBottom: 4 },
  mechanicIconBg: { width: 48, height: 48, borderRadius: 24, backgroundColor: theme.colors.mechanicPrimary + '15', justifyContent: 'center', alignItems: 'center' },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.md, borderBottomWidth: 1, borderBottomColor: theme.colors.borderLight, paddingBottom: 12 },
  sectionTitle: { ...theme.typography.h3, color: theme.colors.text },

  serviceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  srvPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.borderLight },
  srvActive: { backgroundColor: theme.colors.mechanicPrimary, borderColor: theme.colors.mechanicPrimary },
  srvTxt: { ...theme.typography.body, color: theme.colors.textSecondary, fontWeight: '500' },
  srvTxtActive: { color: theme.colors.white, fontWeight: 'bold' },

  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { ...theme.typography.body, color: theme.colors.text, fontWeight: '500' },
  value: { ...theme.typography.h3, color: theme.colors.mechanicPrimary, fontWeight: 'bold' },

  earnRow: { flexDirection: 'row', gap: theme.spacing.md },
  earnBox: { flex: 1, backgroundColor: theme.colors.surface, padding: theme.spacing.lg, borderRadius: theme.borderRadius.md, alignItems: 'center', borderWidth: 1, borderColor: theme.colors.borderLight },
  earnVal: { ...theme.typography.h2, color: theme.colors.success },
  earnLbl: { ...theme.typography.small, color: theme.colors.textSecondary, marginTop: 4, fontWeight: 'bold' },

  photoImg: { width: 120, height: 120, borderRadius: theme.borderRadius.md, marginRight: theme.spacing.md },
  uploadBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: theme.spacing.md, borderWidth: 1, borderColor: theme.colors.mechanicPrimary, borderRadius: theme.borderRadius.md, borderStyle: 'dashed' },
  uploadTxt: { ...theme.typography.body, color: theme.colors.mechanicPrimary, fontWeight: 'bold' },

  saveBtn: { backgroundColor: theme.colors.mechanicPrimary, padding: theme.spacing.md, borderRadius: theme.borderRadius.lg, alignItems: 'center', marginTop: theme.spacing.md },
  saveTxt: { ...theme.typography.h3, color: theme.colors.white },
});
