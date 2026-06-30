import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ImageBackground, Platform, Animated, Easing, Image } from 'react-native';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { theme } from '../../theme';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';

const { width, height } = Dimensions.get('window');

export default function LanguageScreen() {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<any>();
  const [selectedLang, setSelectedLang] = useState('english');
  const insets = useSafeAreaInsets();

  // Animation Values
  const truckAnim = React.useRef(new Animated.Value(0)).current;
  const sheetTranslateY = React.useRef(new Animated.Value(height * 0.5)).current;
  const sheetOpacity = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    // Truck animation loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(truckAnim, { toValue: -15, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(truckAnim, { toValue: 15, duration: 4000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(truckAnim, { toValue: 0, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();

    // Bottom sheet slide up
    Animated.parallel([
      Animated.spring(sheetTranslateY, { toValue: 0, tension: 50, friction: 8, useNativeDriver: true }),
      Animated.timing(sheetOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  const onContinue = () => {
    i18n.changeLanguage(selectedLang);
    navigation.navigate('Login');
  };

  const LanguageOption = ({ id, title, subtitle, letter, color, bg }: any) => {
    const isSelected = selectedLang === id;
    const scaleAnim = React.useRef(new Animated.Value(1)).current;

    const onPressIn = () => {
      Animated.spring(scaleAnim, { toValue: 0.95, useNativeDriver: true }).start();
    };
    const onPressOut = () => {
      Animated.spring(scaleAnim, { toValue: 1, friction: 3, tension: 40, useNativeDriver: true }).start();
    };

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={() => setSelectedLang(id)}
      >
        <Animated.View style={[styles.langCard, isSelected && styles.langCardSelected, { transform: [{ scale: scaleAnim }] }]}>
          <View style={[styles.avatar, { backgroundColor: bg }]}>
            <Text style={[styles.avatarText, { color }]}>{letter}</Text>
          </View>
          <View style={styles.langTextContainer}>
            <Text style={styles.langTitle}>{title}</Text>
            <Text style={styles.langSubtitle}>{subtitle}</Text>
          </View>
          <View style={[styles.radio, isSelected && { borderColor: theme.colors.primary, display: 'flex' }]}>
            {isSelected && <View style={styles.radioInner} />}
          </View>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Animated.View style={[styles.heroContainer, { transform: [{ translateX: truckAnim }] }]}>
        <Image
          source={require('../../assets/images/otp_truck.png')}
          style={styles.heroImage}
          resizeMode="contain"
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.bottomSheet,
          {
            padding: theme.spacing.lg,
            paddingTop: theme.spacing.xl,
            paddingBottom: Math.max(insets.bottom + 16, 24),
            opacity: sheetOpacity,
            transform: [{ translateY: sheetTranslateY }],
          },
        ]}
      >
        <Text style={styles.title}>Choose Your Language</Text>
        <Text style={styles.subtitle}>अपनी भाषा चुनें / ਆਪਣੀ ਭਾਸ਼ਾ ਚੁਣੋ</Text>

        <View style={styles.optionsContainer}>
          <LanguageOption id="english" title="English" subtitle="English" letter="A" color="#288140" bg="#D1FAE5" />
          <LanguageOption id="hindi" title="हिंदी" subtitle="Hindi" letter="अ" color="#F59E0B" bg="#FEF3C7" />
          <LanguageOption id="punjabi" title="ਪੰਜਾਬੀ" subtitle="Punjabi" letter="ਪ" color="#7C3AED" bg="#EDE9FE" />
        </View>

        <TouchableOpacity style={styles.continueBtn} activeOpacity={0.8} onPress={onContinue}>
          <Text style={styles.continueText}>Continue</Text>
          <Icon name="arrow-right" size={20} color={theme.colors.white} />
        </TouchableOpacity>

        <View style={styles.footer}>
          <Icon name="globe" size={16} color={theme.colors.textSecondary} />
          <Text style={styles.footerText}>You can change language later</Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, overflow: 'hidden' },
  heroContainer: { height: height * 0.35, width: '100%', alignItems: 'center', justifyContent: 'center' },
  heroImage: { width: width * 0.65, height: 160 },

  bottomSheet: {
    width: '100%',
    flex: 1,
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    marginTop: -40,
    ...theme.shadows.lg,
  },
  title: { ...theme.typography.h2, color: theme.colors.text, textAlign: 'center', marginBottom: theme.spacing.xs },
  subtitle: { ...theme.typography.body, color: theme.colors.textSecondary, textAlign: 'center', marginBottom: theme.spacing.md },

  optionsContainer: { marginBottom: theme.spacing.md },
  langCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.surfaceCard,
    ...theme.shadows.sm,
  },
  langCardSelected: { borderColor: theme.colors.primary, backgroundColor: theme.colors.surface },

  avatar: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: theme.spacing.md },
  avatarText: { ...theme.typography.h2 },
  langTextContainer: { flex: 1 },
  langTitle: { ...theme.typography.h3, color: theme.colors.text },
  langSubtitle: { ...theme.typography.small, color: theme.colors.textSecondary },

  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: theme.colors.border, justifyContent: 'center', alignItems: 'center', display: 'none' },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: theme.colors.primary },
  chevron: { marginLeft: 'auto' },

  continueBtn: { backgroundColor: theme.colors.primary, height: 56, borderRadius: theme.borderRadius.xl, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 'auto' },
  continueText: { ...theme.typography.h3, color: theme.colors.white, marginRight: theme.spacing.sm },

  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: theme.spacing.md },
  footerText: { ...theme.typography.small, color: theme.colors.textSecondary, marginLeft: theme.spacing.xs },
});
