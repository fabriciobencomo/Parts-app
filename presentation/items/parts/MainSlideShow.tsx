import { Parts } from '@/core/interfaces/parts.interface';
import { useRef } from 'react';
import { Dimensions, Text, useWindowDimensions, View, Image, StyleSheet } from 'react-native';
import Carousel, {ICarouselInstance, Pagination} from 'react-native-reanimated-carousel';
import PartCard from './PartCard';
import { Banners } from '@/core/interfaces/banner.interface';
import PartBanner from './PartBanner';

interface Props{
  banners: Banners[];
}

const MainSlideShow = ({banners}: Props) => {

  const ref = useRef<ICarouselInstance>(null)
  const width = useWindowDimensions().width;

  return (
    <View style={styles.container}>
      <Carousel ref={ref} 
                data={banners}
                renderItem={({ item }) =>(<PartBanner id={item.id} image={item.imageUrl}/> ) } 
                width={width}
                pagingEnabled={true}
                style={{width: width, height:width/2, justifyContent:'center', alignItems: 'center', marginHorizontal: 10}}
                // mode='parallax'
                modeConfig={{

                }}
                defaultIndex={1}
      />
    
    </View>
  )
}

export default MainSlideShow

const styles = StyleSheet.create({  
  container: {
    width: '95%',
  },

})