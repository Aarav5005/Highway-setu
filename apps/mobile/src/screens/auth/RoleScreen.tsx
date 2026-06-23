import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { theme } from '../../theme';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../store/authStore';

export default function RoleScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const setUser = useAuthStore(s => s.setUser);

  const selectRole = (role: 'driver' | 'dhaba_owner' | 'mechanic') => {
    setUser({ id: '', phone: '', role, language_pref: 'english' });
    navigation.navigate('Otp');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('select_role')}</Text>

      <TouchableOpacity style={styles.card} onPress={() => selectRole('driver')}>
        <Text style={styles.emoji}>🚛</Text>
        <View>
          <Text style={styles.cardTitle}>{t('truck_driver')}</Text>
          <Text style={styles.cardSub}>Truck Driver / ट्रक ड्राइवर / ਟਰੱਕ ਡਰਾਈਵਰ</Text>
        </View>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.card} onPress={() => selectRole('dhaba_owner')}>
        <Text style={styles.emoji}>🍛</Text>
        <View>
          <Text style={styles.cardTitle}>{t('dhaba_owner')}</Text>
          <Text style={styles.cardSub}>Dhaba Owner / ढाबा मालिक / ਢਾਬਾ ਮਾਲਕ</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={() => selectRole('mechanic')}>
        <Text style={styles.emoji}>🔧</Text>
        <View>
          <Text style={styles.cardTitle}>{t('mechanic')}</Text>
          <Text style={styles.cardSub}>Mechanic / मैकेनिक / ਮਕੈਨਿਕ</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.white, padding: theme.spacing.lg, justifyContent: 'center' },
  title: { ...theme.typography.h1, color: theme.colors.text, textAlign: 'center', marginBottom: theme.spacing.xxl },
  card: { height: 100, flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md, padding: theme.spacing.md, marginBottom: theme.spacing.md, borderWidth: 1, borderColor: theme.colors.border },
  emoji: { fontSize: 40, marginRight: theme.spacing.md },
  cardTitle: { ...theme.typography.h3, color: theme.colors.text },
  cardSub: { ...theme.typography.small, color: theme.colors.textSecondary }
});
