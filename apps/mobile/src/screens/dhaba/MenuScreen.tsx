import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { theme } from '../../theme';
import BottomSheet from '../../components/BottomSheet';

export default function MenuScreen() {
  const [activeTab, setActiveTab] = useState('All');
  const tabs = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Drinks'];
  
  const [menuItems, setMenuItems] = useState([
    { id: '1', name: 'Dal Makhani', price: 120, is_available: true, category: 'Lunch' },
    { id: '2', name: 'Aloo Paratha', price: 50, is_available: true, category: 'Breakfast' },
    { id: '3', name: 'Lassi', price: 60, is_available: false, category: 'Drinks' },
  ]);

  const [sheetVisible, setSheetVisible] = useState(false);
  const [form, setForm] = useState({ name: '', price: '' });

  const toggleAvailability = (id: string) => {
    setMenuItems(prev => prev.map(item => item.id === id ? { ...item, is_available: !item.is_available } : item));
  };

  const filteredItems = activeTab === 'All' ? menuItems : menuItems.filter(i => i.category === activeTab);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Menu</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setSheetVisible(true)}>
          <Text style={styles.addTxt}>+ Add Item</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroller}>
        {tabs.map(tab => (
          <TouchableOpacity key={tab} style={[styles.tab, activeTab === tab && styles.tabActive]} onPress={() => setActiveTab(tab)}>
            <Text style={[styles.tabTxt, activeTab === tab && styles.tabTxtActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.list}>
        {filteredItems.map(item => (
          <View key={item.id} style={styles.itemCard}>
            <View style={styles.itemImg}><Text style={{color: '#999'}}>Img</Text></View>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemPrice}>₹{item.price}</Text>
            </View>
            <TouchableOpacity 
              style={[styles.toggleBtn, item.is_available ? styles.toggleOn : styles.toggleOff]}
              onPress={() => toggleAvailability(item.id)}
            >
              <Text style={styles.toggleTxt}>{item.is_available ? 'Available' : 'Sold Out'}</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      <BottomSheet visible={sheetVisible} onClose={() => setSheetVisible(false)} title="Add Menu Item">
        <Text style={styles.label}>Item Name (English)*</Text>
        <TextInput style={styles.input} value={form.name} onChangeText={t => setForm({...form, name: t})} placeholder="e.g. Dal Makhani" />
        
        <Text style={styles.label}>Price (₹)*</Text>
        <TextInput style={styles.input} value={form.price} onChangeText={t => setForm({...form, price: t})} keyboardType="number-pad" placeholder="150" />
        
        <TouchableOpacity style={styles.saveBtn} onPress={() => setSheetVisible(false)}>
          <Text style={styles.saveTxt}>Save Item</Text>
        </TouchableOpacity>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: theme.spacing.lg, backgroundColor: theme.colors.white },
  title: { ...theme.typography.h2, color: theme.colors.text },
  addBtn: { backgroundColor: theme.colors.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: theme.borderRadius.sm },
  addTxt: { ...theme.typography.small, color: theme.colors.white, fontWeight: 'bold' },
  tabsScroller: { maxHeight: 50, borderBottomWidth: 1, borderBottomColor: theme.colors.border, backgroundColor: theme.colors.white },
  tab: { paddingHorizontal: theme.spacing.lg, justifyContent: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: theme.colors.primary },
  tabTxt: { ...theme.typography.body, color: theme.colors.textSecondary },
  tabTxtActive: { color: theme.colors.primary, fontWeight: 'bold' },
  list: { padding: theme.spacing.md },
  itemCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.white, padding: theme.spacing.md, borderRadius: theme.borderRadius.md, marginBottom: theme.spacing.sm, elevation: 1 },
  itemImg: { width: 50, height: 50, backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.sm, justifyContent: 'center', alignItems: 'center', marginRight: theme.spacing.md },
  itemInfo: { flex: 1 },
  itemName: { ...theme.typography.body, color: theme.colors.text, fontWeight: 'bold' },
  itemPrice: { ...theme.typography.body, color: theme.colors.textSecondary },
  toggleBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: theme.borderRadius.sm },
  toggleOn: { backgroundColor: '#e6f4ea' },
  toggleOff: { backgroundColor: '#ffebe6' },
  toggleTxt: { ...theme.typography.tiny, fontWeight: 'bold', color: theme.colors.text },
  label: { ...theme.typography.small, color: theme.colors.textSecondary, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.borderRadius.sm, padding: theme.spacing.md, marginBottom: theme.spacing.lg, fontSize: 16 },
  saveBtn: { backgroundColor: theme.colors.primary, padding: theme.spacing.md, borderRadius: theme.borderRadius.md, alignItems: 'center', marginTop: theme.spacing.md },
  saveTxt: { ...theme.typography.h3, color: theme.colors.white }
});
