import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, TextInput, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SearchablePicker({ 
  visible, 
  onClose, 
  data, 
  onSelect, 
  placeholder = 'Select...', 
  title = 'Select Item',
  searchPlaceholder = 'Search...'
}) {
  const [search, setSearch] = useState('');

  const filteredData = data.filter(item => 
    item.label.toLowerCase().includes(search.toLowerCase()) ||
    (item.sub && item.sub.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={s.overlay}>
        <SafeAreaView style={s.modalContainer}>
          <View style={s.header}>
            <Text style={s.title}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={s.closeBtn}>
              <Ionicons name="close" size={24} color="#f1f5f9" />
            </TouchableOpacity>
          </View>

          <View style={s.searchContainer}>
            <Ionicons name="search" size={20} color="#64748b" />
            <TextInput
              style={s.searchInput}
              placeholder={searchPlaceholder}
              placeholderTextColor="#64748b"
              value={search}
              onChangeText={setSearch}
            />
          </View>

          <FlatList
            data={filteredData}
            keyExtractor={item => item.value}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={s.item} 
                onPress={() => {
                  onSelect(item);
                  setSearch('');
                  onClose();
                }}
              >
                <View>
                  <Text style={s.itemLabel}>{item.label}</Text>
                  {item.sub && <Text style={s.itemSub}>{item.sub}</Text>}
                </View>
                <Ionicons name="chevron-forward" size={18} color="#334155" />
              </TouchableOpacity>
            )}
            contentContainerStyle={{ paddingBottom: 20 }}
            ListEmptyComponent={<Text style={s.empty}>No results found</Text>}
          />
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.8)' },
  modalContainer: { flex: 1, backgroundColor: '#0f172a', marginTop: 100, borderTopLeftRadius: 24, borderTopRightRadius: 24, borderWidth: 1, borderColor: '#334155' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#1e293b' },
  title: { fontSize: 18, fontWeight: '700', color: '#f1f5f9' },
  closeBtn: { padding: 4 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e293b', margin: 16, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1, borderColor: '#334155' },
  searchInput: { flex: 1, paddingVertical: 12, paddingHorizontal: 8, color: '#f1f5f9', fontSize: 15 },
  item: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#1e293b' },
  itemLabel: { fontSize: 16, color: '#f1f5f9', fontWeight: '500' },
  itemSub: { fontSize: 13, color: '#94a3b8', marginTop: 2 },
  empty: { textAlign: 'center', color: '#64748b', marginTop: 40, fontSize: 15 },
});
