# RevealMask

A React Native component that reveals hidden content through a circular mask that follows your finger as you drag across the surface.

https://github.com/user-attachments/assets/9a2bdc97-b132-440b-936c-95fa6899813a

## Requirements

```bash
npm install @shopify/react-native-skia react-native-gesture-handler react-native-reanimated
```

### Usage

```tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { RevealMask } from "./RevealMask";

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>RevealMask Demo</Text>
      <Text style={styles.subtitle}>Drag to reveal hidden content</Text>

      <RevealMask
        primary={
          <View style={styles.primary}>
            <Text style={styles.primaryText}>🌟 Primary Layer</Text>
            <Text style={styles.hint}>Drag me!</Text>
          </View>
        }
        secondary={
          <View style={styles.secondary}>
            <Text style={styles.secondaryText}>✨ Hidden Layer</Text>
            <Text style={styles.hint}>You found it!</Text>
          </View>
        }
        maskRadius={50}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 30,
    color: "#666",
  },
  primary: {
    height: 200,
    backgroundColor: "#3498db",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  secondary: {
    height: 200,
    backgroundColor: "#e74c3c",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  primaryText: {
    fontSize: 20,
    color: "white",
    fontWeight: "bold",
    marginBottom: 8,
  },
  secondaryText: {
    fontSize: 20,
    color: "white",
    fontWeight: "bold",
    marginBottom: 8,
  },
  hint: {
    fontSize: 14,
    color: "white",
    opacity: 0.8,
  },
});
```

### Props

| Props        | Type        | Description                                                                                                                                                   |
| ------------ | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `primary`    | `ReactNode` | **Required**. Base component that's always visible.                                                                                                           |
| `secondary`  | `ReactNode` | **Required**. Hidden component revealed through the mask                                                                                                      |
| `maskRadius` | `number`    | Radius of the reveal circle. Default: `80`                                                                                                                    |
| `cacheKeys`  | `array`     | Cache invalidation keys. When any value changes, the component captures a new snapshot of the secondary content. Highly recommended to prevent stale content. |

That's it! Copy the component code and start using it. No configuration needed.
