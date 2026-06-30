import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity,  Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme } from '../../theme';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';

export default function TripHistoryScreen() {
  const navigation = useNavigation<any>();

  const trips = [
    { id: 't1', origin: 'Delhi', dest: 'Jaipur', date: '12 Oct, 2023', dist: '280 km', status: 'Completed', earnings: '₹ 4,500' },
    { id: 't2', origin: 'Jaipur', dest: 'Ahmedabad', date: '15 Oct, 2023', dist: '680 km', status: 'Completed', earnings: '₹ 12,000' },
    { id: 't3', origin: 'Ahmedabad', dest: 'Mumbai', date: '18 Oct, 2023', dist: '520 km', status: 'Completed', earnings: '₹ 9,500' },
  ];

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.tripCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.dateTxt}>{item.date}</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusTxt}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.routeRow}>
        <View style={styles.routeCol}>
          <Text style={styles.cityTxt}>{item.origin}</Text>
        </View>
        <FeatherIcon name="arrow-right" size={20} color={theme.colors.textSecondary} style={{marginHorizontal: 16}} />
        <View style={styles.routeCol}>
          <Text style={styles.cityTxt}>{item.dest}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.footerRow}>
        <View style={styles.statBox}>
          <FeatherIcon name="map" size={16} color={theme.colors.textSecondary} />
          <Text style={styles.statTxt}>{item.dist}</Text>
        </View>
        <View style={styles.statBox}>
          <FeatherIcon name="dollar-sign" size={16} color={theme.colors.success} />
          <Text style={[styles.statTxt, {color: theme.colors.success, fontWeight: 'bold'}]}>{item.earnings}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={{backgroundColor: theme.colors.white}}>
        <View style={styles.header}>
          <Text style={styles.title}>Trip History</Text>
        </View>
      </SafeAreaView>

      <FlatList
        data={trips}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { padding: theme.spacing.md, backgroundColor: theme.colors.white, borderBottomWidth: 1, borderBottomColor: theme.colors.borderLight },
  title: { ...theme.typography.h2, color: theme.colors.text },

  listContent: { padding: theme.spacing.md },
  tripCard: { backgroundColor: theme.colors.white, borderRadius: theme.borderRadius.lg, padding: theme.spacing.lg, marginBottom: theme.spacing.md, ...theme.shadows.sm, borderWidth: 1, borderColor: theme.colors.borderLight },

  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.md },
  dateTxt: { ...theme.typography.small, color: theme.colors.textSecondary },
  statusBadge: { backgroundColor: 'rgba(34, 197, 94, 0.1)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  statusTxt: { ...theme.typography.small, color: theme.colors.success, fontWeight: 'bold' },

  routeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.md },
  routeCol: { flex: 1 },
  cityTxt: { ...theme.typography.h3, color: theme.colors.text },

  divider: { height: 1, backgroundColor: theme.colors.borderLight, marginBottom: theme.spacing.sm },

  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statBox: { flexDirection: 'row', alignItems: 'center' },
  statTxt: { ...theme.typography.body, color: theme.colors.textSecondary, marginLeft: 6 },
});
