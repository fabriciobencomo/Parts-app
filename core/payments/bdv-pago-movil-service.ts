/**
 * Servicio para la API de Conciliación de Pago Móvil del Banco de Venezuela (BDV)
 * Documentación: API de Conciliación BDV
 */

const BDV_API_URL = process.env.EXPO_PUBLIC_BDV_API_URL || 'https://bdvconciliacionqa.banvenez.com:444/getMovement';
const BDV_API_KEY = process.env.EXPO_PUBLIC_BDV_API_KEY || '96R7T1T5J2134T5YFC2GF15SDFG4BD1Z';

/**
 * Códigos bancarios venezolanos más comunes
 */
export const BANK_CODES = {
  BDV: '0102', // Banco de Venezuela
  MERCANTIL: '0105',
  BANESCO: '0134',
  PROVINCIAL: '0108',
  BOD: '0116',
  EXTERIOR: '0115',
  BICENTENARIO: '0175',
  VENEZUELA: '0104',
  BANCARIBE: '0114',
  BNC: '0191',
} as const;

/**
 * Interfaz para la solicitud de conciliación de pago móvil
 */
export interface PagoMovilRequest {
  cedulaPagador: string;        // Ej: "V27037606"
  telefonoPagador: string;       // Ej: "04127141363"
  telefonoDestino: string;       // Ej: "04127141363"
  referencia: string;            // Ej: "123112313"
  fechaPago: string;             // Formato: "YYYY-MM-DD"
  importe: string;               // Ej: "120.00" (usar punto para decimales)
  bancoOrigen: string;           // Código del banco (4 dígitos)
  reqCed: boolean;               // true solo para BDV-BDV, false en otros casos
}

/**
 * Interfaz para la respuesta exitosa de la API
 */
export interface PagoMovilResponse {
  code: number;
  message: string;
  data: {
    status: string;
    amount: string;
    reason: string;
  } | null;
  status: number;
}

/**
 * Resultado procesado de la validación
 */
export interface PagoMovilValidationResult {
  success: boolean;
  validated: boolean;
  amount?: number;
  reason?: string;
  error?: string;
  code?: number;
}

/**
 * Valida un pago móvil contra la API de Conciliación del BDV
 */
export const validatePagoMovil = async (
  request: PagoMovilRequest
): Promise<PagoMovilValidationResult> => {
  try {
    // Validar que la API Key esté configurada
    if (!BDV_API_KEY || BDV_API_KEY === '96R7T1T5J2134T5YFC2GF15SDFG4BD1Z') {
      console.warn('⚠️ BDV API Key no configurada o usando valor por defecto');
    }

    // Validar formato de fecha (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(request.fechaPago)) {
      return {
        success: false,
        validated: false,
        error: 'Formato de fecha inválido. Use YYYY-MM-DD',
      };
    }

    // Validar formato de importe (debe tener punto decimal)
    const importeRegex = /^\d+\.\d{2}$/;
    if (!importeRegex.test(request.importe)) {
      return {
        success: false,
        validated: false,
        error: 'Formato de importe inválido. Use punto para decimales (Ej: 120.00)',
      };
    }

    console.log('🔄 Validando pago móvil con BDV...', {
      referencia: request.referencia,
      importe: request.importe,
      fecha: request.fechaPago,
    });

    const response = await fetch(BDV_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': BDV_API_KEY,
      },
      body: JSON.stringify(request),
    });

    const result: PagoMovilResponse = await response.json();

    console.log('📥 Respuesta BDV:', {
      code: result.code,
      status: result.status,
      message: result.message,
    });

    // Código 1000 = Transacción exitosa
    if (result.code === 1000 && result.data) {
      return {
        success: true,
        validated: true,
        amount: parseFloat(result.data.amount),
        reason: result.data.reason,
        code: result.code,
      };
    }

    // Código 1010 u otros = Error en validación
    return {
      success: true, // La petición fue exitosa
      validated: false, // Pero la transacción no se validó
      error: result.message || 'No se pudo validar el movimiento',
      code: result.code,
    };
  } catch (error: any) {
    console.error('❌ Error validando pago móvil:', error);
    return {
      success: false,
      validated: false,
      error: error.message || 'Error de conexión con el servidor BDV',
    };
  }
};

/**
 * Formatea una cédula venezolana (agrega prefijo si no lo tiene)
 */
export const formatCedula = (cedula: string): string => {
  const cleaned = cedula.trim().toUpperCase();
  
  // Si ya tiene prefijo (V, E, J, G), retornar
  if (/^[VEJG]\d+$/.test(cleaned)) {
    return cleaned;
  }
  
  // Si es solo números, agregar V por defecto
  if (/^\d+$/.test(cleaned)) {
    return `V${cleaned}`;
  }
  
  return cleaned;
};

/**
 * Formatea un número de teléfono venezolano
 */
export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  
  // Si tiene 10 dígitos y no empieza con 0, agregar 0
  if (cleaned.length === 10 && !cleaned.startsWith('0')) {
    return `0${cleaned}`;
  }
  
  // Si tiene 11 dígitos y empieza con 0, está correcto
  if (cleaned.length === 11 && cleaned.startsWith('0')) {
    return cleaned;
  }
  
  return cleaned;
};

/**
 * Formatea un importe para la API (asegura 2 decimales con punto)
 */
export const formatImporte = (amount: number): string => {
  return amount.toFixed(2);
};

/**
 * Formatea una fecha para la API (YYYY-MM-DD)
 */
export const formatFechaPago = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Valida si un código de banco es válido
 */
export const isValidBankCode = (code: string): boolean => {
  return /^\d{4}$/.test(code);
};

/**
 * Obtiene el nombre del banco por su código
 */
export const getBankName = (code: string): string => {
  const banks: Record<string, string> = {
    '0102': 'Banco de Venezuela',
    '0105': 'Banco Mercantil',
    '0134': 'Banesco',
    '0108': 'Banco Provincial',
    '0116': 'Banco Occidental de Descuento',
    '0115': 'Banco Exterior',
    '0175': 'Banco Bicentenario',
    '0104': 'Banco de Venezuela',
    '0114': 'Bancaribe',
    '0191': 'Banco Nacional de Crédito',
  };
  
  return banks[code] || `Banco ${code}`;
};
