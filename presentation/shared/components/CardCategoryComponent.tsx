import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface Props {
  title: string;
  image: any; // require('...') o { uri }
  onPress?: () => void;
}

const CardCategoryComponent: React.FC<Props> = ({ title, image, onPress }) => {
  return (
    <LinearGradient
      colors={["#0A2E73", "#1976D2"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View style={styles.left}>
        <Text style={styles.title}>{title}</Text>
        <TouchableOpacity style={styles.button} onPress={onPress} activeOpacity={0.8}>
          <Text style={styles.buttonText}>Ver</Text>
        </TouchableOpacity>
      </View>
      <Image source={image} style={styles.image} resizeMode="contain" />
    </LinearGradient>
  );
};

export default CardCategoryComponent;

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    marginVertical: 10,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 3,
    minHeight: 120,
  },
  left: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    fontStyle: 'italic',
    marginBottom: 16,
  },
  button: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 22,
    paddingVertical: 6,
    alignSelf: 'center',
  },
  buttonText: {
    color: '#0A2E73',
    fontWeight: 'bold',
    fontSize: 16,
  },
  image: {
    width: 120,
    height: 120,
    marginLeft: 12,
  },
}); 