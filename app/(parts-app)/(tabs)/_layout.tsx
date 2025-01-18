import { useThemeColor } from '@/hooks/useThemeColor';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';

export default function TabLayout() {

  const textColor = useThemeColor({}, 'text')

  return (
    <Tabs screenOptions={{ tabBarActiveTintColor:textColor , headerShown: false}}>
      <Tabs.Screen
        name="(stack)"

        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="home" color={color}/>,
        }}
      />
      <Tabs.Screen
        name="favorites/index"
        options={{
          title: 'favorites',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="cog" color={color}/>,
        }}
      />
    </Tabs>
  );
}
