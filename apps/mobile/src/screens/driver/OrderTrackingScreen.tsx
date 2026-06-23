import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../../theme';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function OrderTrackingScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { orderId } = route.params;

  const [statusIndex, setStatusIndex] = useState(0);
  const statuses = ['Pending', 'Accepted', 'Preparing', 'Ready', 'Picked Up'];

  useEffect(() => {
    const timer = setInterval(() => {
      setStatusIndex(prev => {
        if (prev < statuses.length - 1) return prev + 1;
        clearInterval(timer);
        return prev;
      });
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const isPickedUp = statusIndex === 4;

  if (isPickedUp) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.success, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{fontSize: 80}}>🎉</Text>
        <Text style={[styles.title, { color: theme.colors.white, marginTop: 20 }]}>Order Picked Up!</Text>
        <Text style={[styles.sub, { color: theme.colors.white }]}>You earned 10 loyalty points!</Text>
        <TouchableOpacity style={styles.btnWhite} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.btnWhiteTxt}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}><Text style={styles.backBtn}>✕</Text></TouchableOpacity>
        <Text style={styles.title}>Order #{orderId.substring(0,6)}</Text>
      </View>

      <View style={styles.pipeline}>
        {statuses.map((st, i) => (
          <View key={i} style={styles.statusRow}>
            <View style={[styles.dot, i <= statusIndex ? styles.dotActive : null]} />
            <Text style={[styles.statusTxt, i === statusIndex ? styles.statusTxtActive : null]}>{st}</Text>
            {i < statuses.length - 1 && <View style={[styles.line, i < statusIndex ? styles.lineActive : null]} />}
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Sher-e-Punjab Dhaba</Text>
        <Text style={styles.cardSub}>📞 +91 98765 43210 (Tap to call)</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, padding: theme.spacing.lg },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.xl, marginTop: theme.spacing.xl },
  backBtn: { fontSize: 24, marginRight: theme.spacing.md, color: theme.colors.text },
  title: { ...theme.typography.h2, color: theme.colors.text },
  sub: { ...theme.typography.body, color: theme.colors.textSecondary },
  pipeline: { backgroundColor: theme.colors.white, padding: theme.spacing.xl, borderRadius: theme.borderRadius.md, marginBottom: theme.spacing.lg },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  dot: { width: 16, height: 16, borderRadius: 8, backgroundColor: theme.colors.border, marginRight: theme.spacing.md, zIndex: 2 },
  dotActive: { backgroundColor: theme.colors.primary },
  statusTxt: { ...theme.typography.body, color: theme.colors.textSecondary },
  statusTxtActive: { color: theme.colors.primary, fontWeight: 'bold', fontSize: 18 },
  line: { position: 'absolute', left: 7, top: 16, bottom: -24, width: 2, backgroundColor: theme.colors.border, zIndex: 1 },
  lineActive: { backgroundColor: theme.colors.primary },
  card: { backgroundColor: theme.colors.white, padding: theme.spacing.md, borderRadius: theme.borderRadius.md },
  cardTitle: { ...theme.typography.h3, color: theme.colors.text, marginBottom: 4 },
  cardSub: { ...theme.typography.body, color: theme.colors.primary },
  btnWhite: { backgroundColor: theme.colors.white, paddingHorizontal: 24, paddingVertical: 12, borderRadius: theme.borderRadius.md, marginTop: 40 },
  btnWhiteTxt: { ...theme.typography.h3, color: theme.colors.success }
});
