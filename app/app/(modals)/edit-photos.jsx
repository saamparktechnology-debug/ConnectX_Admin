import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, Dimensions, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import api from '../../services/api';
import { COLORS, SPACING, RADIUS } from '../../utils/constants';

const { width } = Dimensions.get('window');
const PHOTO_SIZE = (width - SPACING.xl * 2 - SPACING.sm * 2) / 3;

export default function EditPhotosScreen() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  useEffect(() => { fetchPhotos(); }, []);

  const fetchPhotos = async () => {
    try {
      const res = await api.get('/user/profile');
      setPhotos(res.data.data.photos || []);
    } catch (error) {
      Alert.alert('Error', 'Failed to load photos');
    } finally { setLoading(false); }
  };

  const handleAddPhoto = async () => {
    if (photos.length >= 9) {
      Alert.alert('Limit reached', 'Maximum 9 photos allowed');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });
    if (!result.canceled) {
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append('photos', {
          uri: result.assets[0].uri,
          type: 'image/jpeg',
          name: 'photo.jpg'
        });
        await api.post('/user/photos', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        await fetchPhotos();
        Alert.alert('Success', 'Photo uploaded');
      } catch (error) { Alert.alert('Error', 'Failed to upload photo'); }
      finally { setUploading(false); }
    }
  };

  const handleDeletePhoto = (index) => {
    Alert.alert('Delete Photo', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await api.delete(`/user/photos/${index}`);
          setPhotos(photos.filter((_, i) => i !== index));
          Alert.alert('Success', 'Photo deleted');
        } catch (error) { Alert.alert('Error', 'Failed to delete photo'); }
      }}
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="close" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Manage Photos</Text>
        <Text style={styles.count}>{photos.length}/9</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ flex: 1, justifyContent: 'center' }} />
      ) : (
        <View style={styles.photoGrid}>
          {photos.map((photo, index) => (
            <View key={index} style={styles.photoContainer}>
              <Image source={{ uri: photo }} style={styles.photo} />
              {index === 0 && (
                <View style={styles.primaryBadge}>
                  <Text style={styles.primaryText}>Main</Text>
                </View>
              )}
              <TouchableOpacity onPress={() => handleDeletePhoto(index)} style={styles.deleteButton}>
                <Ionicons name="close-circle" size={24} color={COLORS.error} />
              </TouchableOpacity>
            </View>
          ))}
          {photos.length < 9 && (
            <TouchableOpacity style={styles.addButton} onPress={handleAddPhoto} disabled={uploading}>
              {uploading ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : (
                <>
                  <Ionicons name="camera-outline" size={32} color={COLORS.textMuted} />
                  <Text style={styles.addText}>Add Photo</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      )}
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
  backButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  count: { color: COLORS.textMuted, fontSize: 14 },
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: SPACING.lg, gap: SPACING.sm },
  photoContainer: { position: 'relative', width: PHOTO_SIZE, height: PHOTO_SIZE * 1.33 },
  photo: { width: '100%', height: '100%', borderRadius: RADIUS.md, backgroundColor: COLORS.border },
  primaryBadge: {
    position: 'absolute', bottom: 4, left: 4,
    backgroundColor: COLORS.primary, paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  primaryText: { color: COLORS.white, fontSize: 10, fontWeight: '700' },
  deleteButton: { position: 'absolute', top: -6, right: -6 },
  addButton: {
    width: PHOTO_SIZE, height: PHOTO_SIZE * 1.33, borderRadius: RADIUS.md,
    borderWidth: 2, borderStyle: 'dashed', borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center', gap: 4,
    backgroundColor: COLORS.white,
  },
  addText: { color: COLORS.textMuted, fontSize: 12 },
});
