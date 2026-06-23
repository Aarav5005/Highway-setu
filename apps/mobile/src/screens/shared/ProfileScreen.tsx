import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useTranslation } from 'react-i18next';
import { theme } from '../../theme';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../store/authStore';
import ConfirmDialog from '../../components/ConfirmDialog';

export default function ProfileScreen() {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<any>();
  const { user, logout } = useAuthStore();
  
  const [logoutDialog, setLogoutDialog] = useState(false);
  const [isEditName, setIsEditName] = useState(false);
  const [name, setName] = useState(user?.name || 'User');

  const handleLogout = () => {
    logout();
    setLogoutDialog(false);
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profileBox}>
          <TouchableOpacity style={styles.avatar}>
            <Text style={styles.avatarTxt}>{name.substring(0,2).toUpperCase()}</Text>
          </TouchableOpacity>
          <View style={styles.infoBox}>
            {isEditName ? (
              <TextInput style={styles.input} value={name} onChangeText={setName} onBlur={() => setIsEditName(false)} autoFocus />
            ) : (
              <TouchableOpacity onPress={() => setIsEditName(true)}>
                <Text style={styles.name}>{name} ✎</Text>
              </TouchableOpacity>
            )}
            <Text style={styles.phone}>{user?.phone || '+91 XXXXXXXXXX'}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Language / भाषा / ਭਾਸ਼ਾ</Text>
          <View style={styles.langRow}>
            <TouchableOpacity style={[styles.langBtn, i18n.language === 'english' && styles.langActive]} onPress={() => changeLanguage('english')}>
              <Text style={[styles.langTxt, i18n.language === 'english' && styles.langTxtActive]}>English</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.langBtn, i18n.language === 'hindi' && styles.langActive]} onPress={() => changeLanguage('hindi')}>
              <Text style={[styles.langTxt, i18n.language === 'hindi' && styles.langTxtActive]}>हिन्दी</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.langBtn, i18n.language === 'punjabi' && styles.langActive]} onPress={() => changeLanguage('punjabi')}>
              <Text style={[styles.langTxt, i18n.language === 'punjabi' && styles.langTxtActive]}>ਪੰਜਾਬੀ</Text>
            </TouchableOpacity>
          </View>
        </View>

        {user?.role === 'driver' && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Rewards & Referrals</Text>
            <View style={styles.rewardBox}>
              <Text style={styles.rewardVal}>450</Text>
              <Text style={styles.rewardLbl}>Loyalty Points</Text>
              <View style={styles.progressBg}>
                <View style={[styles.progressFill, { width: '45%' }]} />
              </View>
              <Text style={styles.progressTxt}>50 points to next reward</Text>
            </View>

            <View style={styles.refBox}>
              <Text style={styles.refLbl}>Your Referral Code</Text>
              <View style={styles.refCodeBox}>
                <Text style={styles.refCode}>HWY-459K</Text>
                <TouchableOpacity style={styles.copyBtn}><Text style={styles.copyTxt}>Copy</Text></TouchableOpacity>
              </View>
              <Text style={styles.refStats}>Total Referrals: 3</Text>
            </View>
          </View>
        )}

        {user?.role === 'dhaba_owner' && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Dhaba Management</Text>
            <TouchableOpacity style={styles.linkRow} onPress={() => navigation.navigate('DhabaProfile')}>
              <Text style={styles.linkTxt}>Edit Dhaba Profile</Text>
              <Text style={styles.linkArrow}>→</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.linkRow} onPress={() => navigation.navigate('Reviews')}>
              <Text style={styles.linkTxt}>Customer Reviews</Text>
              <Text style={styles.linkArrow}>→</Text>
            </TouchableOpacity>
          </View>
        )}

        {user?.role === 'mechanic' && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Mechanic Management</Text>
            <TouchableOpacity style={styles.linkRow} onPress={() => navigation.navigate('MechanicProfile')}>
              <Text style={styles.linkTxt}>Edit Profile & Services</Text>
              <Text style={styles.linkArrow}>→</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity style={styles.logoutBtn} onPress={() => setLogoutDialog(true)}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { padding: theme.spacing.lg, backgroundColor: theme.colors.white },
  title: { ...theme.typography.h2, color: theme.colors.text },
  content: { padding: theme.spacing.md },
  profileBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.white, padding: theme.spacing.lg, borderRadius: theme.borderRadius.md, marginBottom: theme.spacing.md, elevation: 1 },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: theme.colors.surface, justifyContent: 'center', alignItems: 'center', marginRight: theme.spacing.md, borderWidth: 1, borderColor: theme.colors.primary },
  avatarTxt: { ...theme.typography.h2, color: theme.colors.primary },
  infoBox: { flex: 1 },
  name: { ...theme.typography.h2, color: theme.colors.text },
  input: { ...theme.typography.h2, borderBottomWidth: 1, borderBottomColor: theme.colors.border, padding: 0, margin: 0 },
  phone: { ...theme.typography.body, color: theme.colors.textSecondary, marginTop: 4 },
  card: { backgroundColor: theme.colors.white, padding: theme.spacing.lg, borderRadius: theme.borderRadius.md, marginBottom: theme.spacing.md, elevation: 1 },
  sectionTitle: { ...theme.typography.h3, color: theme.colors.text, marginBottom: theme.spacing.md },
  langRow: { flexDirection: 'row', gap: theme.spacing.md },
  langBtn: { flex: 1, paddingVertical: 12, borderRadius: theme.borderRadius.sm, borderWidth: 1, borderColor: theme.colors.border, alignItems: 'center' },
  langActive: { backgroundColor: '#fff4eb', borderColor: theme.colors.primary },
  langTxt: { ...theme.typography.body, color: theme.colors.textSecondary },
  langTxtActive: { color: theme.colors.primary, fontWeight: 'bold' },
  rewardBox: { alignItems: 'center', marginBottom: theme.spacing.xl },
  rewardVal: { ...theme.typography.h1, color: theme.colors.success },
  rewardLbl: { ...theme.typography.small, color: theme.colors.textSecondary, marginBottom: theme.spacing.sm },
  progressBg: { width: '100%', height: 8, backgroundColor: theme.colors.border, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: theme.colors.success },
  progressTxt: { ...theme.typography.tiny, color: theme.colors.textSecondary, marginTop: 8 },
  refBox: { backgroundColor: theme.colors.surface, padding: theme.spacing.md, borderRadius: theme.borderRadius.sm },
  refLbl: { ...theme.typography.small, color: theme.colors.textSecondary, marginBottom: 8 },
  refCodeBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: theme.colors.white, padding: theme.spacing.sm, borderRadius: theme.borderRadius.sm, borderWidth: 1, borderColor: theme.colors.border },
  refCode: { ...theme.typography.h3, color: theme.colors.text, letterSpacing: 2 },
  copyBtn: { backgroundColor: theme.colors.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: theme.borderRadius.sm },
  copyTxt: { color: theme.colors.white, fontWeight: 'bold' },
  refStats: { ...theme.typography.small, color: theme.colors.textSecondary, marginTop: 8 },
  linkRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: theme.spacing.md, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  linkTxt: { ...theme.typography.body, color: theme.colors.text },
  linkArrow: { ...theme.typography.h3, color: theme.colors.textSecondary },
  logoutBtn: { marginVertical: theme.spacing.xl, alignItems: 'center' },
  logoutTxt: { ...theme.typography.body, color: theme.colors.error, fontWeight: 'bold' }
});
