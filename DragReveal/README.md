# DragReveal

A React Native compound component for creating smooth drag-to-reveal interactions with spring animations and velocity-based gestures.

https://github.com/user-attachments/assets/62f296e4-b655-42f5-b4ba-75db9a136279

## Requirements

```bash
npm install react-native-reanimated react-native-gesture-handler
```

### Usage

```tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { DragReveal } from "./DragReveal";

export default function DragRevealDemo() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>DragReveal Demo</Text>
      <Text style={styles.subtitle}>
        Drag the handle up to reveal hidden content
      </Text>

      <View style={styles.demoContainer}>
        <DragReveal
          springConfig={{
            damping: 15,
            stiffness: 200,
            mass: 1,
            overshootClamping: false,
          }}
          velocityThreshold={400}
        >
          <DragReveal.Main>
            <View style={styles.mainContent}>
              <Text style={styles.mainTitle}>Main Content</Text>
              <Text style={styles.mainText}>
                This is the primary content area. The hidden content below can
                be revealed by dragging the handle upward.
              </Text>
            </View>
          </DragReveal.Main>

          <DragReveal.Reveal>
            <View style={styles.revealContent}>
              <View style={styles.revealSection}>
                <Text style={styles.revealTitle}>🎉 Hidden Content</Text>
                <Text style={styles.revealText}>
                  Surprise! This content was hidden below and revealed through
                  the drag interaction.
                </Text>
              </View>

              <View style={[styles.revealSection, styles.secondRevealSection]}>
                <Text style={styles.revealTitle}>📱 Interactive</Text>
                <Text style={styles.revealText}>
                  Try dragging quickly up or down to see the velocity-based
                  animations in action.
                </Text>
              </View>

              <View style={[styles.revealSection, styles.thirdRevealSection]}>
                <Text style={styles.revealTitle}>✨ Smooth</Text>
                <Text style={styles.revealText}>
                  The spring animation creates natural, fluid motion that feels
                  responsive to your gestures.
                </Text>
              </View>
            </View>
          </DragReveal.Reveal>

          <DragReveal.Drag>
            <View style={styles.dragHandle}>
              <View style={styles.dragIndicator} />
              <Text style={styles.dragText}>Drag me up</Text>
            </View>
          </DragReveal.Drag>
        </DragReveal>
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
    marginBottom: 40,
    color: "#7f8c8d",
  },
  demoContainer: {
    borderRadius: 16,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  mainContent: {
    backgroundColor: "#ffffff",
    padding: 24,
    minHeight: 200,
    justifyContent: "center",
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 12,
    textAlign: "center",
  },
  mainText: {
    fontSize: 16,
    color: "#34495e",
    lineHeight: 24,
    textAlign: "center",
  },
  revealContent: {
    backgroundColor: "#ecf0f1",
  },
  revealSection: {
    backgroundColor: "#3498db",
    padding: 24,
    minHeight: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  secondRevealSection: {
    backgroundColor: "#e74c3c",
  },
  thirdRevealSection: {
    backgroundColor: "#2ecc71",
  },
  revealTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
    textAlign: "center",
  },
  revealText: {
    fontSize: 14,
    color: "white",
    opacity: 0.9,
    textAlign: "center",
    lineHeight: 20,
  },
  dragHandle: {
    backgroundColor: "#34495e",
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  dragIndicator: {
    width: 40,
    height: 4,
    backgroundColor: "#bdc3c7",
    borderRadius: 2,
    marginBottom: 8,
  },
  dragText: {
    color: "#ecf0f1",
    fontSize: 14,
    fontWeight: "500",
  },
});
```

### DragReveal Props

| Prop                | Type           | Default                                                                                                                      | Description                                                                                                          |
| ------------------- | -------------- | ---------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `children`          | `ReactNode`    | **Required**                                                                                                                 | The compound components (`Main`, `Reveal`, `Drag`) that define the layout                                            |
| `springConfig`      | `SpringConfig` | `{ damping: 20, stiffness: 150, mass: 1, overshootClamping: true, restDisplacementThreshold: 0.1, restSpeedThreshold: 0.1 }` | Configuration object for the spring animation behavior                                                               |
| `velocityThreshold` | `number`       | `500`                                                                                                                        | Minimum velocity (px/s) required to trigger automatic snap animation. Set to `-1` to disable velocity-based snapping |

### Compound Components

| Component           | Description                                                          |
| ------------------- | -------------------------------------------------------------------- |
| `DragReveal.Main`   | Container for the primary content that remains visible               |
| `DragReveal.Reveal` | Container for the hidden content that gets revealed through dragging |
| `DragReveal.Drag`   | The draggable handle component that controls the reveal interaction  |

### SpringConfig Props

| Property                    | Type      | Description                                                    |
| --------------------------- | --------- | -------------------------------------------------------------- |
| `damping`                   | `number`  | Controls how quickly the spring settles (higher = less bounce) |
| `stiffness`                 | `number`  | Controls the spring's strength (higher = faster animation)     |
| `mass`                      | `number`  | Controls the spring's inertia (higher = slower animation)      |
| `overshootClamping`         | `boolean` | Prevents the animation from overshooting its target            |
| `restDisplacementThreshold` | `number`  | Distance threshold for considering the animation complete      |
| `restSpeedThreshold`        | `number`  | Velocity threshold for considering the animation complete      |

That's it! Copy the component code and start using it. No configuration needed.
