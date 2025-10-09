
import { View, Text } from 'react-native'
import React from 'react'
import { Redirect, Stack } from 'expo-router'
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/presentation/shared/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ThemedView } from '@/presentation/shared/components/ThemedView';
import { useAuthStore } from '@/presentation/store/useAuthStore';


const LayoutScreen = () => {
  const primaryColor = useThemeColor({} , 'primary') || '#1976D2'
  const { status } = useAuthStore()

  if (status !== 'authenticated') {
    return <Redirect href='/auth/welcome' />
  }

  return (
      <Stack screenOptions={{
        headerShown: false, 
        headerTintColor: primaryColor,  
        headerTitleStyle: { color: primaryColor },
        gestureEnabled: false,  // Disable swipe gestures
      }}>
        <Stack.Screen name="home/index" options={{
          title: 'Inicio',
          gestureEnabled: false,  // No swipe back from home
        }} />
        <Stack.Screen name="search-results" options={{
          title: 'Resultados de búsqueda',
          gestureEnabled: true,   // Allow back from search results
        }} />
        <Stack.Screen name="part/[id]" options={{
          title: 'Producto',
          gestureEnabled: true,   // Allow back from product detail
        }} />
        <Stack.Screen name="profile/index" options={{
          title: 'Mi Perfil',
          gestureEnabled: true,
        }} />
        <Stack.Screen name="profile/map" options={{
          title: 'Seleccionar Ubicación',
          gestureEnabled: true,
        }} />
      </Stack>
  )
}

export default LayoutScreen

// custom functional Component 

const HeaderLeft = () => {
  return (
    <ThemedView style={{flexDirection: 'row', alignItems: 'center', margin: 10, marginBottom:20, gap:10}} >
      <ThemedText style={{fontWeight: 700, color:'#fff' }}>Hola, Ricardo</ThemedText>
    </ThemedView>
  )
}
