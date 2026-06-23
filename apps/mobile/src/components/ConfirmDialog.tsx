import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../theme';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

export default function ConfirmDialog({ visible, title, message, onConfirm, onCancel, confirmText = 'Confirm', cancelText = 'Cancel' }: ConfirmDialogProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.btnRow}>
            <TouchableOpacity style={[styles.btn, styles.cancelBtn]} onPress={onCancel}>
              <Text style={styles.cancelTxt}>{cancelText}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.confirmBtn]} onPress={onConfirm}>
              <Text style={styles.confirmTxt}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: theme.spacing.lg },
  card: { backgroundColor: theme.colors.white, borderRadius: theme.borderRadius.md, padding: theme.spacing.lg, width: '100%', elevation: 10 },
  title: { ...theme.typography.h2, color: theme.colors.text, marginBottom: theme.spacing.sm },
  message: { ...theme.typography.body, color: theme.colors.textSecondary, marginBottom: theme.spacing.xl },
  btnRow: { flexDirection: 'row', justifyContent: 'flex-end' },
  btn: { paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.md, borderRadius: theme.borderRadius.sm, marginLeft: theme.spacing.md },
  cancelBtn: { backgroundColor: theme.colors.background },
  confirmBtn: { backgroundColor: theme.colors.primary },
  cancelTxt: { ...theme.typography.body, color: theme.colors.text, fontWeight: 'bold' },
  confirmTxt: { ...theme.typography.body, color: theme.colors.white, fontWeight: 'bold' }
});
