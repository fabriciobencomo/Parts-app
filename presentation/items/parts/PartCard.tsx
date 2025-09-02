import { View, Text, Image, StyleSheet } from 'react-native'
import React from 'react'
import { Pressable } from 'react-native-gesture-handler'
import { router } from 'expo-router'
import { Product } from '@/core/products/interfaces/product.interface'
import { getFirstValidImage } from '@/helpers/image-utils'
import FavoriteButton from '@/presentation/favorites/components/FavoriteButton'

interface Props {
  part: Product;
}

const PartCard = ({ part }: Props) => {
  return (
    <Pressable onPress={() => router.push({ pathname: '/(parts-app)/(tabs)/(stack)/part/[id]', params: { id: part.id } })}>
      <View style={styles.card}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: getFirstValidImage(part.images) }} style={styles.image} />
          <View style={styles.favoriteButtonContainer}>
            <FavoriteButton 
              productId={part.id} 
              size={20}
              showFeedback={false}
              style={styles.favoriteButton}
            />
          </View>
        </View>
        <Text style={styles.name} numberOfLines={2}>{part.name}</Text>
        <Text style={styles.price}>${(part.price || 0) % 1 === 0 ? (part.price || 0) : (part.price || 0).toFixed(2)}</Text>
        <Text style={styles.model}>{part.model}</Text>
        <Text style={styles.brand}>{part.brand?.name}</Text>
      </View>
    </Pressable>
  )
}

export default PartCard

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginHorizontal: 10,
    marginTop: 10,
    padding: 12,
    alignItems: 'center',
    width: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  image: {
    width: 90,
    height: 90,
    borderRadius: 8,
    backgroundColor: '#F4F4F4',
  },
  favoriteButtonContainer: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  favoriteButton: {
    padding: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  name: {
    fontWeight: '500',
    fontSize: 15,
    color: '#001845',
    textAlign: 'center',
    marginBottom: 6,
    minHeight: 38,
  },
  price: {
    fontWeight: '700',
    fontSize: 16,
    color: '#1976D2',
    textAlign: 'center',
    marginTop: 2,
  },
  model: {
    fontSize: 12,
    color: '#7D8597',
    textAlign: 'center',
    marginTop: 2,
  },
  brand: {
    fontSize: 12,
    color: '#1976D2',
    textAlign: 'center',
    marginTop: 2,
    fontWeight: '600',
  },
});