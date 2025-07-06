# ParallaxCarousel

A React Native carousel component that scales card widths based on their distance from center and applies parallax motion to content within each card.

## Requirements

```bash
npm install react-native-reanimated
```

### Usage

```tsx
import { ParallaxCarousel } from './ParallaxCarousel';
import { View, useWindowDimensions, Image, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const images = [
  require('assets/images/test/1.jpg'),
  require('assets/images/test/2.jpg'),
  require('assets/images/test/3.jpg'),
  require('assets/images/test/4.jpg'),
  require('assets/images/test/5.jpg'),
  require('assets/images/test/6.jpg'),
  require('assets/images/test/7.jpg'),
  require('assets/images/test/8.jpg'),
  require('assets/images/test/9.jpg'),
  require('assets/images/test/10.jpg'),
];

export default function Test() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.carouselContainer}>
        <ParallaxCarousel>
          {images.map((src, index) => (
            <Card key={index} src={src} />
          ))}
        </ParallaxCarousel>
      </View>
    </SafeAreaView>
  );
}

function Card({ src }: { src: any }) {
  const { width } = useWindowDimensions();

  return (
    <View
      style={[
        styles.card,
        { width: width * 0.7 }, // Wider for parallax effect
      ]}>
      <Image style={styles.image} resizeMode="cover" source={src} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  carouselContainer: {
    height: 208,
  },
  card: {
    height: 200,
    overflow: 'hidden',
    borderRadius: 24,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
```

That's it! Copy the component code and start using it. No configuration needed.
