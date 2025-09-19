# ParallaxSlices

A React Native component that creates a **horizontal parallax scrolling effect** by automatically dividing content into segments with customizable spacing.

https://github.com/user-attachments/assets/091a6c94-4630-47aa-bb96-a01737ed61d3

## Requirements

```
npm install react-native-reanimated
```

---

## Usage

```tsx
import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ParallaxSlices } from "./ParallaxSlices";

export default function ParallaxSlicesDemo() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>ParallaxSlices Demo</Text>
      <Text style={styles.subtitle}>
        Scroll horizontally to see the parallax effect
      </Text>

      <View style={styles.demoContainer}>
        <ParallaxSlices
          minSegmentWidth={120}
          dividerWidth={30}
          parallaxFactor={0.6}
          borderRadius={16}
          height={300}
          dividerColor="#2c3e50"
        >
          <Image
            source={{
              uri: "https://picsum.photos/800/300",
            }}
            style={styles.image}
            resizeMode="cover"
          />
        </ParallaxSlices>
      </View>

      <Text style={styles.description}>
        The image moves slower than your scroll, creating depth
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
    color: "#2c3e50",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 30,
    color: "#7f8c8d",
  },
  demoContainer: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  description: {
    fontSize: 14,
    textAlign: "center",
    color: "#95a5a6",
    fontStyle: "italic",
  },
});
```

---

## Props

### `<ParallaxSlices />`

| Prop                   | Type           | Default         | Description                                                                                |
| ---------------------- | -------------- | --------------- | ------------------------------------------------------------------------------------------ |
| `children`             | `ReactElement` | –               | **Required.** Single child element that will be used as the parallax background content.   |
| `minSegmentWidth`      | `number`       | `100`           | Minimum width for each segment. Component calculates optimal segment count based on this.  |
| `dividerWidth`         | `number`       | `40`            | Width of the gap/divider between segments.                                                 |
| `parallaxFactor`       | `number`       | `0.5`           | Controls parallax intensity. Higher values = more dramatic effect (0.0 - 1.0 recommended). |
| `borderRadius`         | `number`       | `0`             | Border radius applied to each segment.                                                     |
| `width`                | `number`       | Screen width    | Container width. Defaults to full screen width.                                            |
| `height`               | `number`       | 80% of screen   | Container height. Defaults to 80% of screen height.                                        |
| `imageWidthMultiplier` | `number`       | `2`             | Multiplier for calculating total scroll width. Higher values = more segments.              |
| `dividerColor`         | `string`       | `'transparent'` | Background color of the dividers between segments.                                         |

---

That's it! Copy the component code and start using it. No configuration needed.
