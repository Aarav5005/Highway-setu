import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { theme } from '../../theme';
import { useNavigation } from '@react-navigation/native';
import { authApi } from '../../api/auth';
import { useAuthStore } from '../../store/authStore';

export default function OtpScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const { setToken, user, setUser } = useAuthStore();
  
  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [tokenStr, setTokenStr] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const sendOtp = async () => {
    if (phone.length < 10) return setError(t('error_phone_invalid'));
    setLoading(true);
    setError('');
    try {
      const res = await authApi.sendOtp(`+91${phone}`);
      setTokenStr(res.data.data.verificationToken);
      setStep('OTP');
    } catch (e) {
      setError(t('error_generic'));
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (otp.length < 4) return setError(t('error_otp_invalid'));
    setLoading(true);
    setError('');
    try {
      const res = await authApi.verifyOtp(`+91${phone}`, otp, tokenStr);
      const authUser = res.data.data.user;
      setToken(res.data.data.accessToken);
      if (authUser.verificationStatus === 'unverified') {
         navigation.navigate('Register');
      } else {
         setUser({ ...user!, id: authUser.id, phone: authUser.phoneE164, role: authUser.role });
      }
    } catch (e) {
      setError(t('error_generic'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Highway Setu</Text>

      {step === 'PHONE' ? (
        <>
          <Text style={styles.label}>{t('enter_phone')}</Text>
          <View style={styles.phoneRow}>
            <Text style={styles.prefix}>+91</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              keyboardType="number-pad"
              maxLength={10}
            />
          </View>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <TouchableOpacity style={styles.btn} onPress={sendOtp} disabled={loading}>
            {loading ? <ActivityIndicator color={theme.colors.white}/> : <Text style={styles.btnText}>{t('send_otp')}</Text>}
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.label}>OTP sent to +91 {phone}</Text>
          <TextInput
            style={[styles.input, { letterSpacing: 10, textAlign: 'center' }]}
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
            maxLength={6}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <TouchableOpacity style={styles.btn} onPress={verifyOtp} disabled={loading}>
            {loading ? <ActivityIndicator color={theme.colors.white}/> : <Text style={styles.btnText}>{t('verify')}</Text>}
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.white, padding: theme.spacing.lg, justifyContent: 'center' },
  title: { ...theme.typography.h1, color: theme.colors.primary, textAlign: 'center', marginBottom: theme.spacing.xxl },
  label: { ...theme.typography.body, color: theme.colors.text, marginBottom: theme.spacing.sm },
  phoneRow: { flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.md },
  prefix: { ...theme.typography.h3, marginRight: theme.spacing.sm },
  input: { flex: 1, height: 50, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.borderRadius.sm, paddingHorizontal: theme.spacing.md, fontSize: 18 },
  error: { color: theme.colors.error, marginBottom: theme.spacing.sm },
  btn: { backgroundColor: theme.colors.primary, height: 50, borderRadius: theme.borderRadius.md, justifyContent: 'center', alignItems: 'center', marginTop: theme.spacing.md },
  btnText: { ...theme.typography.h3, color: theme.colors.white }
});
