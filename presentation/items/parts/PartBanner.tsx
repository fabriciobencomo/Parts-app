import { View, Text, Image, StyleSheet, useWindowDimensions } from 'react-native'
import React from 'react'
import { ThemedView } from '@/presentation/shared/components/ThemedView'
import { AutoPart } from '@/core/interfaces/parts.interface'
import { ThemedText } from '@/presentation/shared/components/ThemedText'
import { Pressable } from 'react-native-gesture-handler'

interface Props {
  image: string;
}

const PartBanner = ({image}) => {

  const {width} = useWindowDimensions();

  return (
    <Pressable style={styles.itemsContainer}>  
        <Image source={{uri: image}} style={{height: width/2 , width: width *0.9, objectFit: 'contain', borderRadius: 20}}/>
    </Pressable>
      
  )
}

export default PartBanner

const styles = StyleSheet.create({
  itemsContainer: {flex: 1,
    justifyContent: 'center',
    borderRadius: 8,
    }
})