# WaveText

A React Native component that creates **animated wave effects** on text, with each character transitioning between colors in a cascading pattern.

## Requirements

```
npm install react-native-reanimated
```

> IMPORTANT: The component uses CSS transitions from Reanimated 4, so react-native-reanimated version 4.0.0 or higher is required

---

## Usage

```tsx
import React from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WaveText } from "./WaveText";

export default function WaveTextDemo() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.demoContainer}>
        <WaveText
          style={styles.waveText}
          textSpacing={6}
          waveColors={["#fa7f7c", "#87cce8"]}
          waveDuration={2000}
          waveDelay={100}
          waveInterval={1000}
          waveSpeed={500}
        >
          Hello World
        </WaveText>

        <WaveText
          style={styles.subtitle}
          textSpacing={4}
          waveColors={["#95a5a6", "#2ecc71"]}
          waveDuration={1500}
          waveDelay={80}
          waveInterval={2000}
          waveSpeed={400}
        >
          Wave Animation
        </WaveText>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2c3e50",
    justifyContent: "center",
    alignItems: "center",
  },
  demoContainer: {
    gap: 40,
    alignItems: "center",
  },
  waveText: {
    fontSize: 48,
    fontWeight: "bold",
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: "600",
  },
});
```

---

## Component

### `<WaveText />`

**Props**

| Prop           | Type               | Default                  | Description                                                                                     |
| -------------- | ------------------ | ------------------------ | ----------------------------------------------------------------------------------------------- |
| `children`     | `string`           | –                        | **Required.** The text to animate. Each character will be animated individually.                |
| `textSpacing`  | `number`           | `4`                      | Gap between characters in pixels.                                                               |
| `style`        | `TextStyle`        | `{}`                     | Style applied to each character (fontSize, fontWeight, etc.).                                   |
| `waveColors`   | `[string, string]` | `['#fa7f7c', '#87cce8']` | Two-color array: `[defaultColor, waveColor]`. Characters transition from default to wave color. |
| `waveDuration` | `number`           | `2000`                   | Total duration in ms for one complete wave cycle across all characters.                         |
| `waveDelay`    | `number`           | `100`                    | Delay in ms between each character starting its wave animation.                                 |
| `waveInterval` | `number`           | `1000`                   | Pause duration in ms between wave cycles.                                                       |
| `waveSpeed`    | `number`           | `500`                    | Transition speed in ms for each character's color change.                                       |

---

That's it! Copy the component code and start using it. No configuration needed.
