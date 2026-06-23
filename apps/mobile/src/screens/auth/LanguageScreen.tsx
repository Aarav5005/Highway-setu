import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { theme } from '../../theme';
import { useNavigation } from '@react-navigation/native';

export default function LanguageScreen() {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<any>();

  const selectLang = (lang: string) => {
    i18n.changeLanguage(lang);
    navigation.navigate('Role');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Highway Setu</Text>
      <Text style={styles.subtitle}>{t('select_language')}</Text>

      <TouchableOpacity style={styles.btn} onPress={() => selectLang('english')}>
        <Text style={styles.btnText}>English</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.btn} onPress={() => selectLang('hindi')}>
        <Text style={styles.btnText}>हिन्दी</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btn} onPress={() => selectLang('punjabi')}>
        <Text style={styles.btnText}>ਪੰਜਾਬੀ</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.white, padding: theme.spacing.lg, justifyContent: 'center' },
  title: { ...theme.typography.h1, color: theme.colors.primary, textAlign: 'center', marginBottom: theme.spacing.md },
  subtitle: { ...theme.typography.body, color: theme.colors.textSecondary, textAlign: 'center', marginBottom: theme.spacing.xxl },
  btn: { backgroundColor: theme.colors.primary, height: 72, borderRadius: theme.borderRadius.md, justifyContent: 'center', alignItems: 'center', marginBottom: theme.spacing.md },
  btnText: { ...theme.typography.h3, color: theme.colors.white }
});
