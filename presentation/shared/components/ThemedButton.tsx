import { View, Text, PressableProps, Pressable, StyleSheet } from 'react-native'
import React from 'react'
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';


interface Props extends PressableProps {
  children: string;
  icon?: keyof typeof Ionicons.glyphMap
}

const ThemedButton = ({children, icon, ...rest}: Props) => {

  const primaryColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');


  return (
    <Pressable style={({pressed}) => [{...styles.button, backgroundColor: pressed ? primaryColor + '90' : primaryColor}]} {...rest} >
      <ThemedText style={{color:  'white', fontWeight: 'bold'}}>{children}</ThemedText>

      {
        icon && (
          <Ionicons name={icon} size={24}  color='white' style={{marginLeft: 8}}/>
        )
      }

    </Pressable>
  )
}

export default ThemedButton

const styles = StyleSheet.create({
  button: {
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 10,
    width: '75%',
  }
})