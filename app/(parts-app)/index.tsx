import { Redirect } from 'expo-router'
import { useAuthStore } from '@/presentation/store/useAuthStore'
import { useEffect } from 'react'
import { View, ActivityIndicator } from 'react-native'

const App = () => {
  const { status, checkStatus } = useAuthStore()

  useEffect(() => {
    // Check authentication status when app loads
    checkStatus()
  }, [])

  // Show loading while checking authentication
  if (status === 'checking') {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F4F4F4' }}>
        <ActivityIndicator size="large" color="#1E3A8A" />
      </View>
    )
  }

  // Redirect based on authentication status
  if (status === 'authenticated') {
    return <Redirect href='/(parts-app)/(tabs)/(stack)/home' />
  } else {
    return <Redirect href='/auth/welcome' />
  }
}

export default App