# RippleCover

A React Native component that creates realistic water ripple effects with wave distortion when users tap on the wrapped content.

https://github.com/user-attachments/assets/fe552e8d-f7ba-4373-96bd-8b40dd4a4af2

## Requirements

```bash
npm install @shopify/react-native-skia react-native-gesture-handler react-native-reanimated
```

### Usage

```tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RippleCover } from "./RippleCover";

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>RippleCover Demo</Text>
      <Text style={styles.subtitle}>Tap anywhere to create ripple effects</Text>

      <RippleCover
        maxSpeed={600}
        ringWidth={40}
        decayRate={3}
        slowdownFactor={4}
        maxRipples={8}
      >
        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ripple Effect</Text>
            <Text style={styles.sectionText}>Tap me!</Text>
          </View>

          <View style={[styles.section, styles.secondSection]}>
            <Text style={styles.sectionTitle}>Interactive</Text>
            <Text style={styles.sectionText}>Try multiple taps</Text>
          </View>

          <View style={[styles.section, styles.thirdSection]}>
            <Text style={styles.sectionTitle}>Distortion</Text>
            <Text style={styles.sectionText}>Watch the waves</Text>
          </View>
        </View>
      </RippleCover>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
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
  content: {
    borderRadius: 16,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  section: {
    height: 120,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#3498db",
  },
  secondSection: {
    backgroundColor: "#e74c3c",
  },
  thirdSection: {
    backgroundColor: "#2ecc71",
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 16,
    color: "white",
    opacity: 0.9,
  },
});
```

### Props

| Props             | Type        | Description                                                                                                                                               |
| ----------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `children`        | `ReactNode` | **Required**. The child component that will display ripple effects when tapped.                                                                           |
| `cacheKeys`       | `array`     | Cache invalidation keys. When any value changes, the component captures a new snapshot of the child content. Highly recommended to prevent stale content. |
| `maxSpeed`        | `number`    | Maximum speed the ripple will reach. Default: `800`                                                                                                       |
| `ringWidth`       | `number`    | Width of the ripple ring effect. Default: `35`                                                                                                            |
| `decayRate`       | `number`    | How quickly the ripple effect fades out. Default: `4`                                                                                                     |
| `slowdownFactor`  | `number`    | How fast the ripple will slow down. Default: `5`                                                                                                          |
| `maxRipples`      | `number`    | How many ripples can exist at the same time. **WARNING** Must not exceed the `RIPPLES_LIMITATION` value set in the code. Default: `5`                     |
| `captureWaitTime` | `number`    | How many ms to wait before taking a snapshot of the content. Default: `16`                                                                                |

### Note

If you want to change the limitation of ripples allowed over the default value (`10`), you need to change the `RIPPLES_LIMITATION` value found at the top of the component code just after the imports.

That's it! Copy the component code and start using it. No configuration needed.
