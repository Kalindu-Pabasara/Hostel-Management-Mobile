import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform, Image } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import api from '../../api/api';
import CustomAlert from '../../components/CustomAlert';

export default function AdminRoomFormScreen({ route, navigation }) {
  const existingRoom = route.params?.room || null;
  const isEdit       = !!existingRoom;

  const [form, setForm] = useState({
    roomNumber:  existingRoom?.roomNumber  || '',
    type:        existingRoom?.type        || 'Single',
    floor:       existingRoom?.floor?.toString() || '',
    capacity:    existingRoom?.capacity?.toString() || '',
    price:       existingRoom?.price?.toString()    || '',
    description: existingRoom?.description || '',
    amenities:   existingRoom?.amenities?.join(', ') || '',
    status:      existingRoom?.status      || 'available',
  });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading]     = useState(false);
  const [alert, setAlert]         = useState({ visible: false, title: '', message: '', type: 'error' });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const pickImage = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'image/*' });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageFile(result.assets[0]);
      }
    } catch (err) {
      console.log('Picker error:', err);
    }
  };

  const handleSubmit = async () => {
    const { roomNumber, type, floor, capacity, price } = form;
    if (!roomNumber || !type || !floor || !capacity || !price)
      return setAlert({ visible: true, title: 'Error', message: 'Room number, type, floor, capacity and price are required.', type: 'error' });

    setLoading(true);
    try {
      const formData = new FormData();
      Object.keys(form).forEach(k => {
        formData.append(k, form[k]);
      });
      
      if (imageFile) {
        formData.append('image', {
          uri: imageFile.uri,
          name: imageFile.name || 'room.jpg',
          type: imageFile.mimeType || 'image/jpeg'
        });
      }

      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      
      if (isEdit) {
        await api.put(`/rooms/${existingRoom._id}`, formData, config);
        setAlert({ 
          visible: true, 
          title: 'Success', 
          message: 'Room updated!', 
          type: 'success', 
          onClose: () => navigation.goBack() 
        });
      } else {
        await api.post('/rooms', formData, config);
        setAlert({ 
          visible: true, 
          title: 'Success', 
          message: 'Room created!', 
          type: 'success', 
          onClose: () => navigation.goBack() 
        });
      }
    } catch (err) {
      setAlert({ visible: true, title: 'Error', message: err.response?.data?.message || err.message, type: 'error' });
    } finally { setLoading(false); }
  };

  const typeOptions   = ['Single', 'Double', 'Suite'];
  const statusOptions = ['available', 'occupied', 'maintenance'];

  return (
    <KeyboardAvoidingView style={s.wrapper} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
        <Text style={s.heading}>{isEdit ? 'Edit Room' : 'Create New Room'}</Text>

        <Text style={s.label}>Room Image</Text>
        <TouchableOpacity style={s.uploadBtn} onPress={pickImage}>
          {imageFile ? (
            <Image source={{ uri: imageFile.uri }} style={s.previewImg} />
          ) : existingRoom?.image ? (
            <Image source={{ uri: `${api.defaults.baseURL.replace('/api','')}/uploads/rooms/${existingRoom.image}` }} style={s.previewImg} />
          ) : (
            <Text style={s.uploadText}>📎 Select Room Photo</Text>
          )}
        </TouchableOpacity>
        {(imageFile || existingRoom?.image) && (
          <TouchableOpacity onPress={() => setImageFile(null)}>
            <Text style={s.removeText}>Change Image</Text>
          </TouchableOpacity>
        )}

        {/* Room Type selector */}
        <Text style={s.label}>Room Type</Text>
        <View style={s.optRow}>
          {typeOptions.map(t => (
            <TouchableOpacity key={t} style={[s.optBtn, form.type===t && s.optActive]} onPress={() => set('type', t)}>
              <Text style={[s.optText, form.type===t && { color:'#fff' }]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Text fields */}
        {[
          { label:'Room Number', key:'roomNumber', placeholder:'A101', kb:'default' },
          { label:'Floor',       key:'floor',      placeholder:'1',    kb:'numeric' },
          { label:'Capacity (beds)', key:'capacity', placeholder:'2',  kb:'numeric' },
          { label:'Price (LKR/month)', key:'price', placeholder:'15000', kb:'numeric' },
          { label:'Description', key:'description', placeholder:'Spacious room with balcony', kb:'default' },
          { label:'Amenities (comma separated)', key:'amenities', placeholder:'WiFi, AC, Attached Bath', kb:'default' },
        ].map(f => (
          <View key={f.key}>
            <Text style={s.label}>{f.label}</Text>
            <TextInput style={s.input} value={form[f.key]} onChangeText={v => set(f.key, v)}
              placeholder={f.placeholder} placeholderTextColor="#64748b" keyboardType={f.kb} />
          </View>
        ))}

        {/* Status selector (edit only) */}
        {isEdit && <>
          <Text style={s.label}>Status</Text>
          <View style={s.optRow}>
            {statusOptions.map(st => (
              <TouchableOpacity key={st} style={[s.optBtn, form.status===st && s.optActive]} onPress={() => set('status', st)}>
                <Text style={[s.optText, form.status===st && { color:'#fff' }]}>{st}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>}

        <TouchableOpacity style={[s.btn, loading && { opacity: 0.6 }]} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>{isEdit ? '✅ Update Room' : '➕ Create Room'}</Text>}
        </TouchableOpacity>
      </ScrollView>

      <CustomAlert 
        visible={alert.visible} 
        title={alert.title} 
        message={alert.message} 
        type={alert.type} 
        onClose={alert.onClose || (() => setAlert(p => ({ ...p, visible: false })))} 
      />
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  wrapper:  { flex: 1, backgroundColor: '#0f172a' },
  container:{ padding: 20, paddingBottom: 40 },
  heading:  { fontSize: 22, fontWeight: '800', color: '#f1f5f9', marginBottom: 24 },
  label:    { fontSize: 13, color: '#94a3b8', fontWeight: '600', marginBottom: 6 },
  input:    { backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155', borderRadius: 10, padding: 14, color: '#f1f5f9', fontSize: 15, marginBottom: 16 },
  optRow:   { flexDirection: 'row', gap: 8, marginBottom: 16, flexWrap:'wrap' },
  optBtn:   { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#334155' },
  optActive:{ backgroundColor: '#00b4d8', borderColor: '#00b4d8' },
  optText:  { color: '#94a3b8', fontSize: 13, textTransform: 'capitalize' },
  uploadBtn:{ backgroundColor: '#1e293b', borderRadius: 10, borderWidth: 1, borderColor: '#334155', borderStyle: 'dashed', height: 150, justifyContent: 'center', alignItems: 'center', marginBottom: 8, overflow: 'hidden' },
  uploadText:{ color: '#64748b', fontSize: 14 },
  previewImg:{ width: '100%', height: '100%' },
  removeText:{ color: '#00b4d8', fontSize: 13, textAlign: 'right', marginBottom: 16 },
  btn:      { backgroundColor: '#00b4d8', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 12 },
  btnText:  { color: '#fff', fontWeight: '700', fontSize: 16 },
});
