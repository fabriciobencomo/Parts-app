import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  KeyboardAvoidingView,
  ScrollView,
  useWindowDimensions,
  ActivityIndicator 
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/presentation/shared/components/ThemedText';
import ThemedButton from '@/presentation/shared/components/ThemedButton';
import { useAuthStore } from '@/presentation/store/useAuthStore';

const VerifySMSScreen = () => {
  const { height, width } = useWindowDimensions();
  const params = useLocalSearchParams();
  
  // Obtener solo el teléfono desde parámetros
  const registrationData = {
    phone: params.phone as string,
  } as const;

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [countdown, setCountdown] = useState(600);
  const [canResend, setCanResend] = useState(false);
  const [isCodeVerified, setIsCodeVerified] = useState(false);
  const [codeValidationStatus, setCodeValidationStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid'>('idle');
  // No se usa token en flujo SMS
  
  const inputRefs = useRef<TextInput[]>([]);
  const { sendSMSCode, verifySMSCode } = useAuthStore();

  useEffect(() => {
    // Iniciar countdown para reenvío
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Validar código automáticamente cuando esté completo
  useEffect(() => {
    const verificationCode = code.join('');
    
    if (verificationCode.length === 6) {
      // Siempre validar cuando hay 6 dígitos, sin importar el estado previo
      validateCodeOnly(verificationCode);
    } else if (verificationCode.length < 6) {
      // Resetear estado cuando el código está incompleto
      setCodeValidationStatus('idle');
      setIsCodeVerified(false);
    }
  }, [code]);

  const handleCodeChange = (value: string, index: number) => {
    // Detectar si es un paste de código completo (iOS auto-fill)
    if (value.length > 1) {
      const pastedCode = value.replace(/\D/g, '').slice(0, 6);
      if (pastedCode.length === 6) {
        // Auto-fill completo desde SMS
        const newCodeArray = pastedCode.split('');
        setCode(newCodeArray);
        // Focus al último input
        inputRefs.current[5]?.focus();
        return;
      }
    }

    // Solo permitir números
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus al siguiente input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !code[index] && index > 0) {
      // Focus al input anterior si está vacío y se presiona backspace
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Función para validar solo el código sin registrar
  const validateCodeOnly = async (verificationCode: string) => {
    setCodeValidationStatus('checking');
    
    try {
      const resp = await verifySMSCode(registrationData.phone, verificationCode);
      if (resp.valid) {
        setCodeValidationStatus('valid');
        setIsCodeVerified(true);
      } else {
        setCodeValidationStatus('invalid');
        setIsCodeVerified(false);
      }
    } catch (error) {
      console.error('Code validation error:', error);
      setCodeValidationStatus('invalid');
      setIsCodeVerified(false);
    }
  };

  const handleGoToCompleteForm = () => {
    router.replace({
      pathname: '/auth/complete-registration',
      params: {
        phone: registrationData.phone,
      },
    });
  };

  const handleRetryCode = () => {
    setCode(['', '', '', '', '', '']);
    setIsCodeVerified(false);
    setCodeValidationStatus('idle');
    // no-op
    inputRefs.current[0]?.focus();
  };

  const handleResendCode = async () => {
    setResendLoading(true);
    
    try {
      const waResult = await sendSMSCode(registrationData.phone);
      
      if (waResult.success) {
        Alert.alert('Código Reenviado', 'Hemos enviado un nuevo código a tu teléfono');
        // Reiniciar countdown (10 minutos)
        setCountdown(600);
        setCanResend(false);
        
        // Limpiar código actual y estado de verificación
        setCode(['', '', '', '', '', '']);
        setIsCodeVerified(false);
        setCodeValidationStatus('idle');
        inputRefs.current[0]?.focus();
      } else {
        // Manejar diferentes tipos de errores
        const error = waResult.error;
        
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
          Alert.alert('Error', 'No se pudo reenviar el código. Intenta nuevamente.');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un error al reenviar el código');
      console.error('Resend error:', error);
    } finally {
      setResendLoading(false);
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  const formatPhoneDisplay = (phone: string) => {
    return `+58 ${phone}`;
  };

  return (
    <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
      <ScrollView style={[styles.container, { backgroundColor: '#FFFFFF' }]}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          
          <View style={styles.iconContainer}>
            <Ionicons name="chatbubble-outline" size={48} color="#4A90E2" />
          </View>
          
          <ThemedText type="title" style={styles.title}>
            Verificación SMS
          </ThemedText>
          
          <ThemedText style={styles.subtitle}>
            Hemos enviado un código de 6 dígitos a{'\n'}
            <Text style={styles.phoneNumber}>{formatPhoneDisplay(registrationData.phone)}</Text>
          </ThemedText>
        </View>

        {/* Code Input */}
        <View style={styles.codeContainer}>
          <View style={styles.codeInputRow}>
            {code.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  if (ref) inputRefs.current[index] = ref;
                }}
                style={[
                  styles.codeInput,
                  digit && styles.codeInputFilled,
                  codeValidationStatus === 'checking' && styles.codeInputChecking,
                  codeValidationStatus === 'valid' && styles.codeInputValid,
                  codeValidationStatus === 'invalid' && styles.codeInputInvalid
                ]}
                value={digit}
                onChangeText={(value) => handleCodeChange(value, index)}
                onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                keyboardType="numeric"
                maxLength={6} // Permitir paste de código completo
                textAlign="center"
                autoFocus={index === 0}
                textContentType="oneTimeCode" // iOS auto-fill hint
                autoComplete="sms-otp" // Android auto-fill hint
              />
            ))}
          </View>
        </View>

        {/* Code Status */}
        {codeValidationStatus !== 'idle' && (
          <View style={styles.statusContainer}>
            {codeValidationStatus === 'checking' && (
              <View style={styles.statusRow}>
                <ActivityIndicator size="small" color="#4A90E2" />
                <Text style={styles.statusText}>Verificando código...</Text>
              </View>
            )}
            {codeValidationStatus === 'valid' && (
              <View style={styles.statusRow}>
                <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
                <Text style={[styles.statusText, styles.statusTextValid]}>¡Código correcto!</Text>
              </View>
            )}
            {codeValidationStatus === 'invalid' && (
              <View style={styles.statusRow}>
                <Ionicons name="close-circle" size={20} color="#EF4444" />
                <Text style={[styles.statusText, styles.statusTextInvalid]}>Código incorrecto</Text>
              </View>
            )}
          </View>
        )}

        {/* Actions */}
        <View style={styles.actionsContainer}>
          
          {/* Continue to Complete Form - Show when code is verified */}
          {isCodeVerified && (
            <TouchableOpacity 
              onPress={handleGoToCompleteForm}
              style={[styles.continueButton]}
            >
              <Text style={styles.continueButtonText}>Continuar</Text>
            </TouchableOpacity>
          )}

          {/* Retry Button - Show when code is invalid */}
          {codeValidationStatus === 'invalid' && (
            <TouchableOpacity 
              onPress={handleRetryCode}
              style={styles.retryButton}
            >
              <Text style={styles.retryButtonText}>Intentar otro código</Text>
            </TouchableOpacity>
          )}

          {/* Resend Code - Show when not verified yet */}
          {!isCodeVerified && (
            <View style={styles.resendContainer}>
              {canResend ? (
                <TouchableOpacity 
                  onPress={handleResendCode} 
                  disabled={resendLoading}
                  style={styles.resendButton}
                >
                  <Text style={styles.resendButtonText}>
                    {resendLoading ? 'Reenviando...' : 'Reenviar código'}
                  </Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.countdownText}>
                  Reenviar código en {countdown}s
                </Text>
              )}
            </View>
          )}

          {/* Help Text */}
          <Text style={styles.helpText}>
            {isCodeVerified 
              ? 'Tu teléfono ha sido verificado. Continúa para completar tus datos.'
              : codeValidationStatus === 'invalid'
                ? 'Verifica el código recibido por SMS e intenta nuevamente.'
                : '¿No recibiste el código? Verifica que el número de teléfono sea correcto (formato 0XXXXXXXXXX) y que tengas señal.'
            }
          </Text>
          
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    alignItems: 'center',
    marginBottom: 40,
  },
  backButton: {
    position: 'absolute',
    left: 24,
    top: 60,
    padding: 8,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  phoneNumber: {
    fontWeight: '600',
    color: '#4A90E2',
  },
  codeContainer: {
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  codeInputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  codeInput: {
    width: 45,
    height: 55,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
    backgroundColor: '#F8F9FA',
  },
  codeInputFilled: {
    borderColor: '#4A90E2',
    backgroundColor: '#FFFFFF',
  },
  codeInputChecking: {
    borderColor: '#F59E0B',
    backgroundColor: '#FFFBEB',
  },
  codeInputValid: {
    borderColor: '#22C55E',
    backgroundColor: '#F0FDF4',
  },
  codeInputInvalid: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  actionsContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  statusContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    alignItems: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
  },
  statusTextValid: {
    color: '#22C55E',
  },
  statusTextInvalid: {
    color: '#EF4444',
  },
  actionButton: {
    marginBottom: 16,
  },
  confirmButton: {
    backgroundColor: '#22C55E',
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    marginBottom: 16,
  },
  retryButtonText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  resendButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  resendButtonText: {
    fontSize: 16,
    color: '#4A90E2',
    fontWeight: '600',
  },
  countdownText: {
    fontSize: 16,
    color: '#6B7280',
  },
  helpText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  continueButton: {
    backgroundColor: '#1E3A8A',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginTop: 20,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default VerifySMSScreen;
