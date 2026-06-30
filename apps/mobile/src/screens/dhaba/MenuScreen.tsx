import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme } from '../../theme';
import { menuApi } from '../../api/menu';
import { useAuthStore } from '../../store/authStore';
import ErrorBanner from '../../components/ErrorBanner';
import BottomSheet from '../../components/BottomSheet';
import FeatherIcon from 'react-native-vector-icons/Feather';

export default function MenuScreen() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('All');
  const tabs = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Drinks'];

  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [form, setForm] = useState({ name: '', price: '', category: 'Lunch' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    if (!user) {return;}
    try {
      const res = await menuApi.getMenu(user.id);
      setMenuItems(res.data?.data || []);
    } catch(e) {
      console.log('fetchMenu error', e);
    }
  };

  const toggleAvailability = async (id: string, currentStatus: boolean) => {
    try {
      // optimistic update
      setMenuItems(prev => prev.map(item => item.id === id ? { ...item, is_available: !item.is_available } : item));
      await menuApi.updateMenuItem(id, { is_available: !currentStatus });
    } catch(e) {
      // revert on error
      setMenuItems(prev => prev.map(item => item.id === id ? { ...item, is_available: currentStatus } : item));
      setError('Could not update availability');
    }
  };

  const onSave = async () => {
    if (!form.name || !form.price || !user) {
      setError('Please fill in required fields');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await menuApi.createMenuItem({
        dhaba_id: user.id,
        item_name: form.name,
        price: Number(form.price),
        category: form.category,
        is_available: true,
      });
      setForm({ name: '', price: '', category: 'Lunch' });
      setSheetVisible(false);
      fetchMenu();
    } catch(e: any) {
      setError(e?.response?.data?.message || 'Could not add item');
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = activeTab === 'All' ? menuItems : menuItems.filter(i => i.category === activeTab);

  return (
    <View style={styles.container}>
      <SafeAreaView style={{backgroundColor: theme.colors.white}}>
        <View style={styles.header}>
          <Text style={styles.title}>My Menu</Text>
          <TouchableOpacity style={styles.addBtn} onPress={() => setSheetVisible(true)}>
            <FeatherIcon name="plus" size={16} color={theme.colors.white} style={{marginRight: 4}} />
            <Text style={styles.addTxt}>Add Item</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
      <ErrorBanner message={error} />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroller} contentContainerStyle={{paddingHorizontal: theme.spacing.md}}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabTxt, activeTab === tab && styles.tabTxtActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.list}>
        {filteredItems.map(item => (
          <View key={item.id} style={styles.itemCard}>
            <View style={styles.itemImg}>
              <FeatherIcon name="image" size={24} color={theme.colors.textSecondary} />
            </View>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.item_name}</Text>
              <Text style={styles.itemPrice}>₹ {item.price}</Text>
            </View>
            <TouchableOpacity
              style={[styles.toggleBtn, item.is_available ? styles.toggleOn : styles.toggleOff]}
              onPress={() => toggleAvailability(item.id, item.is_available)}
            >
              <Text style={[styles.toggleTxt, item.is_available ? {color: theme.colors.success} : {color: theme.colors.textSecondary}]}>
                {item.is_available ? 'Available' : 'Sold Out'}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      <BottomSheet visible={sheetVisible} onClose={() => setSheetVisible(false)} title="Add Menu Item">
        <Text style={styles.label}>Item Name (English)*</Text>
        <TextInput
          style={styles.input}
          value={form.name}
          onChangeText={t => setForm({...form, name: t})}
          placeholder="e.g. Dal Makhani"
          placeholderTextColor={theme.colors.textSecondary}
        />

        <Text style={styles.label}>Price (₹)*</Text>
        <TextInput
          style={styles.input}
          value={form.price}
          onChangeText={t => setForm({...form, price: t})}
          keyboardType="number-pad"
          placeholder="150"
          placeholderTextColor={theme.colors.textSecondary}
        />

        <Text style={styles.label}>Category</Text>
        <TextInput
          style={styles.input}
          value={form.category}
          onChangeText={t => setForm({...form, category: t})}
          placeholder="e.g. Lunch"
          placeholderTextColor={theme.colors.textSecondary}
        />

        <TouchableOpacity style={styles.saveBtn} onPress={onSave} disabled={loading}>
          <Text style={styles.saveTxt}>{loading ? 'Saving...' : 'Save Item'}</Text>
        </TouchableOpacity>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: theme.spacing.md, backgroundColor: theme.colors.white, borderBottomWidth: 1, borderBottomColor: theme.colors.borderLight },
  title: { ...theme.typography.h2, color: theme.colors.text },
  addBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.dhabaPrimary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  addTxt: { ...theme.typography.body, color: theme.colors.white, fontWeight: 'bold' },

  tabsScroller: { maxHeight: 50, borderBottomWidth: 1, borderBottomColor: theme.colors.borderLight, backgroundColor: theme.colors.white },
  tab: { paddingHorizontal: theme.spacing.md, justifyContent: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: theme.colors.dhabaPrimary },
  tabTxt: { ...theme.typography.body, color: theme.colors.textSecondary },
  tabTxtActive: { color: theme.colors.dhabaPrimary, fontWeight: 'bold' },

  list: { padding: theme.spacing.md },
  itemCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.white, padding: theme.spacing.md, borderRadius: theme.borderRadius.lg, marginBottom: theme.spacing.sm, ...theme.shadows.sm, borderWidth: 1, borderColor: theme.colors.borderLight },
  itemImg: { width: 56, height: 56, backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md, justifyContent: 'center', alignItems: 'center', marginRight: theme.spacing.md },
  itemInfo: { flex: 1 },
  itemName: { ...theme.typography.h3, color: theme.colors.text, marginBottom: 4 },
  itemPrice: { ...theme.typography.body, color: theme.colors.dhabaPrimary, fontWeight: 'bold' },

  toggleBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: 'transparent' },
  toggleOn: { backgroundColor: 'rgba(34, 197, 94, 0.1)', borderColor: 'rgba(34, 197, 94, 0.2)' },
  toggleOff: { backgroundColor: theme.colors.surface, borderColor: theme.colors.borderLight },
  toggleTxt: { ...theme.typography.small, fontWeight: 'bold' },

  label: { ...theme.typography.body, color: theme.colors.text, marginBottom: 8, fontWeight: 'bold' },
  input: { borderWidth: 1, borderColor: theme.colors.borderLight, borderRadius: theme.borderRadius.md, padding: theme.spacing.md, marginBottom: theme.spacing.lg, fontSize: 16, color: theme.colors.text, backgroundColor: theme.colors.surface },
  saveBtn: { backgroundColor: theme.colors.dhabaPrimary, padding: theme.spacing.md, borderRadius: theme.borderRadius.lg, alignItems: 'center', marginTop: theme.spacing.md },
  saveTxt: { ...theme.typography.h3, color: theme.colors.white },
});
