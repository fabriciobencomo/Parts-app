import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import CardCategoryComponent from '@/presentation/shared/components/CardCategoryComponent';

const categories = [
  {
    id: '1',
    title: 'FAROS Y STOPS',
    image: require('@/assets/images/categories/faros.png'),
  },
  {
    id: '2',
    title: 'LUBRICANTES',
    image: require('@/assets/images/categories/aceites.png'),
  },
  {
    id: '3',
    title: 'SUSPENSIÓN',
    image: require('@/assets/images/categories/suspension.png'),
  },
  {
    id: '4',
    title: 'SENSORES Y VALVULAS',
    image: require('@/assets/images/categories/sensores.png'),
  },
  {
    id: '5',
    title: 'EMPACADURAS Y ESTOPERAS',
    image: require('@/assets/images/categories/empacaduras.png'),
  },
];

const CategoriesScreen = () => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {categories.map((cat, idx) => (
        <CardCategoryComponent key={cat.title} title={cat.title} image={cat.image} />
      ))}
    </ScrollView>
  );
};

export default CategoriesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 18,
    paddingTop: 10,
    paddingBottom: 32,
  },
});