import {
  Canvas,
  makeImageFromView,
  SkImage,
  Skia,
  Shader,
  Fill,
  ImageShader,
} from '@shopify/react-native-skia';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { LayoutChangeEvent, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import {
  useDerivedValue,
  withTiming,
  runOnJS,
  useSharedValue,
  SharedValue,
  cancelAnimation,
  withSequence,
  useAnimatedReaction,
} from 'react-native-reanimated';

const RIPPLES_LIMITATION = 10;

interface RippleCoverProps {
  children: ReactNode;
  cacheKeys?: unknown[];
  maxSpeed?: number;
  ringWidth?: number;
  decayRate?: number;
  slowdownFactor?: number;
  maxRipples?: number;
  captureWaitTime?: number;
}

interface RippleSlot {
  x: SharedValue<number>;
  y: SharedValue<number>;
  time: SharedValue<number>;
  amplitude: SharedValue<number>;
  id: SharedValue<number>;
}

function compareCacheKeys(keys1: unknown[], keys2: unknown[]): boolean {
  if (keys1.length !== keys2.length) return false;

  for (let i = 0; i < keys1.length; i++) {
    const val1 = keys1[i];
    const val2 = keys2[i];

    if (val1 !== val2) {
      if (typeof val1 === 'object' && typeof val2 === 'object') {
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

const multiRippleShader = Skia.RuntimeEffect.Make(`
uniform shader image;
uniform float2 resolution;
uniform float2 centers[10];
uniform float times[10];
uniform float amplitudes[10];
uniform float maxSpeed;
uniform float ringWidth;
uniform float decayRate;
uniform float slowdownFactor;

float calculateRipple(float2 position, float2 center, float time, float amplitude) {
  if (amplitude <= 0.0 || time <= 0.0) return 0.0;
  
  float distance = distance(position, center);
  
  float currentSpeed = maxSpeed * exp(-time * slowdownFactor);
  float currentRadius = maxSpeed * (1.0 - exp(-time * slowdownFactor)) / slowdownFactor;
  
  float distanceFromWave = abs(distance - currentRadius);
  if (distanceFromWave > ringWidth) return 0.0;
  
  float normalizedDistance = distanceFromWave / ringWidth;
  float wavePulse = exp(-normalizedDistance * normalizedDistance * 8.0);
 
  float timeFade = exp(-time * decayRate);
  float distanceFade = amplitude / (1.0 + distance / 150.0);
  
  return wavePulse * timeFade * distanceFade;
}

half4 main(float2 position) {
  float2 totalDisplacement = float2(0.0, 0.0);

  // Loop needs constant
  for (int i = 0; i < ${RIPPLES_LIMITATION}; i++) {
    float ripple = calculateRipple(position, centers[i], times[i], amplitudes[i]);
    
    if (abs(ripple) >= 0.01) {
      float2 direction = normalize(position - centers[i]);
      totalDisplacement += direction * ripple;
    }
  }
  
  return image.eval(position + totalDisplacement);
}`);

export function RippleCover({
  children,
  cacheKeys = [],
  maxSpeed = 800,
  ringWidth = 35,
  decayRate = 4,
  slowdownFactor = 5,
  maxRipples = 5,
  captureWaitTime = 16,
}: RippleCoverProps) {
  if (maxRipples > RIPPLES_LIMITATION) {
    throw new Error(
      `maxRipples cannot exceed ${RIPPLES_LIMITATION} due to shader implementation limitations.`
    );
  }

  const [contentImage, setContentImage] = useState<SkImage | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isCapturing, setIsCapturing] = useState(false);
  const [canvasReveal, setCanvasReveal] = useState(false);

  const contentRef = useRef<View>(null) as React.RefObject<View>;
  const cachedKeys = useRef<unknown[]>(cacheKeys);

  const currentSlotIndex = useRef(0);
  const rippleIdCounter = useRef(0);

  const rippleSlots = useRef<RippleSlot[]>(
    Array.from({ length: Math.min(maxRipples, RIPPLES_LIMITATION) }, (i) => ({
      x: useSharedValue(0),
      y: useSharedValue(0),
      time: useSharedValue(0),
      amplitude: useSharedValue(0),
      id: useSharedValue(0),
    }))
  ).current;

  const activeRipples = useSharedValue(0);

  useAnimatedReaction(
    () => activeRipples.value,
    (activeRipples) => {
      if (activeRipples <= 0) {
        runOnJS(setCanvasReveal)(false);
      }
    }
  );

  const uniforms = useDerivedValue(() => {
    // Need to fill arrays with zeros to match the shader's expected size
    const centers = new Array(RIPPLES_LIMITATION * 2).fill(0);
    const times = new Array(RIPPLES_LIMITATION).fill(0);
    const amplitudes = new Array(RIPPLES_LIMITATION).fill(0);

    rippleSlots.forEach((slot, index) => {
      if (index < RIPPLES_LIMITATION) {
        // Centers composed by x and y coordinates flattened into a single array
        centers[index * 2] = slot.x.value;
        centers[index * 2 + 1] = slot.y.value;
        times[index] = slot.time.value;
        amplitudes[index] = slot.amplitude.value;
      }
    });

    return {
      resolution: [dimensions.width, dimensions.height],
      centers,
      times,
      amplitudes,
      maxSpeed,
      ringWidth,
      decayRate,
      slowdownFactor,
    };
  });

  useEffect(() => {
    if (!compareCacheKeys(cacheKeys, cachedKeys.current)) {
      setContentImage(null);
      cachedKeys.current = [...cacheKeys];
      const timer = setTimeout(captureContent, captureWaitTime);
      return () => clearTimeout(timer);
    }
  }, [cacheKeys]);

  useEffect(() => {
    if (dimensions.width > 0 && dimensions.height > 0) {
      const timer = setTimeout(captureContent, captureWaitTime);
      return () => clearTimeout(timer);
    }
  }, [dimensions.width, dimensions.height]);

  useEffect(() => {
    return () => {
      // Cancel all ongoing animations and reset shared values
      rippleSlots.forEach((slot) => {
        cancelAnimation(slot.time);
        cancelAnimation(slot.amplitude);
        cancelAnimation(slot.x);
        cancelAnimation(slot.y);

        slot.time.value = 0;
        slot.amplitude.value = 0;
        slot.x.value = 0;
        slot.y.value = 0;
        slot.id.value = 0;
      });
      activeRipples.value = 0;
    };
  }, []);

  async function captureContent() {
    if (!contentRef.current || dimensions.width === 0 || dimensions.height === 0 || isCapturing) {
      return;
    }

    setIsCapturing(true);
    try {
      const image = await makeImageFromView(contentRef);
      setContentImage(image);
    } catch (error) {
      console.warn('Could not capture content:', error);
      setContentImage(null);
    } finally {
      setIsCapturing(false);
    }
  }

  function handleLayout(event: LayoutChangeEvent) {
    const { width, height } = event.nativeEvent.layout;
    setDimensions({ width, height });
  }

  // Completion handler that uses ripple ID to prevent conflicts
  function onRippleComplete(expectedId: number) {
    rippleSlots.forEach((slot) => {
      if (slot.id.value === expectedId) {
        slot.time.value = 0;
        slot.amplitude.value = 0;
        slot.id.value = 0;
        activeRipples.value = Math.max(0, activeRipples.value - 1);
      }
    });
  }

  function triggerRipple(x: number, y: number) {
    setCanvasReveal(true);

    const slotIndex = currentSlotIndex.current;
    const slot = rippleSlots[slotIndex];

    const rippleId = ++rippleIdCounter.current;

    slot.x.value = x;
    slot.y.value = y;
    slot.id.value = rippleId;

    activeRipples.value += 1;

    slot.time.value = 0;
    slot.amplitude.value = 0;

    slot.time.value = withTiming(1, { duration: 2200 });
    slot.amplitude.value = withSequence(
      withTiming(55, { duration: 40 }),
      withTiming(0, { duration: 2160 }, () => runOnJS(onRippleComplete)(rippleId))
    );

    currentSlotIndex.current = (currentSlotIndex.current + 1) % rippleSlots.length;
  }

  const tapGesture = Gesture.Tap().onStart((e) => {
    runOnJS(triggerRipple)(e.x, e.y);
  });

  return (
    <GestureDetector gesture={tapGesture}>
      <View>
        <View ref={contentRef} collapsable={false} onLayout={handleLayout}>
          {children}
        </View>

        <Canvas
          style={{
            position: 'absolute',
            width: dimensions.width,
            height: dimensions.height,
            pointerEvents: 'none',
            zIndex: canvasReveal ? 1 : -1, // This ensures that other touchables are active when the ripple effect is off
          }}>
          {contentImage && multiRippleShader && (
            <Fill>
              <Shader source={multiRippleShader} uniforms={uniforms}>
                <ImageShader
                  image={contentImage}
                  fit="cover"
                  rect={{ x: 0, y: 0, width: dimensions.width, height: dimensions.height }}
                />
              </Shader>
            </Fill>
          )}
        </Canvas>
      </View>
    </GestureDetector>
  );
}
