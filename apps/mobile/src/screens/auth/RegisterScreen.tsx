import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator,  ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTranslation } from 'react-i18next';
import { theme } from '../../theme';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuthStore } from '../../store/authStore';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { profileApi } from '../../api/profile';

const InputField = ({ label, placeholder, icon, value, onChangeText, ...props }: any) => (
  <View style={styles.inputGroup}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.inputContainer}>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textMuted}
        value={value}
        onChangeText={onChangeText}
        {...props}
      />
      {icon && <FeatherIcon name={icon} size={20} color={theme.colors.textSecondary} style={styles.inputIcon} />}
    </View>
  </View>
);

export default function RegisterScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { setUser } = useAuthStore();

  const role = route.params?.role || 'driver';
  const authUser = route.params?.authUser;
  const [loading, setLoading] = useState(false);

  // Driver fields
  const [fullName, setFullName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [truckReg, setTruckReg] = useState('');
  const [truckType, setTruckType] = useState('');

  // Dhaba fields
  const [dhabaName, setDhabaName] = useState('');
  const [highwayName, setHighwayName] = useState('');
  const [fssai, setFssai] = useState('');

  // Mechanic fields
  const [shopName, setShopName] = useState('');
  const [experience, setExperience] = useState('');

  const onSubmit = async () => {
    setLoading(true);
    try {
      if (role === 'driver') {
        await profileApi.registerDriver({
          fullName,
          licenseNumber,
          truckRegistrationNumber: truckReg,
          truckType: truckType || 'Truck',
        });
      } else if (role === 'dhaba_owner') {
        await profileApi.registerDhaba({
          dhaba_name: dhabaName,
          highway_name: highwayName,
          fssai_number: fssai,
          fssai_doc_url: 'https://example.com/fssai.jpg', // dummy for now
          latitude: 28.7041, // dummy
          longitude: 77.1025, // dummy
          amenities: { truck_parking: true, wifi: false, toilet: true },
        });
      } else if (role === 'mechanic') {
        await profileApi.registerMechanic({
          shop_name: shopName || fullName,
          latitude: 28.7041,
          longitude: 77.1025,
          services_offered: { tyre: true, engine: true },
          can_travel: false,
        });
      }

      if (authUser) {
        setUser({
          id: authUser.id,
          phone: authUser.phoneE164,
          role: role,
          language_pref: authUser.preferredLanguage || 'english',
          name: fullName || dhabaName || shopName || 'Registered User',
        });
      }
    } catch (error: any) {
      console.error('Registration error', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to complete registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll}>

          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <FeatherIcon name="arrow-left" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <Text style={styles.title}>Complete Your Profile</Text>
            <Text style={styles.subtitle}>कुछ जानकारी भरें</Text>

            {role === 'driver' && (
              <View style={styles.form}>
                <InputField label="Full Name" placeholder="Ravi Kumar" value={fullName} onChangeText={setFullName} />
                <InputField label="Driving License Number" placeholder="RJ14 20210012345" autoCapitalize="characters" value={licenseNumber} onChangeText={setLicenseNumber} />
                <InputField label="Truck Number" placeholder="RJ14 GB 1234" autoCapitalize="characters" value={truckReg} onChangeText={setTruckReg} />
                <InputField label="Truck Type" placeholder="Tata 4825" icon="chevron-down" value={truckType} onChangeText={setTruckType} />
              </View>
            )}

            {role === 'dhaba_owner' && (
              <View style={styles.form}>
                <InputField label="Full Name" placeholder="Ramesh Sharma" value={fullName} onChangeText={setFullName} />
                <InputField label="Dhaba Name" placeholder="Apna Dhaba" value={dhabaName} onChangeText={setDhabaName} />
                <InputField label="Highway Location" placeholder="NH-48, Near Jaipur" value={highwayName} onChangeText={setHighwayName} />
                <InputField label="FSSAI Number" placeholder="12345678901234" value={fssai} onChangeText={setFssai} />
              </View>
            )}

            {role === 'mechanic' && (
              <View style={styles.form}>
                <InputField label="Full Name" placeholder="Sandeep Singh" value={fullName} onChangeText={setFullName} />
                <InputField label="Workshop Name (Optional)" placeholder="Singh Auto Works" value={shopName} onChangeText={setShopName} />
                <InputField label="Specialty Services" placeholder="Tyre, Engine, Electrical" />
                <InputField label="Years of Experience" placeholder="8 Years" keyboardType="numeric" value={experience} onChangeText={setExperience} />
              </View>
            )}

            <View style={styles.trustBadge}>
              <FeatherIcon name="shield" size={20} color={theme.colors.success} style={styles.trustIcon} />
              <Text style={styles.trustText}>
                Your information is secure and will be used to improve your experience.
              </Text>
            </View>

            <TouchableOpacity style={styles.btn} onPress={onSubmit} disabled={loading}>
              {loading ? <ActivityIndicator color={theme.colors.white}/> : <Text style={styles.btnText}>Complete Registration</Text>}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <FeatherIcon name="check-circle" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.footerText}>100% Secure • Verified • Trusted</Text>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  scroll: { flexGrow: 1 },
  header: { padding: theme.spacing.md },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },

  content: { flex: 1, paddingHorizontal: theme.spacing.xl, paddingBottom: theme.spacing.xl },
  title: { ...theme.typography.h1, color: theme.colors.text, textAlign: 'center', marginBottom: theme.spacing.xs },
  subtitle: { ...theme.typography.body, color: theme.colors.textSecondary, textAlign: 'center', marginBottom: theme.spacing.xl },

  form: { marginBottom: theme.spacing.xl },
  inputGroup: { marginBottom: theme.spacing.md },
  label: { ...theme.typography.small, color: theme.colors.textSecondary, marginBottom: theme.spacing.xs },
  inputContainer: { flexDirection: 'row', alignItems: 'center' },
  input: {
    flex: 1,
    height: 52,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text,
    backgroundColor: theme.colors.surfaceCard,
  },
  inputIcon: { position: 'absolute', right: theme.spacing.md },

  trustBadge: {
    flexDirection: 'row',
    backgroundColor: theme.colors.successLight,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.xl,
  },
  trustIcon: { marginRight: theme.spacing.sm, marginTop: 2 },
  trustText: { ...theme.typography.small, color: theme.colors.success, flex: 1, lineHeight: 18 },

  btn: { backgroundColor: theme.colors.primary, height: 56, borderRadius: theme.borderRadius.lg, justifyContent: 'center', alignItems: 'center' },
  btnText: { ...theme.typography.h3, color: theme.colors.white },

  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: theme.spacing.lg },
  footerText: { ...theme.typography.small, color: theme.colors.textSecondary, marginLeft: theme.spacing.sm },
});
