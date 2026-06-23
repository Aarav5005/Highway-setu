import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { theme } from '../../theme';
import { useAuthStore } from '../../store/authStore';

export default function PendingVerificationScreen() {
  const { t } = useTranslation();
  const { logout } = useAuthStore();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.icon}>⏳</Text>
        <Text style={styles.title}>{t('Under Review') || 'Under Review'}</Text>
        <Text style={styles.body}>
          {t('Our team is reviewing your documents. You will receive an SMS when approved. This usually takes 24 hours.') || 'Our team is reviewing your documents. You will receive an SMS when approved. This usually takes 24 hours.'}
        </Text>
        <Text style={styles.support}>Support: 1800-XXX-XXXX</Text>
      </View>
      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutTxt}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, justifyContent: 'center', padding: theme.spacing.xl },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  icon: { fontSize: 80, marginBottom: theme.spacing.lg },
  title: { ...theme.typography.h1, color: theme.colors.primary, marginBottom: theme.spacing.md, textAlign: 'center' },
  body: { ...theme.typography.body, color: theme.colors.textSecondary, textAlign: 'center', lineHeight: 24, marginBottom: theme.spacing.xl },
  support: { ...theme.typography.body, color: theme.colors.text, fontWeight: 'bold' },
  logoutBtn: { padding: theme.spacing.md, alignItems: 'center' },
  logoutTxt: { ...theme.typography.body, color: theme.colors.textSecondary, fontWeight: 'bold' }
});
