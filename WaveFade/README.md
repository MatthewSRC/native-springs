# WaveFade

A React Native component that adds a diagonal reveal and fade transition to its children on mount and unmount.

## Requirements

```bash
npm install @shopify/react-native-skia react-native-reanimated
```

### Usage

```tsx
import { WaveFade } from "./WaveFade";
import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

export default function WaveFadeDemo() {
  const [visible, setVisible] = useState(true);

  return (
    <View style={styles.container}>
      <Pressable style={styles.button} onPress={() => setVisible((v) => !v)}>
        <Text style={styles.buttonText}>{visible ? "Hide" : "Show"}</Text>
      </Pressable>

      <WaveFade
        visible={visible}
        duration={2000}
        fadingColor="#ffffff"
        preventFlickering
      >
        <View style={styles.box}>
          <Text style={styles.boxText}>Hello Wave</Text>
        </View>
      </WaveFade>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    backgroundColor: "black",
    paddingHorizontal: 24,
    paddingVertical: 12,
    position: "absolute",
    top: "25%",
  },
  buttonText: {
    color: "white",
  },
  box: {
    width: 200,
    height: 200,
    backgroundColor: "#FF6347",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },
  boxText: {
    color: "#fff",
    fontSize: 18,
  },
});
```

### Props

| Prop                | Type        | Description                                                                                                                                                                          |
| ------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `children`          | `ReactNode` | **Required.** The content to animate. This component wraps and applies the transition effect to its children.                                                                        |
| `cacheKeys`         | `array`     | Optional cache invalidation keys. When any value changes, the component captures a fresh snapshot of the child content. **Note:** Keys should be primitives or serializable objects. |
| `captureWaitTime`   | `number`    | Time in milliseconds to wait before capturing a snapshot of the child view. Useful for layout stabilization. **Default:** `16`                                                       |
| `duration`          | `number`    | Duration of the entry/exit animation in milliseconds. **Default:** `2000`                                                                                                            |
| `visible`           | `boolean`   | Controls the visibility of the children. When toggled, triggers the appropriate enter or exit animation. **Default:** `true`                                                         |
| `preventFlickering` | `boolean`   | Adds a short delay to avoid visual flicker during transitions by briefly deferring the content hide. **Default:** `false`                                                            |
| `onEntryComplete`   | `function`  | Callback fired after the entry animation completes.                                                                                                                                  |
| `onExitComplete`    | `function`  | Callback fired after the exit animation completes.                                                                                                                                   |

That's it! Copy the component code and start using it. No configuration needed.
