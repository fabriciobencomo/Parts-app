import { View, Text, KeyboardAvoidingView, ScrollView } from 'react-native'
import React, { useEffect } from 'react'
import MainSlideShow from '@/presentation/items/parts/MainSlideShow'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useParts } from '@/hooks/parts/useParts';
import PartsHorizontal from '@/presentation/items/parts/PartsHorizontal';
import { useBanners } from '@/hooks/parts/useBanners';
import SearchComponent from '@/presentation/shared/components/SearchComponent';

const HomeScreen = () => {

  const safeArea = useSafeAreaInsets();
  const {autoParts} = useParts();
  const {offers} = useBanners();

  useEffect(() => {
    console.log(autoParts)
  
  }, [])
  

  return (
    <ScrollView style={{paddingTop: 0, backgroundColor: 'white'}}>
        <SearchComponent />
          <MainSlideShow banners={offers}/>
          <PartsHorizontal parts={autoParts} title='Ofertas de La Semana'/>
          <View style={{height: 20}}/>
          <PartsHorizontal parts={autoParts} title='Lo Mas Vendido'/>
      </ScrollView>
  )
}

export default HomeScreen