import React, { useRef, useState } from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface VenezuelanPhoneInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
}

const VenezuelanPhoneInput: React.FC<VenezuelanPhoneInputProps> = ({
  value,
  onChangeText,
  placeholder = "XXXXXXXXXX",
  error
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  // Validación laxa: acepta 10 u 11 dígitos (el backend normaliza)
  const validatePhone = (phone: string): boolean => {
    const digits = phone.replace(/\D/g, '');
    return /^\d{10,11}$/.test(digits);
  };

  const handleTextChange = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, 11);
    onChangeText(digits);
  };

  const isValid = value ? validatePhone(value) : true;

  return (
    <View style={styles.container}>
      <View
        style={[
        styles.inputWrapper,
        isFocused && styles.inputWrapperFocused,
        error && styles.inputWrapperError,
        !isValid && value && styles.inputWrapperInvalid
        ]}
        onStartShouldSetResponder={() => true}
        onResponderGrant={() => inputRef.current?.focus()}
      >
        <Ionicons 
          name="call-outline" 
          size={20} 
          color={error || (!isValid && value) ? "#EF4444" : isFocused ? "#4A90E2" : "#6B7280"} 
          style={styles.inputIcon} 
        />
        <Text style={styles.countryCode}>+58</Text>
        <TextInput
          ref={inputRef}
          style={[styles.textInput, { color: '#1F2937' }]}
          placeholder={placeholder}
          placeholderTextColor="#A0A0A0"
          value={value}
          onChangeText={handleTextChange}
          keyboardType="phone-pad"
          maxLength={11}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autoComplete="tel"
          textContentType="telephoneNumber"
          autoCorrect={false}
          importantForAutofill="yes"
          returnKeyType="done"
        />
      </View>
      
      {/* Mensaje de ayuda */}
      {!value && isFocused && (
        <Text style={styles.helpText}>
          Ingresa 10 u 11 dígitos. Ej: 4141234567 o 04141234567
        </Text>
      )}
      
      {/* Error de validación */}
      {!isValid && value && (
        <Text style={styles.errorText}>
          Ingresa 10 u 11 dígitos numéricos
        </Text>
      )}
      
      {/* Error personalizado */}
      {error && (
        <Text style={styles.errorText}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  inputWrapperFocused: {
    borderColor: '#4A90E2',
    backgroundColor: '#FFFFFF',
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputWrapperError: {
    borderColor: '#EF4444',
  },
  inputWrapperInvalid: {
    borderColor: '#EF4444',
  },
  inputIcon: {
    marginRight: 12,
  },
  countryCode: {
    fontSize: 16,
    color: '#4A90E2',
    fontWeight: '600',
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
  },
  helpText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    marginLeft: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
    marginLeft: 4,
  },
});

export default VenezuelanPhoneInput;
