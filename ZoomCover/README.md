# ZoomCover

A React Native component that enables **pinch-to-zoom** and **pan/drag gestures** on any child view, with support for configurable **movement and scale boundaries**.

https://github.com/user-attachments/assets/f92a64d9-425f-423a-8548-159b0aa7eb7c

## Requirements

```
npm install react-native-gesture-handler react-native-reanimated
```

---

## Usage

```tsx
import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ZoomCover } from "./ZoomCover";

export default function ZoomCoverDemo() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>ZoomCover Demo</Text>
      <Text style={styles.subtitle}>
        Pinch to zoom and drag to move within boundaries
      </Text>

      <View style={styles.demoContainer}>
        <ZoomCover
          boundaries={{
            movementX: { min: -100, max: 100 },
            movementY: { min: -100, max: 100 },
            scale: { min: 1, max: 3 },
          }}
        >
          <View style={styles.zoomContent}>
            <Image
              source={{
                uri: "https://picsum.photos/600/400",
              }}
              style={styles.image}
              resizeMode="cover"
            />
            <View style={styles.overlay}>
              <Text style={styles.overlayText}>📸 Zoom Me!</Text>
            </View>
          </View>
        </ZoomCover>
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
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#ecf0f1",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  zoomContent: {
    width: 300,
    height: 200,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#dfe6e9",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.4)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  overlayText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
});
```

---

## Components & Hooks

### `<ZoomCover />`

Wraps any child view with pinch-to-zoom and pan/drag gesture capabilities. Uses React Native Gesture Handler and Reanimated for smooth, performant interactions.

**Props**

| Prop         | Type             | Default | Description                                                                         |
| ------------ | ---------------- | ------- | ----------------------------------------------------------------------------------- |
| `children`   | `ReactElement`   | –       | **Required.** Single child element that will receive zoom and pan gestures.         |
| `boundaries` | `BoundaryConfig` | –       | Optional configuration object to limit movement and scaling within specific ranges. |

---

### `useZoomCoverContext()`

Hook to access the current zoom and pan state from within child components.

**Returned values**

| Value          | Type                  | Description                            |
| -------------- | --------------------- | -------------------------------------- |
| `translationX` | `SharedValue<number>` | Current horizontal translation offset. |
| `translationY` | `SharedValue<number>` | Current vertical translation offset.   |
| `scale`        | `SharedValue<number>` | Current scale factor.                  |

---

## Configuration Types

### `BoundaryConfig`

```typescript
interface BoundaryConfig {
  movementX?: BoundaryRange;
  movementY?: BoundaryRange;
  scale?: BoundaryRange;
}
```

### `BoundaryRange`

```typescript
interface BoundaryRange {
  min?: number;
  max?: number;
}
```

---

## Example with Context Hook

```tsx
import { ZoomCover, useZoomCoverContext } from "./ZoomCover";

function ZoomableContent() {
  const { scale, translationX, translationY } = useZoomCoverContext();

  // Access current zoom state for custom logic
  // scale.value, translationX.value, translationY.value

  return (
    <View style={styles.content}>
      <Text>Current zoom level: {scale.value.toFixed(2)}</Text>
    </View>
  );
}

export default function App() {
  return (
    <ZoomCover
      boundaries={{
        movementX: { min: -200, max: 200 },
        movementY: { min: -150, max: 150 },
        scale: { min: 0.5, max: 4 },
      }}
    >
      <ZoomableContent />
    </ZoomCover>
  );
}
```

---

## Key Features

- **Simultaneous Gestures**: Pan and pinch work together smoothly
- **Boundary Constraints**: Configurable limits for movement and scaling
- **Performant**: Uses React Native Reanimated for 60fps animations
- **Context Access**: Child components can access current transformation state
- **TypeScript**: Full TypeScript support with proper type definitions

---

## TL;DR

1. Wrap your content in `<ZoomCover boundaries={...}>`.
2. Configure optional movement and scale boundaries.
3. Use `useZoomCoverContext()` inside children to access current zoom state.
4. Enjoy smooth pinch-to-zoom and pan gestures!

That's it! Copy the component code and start using it. Minimal configuration needed.
