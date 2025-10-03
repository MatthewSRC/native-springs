# ZoomCover

A React Native component that enables **pinch-to-zoom** and **pan/drag gestures** on any child view, with support for configurable **movement and scale boundaries**, **imperative controls**, and **dynamic boundary calculation**.

https://github.com/user-attachments/assets/f92a64d9-425f-423a-8548-159b0aa7eb7c

## Requirements

```bash
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

| Prop                | Type                | Default | Description                                                                                         |
| ------------------- | ------------------- | ------- | --------------------------------------------------------------------------------------------------- |
| `children`          | `ReactElement`      | –       | **Required.** Single child element that will receive zoom and pan gestures.                         |
| `boundaries`        | `BoundaryConfig`    | –       | Optional static boundaries to limit movement and scaling within specific ranges.                    |
| `dynamicBoundaries` | `DynamicBoundaries` | –       | Optional dynamic boundaries calculated based on content and viewport dimensions.                    |
| `ref`               | `Ref<ZoomCoverRef>` | –       | Optional ref to access imperative methods for programmatic control of zoom and pan transformations. |

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

## Ref API (Imperative Controls)

Access imperative methods by passing a ref to the `ZoomCover` component.

### `ZoomCoverRef` Methods

| Method           | Signature                                                                         | Description                                                      |
| ---------------- | --------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `setScale`       | `(scale: number, duration?: number) => void`                                      | Programmatically set the scale with optional animation duration. |
| `setTranslation` | `(x: number, y: number, duration?: number) => void`                               | Programmatically set the translation with optional animation.    |
| `setTransform`   | `(params: { scale?: number; x?: number; y?: number; duration?: number }) => void` | Set scale and/or translation in a single call with animation.    |
| `reset`          | `(duration?: number) => void`                                                     | Reset all transformations to initial state (scale=1, x=0, y=0).  |
| `getValues`      | `() => { scale: number; x: number; y: number }`                                   | Get the current transformation values.                           |

**Example with Ref**

```tsx
import { useRef } from "react";
import { View, Button, StyleSheet } from "react-native";
import { ZoomCover, ZoomCoverRef } from "./ZoomCover";

export default function App() {
  const zoomRef = useRef<ZoomCoverRef>(null);

  return (
    <View style={styles.container}>
      <ZoomCover
        ref={zoomRef}
        boundaries={{
          scale: { min: 1, max: 4 },
        }}
      >
        <View style={styles.content}>{/* Your zoomable content */}</View>
      </ZoomCover>

      <View style={styles.controls}>
        <Button
          title="Zoom In"
          onPress={() => zoomRef.current?.setScale(2, 300)}
        />
        <Button
          title="Zoom Out"
          onPress={() => zoomRef.current?.setScale(1, 300)}
        />
        <Button title="Reset" onPress={() => zoomRef.current?.reset(400)} />
        <Button
          title="Move & Zoom"
          onPress={() =>
            zoomRef.current?.setTransform({
              scale: 1.5,
              x: 50,
              y: -30,
              duration: 500,
            })
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    width: 300,
    height: 300,
    backgroundColor: "#3498db",
    borderRadius: 12,
  },
  controls: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 20,
  },
});
```

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
import { Text, View, StyleSheet } from "react-native";

function ZoomableContent() {
  const { scale, translationX, translationY } = useZoomCoverContext();

  // Access current zoom state for custom logic
  // Use scale.value, translationX.value, translationY.value

  return (
    <View style={styles.content}>
      <Text>Zoom level: {scale.value.toFixed(2)}x</Text>
      <Text>
        Position: ({translationX.value.toFixed(0)},{" "}
        {translationY.value.toFixed(0)})
      </Text>
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

const styles = StyleSheet.create({
  content: {
    width: 300,
    height: 300,
    backgroundColor: "#3498db",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },
});
```

---

## Key Features

- **Simultaneous Gestures**: Pan and pinch work together smoothly
- **Boundary Constraints**: Configurable limits for movement and scaling
- **Performant**: Uses React Native Reanimated for 60fps animations
- **Context Access**: Child components can access current transformation state
- **TypeScript**: Full TypeScript support with proper type definitions
- **Lightweight**: Simple, focused API with no unnecessary complexity

---

## API Overview

### Boundaries

Configure optional constraints for user interactions:

```tsx
<ZoomCover
  boundaries={{
    // Horizontal movement range
    movementX: { min: -100, max: 100 },

    // Vertical movement range
    movementY: { min: -50, max: 50 },

    // Scale/zoom range
    scale: { min: 1, max: 3 },
  }}
>
  {/* Your content */}
</ZoomCover>
```

All boundary properties are optional. Omit them for unrestricted movement or scaling.

---

## TL;DR

1. Wrap your content in `<ZoomCover boundaries={...}>`.
2. Configure optional movement and scale boundaries.
3. Use `useZoomCoverContext()` inside children to access current zoom state.
4. Enjoy smooth pinch-to-zoom and pan gestures!

That's it! Copy the component code and start using it. Minimal configuration needed.
