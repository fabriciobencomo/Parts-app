import { View, Text, Image, StyleSheet } from 'react-native'
import React from 'react'
import { ThemedView } from '@/presentation/shared/components/ThemedView'
import { AutoPart } from '@/core/interfaces/parts.interface'
import { Pressable } from 'react-native-gesture-handler'
import { router } from 'expo-router'
import { Product } from '@/core/products/interfaces/product.interface';

interface Props {
  part: Product;
}

const PartCard = ({ part }: Props) => {
  return (
    <Pressable onPress={() => router.push({ pathname: '/(parts-app)/(tabs)/(stack)/part/[id]', params: { id: part.id } })}>
      <View style={styles.card}>
        <Image source={{ uri: part.images?.[0] || '' }} style={styles.image} />
        <Text style={styles.name} numberOfLines={2}>{part.name}</Text>
        <Text style={styles.price}>${part.price % 1 === 0 ? part.price : part.price.toFixed(2)}</Text>
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
  image: {
    width: 90,
    height: 90,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#F4F4F4',
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