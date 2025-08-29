# LiquidPopup

A React Native component that creates **smooth liquid morphing animations** between a button and panel using **Skia effects**.

https://github.com/user-attachments/assets/f216225c-e008-47b7-b3da-3d5fd69fe3fa

## Requirements

```
npm install @shopify/react-native-skia react-native-reanimated
```

---

## Usage

```tsx
import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LiquidPopup } from "./LiquidPopup";

export default function LiquidPopupDemo() {
  const [toggled, setToggled] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>LiquidPopup Demo</Text>
      <Text style={styles.subtitle}>
        Tap the button to see the liquid morphing effect
      </Text>

      <View style={styles.demoContainer}>
        <Pressable onPress={() => setToggled(!toggled)}>
          <LiquidPopup
            button={
              <View style={styles.button}>
                <Text style={styles.buttonText}>✨ Menu</Text>
              </View>
            }
            panel={
              <View style={styles.panel}>
                <Text style={styles.panelItem}>📝 Edit</Text>
                <Text style={styles.panelItem}>📤 Share</Text>
                <Text style={styles.panelItem}>🗑️ Delete</Text>
              </View>
            }
            toggled={toggled}
            direction="top-left"
          />
        </Pressable>
      </View>
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
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 40,
  },
  button: {
    backgroundColor: "#3498db",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  panel: {
    backgroundColor: "#2ecc71",
    borderRadius: 12,
    padding: 24,
    minWidth: 160,
  },
  panelItem: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
  },
});
```

---

## Component

### `<LiquidPopup />`

Creates a liquid morphing animation between a button and panel using Skia Canvas rendering with blur and color matrix effects.

**Props**

| Prop              | Type              | Default      | Description                                                                     |
| ----------------- | ----------------- | ------------ | ------------------------------------------------------------------------------- |
| `button`          | `ReactElement`    | –            | **Required.** The button element that triggers the animation.                   |
| `panel`           | `ReactElement`    | –            | **Required.** The panel element that morphs from the button.                    |
| `toggled`         | `boolean`         | `false`      | Controls the animation state. When true, shows panel; when false, shows button. |
| `direction`       | `PopoutDirection` | `'top-left'` | Position where panel appears relative to button.                                |
| `gap`             | `number`          | `0`          | Distance between button and panel when fully expanded.                          |
| `padding`         | `number`          | `32`         | Canvas padding around the entire component.                                     |
| `blur`            | `number`          | `30`         | Maximum blur amount during the morphing animation.                              |
| `alpha`           | `number`          | `50`         | Alpha value for the color matrix effect (0-100).                                |
| `bias`            | `number`          | `-12`        | Bias value for the color matrix effect.                                         |
| `cacheKeys`       | `unknown[]`       | `[]`         | Array of values to trigger re-capture when content changes.                     |
| `captureWaitTime` | `number`          | `16`         | Wait time in milliseconds before capturing content for rendering.               |

---

## Configuration Types

### `PopoutDirection`

```typescript
type PopoutDirection =
  | "top"
  | "top-left"
  | "top-right"
  | "bottom"
  | "bottom-left"
  | "bottom-right"
  | "left"
  | "right";
```

---

## How It Works

1. **Content Capture**: The component captures both button and panel as Skia images
2. **Canvas Rendering**: Uses Skia Canvas to render the morphing animation
3. **Blur Animation**: Applies blur and color matrix effects during transition
4. **Shape Morphing**: Smoothly interpolates between button and panel dimensions
5. **Position Calculation**: Automatically calculates optimal positioning based on direction

---

## TL;DR

1. Wrap your button and panel in `<LiquidPopup>`.
2. Set `toggled` state to control the animation.
3. Choose a `direction` for panel positioning.
4. Customize `blur`, `alpha`, `bias` and `gap` for desired effect.
5. Enjoy smooth liquid morphing animations!

That's it! Copy the component code and start using it. No configuration needed.
