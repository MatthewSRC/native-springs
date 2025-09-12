# CardReel

A React Native component that creates a **scrollable card reel** with animated scaling and opacity effects. Cards dynamically scale and fade as they enter and leave the viewport.

## Requirements

```
npm install react-native-gesture-handler react-native-reanimated
```

---

## Usage

```tsx
import { CardReel } from "./CardReel";
```

👉 See full example in [`CardReelDemo`](./CardReelDemo.tsx).

---

## Components

### `<CardReel />`

**Props**

| Prop             | Type             | Default | Description                                                      |
| ---------------- | ---------------- | ------- | ---------------------------------------------------------------- |
| `children`       | `ReactElement[]` | –       | **Required.** Array of React elements to display as cards.       |
| `cardHeight`     | `number`         | –       | **Required.** Height of each card in pixels (excluding spacing). |
| `cardWidth`      | `number`         | –       | **Required.** Width of each card in pixels.                      |
| `cardSpacing`    | `number`         | `12`    | Space between cards in pixels.                                   |
| `displayedCards` | `number`         | `3`     | Number of cards visible in the viewport at once.                 |
| `overScroll`     | `boolean`        | `false` | Allow scrolling beyond the first and last cards                  |

That's it! Copy the component code and start using it. No configuration needed.
