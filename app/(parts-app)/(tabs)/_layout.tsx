import { useThemeColor } from '@/hooks/useThemeColor';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { Text, StyleSheet, View, StyleProp } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from '../../../hooks/useColorScheme.web';
import { Ionicons } from '@expo/vector-icons';




export default function TabLayout() {
  const backgroundColor = useThemeColor({}, 'primary')
  
  const secondaryColor = useThemeColor({}, 'secondary')

  return (
    
    <Tabs screenOptions={{ tabBarActiveTintColor:backgroundColor , headerShown: true, headerTintColor:backgroundColor, headerStyle:{backgroundColor: backgroundColor}}}>
      <Tabs.Screen
        name="(stack)"
        options={{
          title: 'Inicio',
          headerLeft: HeaderLeft,
          tabBarActiveTintColor: secondaryColor,
          tabBarIcon: ({ color, focused }) => <Ionicons size={20} name="home-outline" color={color} tabBarStyle={{borderTopColor: secondaryColor}}/>,
        }}
      />
      <Tabs.Screen
        name="categories/index"
        options={{
          title: 'Categorias',
          tabBarActiveTintColor: secondaryColor,
          tabBarIcon: ({ color }) => <Ionicons size={20} name="square-outline" color={color}/>,
        }}
      />
      <Tabs.Screen
        name="favorites/index"
        options={{
          title: 'Favoritos',
          tabBarActiveTintColor: secondaryColor,
          tabBarIcon: ({ color }) => <Ionicons size={20} name="heart-outline" color={color}/>,
        }}
      />
      <Tabs.Screen
        name="shop/index"
        options={{
          title: 'Pedidos',
          tabBarActiveTintColor: secondaryColor,
          tabBarIcon: ({ color }) => <Ionicons size={20} name="cart-outline" color={color}/>,
        }}
      />

    </Tabs>
  );
}

const HeaderLeft = () => {
  return (
      <View style={styles.headerLeftBackground}>
        <Text style={styles.headerLeftText}>Hola, Ricardo</Text>
      </View>
  )
}

const styles = StyleSheet.create({
  headerLeftBackground: {
    paddingLeft: 10,
    marginLeft: 4
  },
  headerLeftText: {
    fontSize: 16,
    fontWeight: 700,
    color: 'white'
  },

  focusedTab: {
    borderTopWidth: 2,
    borderTopColor: '#087DF1'
  }
})
