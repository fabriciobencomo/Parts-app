import { View, Text, ScrollView, useWindowDimensions, Pressable, Image, StyleSheet, ViewStyle } from 'react-native';
import React from 'react'
import { router, useLocalSearchParams } from 'expo-router';
import { usePart } from '@/hooks/parts/usePart';
import Ionicons from '@expo/vector-icons/build/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useColorScheme } from '../../../../../hooks/useColorScheme.web';
import { Colors } from '../../../../../constants/Colors';

const PartScreen = () => {

  const {id} = useLocalSearchParams();

  const part = usePart(id)

  const primaryColor = useThemeColor({}, 'primary')

  // if((movieQuery.isLoading || !movieQuery.data)) {
  //   return (
  //     <View>
  //       <Text className='mb-4'>Loading</Text>
  //       <ActivityIndicator size={40} />
  //     </View>
  //   )
  // }

  const {height} = useWindowDimensions()

  return (
    <ScrollView style={{backgroundColor: Colors.light.background}}>

      {/* Gradient */}
      <>
      {/* Part Header */}
        <LinearGradient
          // Background Linear Gradient
          colors={['rgba(0,0,0,0.2)', 'transparent']}
          start={[0,0]}
          style={{
            height: height * 0.4,
            position: 'absolute',
            zIndex: 1,
            width: '100%',
            borderBottomLeftRadius: 30,
            borderBottomRightRadius: 30
          }}
        />
        {/* Boton de Regreso */}
        <View style={{
          position: 'absolute',
          zIndex: 99,
          elevation: 9,
          top: 45,
          left: 10
        }}>
          <Pressable>
            <Ionicons name='arrow-back' size={30} color='white' style={styles.icon} onPress={() => router.dismiss()}/>
          </Pressable>
        </View>

        {/* Card */}
        <View style={[styles.card, {height: height * 0.35}]}>
          <View style={styles.cardContainer}>
            <Image style={styles.image}  source={{uri: part.image}} resizeMode='cover'/>
          </View>
        </View>
      </>

      <View style={[styles.container, {paddingTop: height * 0.08}]}>
        {/* Title and Price */}

        <View>
          <Text style={[styles.title]}>{part.name}</Text>
        </View>

        <View style={styles.priceContainer}>
          <Text style={styles.price}>{part.price}$</Text>
          <Ionicons size={28} name='heart-outline' color='white' style={{backgroundColor: 'gray', padding: 5, borderRadius: 100}}></Ionicons>
        </View>

        <Image source={{uri:'https://pbs.twimg.com/profile_images/1760289777180405761/skE3Y_hJ_400x400.png'}} style={{height: 60, width:80, marginTop: 10, borderRadius: 10}}></Image>

        {/* Detalles */}
        <View style={{marginTop: 10}}>
          <Text style={styles.subtitle}>Detalles:</Text>
          <View style={{display:'flex', flexDirection: 'column', marginTop: 10, gap: 10}}>
            <Text style={styles.detail}>Modelo: S123456789</Text>
            <Text style={styles.detail}>SKU: 123456789</Text>
            <Text style={styles.detail}>Garantia: 6 meses</Text>
          </View>
        </View>
        
        {/* Quantity */}
        <View style={{marginTop: 20, display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
          <Text style={styles.subtitle}>Cantidad:</Text>
          <Text>1</Text>
        </View>

        {/* Actions Buttons */}
        <View style={{marginTop: 20, display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
          <Pressable style={{backgroundColor: primaryColor, padding: 15, borderRadius: 10, width: '48%'}}>
            <Text style={{color: 'white', textAlign: 'center', fontWeight: 700}}>Agregar al Carrito</Text>
          </Pressable>
          <Pressable style={{backgroundColor: 'white', padding: 15, borderRadius: 10, borderWidth: 1, borderColor: primaryColor, width: '48%'}}>
            <Text style={{color: primaryColor, textAlign: 'center', fontWeight: 700}}>Comprar Ahora</Text>
          </Pressable>
        </View>
      </View>


    </ScrollView>
  )
}

export default PartScreen

const styles = StyleSheet.create({
  icon: {
    boxShadow: 'shadow'
  },
  card: {
    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    borderRadius: 96
  },
  cardContainer: {
    flexGrow: 1,
    borderRadius: 96,
    overflow: 'hidden'
  },
  image: {
    flexGrow: 1
  },

  container: {
    paddingHorizontal: 20,
  },

  title: {
    fontWeight: 700,
    fontSize: 16,
    textTransform: 'uppercase',
    color: '#001845'
  },

  priceContainer: {
    marginTop: 20,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },

  price: {
    fontSize: 30,
    fontWeight: 700,
    color: '#001845'
  },

  subtitle: {
    color: '#001845',
    fontWeight: 700,
    fontSize: 16
  },

  detail: {
    color: '#7D8597',
    fontWeight: 700,
    fontSize: 14
  }

})
