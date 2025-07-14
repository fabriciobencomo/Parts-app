
import { View, Text } from 'react-native'
import React from 'react'
import { Redirect, Stack } from 'expo-router'
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/presentation/shared/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ThemedView } from '@/presentation/shared/components/ThemedView';


const LayoutScreen = () => {
  const primaryColor = useThemeColor({} , 'primary')

  const auth = true;

  if (!auth) {
    return <Redirect href='/auth/login' />
  }

  return (
      <Stack screenOptions={{headerShown: false, headerTintColor:primaryColor,  headerTitleStyle:{color:primaryColor} }}>
        <Stack.Screen name="home/index" options={{
          title: 'Inicio',
        }} />
        <Stack.Screen name="search-results" options={{
          title: 'Resultados de búsqueda',
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
