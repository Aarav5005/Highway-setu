import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { theme } from '../../theme';
import { useNavigation } from '@react-navigation/native';

export default function RegisterScreen() {
  const { user, setUser } = useAuthStore();
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(false);

  const onSubmit = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setUser({ ...user!, name: 'Test User' }); 
    }, 1000);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Complete Profile</Text>
      
      {user?.role === 'driver' && (
        <View style={styles.form}>
          <TextInput placeholder="Full Name" style={styles.input} />
          <TextInput placeholder="Truck Number (e.g. PB10AB1234)" style={styles.input} autoCapitalize="characters" />
          <TextInput placeholder="Driving Licence Number" style={styles.input} />
          <TextInput placeholder="Emergency Contact Name" style={styles.input} />
          <TextInput placeholder="Emergency Contact Phone" style={styles.input} keyboardType="phone-pad" />
        </View>
      )}

      {user?.role === 'dhaba_owner' && (
        <View style={styles.form}>
          <TextInput placeholder="Dhaba Name" style={styles.input} />
          <TextInput placeholder="Highway Name (e.g. NH-44)" style={styles.input} />
          <TextInput placeholder="FSSAI Number" style={styles.input} />
        </View>
      )}

      {user?.role === 'mechanic' && (
        <View style={styles.form}>
          <TextInput placeholder="Shop Name" style={styles.input} />
          <TextInput placeholder="Services (e.g. Tyre, Engine)" style={styles.input} />
        </View>
      )}

      <TouchableOpacity style={styles.btn} onPress={onSubmit} disabled={loading}>
        <Text style={styles.btnText}>{loading ? 'Loading...' : 'Submit'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: theme.colors.white, padding: theme.spacing.lg, paddingTop: 60 },
  title: { ...theme.typography.h2, color: theme.colors.text, marginBottom: theme.spacing.lg },
  form: { marginBottom: theme.spacing.xl },
  input: { height: 50, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.borderRadius.sm, paddingHorizontal: theme.spacing.md, marginBottom: theme.spacing.md },
  btn: { backgroundColor: theme.colors.primary, height: 50, borderRadius: theme.borderRadius.md, justifyContent: 'center', alignItems: 'center' },
  btnText: { ...theme.typography.h3, color: theme.colors.white }
});
