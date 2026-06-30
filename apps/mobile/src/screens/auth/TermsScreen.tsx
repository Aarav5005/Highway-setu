import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../theme';

export default function TermsScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Otp')} style={styles.backBtn}>
          <FeatherIcon name="arrow-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms & Conditions</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView style={styles.content}>
        <Text style={styles.text}>
          Welcome to Highway Setu! By using our platform, you agree to these terms.
          {'\n\n'}
          1. Use of Service: You agree to use the app for its intended purposes only.
          {'\n\n'}
          2. Privacy Policy: We value your privacy. We collect data necessary for providing our services.
          {'\n\n'}
          3. Prohibited Conduct: Any misuse of the app may lead to termination of your account.
          {'\n\n'}
          4. Modifications: We reserve the right to update these terms at any time.
          {'\n\n'}
          Please read the full detailed policy on our official website.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  text: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    lineHeight: 24,
  },
});
