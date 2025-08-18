# ScrollStoryboard

A React Native component to create **scroll-driven animations** with support for **direction-aware entry/exit animations** and **scroll progress–based effects**.

https://github.com/user-attachments/assets/7d82fddd-2f0e-413a-9beb-c821627445f4

## Requirements

> None – built in plain React Native + TypeScript.  
> Works great with [react-native-reanimated](https://docs.swmansion.com/react-native-reanimated/) for animations.

---

## Usage

```tsx
import {
  useScrollKeyframe,
  ScrollDirection,
  ScrollStoryboard,
} from "./ScrollStoryboard";
```

👉 See full example in [`ScrollStoryboardDemo`](./ScrollStoryboardDemo.tsx).

> Demo uses `react-native-reanimated`

---

## Components & Hooks

### `<ScrollStoryboard.Timeline />`

Wraps your scroll-driven scene. Provides scroll context to child `ScrollKeyframe`s.

**Props**

| Prop                  | Type                  | Default | Description                                                                  |
| --------------------- | --------------------- | ------- | ---------------------------------------------------------------------------- |
| `children`            | `ReactNode`           | –       | **Required.** One or more `ScrollKeyframe` components.                       |
| `length`              | `number`              | `2000`  | Virtual scroll length (in px). Controls total scrollable height.             |
| `onScroll`            | `(y: number) => void` | –       | Optional callback fired with the current vertical scroll position.           |
| `scrollEventThrottle` | `number`              | `16`    | How often `onScroll` is fired, in ms. Smaller = smoother, larger = less CPU. |

---

### `<ScrollStoryboard.Keyframe />`

Defines an interval in the scroll timeline where its children should **render and animate**.

**Props**

| Prop             | Type                                   | Default | Description                                                                                        |
| ---------------- | -------------------------------------- | ------- | -------------------------------------------------------------------------------------------------- |
| `children`       | `ReactNode`                            | –       | **Required.** Content that should animate within this scroll window.                               |
| `position`       | `{ start: number; end: number }`       | –       | **Required.** Start and end scroll positions (inclusive). Controls when this keyframe is active.   |
| `onEnter`        | `(direction: ScrollDirection) => void` | –       | Callback fired when the scroll enters this keyframe. Provides entry direction (`top` or `bottom`). |
| `onExit`         | `(direction: ScrollDirection) => void` | –       | Callback fired when the scroll exits this keyframe. Provides exit direction.                       |
| `minScrollDelta` | `number`                               | `5`     | Minimum scroll delta before state updates are processed. Helps prevent excessive re-renders.       |

---

### `useScrollKeyframe()`

Hook to access keyframe state inside its children.

**Returned values**

| Value                      | Type                             | Description                                                                          |
| -------------------------- | -------------------------------- | ------------------------------------------------------------------------------------ |
| `isActive`                 | `boolean`                        | Whether this keyframe is currently active.                                           |
| `scrollY`                  | `number`                         | Current scroll offset (px).                                                          |
| `position`                 | `{ start: number; end: number }` | The configured keyframe bounds.                                                      |
| `entryDirection`           | `ScrollDirection`                | Direction from which the keyframe was entered (`top`, `bottom`, or `none`).          |
| `exitDirection`            | `ScrollDirection`                | Direction in which the keyframe was exited.                                          |
| `progress`                 | `number`                         | Normalized progress **[0 → 1]** between `position.start` and `position.end`.         |
| `registerEntryHandler`     | `(fn) => () => void`             | Register an async entry animation handler. Call returned unregister fn to remove it. |
| `registerExitHandler`      | `(fn) => () => void`             | Register an async exit animation handler.                                            |
| `registerDirectionalEntry` | `(fn) => () => void`             | Register a direction-aware entry animation (`(direction, done) => void`).            |
| `registerDirectionalExit`  | `(fn) => () => void`             | Register a direction-aware exit animation.                                           |

---

## Example

```tsx
<ScrollStoryboard.Timeline length={2500}>
  <ScrollStoryboard.Keyframe position={{ start: 0, end: 400 }}>
    <DirectionalCard title="Welcome!" color="#FF6B6B" emoji="👋" />
  </ScrollStoryboard.Keyframe>

  <ScrollStoryboard.Keyframe position={{ start: 500, end: 900 }}>
    <ColorMorphCard />
  </ScrollStoryboard.Keyframe>

  <ScrollStoryboard.Keyframe position={{ start: 1000, end: 1400 }}>
    <DirectionalCard title="Amazing!" color="#96CEB4" emoji="✨" />
  </ScrollStoryboard.Keyframe>
</ScrollStoryboard.Timeline>
```

---

## ScrollDirection

Enum representing the direction of entry/exit:

```ts
enum ScrollDirection {
  TOP = "top",
  BOTTOM = "bottom",
  NONE = "none",
}
```

---

## TL;DR

1. Wrap everything in `<ScrollStoryboard.Timeline length={...}>`.
2. Define intervals with `<ScrollStoryboard.Keyframe position={{ start, end }}>...</ScrollStoryboard.Keyframe>`.
3. Use `useScrollKeyframe()` to access scroll progress + register entry/exit animations.

That's it! Copy the component code and start using it. No configuration needed.
