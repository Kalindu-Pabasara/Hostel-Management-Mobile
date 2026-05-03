import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function EmptyState({ icon = 'document-text-outline', title = 'No Data Found', message = 'There are no items to display right now.' }) {
  return (
    <View style={s.container}>
      <View style={s.iconCircle}>
        <Ionicons name={icon} size={40} color="#64748b" />
      </View>
      <Text style={s.title}>{title}</Text>
      <Text style={s.message}>{message}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, marginTop: 40 },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#1e293b', justifyContent: 'center', alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: '#334155' },
  title: { fontSize: 18, fontWeight: '700', color: '#f1f5f9', marginBottom: 8 },
  message: { fontSize: 14, color: '#64748b', textAlign: 'center', lineHeight: 20 },
});
