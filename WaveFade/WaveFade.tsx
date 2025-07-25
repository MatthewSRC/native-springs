import {
  Canvas,
  Image,
  SkImage,
  makeImageFromView,
  LinearGradient,
  Rect,
  vec,
  Mask,
} from "@shopify/react-native-skia";
import { useState, useRef, useEffect, ReactNode } from "react";
import { LayoutChangeEvent, View } from "react-native";
import {
  useSharedValue,
  withTiming,
  Easing,
  runOnJS,
  useDerivedValue,
  cancelAnimation,
} from "react-native-reanimated";

interface WaveFadeProps {
  children: ReactNode;
  cacheKeys?: unknown[];
  captureWaitTime?: number;
  duration?: number;
  visible?: boolean;
  preventFlickering?: boolean;
  onAnimationComplete?: () => void;
  onExitComplete?: () => void;
}

export function WaveFade({
  children,
  cacheKeys = [],
  captureWaitTime = 16,
  duration = 2000,
  visible = true,
  preventFlickering = false,
  onAnimationComplete,
  onExitComplete,
}: WaveFadeProps) {
  const [contentImage, setContentImage] = useState<SkImage | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isCapturing, setIsCapturing] = useState(false);
  const contentRef = useRef<View>(null) as React.RefObject<View>;
  const [animationState, setAnimationState] = useState<
    "entering" | "entered" | "exiting" | "exited"
  >("entering");
  const [shouldRenderContent, setShouldRenderContent] = useState(true);
  const [transitionDelayFlag, setTransitionDelayFlag] = useState(false);
  const cachedKeys = useRef<unknown[]>(cacheKeys);

  const progress = useSharedValue(0);

  useEffect(() => {
    cancelAnimation(progress);

    if (visible) {
      setShouldRenderContent(true);
      setAnimationState("entering");
      progress.value = withTiming(
        1,
        { duration, easing: Easing.in(Easing.cubic) },
        (finished) => {
          if (finished) {
            runOnJS(setAnimationState)("entered");
            onAnimationComplete && runOnJS(onAnimationComplete)();
          }
        }
      );
    } else {
      setAnimationState("exiting");

      if (preventFlickering) {
        setTransitionDelayFlag(true);
        setTimeout(() => {
          setTransitionDelayFlag(false);
        }, 32);
      }

      progress.value = withTiming(
        0,
        { duration, easing: Easing.out(Easing.cubic) },
        (finished) => {
          if (finished) {
            runOnJS(setAnimationState)("exited");
            runOnJS(setShouldRenderContent)(false);
            onExitComplete && runOnJS(onExitComplete)();
          }
        }
      );
    }
  }, [visible, duration]);

  useEffect(() => {
    if (dimensions.width > 0 && dimensions.height > 0 && shouldRenderContent) {
      const timer = setTimeout(captureContent, captureWaitTime);
      return () => clearTimeout(timer);
    }
  }, [dimensions.width, dimensions.height, shouldRenderContent]);

  useEffect(() => {
    if (!compareCacheKeys(cacheKeys, cachedKeys.current)) {
      setContentImage(null);
      cachedKeys.current = [...cacheKeys];
      const timer = setTimeout(captureContent, captureWaitTime);
      return () => clearTimeout(timer);
    }
  }, [cacheKeys]);

  async function captureContent() {
    if (!contentRef.current || isCapturing) return;
    setIsCapturing(true);
    try {
      const image = await makeImageFromView(contentRef);
      setContentImage(image);
    } catch (error) {
      console.warn("Could not capture content:", error);
      setContentImage(null);
    } finally {
      setIsCapturing(false);
    }
  }

  function handleLayout(event: LayoutChangeEvent) {
    const { width, height } = event.nativeEvent.layout;
    setDimensions({ width, height });
  }

  const gradientMaskStart = useDerivedValue(() => {
    const { width, height } = dimensions;
    if (width <= 0 || height <= 0) return vec(0, 0);

    const diagonalLength = Math.sqrt(width * width + height * height);
    const fadeWidth = diagonalLength * 0.4;

    const initialStartX = -fadeWidth * (width / diagonalLength);
    const initialStartY = height + fadeWidth * (height / diagonalLength);

    const finalStartX = width;
    const finalStartY = 0;

    const gradientStartX =
      initialStartX + progress.value * (finalStartX - initialStartX);
    const gradientStartY =
      initialStartY + progress.value * (finalStartY - initialStartY);

    return vec(gradientStartX, gradientStartY);
  });

  const gradientMaskEnd = useDerivedValue(() => {
    const { width, height } = dimensions;
    if (width <= 0 || height <= 0) return vec(0, 0);

    const diagonalLength = Math.sqrt(width * width + height * height);
    const fadeWidth = diagonalLength * 0.4;

    const initialStartX = -fadeWidth * (width / diagonalLength);
    const initialStartY = height + fadeWidth * (height / diagonalLength);
    const finalStartX = width;
    const finalStartY = 0;

    const gradientStartX =
      initialStartX + progress.value * (finalStartX - initialStartX);
    const gradientStartY =
      initialStartY + progress.value * (finalStartY - initialStartY);

    const gradientEndX = gradientStartX + fadeWidth * (width / diagonalLength);
    const gradientEndY = gradientStartY - fadeWidth * (height / diagonalLength);

    return vec(gradientEndX, gradientEndY);
  });

  if (!shouldRenderContent && animationState === "exited") {
    return null;
  }

  const shouldShowCanvas =
    animationState === "entering" || animationState === "exiting";
  const shouldHideContent =
    animationState === "entering" ||
    (animationState === "exiting" && !transitionDelayFlag);

  return (
    <>
      <View
        onLayout={handleLayout}
        ref={contentRef}
        collapsable={false}
        style={{
          position: "absolute",
          top: shouldHideContent ? -10000 : undefined,
        }}
      >
        {children}
      </View>
      {shouldShowCanvas && (
        <Canvas
          style={{
            width: dimensions.width,
            height: dimensions.height,
            position: "absolute",
          }}
        >
          <Mask
            mask={
              <Rect
                x={0}
                y={0}
                width={dimensions.width}
                height={dimensions.height}
              >
                <LinearGradient
                  start={gradientMaskStart}
                  end={gradientMaskEnd}
                  colors={["rgba(0,0,0,1)", "rgba(0,0,0,0)"]}
                  positions={[0, 1]}
                />
              </Rect>
            }
          >
            <Image
              image={contentImage}
              x={0}
              y={0}
              width={dimensions.width}
              height={dimensions.height}
            />
          </Mask>
        </Canvas>
      )}
    </>
  );
}

// Unsafe for functions or circular refs. Keys should be primitives or serializable objects.
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
