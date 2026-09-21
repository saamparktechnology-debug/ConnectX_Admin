import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import useAuthStore from '../../store/useAuthStore';
import api from '../../services/api';
import { COLORS, SPACING, RADIUS } from '../../utils/constants';

export default function EditProfileScreen() {
  const { user, updateUser } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [occupation, setOccupation] = useState(user?.occupation || '');
  const [company, setCompany] = useState(user?.company || '');
  const [school, setSchool] = useState(user?.school || '');
  const [city, setCity] = useState(user?.city || '');
  const [state, setState] = useState(user?.state || '');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSave = async () => {
    if (!name.trim()) return Alert.alert('Error', 'Name is required');
    setLoading(true);
    try {
      await api.put('/user/profile', { name, bio, occupation, company, school, city, state });
      updateUser({ name, bio, occupation, company, school, city, state });
      Alert.alert('Success', 'Profile updated');
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    } finally { setLoading(false); }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={{ fontSize: 28, fontWeight: '700', color: COLORS.textPrimary, lineHeight: 44 }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Edit Profile</Text>
        <TouchableOpacity onPress={handleSave} disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : (
            <Text style={styles.saveButton}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Info</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Name *</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Your name" placeholderTextColor={COLORS.textMuted} />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Bio</Text>
            <TextInput style={[styles.input, styles.textArea]} value={bio} onChangeText={setBio}
              placeholder="Tell about yourself" placeholderTextColor={COLORS.textMuted} multiline numberOfLines={4} />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>City</Text>
            <TextInput style={styles.input} value={city} onChangeText={setCity} placeholder="Your city" placeholderTextColor={COLORS.textMuted} />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>State</Text>
            <TextInput style={styles.input} value={state} onChangeText={setState} placeholder="Your state" placeholderTextColor={COLORS.textMuted} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Work & Education</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Occupation</Text>
            <TextInput style={styles.input} value={occupation} onChangeText={setOccupation} placeholder="Job title" placeholderTextColor={COLORS.textMuted} />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Company</Text>
            <TextInput style={styles.input} value={company} onChangeText={setCompany} placeholder="Company name" placeholderTextColor={COLORS.textMuted} />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>School</Text>
            <TextInput style={styles.input} value={school} onChangeText={setSchool} placeholder="School/University" placeholderTextColor={COLORS.textMuted} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 50, paddingHorizontal: SPACING.lg, paddingBottom: SPACING.md,
    backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  backButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  saveButton: { color: COLORS.primary, fontSize: 16, fontWeight: '700' },
  content: { paddingBottom: 40 },
  section: { paddingHorizontal: SPACING.lg, marginBottom: SPACING.xl, marginTop: SPACING.lg },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, marginBottom: SPACING.md },
  inputGroup: { marginBottom: SPACING.md },
  label: { fontSize: 13, color: COLORS.textMuted, marginBottom: 6 },
  input: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.md, paddingHorizontal: 16,
    paddingVertical: 12, color: COLORS.textPrimary, fontSize: 15, borderWidth: 1, borderColor: COLORS.border,
  },
  textArea: { height: 100, textAlignVertical: 'top' },
});
