import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions, Image } from 'react-native'
import React, { useEffect } from 'react'
import { useThemeColor } from '@/hooks/useThemeColor'
import { ThemedText } from '@/presentation/shared/components/ThemedText'
import { router } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { useAuthStore } from '@/presentation/store/useAuthStore'

const WelcomeScreen = () => {
  const backgroundColor = useThemeColor({}, 'background')
  const textColor = useThemeColor({}, 'text')
  const { height, width } = useWindowDimensions()
  const { status } = useAuthStore()

     // Redirect to home if user is already authenticated
   useEffect(() => {
     if (status === 'authenticated') {
       router.replace('/(parts-app)')
     }
   }, [status])

  const handleRegister = () => {
    router.push('/auth/register')
  }

  const handleLogin = () => {
    router.push('/auth/login')
  }

  const handleContactSupport = () => {
    // TODO: Implement contact support functionality
    console.log('Contact support pressed')
  }

  return (
    <LinearGradient
      colors={['#1E3A8A', '#3B82F6', '#1E40AF']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.content}>
        
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <Image
            source={require('@/assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Welcome Text Section */}
        <View style={styles.textSection}>
          <Text style={styles.welcomeTitle}>¡BIENVENIDO!</Text>
          <Text style={styles.welcomeSubtitle}>
            Todas las autopartes que tu carro necesita,{'\n'}
            al alcance de tus manos.
          </Text>
        </View>

        {/* Buttons Section */}
        <View style={styles.buttonsSection}>
          
          {/* Register Button */}
          <TouchableOpacity 
            style={styles.registerButton}
            onPress={handleRegister}
            activeOpacity={0.8}
          >
            <Text style={styles.registerButtonText}>REGISTRARME</Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity 
            style={styles.loginButton}
            onPress={handleLogin}
            activeOpacity={0.8}
          >
            <Text style={styles.loginButtonText}>YA TENGO CUENTA</Text>
          </TouchableOpacity>

        </View>

        {/* Support Section */}
        <View style={styles.supportSection}>
          <Text style={styles.supportQuestion}>
            ¿Necesitas ayuda para ingresar?
          </Text>
          <TouchableOpacity onPress={handleContactSupport}>
            <Text style={styles.supportLink}>
              🏠 CONTACTAR CON SOPORTE
            </Text>
          </TouchableOpacity>
        </View>

      </View>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingTop: 100,
    paddingBottom: 50,
  },
  logoSection: {
    alignItems: 'center',
    marginTop: 40,
  },
  logo: {
    width: 120,
    height: 120,
    tintColor: 'white',
  },
  textSection: {
    alignItems: 'center',
    marginTop: -50,
  },
  welcomeTitle: {
    fontSize: 36,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 1,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '400',
  },
  buttonsSection: {
    gap: 20,
  },
  registerButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  registerButtonText: {
    color: '#1E3A8A',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  loginButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  dividerText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginHorizontal: 16,
    fontWeight: '400',
  },
  socialButtonsPlaceholder: {
    height: 120, // Space for social buttons if needed later
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: 'transparent',
  },
  supportSection: {
    alignItems: 'center',
    gap: 8,
  },
  supportQuestion: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    textAlign: 'center',
  },
  supportLink: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    textDecorationLine: 'underline',
    textAlign: 'center',
  },
})

export default WelcomeScreen