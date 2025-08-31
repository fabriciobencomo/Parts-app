import { View, Text, TextInput, KeyboardAvoidingView, ScrollView, useWindowDimensions, StyleSheet, TouchableOpacity, Alert } from 'react-native'
import React, { useState, useEffect } from 'react'
import { useThemeColor } from '@/hooks/useThemeColor'
import { ThemedText } from '@/presentation/shared/components/ThemedText'
import ThemedButton from '@/presentation/shared/components/ThemedButton'
import { Link, router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useAuthStore } from '@/presentation/store/useAuthStore'

const RegisterScreen = () => {

  const backgroundColor = '#FFFFFF' // White background as requested
  const textColor = useThemeColor({}, 'text')
  const {height, width} = useWindowDimensions();

  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    cedula: '',
    phone: '',
    email: '',
    vehicleInfo: '',
    password: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { register, status } = useAuthStore();

     // Redirect to home if user is already authenticated
   useEffect(() => {
     if (status === 'authenticated') {
       router.replace('/(parts-app)')
     }
   }, [status])

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleContinue = async () => {
    // Basic validation
    if (!formData.fullName || !formData.email || !formData.phone || !formData.password) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
      return;
    }

    if (!formData.email.includes('@')) {
      Alert.alert('Error', 'Por favor ingresa un email válido');
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setIsLoading(true);
    
    try {
      const success = await register({
        ...formData,
        password: formData.password
      });

              if (success) {
          // Navigate directly to home and reset navigation stack
          router.replace('/(parts-app)');
        } else {
        Alert.alert('Error', 'No se pudo crear la cuenta. Intenta nuevamente.');
      }
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un error inesperado');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior='padding' style={{ flex: 1 }}>
      <ScrollView style={[styles.container, { backgroundColor: '#FFFFFF' }]}>
        
        {/* Header */}
        <View style={styles.header}>
          <ThemedText type='title' style={styles.title}>Regístrate.</ThemedText>
          <ThemedText style={styles.subtitle}>Usaremos tus datos para crear tu usuario</ThemedText>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          
          {/* Full Name Input */}
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={20} color="#4A90E2" style={styles.inputIcon} />
              <TextInput
                style={[styles.textInput, { color: '#1F2937' }]}
                placeholder="Nombre y Apellido"
                placeholderTextColor="#A0A0A0"
                value={formData.fullName}
                onChangeText={(value) => updateFormData('fullName', value)}
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* Cedula Input
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Ionicons name="card-outline" size={20} color="#4A90E2" style={styles.inputIcon} />
              <TextInput
                style={[styles.textInput, { color: '#1F2937' }]}
                placeholder="Cédula"
                placeholderTextColor="#A0A0A0"
                value={formData.cedula}
                onChangeText={(value) => updateFormData('cedula', value)}
                keyboardType="numeric"
              />
            </View>
          </View> */}

          {/* Phone Input */}
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Ionicons name="call-outline" size={20} color="#4A90E2" style={styles.inputIcon} />
              <TextInput
                style={[styles.textInput, { color: '#1F2937' }]}
                placeholder="Número de teléfono"
                placeholderTextColor="#A0A0A0"
                value={formData.phone}
                onChangeText={(value) => updateFormData('phone', value)}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color="#4A90E2" style={styles.inputIcon} />
              <TextInput
                style={[styles.textInput, { color: '#1F2937' }]}
                placeholder="Correo"
                placeholderTextColor="#A0A0A0"
                value={formData.email}
                onChangeText={(value) => updateFormData('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color="#4A90E2" style={styles.inputIcon} />
              <TextInput
                style={[styles.textInput, { color: '#1F2937' }]}
                placeholder="Contraseña"
                placeholderTextColor="#A0A0A0"
                value={formData.password}
                onChangeText={(value) => updateFormData('password', value)}
                secureTextEntry={!showPassword}
                autoComplete="password"
              />
              <TouchableOpacity 
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
              >
                <Ionicons 
                  name={showPassword ? "eye-outline" : "eye-off-outline"} 
                  size={20} 
                  color="#A0A0A0" 
                />
              </TouchableOpacity>
            </View>
          </View>

        </View>

        {/* Continue Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.continueButton, isLoading && styles.continueButtonDisabled]}
            onPress={handleContinue}
            disabled={isLoading}
          >
            <Text style={styles.continueButtonText}>
              {isLoading ? 'Registrando...' : 'Continuar'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Login Link */}
        <View style={styles.loginLinkContainer}>
          <Text style={styles.loginLinkText}>
            ¿Ya tienes cuenta?{' '}
          </Text>
          <TouchableOpacity onPress={() => router.push('/auth/login')}>
            <Text style={styles.loginLink}>Inicia sesión</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Spacer */}
        <View style={{ height: 50 }} />
        
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    marginTop: 100,
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1E3A8A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '400',
  },
  formContainer: {
    gap: 16,
  },
  inputContainer: {
    marginBottom: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '400',
    color: '#1F2937',
  },
  eyeButton: {
    padding: 4,
    marginLeft: 8,
  },
  buttonContainer: {
    marginTop: 40,
    paddingHorizontal: 0,
  },
  continueButton: {
    backgroundColor: '#1E3A8A',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  continueButtonDisabled: {
    backgroundColor: '#94A3B8',
    opacity: 0.7,
  },
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  loginLinkText: {
    fontSize: 14,
    color: '#64748B',
  },
  loginLink: {
    fontSize: 14,
    color: '#1E3A8A',
    fontWeight: '600',
  },
});

export default RegisterScreen