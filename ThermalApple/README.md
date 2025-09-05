# ThermalApple

A React Native component that recreates Apple's thermal imaging effect with **interactive heat trails**, **flowing border animations**, and **realistic thermal gradients**. Touch and drag to generate heat patterns that persist and decay naturally over time.

_Original concept and credits to [samhenrigold/apple-event-shader](https://github.com/samhenrigold/apple-event-shader/tree/main). This React Native implementation recreates the effect using Skia shaders, Reanimated, and Gesture Handler, heavily based on the original shader methods._

https://github.com/user-attachments/assets/35e425a9-0d12-4af1-833a-65076712e84d

## Requirements

```bash
npm install @shopify/react-native-skia react-native-gesture-handler react-native-reanimated
```

---

## Usage

```tsx
import React from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThermalApple } from "./ThermalApple";

export default function ThermalAppleDemo() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.thermalContainer}>
        <ThermalApple width={300} height={300} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  thermalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
```

---

## Props

| Prop                      | Type     | Default         | Description                                                         |
| ------------------------- | -------- | --------------- | ------------------------------------------------------------------- |
| `width`                   | `number` | `SCREEN_WIDTH`  | Width of the thermal canvas                                         |
| `height`                  | `number` | `SCREEN_HEIGHT` | Height of the thermal canvas                                        |
| `heatBuildupRate`         | `number` | `0.03`          | Rate at which heat accumulates on touch (0-1)                       |
| `heatDecayRate`           | `number` | `0.985`         | Rate at which heat dissipates over time (0-1, closer to 1 = slower) |
| `trailRadius`             | `number` | `0.25`          | Size of heat trails created by touch interactions (0-1)             |
| `backgroundHeatIntensity` | `number` | `0.03`          | Intensity of ambient background thermal noise (0-1)                 |
| `thermalSpeed`            | `number` | `0.15`          | Speed of background thermal flow animation                          |
| `borderFlowSpeed`         | `number` | `0.4`           | Speed of flowing heat animation along logo borders                  |
| `borderIntensity`         | `number` | `1.1`           | Intensity of border thermal effects                                 |
| `borderWidth`             | `number` | `0.02`          | Width of thermal border zone (0-1)                                  |

---

## Setup

### Add the Apple Logo Asset

Download the logo asset from the [original repository](https://github.com/samhenrigold/apple-event-shader/tree/main/public) and place it in your assets folder:

```
./assets/logo__dcojfwkzna2q.png
```

_Note: Update the `require()` path in the component to match your asset location._

---

## Disclaimer, Credits & Attribution

Original concept, design, and shader implementation by Sam Henri Gold. This React Native version attempts to recreate the thermal effect using mobile techniques. While not a perfect recreation nor perfectly optimized (can be improved in many ways code and design wise), the goal was to capture the core visual and interactive essence of the original for React Native applications.

---

## TL;DR

1. Install dependencies: `@shopify/react-native-skia`, `react-native-gesture-handler`, `react-native-reanimated`
2. Add the Apple logo asset to your project
3. Drop in `<ThermalApple />` component
4. Touch and drag to create stunning thermal heat effects!

That's it! Copy the component code and start using it.
