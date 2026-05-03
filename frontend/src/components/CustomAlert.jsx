import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function CustomAlert({ visible, title, message, onClose, onConfirm, showCancel = false, type = 'error', confirmText = 'OK', cancelText = 'CANCEL' }) {
  const isError = type === 'error';
  const iconName = type === 'warning' ? 'warning' : (isError ? 'alert-circle' : 'checkmark-circle');
  const color = type === 'warning' ? '#f59e0b' : (isError ? '#ef4444' : '#22c55e');

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={s.overlay}>
        <View style={s.box}>
          <View style={[s.iconWrapper, { backgroundColor: color + '20' }]}>
            <Ionicons name={iconName} size={40} color={color} />
          </View>
          <Text style={s.title}>{title}</Text>
          <Text style={s.message}>{message}</Text>
          
          {showCancel ? (
            <View style={s.btnRow}>
              <TouchableOpacity style={[s.btn, s.cancelBtn]} onPress={onClose}>
                <Text style={s.cancelText}>{cancelText}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.btn, s.confirmBtn, { backgroundColor: color }]} onPress={onConfirm || onClose}>
                <Text style={s.btnText}>{confirmText}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={[s.btn, { backgroundColor: color }]} onPress={onClose}>
              <Text style={s.btnText}>{confirmText}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.8)',
    justifyContent: 'center', alignItems: 'center', padding: 20
  },
  box: {
    width: '100%', maxWidth: 340, backgroundColor: '#1e293b',
    borderRadius: 20, padding: 24, alignItems: 'center',
    borderWidth: 1, borderColor: '#334155', elevation: 5
  },
  iconWrapper: {
    width: 64, height: 64, borderRadius: 32,
    justifyContent: 'center', alignItems: 'center', marginBottom: 16
  },
  title: { fontSize: 20, fontWeight: 'bold', color: '#f8fafc', marginBottom: 8, textAlign: 'center' },
  message: { fontSize: 14, color: '#94a3b8', textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  btnRow: { flexDirection: 'row', width: '100%', gap: 12 },
  btn: { width: '100%', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  cancelBtn: { backgroundColor: 'transparent', flex: 1, width: 'auto' },
  confirmBtn: { flex: 1, width: 'auto' },
  cancelText: { color: '#00b4d8', fontSize: 16, fontWeight: 'bold' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
