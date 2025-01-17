import { View, Text, Keyboard, KeyboardAvoidingView, ScrollView, useWindowDimensions } from 'react-native'
import React from 'react'
import { useThemeColor } from '@/hooks/useThemeColor'
import { ThemedText } from '@/presentation/shared/components/ThemedText'
import ThemedButton from '@/presentation/shared/components/ThemedButton'
import { Link } from 'expo-router'

const LoginScreen = () => {

  const backgroundColor = useThemeColor({}, 'background')
  const textColor = useThemeColor({}, 'text')
  const {height, width} = useWindowDimensions();


  return (
    <KeyboardAvoidingView behavior='padding' style={{ flex: 1 }}>
      <ScrollView style={{ paddingHorizontal: 20,  backgroundColor: backgroundColor }}>
        <View style={{paddingTop: height * 0.25, justifyContent: 'center', alignItems: 'center'}}>
          <ThemedText type='title'>Bienvenido!</ThemedText>
          <ThemedText style={{color:'grey'}}>Crea tu cuenta Para Comenzar</ThemedText>
          {/* SPACER */}
          <View style={{marginTop:100}} />
          {/* Buttons */}
          <Link href='/'>
            <ThemedButton>Registrarme</ThemedButton>
          </Link>
          
        </View>
      </ScrollView>
      
    </KeyboardAvoidingView>
  
  )
}

export default LoginScreen