import React, { useState } from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  View, 
  Alert,
  ActivityIndicator,
  ViewStyle,
  TextStyle 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAddToCart } from '../hooks/useCart';
import { router } from 'expo-router';

interface AddToCartButtonProps {
  productId: string;
  quantity?: number;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  showIcon?: boolean;
  text?: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'primary' | 'secondary' | 'outline';
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  productId,
  quantity = 1,
  style,
  textStyle,
  disabled = false,
  showIcon = true,
  text = 'Agregar',
  size = 'medium',
  variant = 'primary',
  onSuccess,
  onError,
}) => {
  const { 
    addToCart, 
    isLoading, 
    isInCart, 
    quantity: cartQuantity, 
    error,
    clearError 
  } = useAddToCart(productId);

  const [localLoading, setLocalLoading] = useState(false);

  const buttonSizes = {
    small: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      fontSize: 12,
      iconSize: 14,
    },
    medium: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      fontSize: 14,
      iconSize: 16,
    },
    large: {
      paddingHorizontal: 20,
      paddingVertical: 12,
      fontSize: 16,
      iconSize: 18,
    },
  };

  const sizeStyle = buttonSizes[size];

  const handleAddToCart = async () => {
    try {
      setLocalLoading(true);
      clearError();
      
      const success = await addToCart(quantity);
      
      if (success) {
        // Mostrar feedback de éxito
        Alert.alert(
          '¡Agregado!', 
          `Producto agregado al carrito${isInCart ? ` (${cartQuantity + quantity} unidades)` : ''}`,
          [
            {
              text: 'Continuar',
              style: 'default',
            },
            {
              text: 'Ver Carrito',
              style: 'default',
              onPress: () => router.push('/(parts-app)/(tabs)/shop'),
            },
          ]
        );
        
        onSuccess?.();
      } else {
        const errorMessage = error || 'Error al agregar al carrito';
        Alert.alert('Error', errorMessage);
        onError?.(errorMessage);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Error inesperado';
      Alert.alert('Error', errorMessage);
      onError?.(errorMessage);
    } finally {
      setLocalLoading(false);
    }
  };

  const isButtonLoading = isLoading || localLoading;
  const isButtonDisabled = disabled || isButtonLoading;

  const getButtonStyle = () => {
    const baseStyle = [
      styles.button,
      {
        paddingHorizontal: sizeStyle.paddingHorizontal,
        paddingVertical: sizeStyle.paddingVertical,
      },
    ];

    switch (variant) {
      case 'primary':
        baseStyle.push(styles.primaryButton);
        break;
      case 'secondary':
        baseStyle.push(styles.secondaryButton);
        break;
      case 'outline':
        baseStyle.push(styles.outlineButton);
        break;
    }

    if (isButtonDisabled) {
      baseStyle.push(styles.disabledButton);
    }

    return baseStyle;
  };

  const getTextStyle = () => {
    const baseTextStyle = [
      styles.buttonText,
      { fontSize: sizeStyle.fontSize },
    ];

    switch (variant) {
      case 'primary':
        baseTextStyle.push(styles.primaryButtonText);
        break;
      case 'secondary':
        baseTextStyle.push(styles.secondaryButtonText);
        break;
      case 'outline':
        baseTextStyle.push(styles.outlineButtonText);
        break;
    }

    if (isButtonDisabled) {
      baseTextStyle.push(styles.disabledButtonText);
    }

    return baseTextStyle;
  };

  const buttonText = isInCart ? `${text} (${cartQuantity})` : text;

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={handleAddToCart}
      disabled={isButtonDisabled}
      activeOpacity={0.8}
    >
      <View style={styles.buttonContent}>
        {isButtonLoading ? (
          <ActivityIndicator 
            size="small" 
            color={variant === 'outline' ? '#007AFF' : '#FFFFFF'} 
          />
        ) : (
          <>
            {showIcon && (
              <Ionicons 
                name={isInCart ? "checkmark-circle" : "cart-outline"} 
                size={sizeStyle.iconSize} 
                color={variant === 'outline' ? '#007AFF' : '#FFFFFF'} 
                style={styles.icon}
              />
            )}
            <Text style={[getTextStyle(), textStyle]}>
              {buttonText}
            </Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: '#6B7280',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  disabledButton: {
    backgroundColor: '#E5E7EB',
    borderColor: '#E5E7EB',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontWeight: '600',
  },
  primaryButtonText: {
    color: '#FFFFFF',
  },
  secondaryButtonText: {
    color: '#FFFFFF',
  },
  outlineButtonText: {
    color: '#007AFF',
  },
  disabledButtonText: {
    color: '#9CA3AF',
  },
  icon: {
    marginRight: 6,
  },
});

export default AddToCartButton;
