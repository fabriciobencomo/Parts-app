import React, { useState } from 'react'
import { TouchableOpacity, StyleSheet, Alert, Animated } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useFavoriteToggle } from '@/presentation/favorites/hooks/useFavorites'

interface FavoriteButtonProps {
  productId: string
  size?: number
  style?: any
  showFeedback?: boolean
  onToggle?: (isFavorite: boolean) => void
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  productId,
  size = 24,
  style,
  showFeedback = true,
  onToggle
}) => {
  const { isFavorite, loading, toggleFavorite } = useFavoriteToggle(productId)
  const [isAnimating, setIsAnimating] = useState(false)
  const scaleAnim = useState(new Animated.Value(1))[0]

  const handlePress = async () => {
    if (isAnimating) return // Allow press even when loading for better UX

    setIsAnimating(true)
    
    // Immediate visual feedback with animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.3,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      })
    ]).start()

    try {
      const result = await toggleFavorite()
      
      // Call callback if provided
      onToggle?.(result.isFavorite)
      
      // Show feedback if enabled (but don't block UI)
      if (showFeedback) {
        // You could add haptic feedback here
        // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      }
    } catch (error: any) {
      if (showFeedback) {
        Alert.alert('Error', error.message || 'Error al cambiar favorito')
      }
    } finally {
      setIsAnimating(false)
    }
  }

  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={handlePress}
      disabled={isAnimating}
      activeOpacity={0.7}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Ionicons
          name={isFavorite ? 'heart' : 'heart-outline'}
          size={size}
          color={isFavorite ? '#EF4444' : '#9CA3AF'}
          style={[
            loading && styles.loading
          ]}
        />
      </Animated.View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  // Removed animating style - now handled by Animated.View
  loading: {
    opacity: 0.6,
  },
})

export default FavoriteButton
