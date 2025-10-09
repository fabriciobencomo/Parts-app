import { View, Text, TextInput, KeyboardAvoidingView, ScrollView, useWindowDimensions, StyleSheet, TouchableOpacity, Alert } from 'react-native'
import React, { useState, useEffect } from 'react'
import { useThemeColor } from '@/hooks/useThemeColor'
import { ThemedText } from '@/presentation/shared/components/ThemedText'
import ThemedButton from '@/presentation/shared/components/ThemedButton'
import { Link, router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useAuthStore } from '@/presentation/store/useAuthStore'
import VenezuelanPhoneInput from '@/presentation/shared/components/VenezuelanPhoneInput'

const RegisterScreen = () => {

  const backgroundColor = '#FFFFFF' // White background as requested
  const textColor = useThemeColor({}, 'text')
  const {height, width} = useWindowDimensions();

  // State: only phone for first step
  const [phone, setPhone] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const { status, sendSMSCode } = useAuthStore();

     // Redirect to home if user is already authenticated
   useEffect(() => {
     if (status === 'authenticated') {
       router.replace('/(parts-app)')
     }
   }, [status])

  const updatePhone = (value: string) => {
    setPhone(value);
    if (phoneError) setPhoneError('');
  };

  // Validar formato de teléfono venezolano
  const validateVenezuelanPhone = (phone: string): boolean => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length !== 11 || !cleaned.startsWith('0')) {
      return false;
    }
    
    const validAreaCodes = [
      '212', '424', '414', '426', '416', '251', '252', '253', '254', '255', 
      '258', '259', '261', '262', '263', '264', '265', '266', '267', '268', 
      '269', '271', '272', '273', '274', '275', '276', '277', '278', '281', 
      '282', '283', '284', '285', '286', '287', '288', '291', '292', '293', 
      '294', '295'
    ];
    
    const areaCode = cleaned.slice(1, 4);
    return validAreaCodes.includes(areaCode);
  };

  const handleContinue = async () => {
    // Limpiar errores previos
    setPhoneError('');

    // Aceptar 10 u 11 dígitos y formatear a 0XXX-XXX-XXXX para cumplir con backend actual
    const digits = phone.replace(/\D/g, '');
    if (!(digits.length === 10 || (digits.length === 11 && digits.startsWith('0')))) {
      setPhoneError('Ingresa 10 u 11 dígitos');
      Alert.alert('Error', 'Por favor ingresa un teléfono válido (10 u 11 dígitos)');
      return;
    }
    const withZero = digits.length === 10 ? '0' + digits : digits;
    const formattedPhone = `${withZero.slice(0,1)}${withZero.slice(1,4)}-${withZero.slice(4,7)}-${withZero.slice(7,11)}`;

    setIsLoading(true);
    
    try {
      // Enviar código por SMS antes de proceder con el registro
      const smsResult = await sendSMSCode(formattedPhone);
      
      if (smsResult.success) {
        // Navegar a la página de verificación con el número de teléfono
        router.push({
          pathname: '/auth/verify-sms',
          params: {
            phone: formattedPhone,
          }
        });
      } else {
        // Manejar diferentes tipos de errores
        const error = smsResult.error;
        
        if (error?.statusCode === 429) {
          // Error de demasiados intentos
          const seconds = error.message?.match(/(\d+) segundos?/)?.[1];
          const minutes = seconds ? Math.ceil(parseInt(seconds) / 60) : 0;
          
          Alert.alert(
            'Demasiados Intentos',
            `Has enviado demasiados códigos SMS. Por favor espera ${minutes > 1 ? `${minutes} minutos` : 'un momento'} antes de intentar nuevamente.`,
            [{ text: 'Entendido' }]
          );
        } else {
          // Otros errores
          Alert.alert('Error', error?.message || 'No se pudo enviar el código de verificación. Intenta nuevamente.');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un error al enviar el código de verificación');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior='padding' style={{ flex: 1 }}>
      <ScrollView style={[styles.container, { backgroundColor: '#FFFFFF' }]} keyboardShouldPersistTaps="handled">        
        {/* Header */}
        <View style={styles.header}>
          <ThemedText type='title' style={styles.title}>Regístrate.</ThemedText>
          <ThemedText style={styles.subtitle}>Usaremos tus datos para crear tu usuario</ThemedText>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          <VenezuelanPhoneInput
            value={phone}
            onChangeText={updatePhone}
            placeholder="Número de teléfono"
            error={phoneError}
          />
        </View>

        {/* Continue Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.continueButton, isLoading && styles.continueButtonDisabled]}
            onPress={handleContinue}
            disabled={isLoading}
          >
            <Text style={styles.continueButtonText}>
              {isLoading ? 'Enviando código...' : 'Enviar código'}
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