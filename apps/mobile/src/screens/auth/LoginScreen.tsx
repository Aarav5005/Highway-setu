import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Animated, Image, Dimensions, Easing } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { theme } from '../../theme';
import { useNavigation } from '@react-navigation/native';
import ErrorBanner from '../../components/ErrorBanner';
import { authApi } from '../../api/auth';
import FeatherIcon from 'react-native-vector-icons/Feather';

export default function LoginScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Animation Values
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;
  const btnScale = React.useRef(new Animated.Value(1)).current;
  const truckAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 7, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(truckAnim, { toValue: -15, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(truckAnim, { toValue: 15, duration: 4000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(truckAnim, { toValue: 0, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const onGetOtp = async () => {
    if (!phone || phone.length < 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await authApi.sendOtp(`+91${phone}`);
      navigation.navigate('Otp', { phone, verificationToken: res.data.verificationToken });
    } catch (e: any) {
      setError(e?.response?.data?.message || e.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const content = (
    <ScrollView
      contentContainerStyle={[
        styles.scrollContent,
        { paddingTop: Math.max(insets.top + 16, 24), paddingBottom: Math.max(insets.bottom + 16, 24) },
      ]}
      keyboardShouldPersistTaps="always"
    >
      <View style={styles.headerTop}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <FeatherIcon name="arrow-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <ErrorBanner message={error} />

      <Animated.View style={[styles.heroContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }, { translateX: truckAnim }] }]}>
        <Image
          source={require('../../assets/images/otp_truck.png')}
          style={styles.heroImage}
          resizeMode="contain"
        />
      </Animated.View>

      <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <Text style={styles.title}>Welcome to Highway Setu</Text>
        <Text style={styles.subtitle}>Enter your phone number to continue</Text>
      </Animated.View>

      <Animated.View style={[styles.form, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <Text style={styles.label}>Phone Number</Text>
        <View style={styles.inputContainer}>
          <Text style={styles.flagIcon}>🇮🇳</Text>
          <Text style={styles.prefix}>+91</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="Enter your phone number"
            placeholderTextColor={theme.colors.textMuted}
            keyboardType="phone-pad"
            maxLength={10}
          />
        </View>

        <TouchableOpacity
          activeOpacity={0.9}
          onPressIn={() => Animated.spring(btnScale, { toValue: 0.95, useNativeDriver: true }).start()}
          onPressOut={() => Animated.spring(btnScale, { toValue: 1, friction: 3, tension: 40, useNativeDriver: true }).start()}
          onPress={onGetOtp}
          disabled={loading}
        >
          <Animated.View style={[styles.btn, { transform: [{ scale: btnScale }] }]}>
            <Text style={styles.btnText}>{loading ? 'Sending...' : 'Get OTP'}</Text>
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>

      <View style={styles.footer}>
        <FeatherIcon name="shield" size={16} color={theme.colors.textSecondary} />
        <Text style={styles.footerText}>Secure Login</Text>
      </View>
    </ScrollView>
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
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  scrollContent: {
    flexGrow: 1,
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
  },
  headerTop: { paddingBottom: theme.spacing.xl, marginTop: theme.spacing.md },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  header: {
    marginBottom: theme.spacing.xl,
    alignItems: 'center',
  },
  heroContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  heroImage: {
    width: Dimensions.get('window').width * 0.7,
    height: 180,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  form: {
    marginBottom: theme.spacing.xl,
  },
  label: {
    ...theme.typography.small,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: theme.colors.borderLight,
    borderRadius: theme.borderRadius.xl,
    height: 64,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.surfaceCard,
  },
  inputContainerFocused: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.white,
    ...theme.shadows.lg,
  },
  flagIcon: {
    fontSize: 24,
    marginRight: theme.spacing.sm,
  },
  prefix: {
    ...theme.typography.h3,
    color: theme.colors.textSecondary,
    marginRight: theme.spacing.md,
    fontWeight: 'bold',
  },
  input: {
    flex: 1,
    fontSize: 22,
    fontWeight: '600',
    color: theme.colors.text,
    letterSpacing: 2,
  },
  btn: {
    backgroundColor: theme.colors.primary,
    height: 56,
    borderRadius: theme.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.xl,
  },
  btnText: {
    ...theme.typography.h3,
    color: theme.colors.white,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    paddingVertical: theme.spacing.lg,
  },
  footerText: {
    ...theme.typography.small,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.sm,
  },
});
