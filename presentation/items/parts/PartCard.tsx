import { View, Text, Image, StyleSheet } from 'react-native'
import React from 'react'
import { ThemedView } from '@/presentation/shared/components/ThemedView'
import { AutoPart } from '@/core/interfaces/parts.interface'
import { ThemedText } from '@/presentation/shared/components/ThemedText'
import { Pressable } from 'react-native-gesture-handler'
import { router } from 'expo-router'

interface Props {
  part: AutoPart;
}

const PartCard = ({ part }: Props) => {
  return (
    <Pressable onPress={() => router.push(`/part/${part.id}`)}>  
      <ThemedView style={styles.ThemedView}>
        <Image source={{uri: part.image[0]}} style={{height:140, width: 140}}/>
        <Text style={styles.text} numberOfLines={3}>{part.name}</Text>
      </ThemedView>
    </Pressable>
  )
}

export default PartCard

const styles = StyleSheet.create({
  ThemedView: {
    backgroundColor: 'transparent',
    paddingHorizontal: 10,
    borderWidth: 0.5,
    borderRadius: 10,
    marginHorizontal: 10,
    borderColor: "#ddd",
    marginTop: 10,
    paddingBottom: 20,
    display: 'flex',
    flexDirection: 'column',
    alignItems : 'center',
    justifyContent: 'center',
    width: 150,
    height: 200,
    textOverflow: 'ellipsis',
    overflow: 'hidden',
  },

  text: {
    fontWeight: '500',
    textAlign: 'center'
  }
})