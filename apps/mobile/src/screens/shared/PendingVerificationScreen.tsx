import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTranslation } from 'react-i18next';
import { theme } from '../../theme';
import { useAuthStore } from '../../store/authStore';
import FeatherIcon from 'react-native-vector-icons/Feather';

export default function PendingVerificationScreen() {
  const { t } = useTranslation();
  const { logout } = useAuthStore();

  return (
    <View style={styles.container}>
      <SafeAreaView style={{flex: 1}}>
        <View style={styles.content}>
          <View style={styles.iconBox}>
            <FeatherIcon name="clock" size={48} color={theme.colors.primary} />
          </View>
          <Text style={styles.title}>{t('Under Review') || 'Under Review'}</Text>
          <Text style={styles.body}>
            {t('Our team is reviewing your documents. You will receive an SMS when approved. This usually takes 24 hours.') || 'Our team is reviewing your documents. You will receive an SMS when approved. This usually takes 24 hours.'}
          </Text>

          <View style={styles.supportCard}>
            <FeatherIcon name="headphones" size={24} color={theme.colors.primary} style={{marginBottom: 8}} />
            <Text style={styles.supportLbl}>Need help?</Text>
            <Text style={styles.supportTxt}>Support: 1800-XXX-XXXX</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <FeatherIcon name="log-out" size={20} color={theme.colors.textSecondary} style={{marginRight: 8}} />
          <Text style={styles.logoutTxt}>Logout</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: theme.spacing.xl },
  iconBox: { width: 100, height: 100, borderRadius: 50, backgroundColor: theme.colors.primary + '10', justifyContent: 'center', alignItems: 'center', marginBottom: theme.spacing.xl },
  title: { ...theme.typography.h1, color: theme.colors.text, marginBottom: theme.spacing.md, textAlign: 'center' },
  body: { ...theme.typography.body, color: theme.colors.textSecondary, textAlign: 'center', lineHeight: 24, marginBottom: theme.spacing.xxl },

  supportCard: { backgroundColor: theme.colors.white, padding: theme.spacing.lg, borderRadius: theme.borderRadius.lg, alignItems: 'center', width: '100%', borderWidth: 1, borderColor: theme.colors.borderLight, ...theme.shadows.sm },
  supportLbl: { ...theme.typography.small, color: theme.colors.textSecondary, marginBottom: 4 },
  supportTxt: { ...theme.typography.h3, color: theme.colors.text, fontWeight: 'bold' },

  logoutBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: theme.spacing.lg, backgroundColor: theme.colors.white, borderTopWidth: 1, borderTopColor: theme.colors.borderLight },
  logoutTxt: { ...theme.typography.h3, color: theme.colors.textSecondary },
});
