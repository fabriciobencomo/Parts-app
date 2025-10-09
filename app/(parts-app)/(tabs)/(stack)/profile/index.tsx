import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '@/presentation/store/useAuthStore';
import { updateUser } from '@/core/auth/actions/auth-actions';
import { useLocationStore } from '@/presentation/store/useLocationStore';

const ProfileScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, updateUserData } = useAuthStore();
  const { selectedLocation: globalLocation, clearSelectedLocation } = useLocationStore();
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    address: user?.address || '',
    direction: user?.direction || '',
  });
  
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
    address: string;
    zone: string;
  } | null>(null);

  // Actualizar formData cuando el usuario cambie
  useEffect(() => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phoneNumber: user?.phoneNumber || '',
      address: user?.address || '',
      direction: user?.direction || '',
    });
    
    // Si el usuario ya tiene coordenadas guardadas, establecer la ubicación seleccionada
    if (user?.latitude && user?.longitude) {
      setSelectedLocation({
        latitude: user.latitude,
        longitude: user.longitude,
        address: user.direction || 'Ubicación guardada',
        zone: 'Zona guardada'
      });
    }
  }, [user]);

  // Detectar cuando se regresa del mapa con una ubicación seleccionada
  useEffect(() => {
    if (globalLocation) {
      setFormData(prev => ({
        ...prev,
        direction: globalLocation.address
      }));
      setSelectedLocation(globalLocation);
      // Limpiar la ubicación global después de usarla
      clearSelectedLocation();
    }
  }, [globalLocation, clearSelectedLocation]);

  const handleSave = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const updatedUser = await updateUser(user.id, {
        name: formData.name,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        direction: formData.direction,
        latitude: selectedLocation?.latitude,
        longitude: selectedLocation?.longitude,
      });

      if (updatedUser) {
        updateUserData(updatedUser);
        setIsEditing(false);
        Alert.alert('Éxito', 'Perfil actualizado correctamente');
      } else {
        Alert.alert('Error', 'No se pudo actualizar el perfil');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'No se pudo actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phoneNumber: user?.phoneNumber || '',
      address: user?.address || '',
      direction: user?.direction || '',
    });
    setIsEditing(false);
  };

  const handleLocationPress = () => {
    router.push('/(parts-app)/(tabs)/(stack)/profile/map');
  };

  const formatUserName = (fullName?: string) => {
    if (!fullName) return 'Usuario';
    const firstName = fullName.split(' ')[0];
    return firstName.length > 15 ? firstName.substring(0, 15) + '...' : firstName;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={["#0A2E73", "#1976D2"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 16 }]}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name={Platform.OS === 'ios' ? 'chevron-back' : 'arrow-back'} size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mi Perfil</Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => {
              console.log('Edit button pressed, isEditing:', isEditing);
              isEditing ? handleSave() : setIsEditing(true);
            }}
            disabled={loading}
          >
            <Ionicons 
              name={isEditing ? 'checkmark' : 'create-outline'} 
              size={24} 
              color="#fff" 
            />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Info */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {formatUserName(user?.name).charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text style={styles.userName}>{formatUserName(user?.name)}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>
        </View>

        {/* Form Fields */}
        <View style={styles.formSection}>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Nombre completo</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={formData.name}
              onChangeText={(text) => {
                console.log('Name changed:', text, 'isEditing:', isEditing);
                setFormData(prev => ({ ...prev, name: text }));
              }}
              editable={isEditing}
              placeholder="Ingresa tu nombre completo"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Email</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={formData.email}
              onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
              editable={isEditing}
              placeholder="Ingresa tu email"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Teléfono</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={formData.phoneNumber}
              onChangeText={(text) => setFormData(prev => ({ ...prev, phoneNumber: text }))}
              editable={isEditing}
              placeholder="Ingresa tu teléfono"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Dirección</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={formData.address}
              onChangeText={(text) => setFormData(prev => ({ ...prev, address: text }))}
              editable={isEditing}
              placeholder="Ingresa tu dirección"
              placeholderTextColor="#999"
              multiline
              numberOfLines={2}
            />
          </View>

          {/* Location Selector */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Ubicación en el mapa</Text>
            <TouchableOpacity 
              style={[styles.locationButton, !isEditing && styles.locationButtonDisabled]}
              onPress={handleLocationPress}
              disabled={!isEditing}
            >
              <Ionicons name="location-outline" size={20} color={isEditing ? "#1976D2" : "#999"} />
              <Text style={[styles.locationButtonText, !isEditing && styles.locationButtonTextDisabled]}>
                {selectedLocation ? 'Ubicación seleccionada' : 'Seleccionar ubicación'}
              </Text>
              <Ionicons name="chevron-forward" size={16} color={isEditing ? "#1976D2" : "#999"} />
            </TouchableOpacity>
            {formData.direction && (
              <Text style={styles.locationText}>{formData.direction}</Text>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        {isEditing && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, loading && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={loading}
            >
              <Text style={styles.saveButtonText}>
                {loading ? 'Guardando...' : 'Guardar'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  backButton: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  editButton: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  profileSection: {
    backgroundColor: 'white',
    marginTop: -16,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingVertical: 32,
  },
  avatarContainer: {
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1976D2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: 'white',
    fontSize: 32,
    fontWeight: '600',
  },
  userName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#001845',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
  },
  formSection: {
    backgroundColor: 'white',
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  fieldGroup: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#001845',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#001845',
    backgroundColor: 'white',
  },
  inputDisabled: {
    backgroundColor: '#F8F9FA',
    color: '#666',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
  },
  locationButtonDisabled: {
    backgroundColor: '#F8F9FA',
  },
  locationButtonText: {
    flex: 1,
    fontSize: 16,
    color: '#001845',
    marginLeft: 8,
  },
  locationButtonTextDisabled: {
    color: '#666',
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#1976D2',
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#E5E5E5',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

export default ProfileScreen;
