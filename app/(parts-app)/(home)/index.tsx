import { View, Text, KeyboardAvoidingView, ScrollView } from 'react-native'
import React, { useEffect } from 'react'
import MainSlideShow from '@/presentation/items/parts/MainSlideShow'
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useParts } from '@/hooks/parts/useParts';
import PartsHorizontal from '@/presentation/items/parts/PartsHorizontal';
import { useBanners } from '@/hooks/parts/useBanners';

const HomeScreen = () => {

  const safeArea = useSafeAreaInsets();
  const {autoParts} = useParts();
  const {offers} = useBanners();

  useEffect(() => {
    console.log(autoParts)
  
  }, [])
  

  return (
      <ScrollView className='mt-2 pb-10' style={{paddingTop: safeArea.top *3.2}}>
        <MainSlideShow banners={offers}/>
        <PartsHorizontal parts={autoParts} title='Ofertas de La Semana'/>
      </ScrollView>
  )
}

export default HomeScreen