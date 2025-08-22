import { createContext, ReactElement, useContext } from 'react';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { SharedValue, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

interface ZoomCoverContextScheme {
  translationX: SharedValue<number>;
  translationY: SharedValue<number>;
  scale: SharedValue<number>;
}

const ZoomCoverContext = createContext<ZoomCoverContextScheme | null>(null);

export function useZoomCoverContext() {
  const context = useContext(ZoomCoverContext);
  if (!context) throw new Error('useZoomCoverContext must be used inside a ZoomCover component');
  return context;
}

export function ZoomCover({ children, boundaries }: ZoomCoverProps) {
  const translationX = useSharedValue(0);
  const startX = useSharedValue(0);
  const translationY = useSharedValue(0);
  const startY = useSharedValue(0);
  const scale = useSharedValue(1);
  const startScale = useSharedValue(1);

  const pan = Gesture.Pan()
    .onBegin(() => {
      startX.value = translationX.value;
      startY.value = translationY.value;
    })
    .onUpdate((e) => {
      let nextX = startX.value + e.translationX;
      let nextY = startY.value + e.translationY;

      if (boundaries?.movementX) {
        const { min, max } = boundaries.movementX;
        if (min !== undefined) nextX = Math.max(nextX, min);
        if (max !== undefined) nextX = Math.min(nextX, max);
      }

      if (boundaries?.movementY) {
        const { min, max } = boundaries.movementY;
        if (min !== undefined) nextY = Math.max(nextY, min);
        if (max !== undefined) nextY = Math.min(nextY, max);
      }

      translationX.value = nextX;
      translationY.value = nextY;
    });

  const pinch = Gesture.Pinch()
    .onBegin(() => {
      startScale.value = scale.value;
    })
    .onUpdate((e) => {
      let nextScale = startScale.value * e.scale;

      if (boundaries?.scale) {
        const { min, max } = boundaries.scale;
        if (min !== undefined) nextScale = Math.max(nextScale, min);
        if (max !== undefined) nextScale = Math.min(nextScale, max);
      }

      scale.value = nextScale;
    });

  const gestures = Gesture.Simultaneous(pan, pinch);

  const rStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translationX.value },
        { translateY: translationY.value },
        { scale: scale.value },
      ],
    };
  });

  const context = {
    translationX,
    translationY,
    scale,
  };

  return (
    <ZoomCoverContext.Provider value={context}>
      <GestureDetector gesture={gestures}>
        <Animated.View style={rStyle}>{children}</Animated.View>
      </GestureDetector>
    </ZoomCoverContext.Provider>
  );
}

interface ZoomCoverProps {
  children: ReactElement;
  boundaries?: Partial<{
    movementX: BoundaryRange;
    movementY: BoundaryRange;
    scale: BoundaryRange;
  }>;
}

interface BoundaryRange {
  min?: number;
  max?: number;
}
