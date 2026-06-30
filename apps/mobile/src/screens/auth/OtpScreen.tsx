import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator,  KeyboardAvoidingView, Platform, Animated, Easing, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTranslation } from 'react-i18next';
import { theme } from '../../theme';
import { useNavigation, useRoute } from '@react-navigation/native';
import { authApi } from '../../api/auth';
import { useAuthStore } from '../../store/authStore';
import FeatherIcon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function OtpScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const { setToken, user, setUser } = useAuthStore();

  const route = useRoute<any>();
  const phone = route.params?.phone || '9999999999';
  const tokenStr = route.params?.verificationToken || '';
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Animations
  const floatAnim = React.useRef(new Animated.Value(0)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;
  const btnScale = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    // Floating animation for shield
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -15, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();

    // Entry animation
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 7, useNativeDriver: true }),
    ]).start();
  }, []);

  const verifyOtp = async () => {
    if (otp.length < 4) {return setError(t('error_otp_invalid'));}
    setLoading(true);
    setError('');
    try {
      const res = await authApi.verifyOtp(`+91${phone}`, otp, tokenStr);
      const authUser = res.data.user;
      setToken(res.data.accessToken);
      if (authUser.verificationStatus === 'unverified' || authUser.verificationStatus === 'pending') {
         navigation.navigate('Role', { authUser });
      } else {
         setUser({ id: authUser.id, phone: authUser.phoneE164, role: authUser.role, language_pref: authUser.preferredLanguage || 'english' });
      }
    } catch (e) {
      setError(t('error_generic'));
    } finally {
      setLoading(false);
    }
  };

  const content = (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Role')} style={styles.backBtn}>
          <FeatherIcon name="arrow-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <Text style={styles.title}>Verify Your Number</Text>
        <Text style={styles.subtitle}>हमने भेजा है OTP</Text>

        <View style={styles.phoneContainer}>
          <Text style={styles.phoneText}>+91 {phone}</Text>
          <TouchableOpacity onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Login')}>
            <Text style={styles.changeText}>Change</Text>
          </TouchableOpacity>
        </View>

        {/* 3D Illustration */}
        <Animated.View style={[styles.illustrationContainer, { transform: [{ translateY: floatAnim }] }]}>
          <Image
            source={require('../../assets/images/otp_truck.png')}
            style={styles.heroImage}
            resizeMode="contain"
          />
        </Animated.View>

        <Text style={styles.promptText}>Enter 6-digit OTP</Text>

        <View style={styles.otpWrapper}>
          {[0, 1, 2, 3, 4, 5].map((index) => {
            const isActive = otp.length === index;
            return (
              <View key={index} style={[styles.otpBox, isActive && styles.otpBoxActive]}>
                <Text style={styles.otpText}>{otp[index] || ''}</Text>
              </View>
            );
          })}
          <TextInput
            style={styles.hiddenInput}
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
            maxLength={6}
            autoFocus
          />
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Resend code in </Text>
          <Text style={styles.timerText}>00:28</Text>
        </View>

        <TouchableOpacity
          style={styles.termsContainer}
          onPress={() => setAgreedToTerms(!agreedToTerms)}
        >
          <View style={[styles.checkbox, agreedToTerms && styles.checkboxActive]}>
            {agreedToTerms && <FeatherIcon name="check" size={14} color={theme.colors.white} />}
          </View>
          <Text style={styles.termsText}>
            I agree to the <Text style={styles.termsLink} onPress={() => navigation.navigate('Terms')}>Terms & Conditions</Text>
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{ width: '100%' }}
          activeOpacity={0.9}
          onPressIn={() => Animated.spring(btnScale, { toValue: 0.95, useNativeDriver: true }).start()}
          onPressOut={() => Animated.spring(btnScale, { toValue: 1, friction: 3, tension: 40, useNativeDriver: true }).start()}
          onPress={verifyOtp}
          disabled={loading || !agreedToTerms}
        >
          <Animated.View style={[styles.btn, (!agreedToTerms || loading) && styles.btnDisabled, { transform: [{ scale: btnScale }] }]}>
            {loading ? <ActivityIndicator color={theme.colors.white}/> : <Text style={styles.btnText}>Verify & Continue</Text>}
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>

      <View style={styles.footer}>
        <FeatherIcon name="lock" size={16} color={theme.colors.textSecondary} />
        <Text style={styles.footerText}>Secure Verification</Text>
      </View>
    </SafeAreaView>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {content}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  container: { flex: 1 },
  header: { padding: theme.spacing.md },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },

  content: { flex: 1, paddingHorizontal: theme.spacing.xl, alignItems: 'center', paddingTop: theme.spacing.md },
  title: { ...theme.typography.h1, color: theme.colors.text, marginBottom: theme.spacing.xs },
  subtitle: { ...theme.typography.body, color: theme.colors.textSecondary, marginBottom: theme.spacing.md },

  phoneContainer: { alignItems: 'center', marginBottom: theme.spacing.lg },
  phoneText: { ...theme.typography.h2, color: theme.colors.text, letterSpacing: 1, marginBottom: 2 },
  changeText: { ...theme.typography.body, color: '#3B82F6' },

  illustrationContainer: { width: 100, height: 100, justifyContent: 'center', alignItems: 'center', marginBottom: theme.spacing.lg },
  heroImage: { width: 100, height: 100 },

  promptText: { ...theme.typography.body, color: theme.colors.textSecondary, marginBottom: theme.spacing.sm },

  otpWrapper: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: theme.spacing.lg },
  otpBox: { width: 48, height: 56, borderRadius: theme.borderRadius.md, borderWidth: 1, borderColor: theme.colors.border, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.surfaceCard },
  otpBoxActive: { borderColor: theme.colors.primary, borderWidth: 2, backgroundColor: theme.colors.white, transform: [{ scale: 1.05 }], ...theme.shadows.sm },
  otpText: { ...theme.typography.h2, color: theme.colors.text },
  hiddenInput: { position: 'absolute', width: '100%', height: '100%', opacity: 0 },

  error: { color: theme.colors.error, marginBottom: theme.spacing.sm },

  resendContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.lg },
  resendText: { ...theme.typography.body, color: theme.colors.textSecondary },
  timerText: { ...theme.typography.body, color: theme.colors.primary, fontWeight: 'bold', backgroundColor: 'rgba(59, 130, 246, 0.1)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, overflow: 'hidden' },

  btn: { backgroundColor: theme.colors.primary, width: '100%', height: 56, borderRadius: theme.borderRadius.lg, justifyContent: 'center', alignItems: 'center' },
  btnText: { ...theme.typography.h3, color: theme.colors.white },
  btnDisabled: { opacity: 0.6 },

  termsContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.lg, width: '100%', paddingHorizontal: theme.spacing.sm },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: theme.colors.border, marginRight: theme.spacing.md, justifyContent: 'center', alignItems: 'center' },
  checkboxActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  termsText: { ...theme.typography.small, color: theme.colors.textSecondary, flex: 1, lineHeight: 20 },
  termsLink: { color: theme.colors.primary, fontWeight: 'bold' },

  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: theme.spacing.md },
  footerText: { ...theme.typography.small, color: theme.colors.textSecondary, marginLeft: theme.spacing.sm },
});
