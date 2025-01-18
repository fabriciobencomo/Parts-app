
import { View, Text } from 'react-native'
import React from 'react'
import { Redirect, Stack } from 'expo-router'
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/presentation/shared/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ThemedView } from '@/presentation/shared/components/ThemedView';
import HomeScreen from './home';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const LayoutScreen = () => {

  const backgroundColor = useThemeColor({} , 'primary')
  const auth = true;

  if (!auth) {
    return <Redirect href='/auth/login' />
  }

  return (
      <Stack screenOptions={{headerSearchBarOptions:{ barTintColor: '#fff', tintColor:'#000', headerIconColor: '#000', cancelButtonText:'Cancelar', placeholder: 'Buscar Respuestos', hintTextColor:"#ddd", textColor:'#000'} , headerLeft: HeaderLeft, headerTitle: '' , headerStyle: {backgroundColor: backgroundColor} }}>
        <Stack.Screen name="/(home)/index" options={{
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
      <ThemedText style={{fontWeight: 700, color:'#fff' }}>Hola, Ricardo</ThemedText>
    </ThemedView>
  )
}
