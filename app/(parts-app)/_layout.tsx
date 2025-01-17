import { View, Text } from 'react-native'
import React from 'react'
import { Redirect, Stack } from 'expo-router'
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/presentation/shared/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ThemedView } from '@/presentation/shared/components/ThemedView';
import HomeScreen from './(home)';

const LayoutScreen = () => {

  const backgroundColor = useThemeColor({} , 'tint')
  const auth = true;

  if (!auth) {
    return <Redirect href='/auth/login' />
  }

  return (
    <Stack screenOptions={{headerSearchBarOptions:{ barTintColor: '#fff', tintColor:'#fff', headerIconColor: '#fff', cancelButtonText:'Cancelar', obscureBackground:false, placeholder: 'Buscar Respuestos' } , headerLeft: HeaderLeft, headerTitle: '' , headerStyle: {backgroundColor: backgroundColor} }}>
      <Stack.Screen name="(home)/index" options={{
        title: 'Inicio',
      }} />
    </Stack>
  )
}

export default LayoutScreen

// custom functional Component 

const HeaderLeft = () => {
  return (
    <ThemedView style={{backgroundColor: 'transparent', flexDirection: 'row', alignItems: 'center', margin: 10, marginBottom:20, gap:10}} >
      <Ionicons name='menu' size={25} style={{color: '#fff'}}/>
      <ThemedText style={{fontWeight: 700, color:'#fff' }}>Hola, Ricardo</ThemedText>
    </ThemedView>
  )
}