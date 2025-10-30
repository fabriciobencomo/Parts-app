import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  Platform,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/presentation/shared/components/ThemedText';
import {
  validatePagoMovil,
  formatCedula,
  formatPhoneNumber,
  formatImporte,
  formatFechaPago,
  BANK_CODES,
  getBankName,
} from '@/core/payments/bdv-pago-movil-service';
import { useCartStore } from '@/presentation/store/useCartStore';
import { useCurrencyConverter } from '@/hooks/useCurrencyConverter';

const PagoMovilScreen = () => {
  const params = useLocalSearchParams();
  const amount = parseFloat(params.amount as string) || 0;
  const orderData = params.orderData ? JSON.parse(params.orderData as string) : null;
  
  const { createOrder, clearError } = useCartStore();
  const { convertToVES, formatVESAmount } = useCurrencyConverter();
  
  const [validating, setValidating] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showBankPicker, setShowBankPicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [formData, setFormData] = useState({
    cedulaPagador: '',
    telefonoPagador: '',
    referencia: '',
    fechaPago: new Date().toISOString().split('T')[0], // YYYY-MM-DD
    bancoOrigen: BANK_CODES.BDV,
  });

  // Lista completa de bancos
  const allBanks = [
    { code: '0102', name: 'Banco de Venezuela' },
    { code: '0104', name: 'Banco Venezolano de Crédito' },
    { code: '0105', name: 'Banco Mercantil' },
    { code: '0108', name: 'Banco Provincial' },
    { code: '0114', name: 'Bancaribe' },
    { code: '0115', name: 'Banco Exterior' },
    { code: '0116', name: 'Banco Occidental de Descuento' },
    { code: '0128', name: 'Banco Caroní' },
    { code: '0134', name: 'Banesco' },
    { code: '0137', name: 'Banco Sofitasa' },
    { code: '0138', name: 'Banco Plaza' },
    { code: '0146', name: 'Banco de la Gente Emprendedora' },
    { code: '0151', name: 'Banco Fondo Común' },
    { code: '0156', name: '100% Banco' },
    { code: '0157', name: 'Banco del Sur' },
    { code: '0163', name: 'Banco del Tesoro' },
    { code: '0166', name: 'Banco Agrícola de Venezuela' },
    { code: '0168', name: 'Bancrecer' },
    { code: '0169', name: 'Mi Banco' },
    { code: '0171', name: 'Banco Activo' },
    { code: '0172', name: 'Bancamiga' },
    { code: '0173', name: 'Banco Internacional de Desarrollo' },
    { code: '0174', name: 'Banplus' },
    { code: '0175', name: 'Banco Bicentenario' },
    { code: '0177', name: 'Banco de la Fuerza Armada Nacional Bolivariana' },
    { code: '0191', name: 'Banco Nacional de Crédito' },
  ];

  const telefonoDestino = process.env.EXPO_PUBLIC_BDV_TELEFONO_DESTINO || '04124145811';
  const rifDestino = process.env.EXPO_PUBLIC_BDV_RIF || 'J501214891';
  const amountVES = convertToVES(amount);

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      if (Platform.OS === 'web') {
        await navigator.clipboard.writeText(text);
      } else {
        await Clipboard.setStringAsync(text);
      }
      Alert.alert('✓ Copiado', `${label} copiado al portapapeles`);
    } catch (error) {
      console.error('Error al copiar:', error);
      Alert.alert('Error', 'No se pudo copiar al portapapeles');
    }
  };

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (date) {
      setSelectedDate(date);
      const formattedDate = date.toISOString().split('T')[0];
      updateField('fechaPago', formattedDate);
    }
  };

  const handleBankSelect = (bankCode: string) => {
    updateField('bancoOrigen', bankCode);
    setShowBankPicker(false);
  };

  const getSelectedBankName = () => {
    const bank = allBanks.find(b => b.code === formData.bancoOrigen);
    return bank ? bank.name : 'Seleccionar banco';
  };

  const handleValidatePayment = async () => {
    // Validaciones básicas
    if (!formData.cedulaPagador.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu cédula');
      return;
    }

    if (!formData.telefonoPagador.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu teléfono');
      return;
    }

    if (!formData.referencia.trim()) {
      Alert.alert('Error', 'Por favor ingresa el número de referencia del pago');
      return;
    }

    setValidating(true);
    clearError();

    try {
      // Formatear datos
      const request = {
        cedulaPagador: formatCedula(formData.cedulaPagador),
        telefonoPagador: formatPhoneNumber(formData.telefonoPagador),
        telefonoDestino: formatPhoneNumber(telefonoDestino),
        referencia: formData.referencia.trim(),
        fechaPago: formData.fechaPago,
        importe: formatImporte(amountVES),
        bancoOrigen: formData.bancoOrigen,
        reqCed: formData.bancoOrigen === BANK_CODES.BDV, // true solo para BDV-BDV
      };

      console.log('🔄 Validando pago móvil...', request);

      const result = await validatePagoMovil(request);

      if (result.validated) {
        // Pago validado exitosamente
        Alert.alert(
          '✅ Pago Validado',
          `El pago de ${formatVESAmount(result.amount || amountVES)} ha sido validado exitosamente.\n\n${result.reason}`,
          [
            {
              text: 'Continuar',
              onPress: async () => {
                // Crear la orden con los datos del pago móvil
                const orderResult = await createOrder({
                  ...orderData,
                  paymentMethod: 'pago_movil',
                  notes: `${orderData.notes || ''}\n\nPago Móvil Validado:\nReferencia: ${formData.referencia}\nCédula: ${request.cedulaPagador}\nTeléfono: ${request.telefonoPagador}\nBanco: ${getBankName(formData.bancoOrigen)}\nMonto: ${formatVESAmount(amountVES)}`,
                });

                if (orderResult.success && orderResult.order) {
                  Alert.alert(
                    '¡Orden creada exitosamente!',
                    `Tu orden #${orderResult.order.id.slice(-8)} ha sido creada y el pago ha sido validado.`,
                    [
                      {
                        text: 'Ver mis órdenes',
                        onPress: () => router.replace('/(parts-app)/(tabs)/orders'),
                      },
                      {
                        text: 'Continuar comprando',
                        onPress: () => router.replace('/(parts-app)/(tabs)/shop'),
                      },
                    ]
                  );
                }
              },
            },
          ]
        );
      } else {
        // Pago no validado
        Alert.alert(
          '❌ Pago No Validado',
          result.error || 'No se pudo validar el pago móvil. Verifica los datos e intenta nuevamente.',
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error al validar el pago');
    } finally {
      setValidating(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <ThemedText type="title" style={styles.title}>Validar Pago Móvil</ThemedText>
      </View>

      {/* Información del pago */}
      <View style={styles.section}>
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color="#3B82F6" />
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoTitle}>Realiza tu pago móvil</Text>
            <Text style={styles.infoText}>
              Transfiere {formatVESAmount(amountVES)} al RIF {rifDestino} - Teléfono {telefonoDestino} (Banco de Venezuela). Luego ingresa los datos de la transacción para validar tu pago.
            </Text>
          </View>
        </View>
      </View>

      {/* Monto a pagar */}
      <View style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Monto a Pagar</ThemedText>
        <View style={styles.amountCard}>
          <Text style={styles.amountUSD}>${amount.toFixed(2)} USD</Text>
          <Text style={styles.amountVES}>{formatVESAmount(amountVES)}</Text>
          <Text style={styles.amountNote}>Monto en bolívares según tasa BCV</Text>
        </View>
      </View>

      {/* Datos del teléfono destino */}
      <View style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Datos de Destino</ThemedText>
        <View style={styles.destinationCard}>
          <TouchableOpacity
            style={styles.copyableRow}
            onPress={() => copyToClipboard(telefonoDestino, 'Teléfono')}
            activeOpacity={0.7}
          >
            <View style={styles.destinationRow}>
              <Ionicons name="phone-portrait" size={20} color="#10B981" />
              <Text style={styles.destinationLabel}>Teléfono:</Text>
              <Text style={styles.destinationValue}>{telefonoDestino}</Text>
            </View>
            <Ionicons name="copy-outline" size={20} color="#10B981" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.copyableRow}
            onPress={() => copyToClipboard(rifDestino, 'RIF')}
            activeOpacity={0.7}
          >
            <View style={styles.destinationRow}>
              <Ionicons name="document-text" size={20} color="#10B981" />
              <Text style={styles.destinationLabel}>RIF:</Text>
              <Text style={styles.destinationValue}>{rifDestino}</Text>
            </View>
            <Ionicons name="copy-outline" size={20} color="#10B981" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.copyableRow}
            onPress={() => copyToClipboard(formatVESAmount(amountVES), 'Monto')}
            activeOpacity={0.7}
          >
            <View style={styles.destinationRow}>
              <Ionicons name="cash" size={20} color="#10B981" />
              <Text style={styles.destinationLabel}>Monto:</Text>
              <Text style={styles.destinationValue}>{formatVESAmount(amountVES)}</Text>
            </View>
            <Ionicons name="copy-outline" size={20} color="#10B981" />
          </TouchableOpacity>

          <View style={styles.destinationRow}>
            <Ionicons name="business" size={20} color="#10B981" />
            <Text style={styles.destinationLabel}>Banco:</Text>
            <Text style={styles.destinationValue}>Banco de Venezuela</Text>
          </View>
        </View>
      </View>

      {/* Formulario de validación */}
      <View style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Datos de tu Pago Móvil
        </ThemedText>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Cédula del Pagador *</Text>
          <TextInput
            style={styles.textInput}
            placeholder="V12345678 o 12345678"
            value={formData.cedulaPagador}
            onChangeText={(value) => updateField('cedulaPagador', value)}
            keyboardType="default"
            autoCapitalize="characters"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Teléfono del Pagador *</Text>
          <TextInput
            style={styles.textInput}
            placeholder="04127141363"
            value={formData.telefonoPagador}
            onChangeText={(value) => updateField('telefonoPagador', value)}
            keyboardType="phone-pad"
            maxLength={11}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Número de Referencia *</Text>
          <TextInput
            style={styles.textInput}
            placeholder="123456789"
            value={formData.referencia}
            onChangeText={(value) => updateField('referencia', value)}
            keyboardType="number-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Fecha del Pago *</Text>
          <TouchableOpacity
            style={styles.selectorButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar-outline" size={20} color="#6B7280" />
            <Text style={styles.selectorButtonText}>{formData.fechaPago}</Text>
            <Ionicons name="chevron-down" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* DatePicker Modal */}
        {showDatePicker && Platform.OS === 'android' && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
            minimumDate={new Date(2025, 0, 1)}
            maximumDate={new Date()}
            locale="es-ES"
            themeVariant="light"
          />
        )}
        {showDatePicker && Platform.OS === 'ios' && (
          <Modal
            visible={showDatePicker}
            transparent
            animationType="slide"
            onRequestClose={() => setShowDatePicker(false)}
          >
            <TouchableOpacity
              style={styles.datePickerModalOverlay}
              activeOpacity={1}
              onPress={() => setShowDatePicker(false)}
            >
              <View style={styles.datePickerModalContent}>
                <View style={styles.datePickerHeader}>
                  <Text style={styles.datePickerTitle}>Seleccionar Fecha</Text>
                  <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                    <Text style={styles.datePickerDone}>Listo</Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display="spinner"
                  onChange={handleDateChange}
                  minimumDate={new Date(2025, 0, 1)}
                  maximumDate={new Date()}
                  locale="es-ES"
                  themeVariant="light"
                  textColor="#1F2937"
                  style={styles.iosDatePicker}
                />
              </View>
            </TouchableOpacity>
          </Modal>
        )}

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Banco Origen *</Text>
          <TouchableOpacity
            style={styles.selectorButton}
            onPress={() => setShowBankPicker(true)}
          >
            <Ionicons name="business-outline" size={20} color="#6B7280" />
            <Text style={styles.selectorButtonText}>{getSelectedBankName()}</Text>
            <Ionicons name="chevron-down" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Bank Picker Modal */}
        <Modal
          visible={showBankPicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowBankPicker(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowBankPicker(false)}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Seleccionar Banco</Text>
                <TouchableOpacity onPress={() => setShowBankPicker(false)}>
                  <Ionicons name="close" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.bankList}>
                {allBanks.map((bank) => (
                  <TouchableOpacity
                    key={bank.code}
                    style={[
                      styles.bankListItem,
                      formData.bancoOrigen === bank.code && styles.bankListItemSelected,
                    ]}
                    onPress={() => handleBankSelect(bank.code)}
                  >
                    <View style={styles.bankListItemContent}>
                      <Text style={styles.bankListItemName}>{bank.name}</Text>
                      <Text style={styles.bankListItemCode}>{bank.code}</Text>
                    </View>
                    {formData.bancoOrigen === bank.code && (
                      <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>
      </View>

      {/* Botón de validar */}
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={[styles.validateButton, validating && styles.validateButtonDisabled]}
          onPress={handleValidatePayment}
          disabled={validating}
        >
          {validating ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
              <Text style={styles.validateButtonText}>Validar Pago Móvil</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default PagoMovilScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    marginRight: 16,
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  infoTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E3A8A',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 20,
  },
  amountCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#10B981',
  },
  amountUSD: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  amountVES: {
    fontSize: 32,
    fontWeight: '700',
    color: '#10B981',
    marginBottom: 4,
  },
  amountNote: {
    fontSize: 12,
    color: '#6B7280',
  },
  destinationCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
  },
  copyableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  destinationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  destinationLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginLeft: 8,
    marginRight: 8,
  },
  destinationValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#FFFFFF',
  },
  inputHint: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  bankSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  bankOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  bankOptionSelected: {
    borderColor: '#10B981',
    backgroundColor: '#D1FAE5',
  },
  bankOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  bankOptionTextSelected: {
    color: '#10B981',
    fontWeight: '600',
  },
  actionContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  validateButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  validateButtonDisabled: {
    backgroundColor: '#9CA3AF',
    opacity: 0.7,
  },
  validateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  selectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    gap: 8,
  },
  selectorButtonText: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  bankList: {
    maxHeight: 400,
  },
  bankListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  bankListItemSelected: {
    backgroundColor: '#F0FDF4',
  },
  bankListItemContent: {
    flex: 1,
  },
  bankListItemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 4,
  },
  bankListItemCode: {
    fontSize: 14,
    color: '#6B7280',
  },
  datePickerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  datePickerModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  datePickerDone: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
  },
  iosDatePicker: {
    backgroundColor: '#FFFFFF',
    height: 200,
  },
});
