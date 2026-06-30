import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { theme } from '../theme';

interface PhotoUploadSectionProps {
  photos: string[];
  rolePrimary: string;
  onUpload: (formData: FormData) => Promise<void>;
  onDelete: (photoUrl: string) => Promise<void>;
}

export default function PhotoUploadSection({ photos = [], rolePrimary, onUpload, onDelete }: PhotoUploadSectionProps) {
  const [loading, setLoading] = useState(false);

  const handleAddPhoto = async () => {
    if (photos.length >= 5) {
      Alert.alert('Limit Reached', 'You can upload a maximum of 5 photos.');
      return;
    }

    const result = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 5 - photos.length,
    });

    if (result.didCancel || !result.assets || result.assets.length === 0) {
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      result.assets.forEach((asset) => {
        formData.append('photos', {
          uri: asset.uri,
          name: asset.fileName || 'photo.jpg',
          type: asset.type || 'image/jpeg',
        } as any);
      });

      await onUpload(formData);
    } catch (e) {
      console.error(e);
      Alert.alert('Upload Failed', 'There was an error uploading your photos.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (url: string) => {
    Alert.alert('Delete Photo', 'Are you sure you want to delete this photo?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          try {
            await onDelete(url);
          } catch (e) {
            console.error(e);
            Alert.alert('Error', 'Failed to delete photo.');
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Photos</Text>
        <Text style={styles.subtitle}>{photos.length}/5</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {photos.map((url, idx) => (
          <View key={idx} style={styles.photoContainer}>
            <Image source={{ uri: url }} style={styles.photo} />
            <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(url)}>
              <FeatherIcon name="x" size={16} color={theme.colors.white} />
            </TouchableOpacity>
          </View>
        ))}
        {photos.length < 5 && (
          <TouchableOpacity style={[styles.addBtn, { borderColor: rolePrimary }]} onPress={handleAddPhoto}>
            {loading ? (
              <ActivityIndicator color={rolePrimary} />
            ) : (
              <>
                <FeatherIcon name="camera" size={24} color={rolePrimary} />
                <Text style={[styles.addTxt, { color: rolePrimary }]}>Add Photo</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.md },
  title: { ...theme.typography.h3, color: theme.colors.text },
  subtitle: { ...theme.typography.body, color: theme.colors.textSecondary },
  scroll: { gap: theme.spacing.sm },
  photoContainer: { width: 100, height: 100, borderRadius: theme.borderRadius.md, overflow: 'hidden', position: 'relative' },
  photo: { width: '100%', height: '100%', resizeMode: 'cover' },
  deleteBtn: { position: 'absolute', top: 4, right: 4, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 12, padding: 4 },
  addBtn: { width: 100, height: 100, borderRadius: theme.borderRadius.md, borderWidth: 1, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', backgroundColor: '#fafafa' },
  addTxt: { ...theme.typography.small, marginTop: 8, fontWeight: 'bold' },
});
