import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,  Platform, Alert, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTranslation } from 'react-i18next';
import { theme } from '../../theme';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../store/authStore';
import ConfirmDialog from '../../components/ConfirmDialog';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { profileApi } from '../../api/profile';

export default function ProfileScreen() {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<any>();
  const { user, logout, setUser } = useAuthStore();

  const [logoutDialog, setLogoutDialog] = useState(false);
  const [isEditName, setIsEditName] = useState(false);
  const [name, setName] = useState(user?.name || 'User');
  const [fullProfile, setFullProfile] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        let res;
        if (user?.role === 'driver') {res = await profileApi.getDriverProfile();}
        else if (user?.role === 'dhaba_owner') {res = await profileApi.getDhabaProfile(user.id);}
        else if (user?.role === 'mechanic') {res = await profileApi.getMechanicProfile(user.id);}

        const data = res?.data?.data || res?.data;
        if (data) {
           setFullProfile(data);
           setName(data.fullName || data.dhaba_name || data.shop_name || user?.name || 'User');
        }
      } catch (e) {
        console.error(e);
      }
    };
    if (user?.id) {fetchProfile();}
  }, [user]);

  const saveName = async () => {
    setIsEditName(false);
    try {
      if (user?.role === 'driver') {
        await profileApi.registerDriver({
          fullName: name,
          licenseNumber: fullProfile?.licenseNumber || '',
          truckRegistrationNumber: fullProfile?.truckRegistrationNumber || '',
          truckType: fullProfile?.truckType || '',
        });
      } else if (user?.role === 'dhaba_owner') {
        await profileApi.updateDhabaProfile(user.id, { dhaba_name: name });
      } else if (user?.role === 'mechanic') {
        await profileApi.updateMechanicProfile(user.id, { shop_name: name });
      }
      setUser({ ...user, name } as any);
      Alert.alert('Success', 'Profile name updated');
    } catch(e) {
      console.error(e);
      Alert.alert('Error', 'Failed to update name');
    }
  };

  // Determine role-specific primary color
  const rolePrimary = user?.role === 'driver' ? theme.colors.driverPrimary :
                      user?.role === 'dhaba_owner' ? theme.colors.dhabaPrimary :
                      user?.role === 'mechanic' ? theme.colors.mechanicPrimary :
                      theme.colors.primary;

  const handleLogout = () => {
    logout();
    setLogoutDialog(false);
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <SafeAreaView style={{backgroundColor: theme.colors.white}}>
        <View style={styles.header}>
          <Text style={styles.title}>My Profile</Text>
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Profile Card */}
        <View style={styles.profileBox}>
          <TouchableOpacity style={[styles.avatar, { borderColor: rolePrimary }]}>
            <Text style={[styles.avatarTxt, { color: rolePrimary }]}>{name.substring(0,2).toUpperCase()}</Text>
          </TouchableOpacity>
          <View style={styles.infoBox}>
            {isEditName ? (
              <TextInput style={styles.input} value={name} onChangeText={setName} onBlur={saveName} autoFocus />
            ) : (
              <TouchableOpacity onPress={() => setIsEditName(true)} style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text style={styles.name}>{name}</Text>
                <FeatherIcon name="edit-2" size={16} color={theme.colors.textSecondary} style={{marginLeft: 8}} />
              </TouchableOpacity>
            )}
            <Text style={styles.phone}>{user?.phone || '+91 98765 43210'}</Text>
          </View>
        </View>

        {/* Language Selection */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Language / भाषा / ਭਾਸ਼ਾ</Text>
          <View style={styles.langRow}>
            <TouchableOpacity style={[styles.langBtn, i18n.language === 'english' && { backgroundColor: rolePrimary + '15', borderColor: rolePrimary }]} onPress={() => changeLanguage('english')}>
              <Text style={[styles.langTxt, i18n.language === 'english' && { color: rolePrimary, fontWeight: 'bold' }]}>English</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.langBtn, i18n.language === 'hindi' && { backgroundColor: rolePrimary + '15', borderColor: rolePrimary }]} onPress={() => changeLanguage('hindi')}>
              <Text style={[styles.langTxt, i18n.language === 'hindi' && { color: rolePrimary, fontWeight: 'bold' }]}>हिन्दी</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.langBtn, i18n.language === 'punjabi' && { backgroundColor: rolePrimary + '15', borderColor: rolePrimary }]} onPress={() => changeLanguage('punjabi')}>
              <Text style={[styles.langTxt, i18n.language === 'punjabi' && { color: rolePrimary, fontWeight: 'bold' }]}>ਪੰਜਾਬੀ</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Driver specific */}
        {user?.role === 'driver' && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Rewards & Referrals</Text>
            <View style={styles.rewardBox}>
              <View style={styles.rewardHeader}>
                <FeatherIcon name="award" size={24} color={theme.colors.warning} />
                <Text style={styles.rewardVal}>450</Text>
              </View>
              <Text style={styles.rewardLbl}>Loyalty Points</Text>

              <View style={styles.progressBg}>
                <View style={[styles.progressFill, { width: '45%', backgroundColor: theme.colors.warning }]} />
              </View>
              <Text style={styles.progressTxt}>50 points to next reward</Text>
            </View>

            <View style={styles.refBox}>
              <Text style={styles.refLbl}>Your Referral Code</Text>
              <View style={styles.refCodeBox}>
                <Text style={styles.refCode}>HWY-459K</Text>
                <TouchableOpacity style={[styles.copyBtn, { backgroundColor: rolePrimary }]}>
                  <Text style={styles.copyTxt}>Copy</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.refStats}>Total Referrals: 3</Text>
            </View>
          </View>
        )}

        {/* Dhaba Owner specific */}
        {user?.role === 'dhaba_owner' && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Dhaba Management</Text>
            <TouchableOpacity style={styles.linkRow} onPress={() => navigation.navigate('DhabaProfile')}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <FeatherIcon name="home" size={20} color={theme.colors.textSecondary} style={{marginRight: 12}} />
                <Text style={styles.linkTxt}>Edit Dhaba Profile</Text>
              </View>
              <FeatherIcon name="chevron-right" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.linkRow} onPress={() => navigation.navigate('Reviews')}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <FeatherIcon name="star" size={20} color={theme.colors.textSecondary} style={{marginRight: 12}} />
                <Text style={styles.linkTxt}>Customer Reviews</Text>
              </View>
              <FeatherIcon name="chevron-right" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>
        )}

        {/* Mechanic specific */}
        {user?.role === 'mechanic' && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Mechanic Management</Text>
            <TouchableOpacity style={styles.linkRow} onPress={() => navigation.navigate('MechanicProfile')}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <FeatherIcon name="tool" size={20} color={theme.colors.textSecondary} style={{marginRight: 12}} />
                <Text style={styles.linkTxt}>Edit Profile & Services</Text>
              </View>
              <FeatherIcon name="chevron-right" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity style={styles.logoutBtn} onPress={() => setLogoutDialog(true)}>
          <FeatherIcon name="log-out" size={20} color={theme.colors.error} style={{marginRight: 8}} />
          <Text style={styles.logoutTxt}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>

      <ConfirmDialog
        visible={logoutDialog}
        title="Logout"
        message="Are you sure you want to log out?"
        onConfirm={handleLogout}
        onCancel={() => setLogoutDialog(false)}
        confirmText="Logout"
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { padding: theme.spacing.md, backgroundColor: theme.colors.white, borderBottomWidth: 1, borderBottomColor: theme.colors.borderLight },
  title: { ...theme.typography.h2, color: theme.colors.text },

  content: { padding: theme.spacing.md, paddingBottom: 100 },

  profileBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.white, padding: theme.spacing.lg, borderRadius: theme.borderRadius.lg, marginBottom: theme.spacing.md, ...theme.shadows.sm, borderWidth: 1, borderColor: theme.colors.borderLight },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: theme.colors.surface, justifyContent: 'center', alignItems: 'center', marginRight: theme.spacing.md, borderWidth: 2 },
  avatarTxt: { ...theme.typography.h2 },
  infoBox: { flex: 1 },
  name: { ...theme.typography.h2, color: theme.colors.text },
  input: { ...theme.typography.h2, borderBottomWidth: 1, borderBottomColor: theme.colors.borderLight, padding: 0, margin: 0, color: theme.colors.text },
  phone: { ...theme.typography.body, color: theme.colors.textSecondary, marginTop: 4 },

  card: { backgroundColor: theme.colors.white, padding: theme.spacing.lg, borderRadius: theme.borderRadius.lg, marginBottom: theme.spacing.md, ...theme.shadows.sm, borderWidth: 1, borderColor: theme.colors.borderLight },
  sectionTitle: { ...theme.typography.h3, color: theme.colors.text, marginBottom: theme.spacing.lg },

  langRow: { flexDirection: 'row', gap: theme.spacing.md },
  langBtn: { flex: 1, paddingVertical: 12, borderRadius: theme.borderRadius.md, borderWidth: 1, borderColor: theme.colors.borderLight, alignItems: 'center' },
  langTxt: { ...theme.typography.body, color: theme.colors.textSecondary },

  rewardBox: { alignItems: 'center', marginBottom: theme.spacing.xl },
  rewardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  rewardVal: { ...theme.typography.h1, color: theme.colors.text, marginLeft: 8 },
  rewardLbl: { ...theme.typography.body, color: theme.colors.textSecondary, marginBottom: theme.spacing.md },
  progressBg: { width: '100%', height: 8, backgroundColor: theme.colors.borderLight, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%' },
  progressTxt: { ...theme.typography.small, color: theme.colors.textSecondary, marginTop: 8 },

  refBox: { backgroundColor: theme.colors.surface, padding: theme.spacing.md, borderRadius: theme.borderRadius.md, borderWidth: 1, borderColor: theme.colors.borderLight },
  refLbl: { ...theme.typography.small, color: theme.colors.textSecondary, marginBottom: 8 },
  refCodeBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: theme.colors.white, padding: theme.spacing.xs, paddingLeft: theme.spacing.md, borderRadius: theme.borderRadius.sm, borderWidth: 1, borderColor: theme.colors.borderLight },
  refCode: { ...theme.typography.h3, color: theme.colors.text, letterSpacing: 2 },
  copyBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: theme.borderRadius.sm },
  copyTxt: { color: theme.colors.white, fontWeight: 'bold' },
  refStats: { ...theme.typography.small, color: theme.colors.textSecondary, marginTop: 8 },

  linkRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: theme.spacing.md, borderBottomWidth: 1, borderBottomColor: theme.colors.borderLight },
  linkTxt: { ...theme.typography.body, color: theme.colors.text },

  logoutBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: theme.spacing.xl, backgroundColor: theme.colors.white, padding: theme.spacing.md, borderRadius: theme.borderRadius.lg, borderWidth: 1, borderColor: theme.colors.error, ...theme.shadows.sm },
  logoutTxt: { ...theme.typography.h3, color: theme.colors.error },
});
