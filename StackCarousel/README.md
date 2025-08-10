# StackCarousel

A React Native stack-style carousel component with infinite scrolling and item snaps.

https://github.com/user-attachments/assets/8b685cdf-f9d4-440c-8308-47bcbcdb1d2c

## Requirements

```bash
npm install react-native-gesture-handler react-native-reanimated
```

### Usage

```tsx
import { StackCarousel } from "components/common/wallcarousel/StackCarousel";
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const colors = [
  "#e74c3c",
  "#3498db",
  "#2ecc71",
  "#f1c40f",
  "#9b59b6",
  "#1abc9c",
];

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.carouselContainer}>
        <StackCarousel
          content={colors.map((color, index) => (
            <Card key={index} color={color} label={`Card ${index + 1}`} />
          ))}
          itemHeight={200}
          itemCount={4}
          baseSpacing={60}
          snapsDuration={200}
        />
      </View>
    </SafeAreaView>
  );
}

function Card({ color, label }: { color: string; label: string }) {
  return (
    <View style={[styles.card, { backgroundColor: color }]}>
      <Text style={styles.cardText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  carouselContainer: {
    width: "50%",
  },
  card: {
    height: 200,
    width: 200,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  cardText: {
    fontSize: 24,
    color: "white",
    fontWeight: "bold",
  },
});
```

### Props

| Prop            | Type             | Description                                                                          |
| --------------- | ---------------- | ------------------------------------------------------------------------------------ |
| `content`       | `ReactElement[]` | **Required.** Array of React elements to render inside the stack.                    |
| `itemHeight`    | `number`         | **Required.** Height of each item (used for gesture calculations and snapping).      |
| `itemCount`     | `number`         | Number of items visible in the stack at once. Default: `4`                           |
| `baseSpacing`   | `number`         | Vertical spacing between stacked items. Default: `60`                                |
| `snapsDuration` | `number`         | Duration in milliseconds for snapping animations when scrolling ends. Default: `200` |
| `scrollEnabled` | `boolean`        | Should scroll be enabled. Default: `true`                                            |

### Ref API

| Prop           | Description              |
| -------------- | ------------------------ |
| `goToNext`     | Scroll to next item.     |
| `goToPrevious` | Scroll to previous item. |

That's it! Copy the component code and start using it. No configuration needed.
