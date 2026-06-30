import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, Alert, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

import { theme } from '../../theme';
import StatusBadge from '../../components/StatusBadge';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { launchImageLibrary } from 'react-native-image-picker';
import { apiClient } from '../../api/client';
import { profileApi } from '../../api/profile';
import { useAuthStore } from '../../store/authStore';
import PhotoUploadSection from '../../components/PhotoUploadSection';

export default function DhabaProfileScreen() {
  const navigation = useNavigation<any>();
  const [isEdit, setIsEdit] = useState(false);
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>({
    name: 'Sher-e-Punjab Dhaba',
    highway: 'NH-44',
    fssai: '12345678901234',
    parking: true,
    ac: true,
    dormitory: false,
    photos: [],
  });

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (navigation.canGoBack()) {
          navigation.goBack();
          return true;
        }
        return false;
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [navigation])
  );

  React.useEffect(() => {
    if (user?.id) {
      profileApi.getDhabaProfile(user.id)
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
      const res = await profileApi.uploadDhabaPhotos(user.id, formData);
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
      const res = await profileApi.deleteDhabaPhoto(user.id, photoUrl);
      setProfile(res.data.data);
    } catch(e) {
      console.error(e);
      Alert.alert('Error', 'Failed to delete photo');
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={{backgroundColor: theme.colors.white}}>
        <View style={styles.header}>
          <Text style={styles.title}>Dhaba Profile</Text>
          <TouchableOpacity onPress={() => setIsEdit(!isEdit)} style={styles.editBtnBox}>
            <FeatherIcon name={isEdit ? 'x' : 'edit-2'} size={16} color={theme.colors.dhabaPrimary} style={{marginRight: 4}} />
            <Text style={styles.editBtn}>{isEdit ? 'Cancel' : 'Edit'}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <FeatherIcon name="info" size={20} color={theme.colors.dhabaPrimary} style={{marginRight: 8}} />
            <Text style={styles.sectionTitle}>Basic Info</Text>
          </View>

          <Text style={styles.label}>Dhaba Name</Text>
          {isEdit ? (
            <TextInput style={styles.input} value={profile.name} onChangeText={t => setProfile({...profile, name: t})} placeholderTextColor={theme.colors.textSecondary} />
          ) : (
            <Text style={styles.value}>{profile.name}</Text>
          )}

          <Text style={styles.label}>Highway Name</Text>
          {isEdit ? (
            <TextInput style={styles.input} value={profile.highway} onChangeText={t => setProfile({...profile, highway: t})} placeholderTextColor={theme.colors.textSecondary} />
          ) : (
            <Text style={styles.value}>{profile.highway}</Text>
          )}

          <Text style={styles.label}>FSSAI Number</Text>
          <Text style={styles.value}>{profile.fssai}</Text>

          <View style={{marginTop: 8}}>
            <StatusBadge status="Verified" type="verification" />
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <FeatherIcon name="list" size={20} color={theme.colors.dhabaPrimary} style={{marginRight: 8}} />
            <Text style={styles.sectionTitle}>Amenities</Text>
          </View>

          <TouchableOpacity style={styles.checkboxRow} disabled={!isEdit} onPress={() => setProfile({...profile, parking: !profile.parking})}>
            <View style={[styles.checkbox, profile.parking && styles.checkboxActive]}>
              {profile.parking && <FeatherIcon name="check" size={16} color={theme.colors.white} />}
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={styles.checkboxLbl}>Truck Parking</Text>
              <Text style={{marginLeft: 8}}>🅿️</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.checkboxRow} disabled={!isEdit} onPress={() => setProfile({...profile, ac: !profile.ac})}>
            <View style={[styles.checkbox, profile.ac && styles.checkboxActive]}>
              {profile.ac && <FeatherIcon name="check" size={16} color={theme.colors.white} />}
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={styles.checkboxLbl}>AC Seating</Text>
              <Text style={{marginLeft: 8}}>❄️</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.checkboxRow} disabled={!isEdit} onPress={() => setProfile({...profile, dormitory: !profile.dormitory})}>
            <View style={[styles.checkbox, profile.dormitory && styles.checkboxActive]}>
              {profile.dormitory && <FeatherIcon name="check" size={16} color={theme.colors.white} />}
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={styles.checkboxLbl}>Dormitory / Beds</Text>
              <Text style={{marginLeft: 8}}>🛏️</Text>
            </View>
          </TouchableOpacity>
        </View>

        <PhotoUploadSection
          photos={profile.photos || []}
          rolePrimary={theme.colors.dhabaPrimary}
          onUpload={handleUploadPhoto}
          onDelete={handleDeletePhoto}
        />

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
  editBtnBox: { flexDirection: 'row', alignItems: 'center', padding: 8, backgroundColor: theme.colors.dhabaPrimary + '15', borderRadius: 20 },
  editBtn: { ...theme.typography.body, color: theme.colors.dhabaPrimary, fontWeight: 'bold' },

  content: { padding: theme.spacing.md },

  card: { backgroundColor: theme.colors.white, padding: theme.spacing.lg, borderRadius: theme.borderRadius.lg, marginBottom: theme.spacing.md, ...theme.shadows.sm, borderWidth: 1, borderColor: theme.colors.borderLight },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.md, borderBottomWidth: 1, borderBottomColor: theme.colors.borderLight, paddingBottom: 12 },
  sectionTitle: { ...theme.typography.h3, color: theme.colors.text },

  label: { ...theme.typography.small, color: theme.colors.textSecondary, marginBottom: 6, fontWeight: 'bold' },
  value: { ...theme.typography.body, color: theme.colors.text, marginBottom: theme.spacing.lg },
  input: { borderWidth: 1, borderColor: theme.colors.borderLight, borderRadius: theme.borderRadius.md, padding: theme.spacing.md, marginBottom: theme.spacing.lg, fontSize: 16, backgroundColor: theme.colors.surface, color: theme.colors.text },

  checkboxRow: { flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.lg },
  checkbox: { width: 24, height: 24, borderWidth: 2, borderColor: theme.colors.borderLight, borderRadius: 6, marginRight: 12, justifyContent: 'center', alignItems: 'center' },
  checkboxActive: { backgroundColor: theme.colors.dhabaPrimary, borderColor: theme.colors.dhabaPrimary },
  checkboxLbl: { ...theme.typography.body, color: theme.colors.text },

  photoImg: { width: 120, height: 120, borderRadius: theme.borderRadius.md, marginRight: theme.spacing.md },
  uploadBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: theme.spacing.md, borderWidth: 1, borderColor: theme.colors.dhabaPrimary, borderRadius: theme.borderRadius.md, borderStyle: 'dashed' },
  uploadTxt: { ...theme.typography.body, color: theme.colors.dhabaPrimary, fontWeight: 'bold' },

  saveBtn: { backgroundColor: theme.colors.dhabaPrimary, padding: theme.spacing.md, borderRadius: theme.borderRadius.lg, alignItems: 'center', marginTop: theme.spacing.md },
  saveTxt: { ...theme.typography.h3, color: theme.colors.white },
});
