import { View, Text, FlatList, NativeSyntheticEvent, NativeScrollEvent } from 'react-native'
import React, { useEffect, useRef } from 'react'
import { AutoPart } from '@/core/interfaces/parts.interface';
import PartCard from './PartCard';
import { StyleSheet } from 'react-native';

interface Props {
  title?: string,
  parts: AutoPart[];
  loadNextPage?: () => void
}

const PartsHorizontal = ({parts: parts, title, loadNextPage}: Props) => {

  const isLoading = useRef(false);
  
  useEffect(() => {
    setTimeout(() => {
      isLoading.current = false
    }, 200)
  }, [parts])
  

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if(isLoading.current) return

    const {contentOffset, layoutMeasurement, contentSize} = event.nativeEvent

    const isEndReach = (contentOffset.x + layoutMeasurement.width + 600) >=  contentSize.width

    if(!isEndReach) return

    isLoading.current = true;

    // TODO: 
    loadNextPage && loadNextPage()
  }

  return (
    <View>
      <Text style={styles.title}>{title}</Text>
      <FlatList showsHorizontalScrollIndicator={false} keyExtractor={(item, i) => `${item.id}-${i}`} horizontal data={parts} renderItem={({item}) => <PartCard part={item}/>} onScroll={onScroll}/>
    </View>
  )
}

export default PartsHorizontal

const styles = StyleSheet.create({
  title: {
    fontWeight: 'bold',
    paddingHorizontal: 10,
    fontSize: 16
  }
})