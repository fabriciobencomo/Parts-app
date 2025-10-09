import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, KeyboardAvoidingView, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ThemedText } from '@/presentation/shared/components/ThemedText';
import ThemedButton from '@/presentation/shared/components/ThemedButton';
import { useAuthStore } from '@/presentation/store/useAuthStore';

const CompleteRegistrationScreen = () => {
  const params = useLocalSearchParams();
  const phone = useMemo(() => (params.phone as string) || '', [params]);

  const { register } = useAuthStore();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const updateField = (key: keyof typeof form, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  const validate = () => {
    if (!phone) {
      Alert.alert('Error', 'Falta el teléfono verificado. Regresa y verifica nuevamente.');
      return false;
    }
    if (!form.name || form.name.trim().length < 2) {
      Alert.alert('Error', 'Ingresa tu nombre (mínimo 2 caracteres)');
      return false;
    }
    const emailValid = /.+@.+\..+/.test(form.email);
    if (!emailValid) {
      Alert.alert('Error', 'Ingresa un correo válido');
      return false;
    }
    const passwordValid = form.password.length >= 8 && /[a-z]/.test(form.password) && /[A-Z]/.test(form.password) && /\d/.test(form.password);
    if (!passwordValid) {
      Alert.alert('Error', 'La contraseña debe tener mínimo 8 caracteres e incluir al menos 1 minúscula, 1 mayúscula y 1 número');
      return false;
    }
    return true;
  };

  const onSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const ok = await register({
        fullName: form.name,
        email: form.email,
        password: form.password,
        phone: phone,
      });

      if (ok) {
        Alert.alert('¡Registro completado!', 'Tu cuenta ha sido creada exitosamente.');
        router.replace('/(parts-app)');
      } else {
        Alert.alert('Error', 'No se pudo crear la cuenta. Intenta nuevamente.');
      }
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Ocurrió un error al completar el registro');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
      <ScrollView style={[styles.container, { backgroundColor: '#FFFFFF' }]}
        contentContainerStyle={{ paddingBottom: 40 }}>

        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>Completa tu registro</ThemedText>
          <ThemedText style={styles.subtitle}>Ingresa tus datos para crear tu cuenta</ThemedText>
        </View>

        <View style={styles.form}>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Nombre y Apellido</Text>
            <TextInput
              style={styles.input}
              placeholder="Nombre y Apellido"
              placeholderTextColor="#A0A0A0"
              value={form.name}
              onChangeText={(v) => updateField('name', v)}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Correo</Text>
            <TextInput
              style={styles.input}
              placeholder="correo@ejemplo.com"
              placeholderTextColor="#A0A0A0"
              value={form.email}
              onChangeText={(v) => updateField('email', v)}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Contraseña</Text>
            <TextInput
              style={styles.input}
              placeholder="Contraseña"
              placeholderTextColor="#A0A0A0"
              value={form.password}
              onChangeText={(v) => updateField('password', v)}
              secureTextEntry
              autoComplete="password"
            />
            <Text style={styles.hint}>Mín. 8 caracteres, 1 minúscula, 1 mayúscula y 1 número</Text>
          </View>

        </View>

        <View style={styles.actions}>
          <TouchableOpacity 
            onPress={onSubmit} 
            disabled={submitting}
            style={[styles.completeButton, submitting && styles.completeButtonDisabled]}
          >
            <Text style={styles.completeButtonText}>
              {submitting ? 'Creando cuenta...' : 'Completar registro'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default CompleteRegistrationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    marginTop: 80,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E3A8A',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    color: '#64748B',
  },
  form: {
    marginTop: 16,
    gap: 16,
  },
  inputWrapper: {
    gap: 8,
  },
  inputLabel: {
    color: '#334155',
    fontSize: 14,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#FFFFFF',
  },
  hint: {
    fontSize: 12,
    color: '#6B7280',
  },
  actions: {
    marginTop: 24,
    alignItems: 'center',
  },
  completeButton: {
    backgroundColor: '#1E3A8A',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  completeButtonDisabled: {
    backgroundColor: '#94A3B8',
    opacity: 0.7,
  },
});
