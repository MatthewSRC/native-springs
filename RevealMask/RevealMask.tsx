import {
  Canvas,
  makeImageFromView,
  SkImage,
  Image,
  Group,
  Circle,
} from "@shopify/react-native-skia";
import React, { ReactNode, useRef, useState, useEffect } from "react";
import { View, LayoutChangeEvent } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import {
  useSharedValue,
  runOnJS,
  withSpring,
  withTiming,
} from "react-native-reanimated";

interface RevealMaskProps {
  primary: ReactNode;
  secondary: ReactNode;
  maskRadius?: number;
  cacheKeys?: unknown[];
}

// Caching system to avoid unnecessary re-capturing of the secondary content
function compareCacheKeys(keys1: unknown[], keys2: unknown[]): boolean {
  if (keys1.length !== keys2.length) return false;

  for (let i = 0; i < keys1.length; i++) {
    const val1 = keys1[i];
    const val2 = keys2[i];

    if (val1 !== val2) {
      if (typeof val1 === "object" && typeof val2 === "object") {
        if (JSON.stringify(val1) !== JSON.stringify(val2)) {
          return false;
        }
      } else {
        return false;
      }
    }
  }

  return true;
}

export function RevealMask({
  primary,
  secondary,
  maskRadius = 80,
  cacheKeys = [],
}: RevealMaskProps) {
  const [secondaryImage, setSecondaryImage] = useState<SkImage | null>(null);
  const [viewDimensions, setViewDimensions] = useState({ width: 0, height: 0 });
  const [isCapturing, setIsCapturing] = useState(false);
  const [canvasReveal, setCanvasReveal] = useState(false);

  const secondaryRef = useRef<View>(null) as React.RefObject<View>;
  const cachedKeys = useRef<unknown[]>(cacheKeys);

  const touchX = useSharedValue(0);
  const touchY = useSharedValue(0);
  const circleRadius = useSharedValue(0);
  const circleOpacity = useSharedValue(0);

  useEffect(() => {
    if (!compareCacheKeys(cacheKeys, cachedKeys.current)) {
      setSecondaryImage(null);
      cachedKeys.current = [...cacheKeys];
      console.log("Cache invalidated - keys changed, capturing new image...");
      const tm = setTimeout(() => {
        captureSecondaryContent();
      }, 16);
      return () => clearTimeout(tm);
    }
  }, [cacheKeys]);

  useEffect(() => {
    if (viewDimensions.width > 0 && viewDimensions.height > 0) {
      const timeoutId = setTimeout(() => {
        captureSecondaryContent();
      }, 16);

      return () => clearTimeout(timeoutId);
    }
  }, [viewDimensions.width, viewDimensions.height]);

  async function captureSecondaryContent() {
    if (
      !secondaryRef.current ||
      viewDimensions.width === 0 ||
      viewDimensions.height === 0 ||
      isCapturing
    ) {
      return;
    }
    setIsCapturing(true);

    try {
      console.log("Capturing secondary content...");
      const image = await makeImageFromView(secondaryRef);
      setSecondaryImage(image);
    } catch (error) {
      console.warn("Failed to capture secondary content as image:", error);
      setSecondaryImage(null);
    } finally {
      setIsCapturing(false);
    }
  }

  function handleLayout(event: LayoutChangeEvent) {
    const { width, height } = event.nativeEvent.layout;
    setViewDimensions({ width, height });
  }

  function animateCircleIn() {
    setCanvasReveal(true);
    circleRadius.value = withSpring(maskRadius, {
      damping: 15,
      stiffness: 300,
    });
    circleOpacity.value = withTiming(1, { duration: 200 });
  }

  function animateCircleOut() {
    circleRadius.value = withSpring(0, {
      damping: 20,
      stiffness: 400,
    });
    circleOpacity.value = withTiming(0, { duration: 150 }, () =>
      runOnJS(setCanvasReveal)(false)
    );
  }

  const panGesture = Gesture.Pan()
    .onStart((event) => {
      touchX.value = event.x;
      touchY.value = event.y;
      runOnJS(animateCircleIn)();
    })
    .onUpdate((event) => {
      touchX.value = event.x;
      touchY.value = event.y;
    })
    .onEnd(() => {
      runOnJS(animateCircleOut)();
    });

  return (
    <GestureDetector gesture={panGesture}>
      <View>
        <View onLayout={handleLayout}>{primary}</View>

        <View
          ref={secondaryRef}
          collapsable={false}
          style={{
            position: "absolute",
            top: -10000,
            width: viewDimensions.width,
            height: viewDimensions.height,
          }}
        >
          {secondary}
        </View>

        <Canvas
          style={{
            position: "absolute",
            width: viewDimensions.width,
            height: viewDimensions.height,
            pointerEvents: "none",
            zIndex: canvasReveal ? 1 : -1, // This ensures that other touchables are active when the mask effect is off
          }}
        >
          <Group>
            <Circle
              cx={touchX}
              cy={touchY}
              r={circleRadius}
              color="white"
              opacity={circleOpacity}
            />
            <Image
              image={secondaryImage}
              x={0}
              y={0}
              width={viewDimensions.width}
              height={viewDimensions.height}
              blendMode="srcIn"
            />
          </Group>
        </Canvas>
      </View>
    </GestureDetector>
  );
}
