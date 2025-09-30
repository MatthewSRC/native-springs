# ActionSlider

A React Native component that provides a **slide-to-confirm** interaction with customizable slider and container components.

## Requirements

```
npm install react-native-gesture-handler react-native-reanimated
```

---

## Usage

```tsx
import React, { useRef } from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ActionSlider, ActionSliderRef } from "./ActionSlider";

export default function ActionSliderDemo() {
  const sliderRef = useRef<ActionSliderRef>(null);

  const handleSuccess = () => {
    console.log("Success! Action confirmed");
    // Perform your action here
  };

  const handleFail = () => {
    console.log("Not quite there, try again");
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>ActionSlider Demo</Text>
      <Text style={styles.subtitle}>
        Swipe the slider all the way to the right to confirm
      </Text>

      <ActionSlider
        ref={sliderRef}
        containerStyle={styles.sliderContainer}
        sliderStyle={styles.slider}
        onSuccess={handleSuccess}
        onFail={handleFail}
        successRange={10}
        snapOnReleaseDuration={500}
        snapBackOnSuccess={true}
        SliderComponent={
          <View style={styles.sliderButton}>
            <Text style={styles.sliderText}>→</Text>
          </View>
        }
      >
        <View style={styles.trackContent}>
          <Text style={styles.trackText}>Swipe to Confirm</Text>
        </View>
      </ActionSlider>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    padding: 20,
    justifyContent: "center",
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
  sliderContainer: {
    backgroundColor: "#ecf0f1",
    borderRadius: 50,
    padding: 4,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  slider: {
    // Slider button styles
  },
  sliderButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#3498db",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  sliderText: {
    fontSize: 24,
    color: "white",
    fontWeight: "bold",
  },
  trackContent: {
    height: 68,
    justifyContent: "center",
    alignItems: "center",
  },
  trackText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#7f8c8d",
  },
});
```

---

## Components & Hooks

### `<ActionSlider />`

**Props**

| Prop                    | Type         | Default | Description                                                                                     |
| ----------------------- | ------------ | ------- | ----------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `SliderComponent`       | `ReactNode`  | –       | **Required.** The draggable slider element (e.g., a button or custom view).                     |
| `children`              | `ReactNode`  | –       | Optional content displayed in the track behind the slider.                                      |
| `containerStyle`        | `ViewStyle`  | –       | Style for the outer container view.                                                             |
| `sliderStyle`           | `ViewStyle`  | –       | Style for the animated slider view.                                                             |
| `successRange`          | `number`     | `10`    | Percentage threshold from 100% to trigger success (e.g., 10 means success at 90%+).             |
| `snapOnReleaseDuration` | `number      | null`   | `500`                                                                                           | Duration in ms for snap-back animation. Set to `null` to disable snap-back. |
| `snapBackOnSuccess`     | `boolean`    | `true`  | Whether to snap back after success. If `false`, slider stays at the end position after success. |
| `onSuccess`             | `() => void` | –       | Callback fired when slider reaches success threshold.                                           |
| `onFail`                | `() => void` | –       | Callback fired when slider is released before reaching success threshold.                       |
| `disabled`              | `boolean`    | `false` | When `true`, disables all swipe interactions.                                                   |

---

### `useActionSliderContext()`

**Returned values**

| Value          | Type                  | Description                                                   |
| -------------- | --------------------- | ------------------------------------------------------------- |
| `translationX` | `SharedValue<number>` | Current horizontal translation of the slider.                 |
| `progress`     | `SharedValue<number>` | Current progress percentage (0-100) based on slider position. |

---

## Ref Methods

### `ActionSliderRef`

**Methods**

| Method  | Signature                                         | Description                                                                              |
| ------- | ------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `reset` | `(animated?: boolean, duration?: number) => void` | Resets slider to initial position. `animated` defaults to `true`, `duration` to `300`ms. |

---

That's it! Copy the component code and start using it. No configuration needed.
