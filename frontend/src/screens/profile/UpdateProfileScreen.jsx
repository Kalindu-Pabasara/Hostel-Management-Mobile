import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/api';
import CustomAlert from '../../components/CustomAlert';
import { Ionicons } from '@expo/vector-icons';

export default function UpdateProfileScreen({ navigation }) {
  const { user, setUser } = useAuth();
  const [phone, setPhone] = useState(user?.phone || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ visible: false, title: '', message: '', type: 'error' });
  const [showPassword, setShowPassword] = useState(false);

  const handleUpdate = async () => {
    if (password && password !== confirmPassword) {
      return setAlert({ visible: true, title: 'Error', message: 'Passwords do not match.', type: 'error' });
    }

    setLoading(true);
    try {
      const res = await api.patch('/auth/profile', { phone, password: password || undefined });
      setUser(res.data.user); // Update local context
      setAlert({ 
        visible: true, 
        title: 'Success', 
        message: 'Profile updated successfully!', 
        type: 'success', 
        onClose: () => navigation.goBack() 
      });
    } catch (err) {
      setAlert({ visible: true, title: 'Update Failed', message: err.response?.data?.message || err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={s.wrapper} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.container}>
        <Text style={s.title}>Update Profile</Text>
        <Text style={s.subtitle}>Modify your contact details or change your password.</Text>

        <View style={s.inputBox}>
          <Text style={s.label}>Phone Number</Text>
          <View style={s.inputWrapper}>
            <Ionicons name="call-outline" size={20} color="#64748b" style={s.icon} />
            <TextInput 
              style={s.input} 
              value={phone} 
              onChangeText={setPhone} 
              placeholder="07XXXXXXXX" 
              placeholderTextColor="#64748b" 
              keyboardType="phone-pad" 
            />
          </View>
        </View>

        <View style={s.divider} />

        <View style={s.inputBox}>
          <Text style={s.label}>New Password (leave blank to keep current)</Text>
          <View style={s.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={20} color="#64748b" style={s.icon} />
            <TextInput 
              style={s.input} 
              value={password} 
              onChangeText={setPassword} 
              placeholder="••••••••" 
              placeholderTextColor="#64748b" 
              secureTextEntry={!showPassword} 
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#64748b" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={s.inputBox}>
          <Text style={s.label}>Confirm New Password</Text>
          <View style={s.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={20} color="#64748b" style={s.icon} />
            <TextInput 
              style={s.input} 
              value={confirmPassword} 
              onChangeText={setConfirmPassword} 
              placeholder="••••••••" 
              placeholderTextColor="#64748b" 
              secureTextEntry={!showPassword} 
            />
          </View>
        </View>

        <TouchableOpacity style={[s.btn, loading && { opacity: 0.7 }]} onPress={handleUpdate} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Save Changes</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={s.cancelBtn} onPress={() => navigation.goBack()}>
          <Text style={s.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>

      <CustomAlert 
        visible={alert.visible} title={alert.title} 
        message={alert.message} type={alert.type} 
        onClose={alert.onClose || (() => setAlert(p => ({ ...p, visible: false })))} 
      />
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#0f172a' },
  container: { padding: 24 },
  title: { fontSize: 24, fontWeight: '800', color: '#f1f5f9', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#94a3b8', marginBottom: 32 },
  inputBox: { marginBottom: 20 },
  label: { fontSize: 13, color: '#94a3b8', fontWeight: '600', marginBottom: 8 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155', borderRadius: 12, paddingHorizontal: 12 },
  icon: { marginRight: 8 },
  input: { flex: 1, paddingVertical: 14, color: '#f1f5f9', fontSize: 15 },
  divider: { height: 1, backgroundColor: '#1e293b', marginVertical: 12 },
  btn: { backgroundColor: '#00b4d8', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 24 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  cancelBtn: { marginTop: 16, padding: 12, alignItems: 'center' },
  cancelText: { color: '#64748b', fontSize: 15 },
});
