import {
  createContext,
  forwardRef,
  ReactElement,
  useContext,
  useImperativeHandle,
} from "react";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from "react-native-reanimated";

interface ZoomCoverContextScheme {
  translationX: SharedValue<number>;
  translationY: SharedValue<number>;
  scale: SharedValue<number>;
}

const ZoomCoverContext = createContext<ZoomCoverContextScheme | null>(null);

export function useZoomCoverContext() {
  const context = useContext(ZoomCoverContext);
  if (!context)
    throw new Error(
      "useZoomCoverContext must be used inside a ZoomCover component"
    );
  return context;
}

export interface ZoomCoverRef {
  setScale: (scale: number, duration?: number) => void;
  setTranslation: (x: number, y: number, duration?: number) => void;
  setTransform: (params: {
    scale?: number;
    x?: number;
    y?: number;
    duration?: number;
  }) => void;
  reset: (duration?: number) => void;
  getValues: () => { scale: number; x: number; y: number };
}

export const ZoomCover = forwardRef<ZoomCoverRef, ZoomCoverProps>(
  ({ children, boundaries, dynamicBoundaries }, ref) => {
    const translationX = useSharedValue(0);
    const startX = useSharedValue(0);
    const translationY = useSharedValue(0);
    const startY = useSharedValue(0);
    const scale = useSharedValue(1);
    const startScale = useSharedValue(1);

    const applyScaleBoundaries = (newScale: number): number => {
      let constrainedScale = newScale;
      if (boundaries?.scale || dynamicBoundaries?.scaleRange) {
        const scaleRange = boundaries?.scale || dynamicBoundaries?.scaleRange;
        if (scaleRange) {
          const { min, max } = scaleRange;
          if (min !== undefined)
            constrainedScale = Math.max(constrainedScale, min);
          if (max !== undefined)
            constrainedScale = Math.min(constrainedScale, max);
        }
      }
      return constrainedScale;
    };

    const applyTranslationBoundaries = (
      x: number,
      y: number,
      currentScale: number
    ): { x: number; y: number } => {
      let nextX = x;
      let nextY = y;

      if (dynamicBoundaries) {
        const {
          contentWidth,
          contentHeight,
          viewportWidth,
          viewportHeight,
          baseScale = 1,
        } = dynamicBoundaries;

        if (currentScale <= baseScale) {
          nextX = 0;
          nextY = 0;
        } else {
          const scaledContentWidth = contentWidth * currentScale;
          const scaledContentHeight = contentHeight * currentScale;

          const maxMovementX = Math.max(
            0,
            (scaledContentWidth - viewportWidth) / 2
          );
          const maxMovementY = Math.max(
            0,
            (scaledContentHeight - viewportHeight) / 2
          );

          nextX = Math.max(-maxMovementX, Math.min(nextX, maxMovementX));
          nextY = Math.max(-maxMovementY, Math.min(nextY, maxMovementY));
        }
      } else {
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
      }

      return { x: nextX, y: nextY };
    };

    useImperativeHandle(ref, () => ({
      setScale: (newScale: number, duration = 300) => {
        const constrainedScale = applyScaleBoundaries(newScale);

        scale.value = withTiming(constrainedScale, {
          duration,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        });

        if (dynamicBoundaries) {
          const {
            contentWidth,
            contentHeight,
            viewportWidth,
            viewportHeight,
            baseScale = 1,
          } = dynamicBoundaries;

          if (constrainedScale <= baseScale) {
            translationX.value = withTiming(0, { duration });
            translationY.value = withTiming(0, { duration });
          } else {
            const scaledContentWidth = contentWidth * constrainedScale;
            const scaledContentHeight = contentHeight * constrainedScale;

            const maxMovementX = Math.max(
              0,
              (scaledContentWidth - viewportWidth) / 2
            );
            const maxMovementY = Math.max(
              0,
              (scaledContentHeight - viewportHeight) / 2
            );

            const currentX = translationX.value;
            const currentY = translationY.value;

            if (Math.abs(currentX) > maxMovementX) {
              translationX.value = withTiming(
                Math.max(-maxMovementX, Math.min(currentX, maxMovementX)),
                { duration }
              );
            }
            if (Math.abs(currentY) > maxMovementY) {
              translationY.value = withTiming(
                Math.max(-maxMovementY, Math.min(currentY, maxMovementY)),
                { duration }
              );
            }
          }
        }
      },

      setTranslation: (x: number, y: number, duration = 300) => {
        const currentScale = scale.value;
        const constrained = applyTranslationBoundaries(x, y, currentScale);

        translationX.value = withTiming(constrained.x, {
          duration,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        });
        translationY.value = withTiming(constrained.y, {
          duration,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        });
      },

      setTransform: ({ scale: newScale, x, y, duration = 300 }) => {
        const finalScale =
          newScale !== undefined ? applyScaleBoundaries(newScale) : scale.value;

        if (newScale !== undefined) {
          scale.value = withTiming(finalScale, {
            duration,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          });
        }

        if (x !== undefined || y !== undefined) {
          const nextX = x ?? translationX.value;
          const nextY = y ?? translationY.value;
          const constrained = applyTranslationBoundaries(
            nextX,
            nextY,
            finalScale
          );

          if (x !== undefined) {
            translationX.value = withTiming(constrained.x, {
              duration,
              easing: Easing.bezier(0.25, 0.1, 0.25, 1),
            });
          }
          if (y !== undefined) {
            translationY.value = withTiming(constrained.y, {
              duration,
              easing: Easing.bezier(0.25, 0.1, 0.25, 1),
            });
          }
        }
      },

      reset: (duration = 300) => {
        scale.value = withTiming(1, {
          duration,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        });
        translationX.value = withTiming(0, {
          duration,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        });
        translationY.value = withTiming(0, {
          duration,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        });
      },

      getValues: () => ({
        scale: scale.value,
        x: translationX.value,
        y: translationY.value,
      }),
    }));

    const pan = Gesture.Pan()
      .onBegin(() => {
        startX.value = translationX.value;
        startY.value = translationY.value;
      })
      .onUpdate((e) => {
        let nextX = startX.value + e.translationX;
        let nextY = startY.value + e.translationY;

        if (dynamicBoundaries) {
          const {
            contentWidth,
            contentHeight,
            viewportWidth,
            viewportHeight,
            baseScale = 1,
          } = dynamicBoundaries;
          const currentScale = scale.value;

          if (currentScale <= baseScale) {
            nextX = 0;
            nextY = 0;
          } else {
            const scaledContentWidth = contentWidth * currentScale;
            const scaledContentHeight = contentHeight * currentScale;

            const maxMovementX = Math.max(
              0,
              (scaledContentWidth - viewportWidth) / 2
            );
            const maxMovementY = Math.max(
              0,
              (scaledContentHeight - viewportHeight) / 2
            );

            nextX = Math.max(-maxMovementX, Math.min(nextX, maxMovementX));
            nextY = Math.max(-maxMovementY, Math.min(nextY, maxMovementY));
          }
        } else if (boundaries?.movementX) {
          const { min, max } = boundaries.movementX;
          if (min !== undefined) nextX = Math.max(nextX, min);
          if (max !== undefined) nextX = Math.min(nextX, max);
        }

        if (!dynamicBoundaries && boundaries?.movementY) {
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

        if (boundaries?.scale || dynamicBoundaries?.scaleRange) {
          const scaleRange = boundaries?.scale || dynamicBoundaries?.scaleRange;
          if (scaleRange) {
            const { min, max } = scaleRange;
            if (min !== undefined) nextScale = Math.max(nextScale, min);
            if (max !== undefined) nextScale = Math.min(nextScale, max);
          }
        }

        scale.value = nextScale;

        if (dynamicBoundaries) {
          const {
            contentWidth,
            contentHeight,
            viewportWidth,
            viewportHeight,
            baseScale = 1,
          } = dynamicBoundaries;

          if (nextScale <= baseScale) {
            translationX.value = 0;
            translationY.value = 0;
          } else {
            const scaledContentWidth = contentWidth * nextScale;
            const scaledContentHeight = contentHeight * nextScale;

            const maxMovementX = Math.max(
              0,
              (scaledContentWidth - viewportWidth) / 2
            );
            const maxMovementY = Math.max(
              0,
              (scaledContentHeight - viewportHeight) / 2
            );
            translationX.value = Math.max(
              -maxMovementX,
              Math.min(translationX.value, maxMovementX)
            );
            translationY.value = Math.max(
              -maxMovementY,
              Math.min(translationY.value, maxMovementY)
            );
          }
        }
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
);

ZoomCover.displayName = "ZoomCover";

interface ZoomCoverProps {
  children: ReactElement;
  boundaries?: Partial<{
    movementX: BoundaryRange;
    movementY: BoundaryRange;
    scale: BoundaryRange;
  }>;
  dynamicBoundaries?: {
    contentWidth: number;
    contentHeight: number;
    viewportWidth: number;
    viewportHeight: number;
    baseScale?: number;
    scaleRange?: BoundaryRange;
  };
}

interface BoundaryRange {
  min?: number;
  max?: number;
}
