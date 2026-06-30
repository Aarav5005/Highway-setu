import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTranslation } from 'react-i18next';
import { theme } from '../../theme';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuthStore } from '../../store/authStore';
import { authApi } from '../../api/auth';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import FeatherIcon from 'react-native-vector-icons/Feather';

const AnimatedPressable = ({ children, onPress, style, disabled }: any) => {
  const scale = React.useRef(new Animated.Value(1)).current;
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPressIn={() => !disabled && Animated.spring(scale, { toValue: 0.95, useNativeDriver: true }).start()}
      onPressOut={() => !disabled && Animated.spring(scale, { toValue: 1, friction: 3, tension: 40, useNativeDriver: true }).start()}
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
    >
      <Animated.View style={[style, { transform: [{ scale }] }]}>
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
};

export default function RoleScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const authUser = route.params?.authUser;

  const [isSelecting, setIsSelecting] = useState<string | null>(null);

  // Animations
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;
  const card1Anim = React.useRef(new Animated.Value(0)).current;
  const card2Anim = React.useRef(new Animated.Value(0)).current;
  const card3Anim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 7, useNativeDriver: true }),
    ]).start();

    Animated.stagger(150, [
      Animated.timing(card1Anim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(card2Anim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(card3Anim, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  const selectRole = async (role: 'driver' | 'dhaba_owner' | 'mechanic') => {
    if (isSelecting) {return;}
    setIsSelecting(role);
    try {
      const res = await authApi.setRole(role);
      if (res.data?.accessToken) {
        useAuthStore.getState().setToken(res.data.accessToken);
      }
      const updatedAuthUser = res.data?.user || authUser;
      navigation.navigate('Register', { role, authUser: updatedAuthUser });
    } catch (e) {
      console.error('Failed to set role', e);
    } finally {
      setIsSelecting(null);
    }
  };

  const RoleCard = ({ role, title, subtitle, icon, iconColor, iconBg, animValue }: any) => {
    const isThisSelecting = isSelecting === role;
    return (
      <Animated.View style={{ opacity: animValue, transform: [{ translateY: animValue.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }] }}>
        <AnimatedPressable
          style={[styles.card, isThisSelecting && styles.cardActive]}
          onPress={() => selectRole(role)}
          disabled={!!isSelecting}
        >
          <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
            <MaterialIcon name={icon} size={36} color={iconColor} />
          </View>
          <View style={styles.cardTextContainer}>
            <Text style={styles.cardTitle}>{title}</Text>
            <Text style={styles.cardSub}>{subtitle}</Text>
          </View>
          {isThisSelecting ? (
            <ActivityIndicator color={iconColor} />
          ) : (
            <View style={styles.chevronBg}>
              <FeatherIcon name="chevron-right" size={24} color={iconColor} />
            </View>
          )}
        </AnimatedPressable>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.logoCircle}>
             <MaterialIcon name="road-variant" size={40} color={theme.colors.warning} />
          </View>
          <Text style={styles.logoText}>HIGHWAY</Text>
          <Text style={styles.logoTextHighlight}>SETU</Text>
        </Animated.View>

        <Animated.Text style={[styles.title, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>Choose Your Role</Animated.Text>
        <Animated.Text style={[styles.subtitle, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>अपनी भूमिका चुनें</Animated.Text>

        <View style={styles.cardsContainer}>
          <RoleCard
            role="driver"
            title="Driver"
            subtitle="मैं ट्रक ड्राइवर हूं"
            icon="truck"
            iconColor="#288140"
            iconBg="#D1FAE5"
            animValue={card1Anim}
          />
          <RoleCard
            role="dhaba_owner"
            title="Dhaba Owner"
            subtitle="मैं ढाबा मालिक हूं"
            icon="storefront-outline"
            iconColor="#F59E0B"
            iconBg="#FEF3C7"
            animValue={card2Anim}
          />
          <RoleCard
            role="mechanic"
            title="Mechanic"
            subtitle="मैं मैकेनिक हूं"
            icon="wrench"
            iconColor="#7C3AED"
            iconBg="#EDE9FE"
            animValue={card3Anim}
          />
        </View>

        <View style={styles.footer}>
          <FeatherIcon name="shield" size={16} color={theme.colors.textSecondary} />
          <Text style={styles.footerText}>Secure • Trusted • For Truckers</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  scroll: { flexGrow: 1, padding: theme.spacing.lg, alignItems: 'center', paddingTop: theme.spacing.xxl },

  header: { alignItems: 'center', marginBottom: theme.spacing.xl },
  logoCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center', marginBottom: theme.spacing.sm, ...theme.shadows.md },
  logoText: { ...theme.typography.h1, color: theme.colors.text, letterSpacing: 2 },
  logoTextHighlight: { ...theme.typography.h1, color: theme.colors.warning, letterSpacing: 2, marginTop: -8 },

  title: { ...theme.typography.h2, color: theme.colors.text, textAlign: 'center', marginBottom: theme.spacing.xs },
  subtitle: { ...theme.typography.body, color: theme.colors.textSecondary, textAlign: 'center', marginBottom: theme.spacing.xxl },

  cardsContainer: { width: '100%', marginBottom: theme.spacing.xxl, gap: theme.spacing.md },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    borderWidth: 2,
    borderColor: theme.colors.surfaceCard,
    ...theme.shadows.md,
  },
  cardActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.surfaceCard,
  },
  iconContainer: { width: 70, height: 70, borderRadius: theme.borderRadius.lg, justifyContent: 'center', alignItems: 'center', marginRight: theme.spacing.lg },
  cardTextContainer: { flex: 1 },
  cardTitle: { ...theme.typography.h2, color: theme.colors.text, marginBottom: 4 },
  cardSub: { ...theme.typography.body, color: theme.colors.textSecondary },
  chevronBg: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' },

  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 'auto', paddingVertical: theme.spacing.lg },
  footerText: { ...theme.typography.small, color: theme.colors.textSecondary, marginLeft: theme.spacing.sm },
});
