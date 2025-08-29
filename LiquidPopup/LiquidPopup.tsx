import {
  Blur,
  Canvas,
  ColorMatrix,
  Group,
  Paint,
  SkImage,
  makeImageFromView,
  Image,
  rrect,
  rect,
} from '@shopify/react-native-skia';
import { useState, useRef, useEffect, useMemo, ReactElement } from 'react';
import { View, LayoutChangeEvent } from 'react-native';
import Animated, {
  useDerivedValue,
  useSharedValue,
  withTiming,
  interpolate,
  Extrapolation,
  Easing,
  useAnimatedStyle,
} from 'react-native-reanimated';

type PopoutDirection =
  | 'top'
  | 'top-left'
  | 'top-right'
  | 'bottom'
  | 'bottom-left'
  | 'bottom-right'
  | 'left'
  | 'right';

interface LiquidPopupProps {
  panel: ReactElement;
  button: ReactElement;
  cacheKeys?: unknown[];
  captureWaitTime?: number;
  toggled?: boolean;
  gap?: number;
  padding?: number;
  blur?: number;
  alpha?: number;
  bias?: number;
  direction?: PopoutDirection;
}

function compareCacheKeys(keys1: unknown[], keys2: unknown[]): boolean {
  if (keys1.length !== keys2.length) return false;

  for (let i = 0; i < keys1.length; i++) {
    const val1 = keys1[i];
    const val2 = keys2[i];

    if (val1 !== val2) {
      if (typeof val1 === 'object' && val1 !== null && typeof val2 === 'object' && val2 !== null) {
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

interface PositionConfig {
  canvasWidth: number;
  canvasHeight: number;
  buttonX: number;
  buttonY: number;
  panelStartX: number;
  panelStartY: number;
  panelEndX: number;
  panelEndY: number;
}

function calculatePositions(
  direction: PopoutDirection,
  panelWidth: number,
  panelHeight: number,
  buttonWidth: number,
  buttonHeight: number,
  gap: number,
  padding: number
): PositionConfig {
  let canvasWidth: number;
  let canvasHeight: number;
  let buttonX: number;
  let buttonY: number;
  let panelEndX: number;
  let panelEndY: number;

  switch (direction) {
    case 'top':
      canvasWidth = Math.max(panelWidth, buttonWidth) + padding;
      canvasHeight = panelHeight + buttonHeight + gap + padding;
      buttonX = (canvasWidth - buttonWidth) / 2;
      buttonY = canvasHeight - buttonHeight - padding / 2;
      panelEndX = (canvasWidth - panelWidth) / 2;
      panelEndY = buttonY - panelHeight - gap;
      break;

    case 'top-left':
      canvasWidth = Math.max(panelWidth + buttonWidth + gap, panelWidth, buttonWidth) + padding;
      canvasHeight =
        Math.max(panelHeight + buttonHeight + gap, panelHeight, buttonHeight) + padding;
      buttonX = canvasWidth - buttonWidth - padding / 2;
      buttonY = canvasHeight - buttonHeight - padding / 2;
      panelEndX = buttonX - panelWidth - gap;
      panelEndY = buttonY - panelHeight - gap;
      break;

    case 'top-right':
      canvasWidth = Math.max(panelWidth + buttonWidth + gap, panelWidth, buttonWidth) + padding;
      canvasHeight =
        Math.max(panelHeight + buttonHeight + gap, panelHeight, buttonHeight) + padding;
      buttonX = padding / 2;
      buttonY = canvasHeight - buttonHeight - padding / 2;
      panelEndX = buttonX + buttonWidth + gap;
      panelEndY = buttonY - panelHeight - gap;
      break;

    case 'bottom':
      canvasWidth = Math.max(panelWidth, buttonWidth) + padding;
      canvasHeight = panelHeight + buttonHeight + gap + padding;
      buttonX = (canvasWidth - buttonWidth) / 2;
      buttonY = padding / 2;
      panelEndX = (canvasWidth - panelWidth) / 2;
      panelEndY = buttonY + buttonHeight + gap;
      break;

    case 'bottom-left':
      canvasWidth = Math.max(panelWidth + buttonWidth + gap, panelWidth, buttonWidth) + padding;
      canvasHeight =
        Math.max(panelHeight + buttonHeight + gap, panelHeight, buttonHeight) + padding;
      buttonX = canvasWidth - buttonWidth - padding / 2;
      buttonY = padding / 2;
      panelEndX = buttonX - panelWidth - gap;
      panelEndY = buttonY + buttonHeight + gap;
      break;

    case 'bottom-right':
    default:
      canvasWidth = Math.max(panelWidth + buttonWidth + gap, panelWidth, buttonWidth) + padding;
      canvasHeight =
        Math.max(panelHeight + buttonHeight + gap, panelHeight, buttonHeight) + padding;
      buttonX = padding / 2;
      buttonY = padding / 2;
      panelEndX = buttonX + buttonWidth + gap;
      panelEndY = buttonY + buttonHeight + gap;
      break;

    case 'left':
      canvasWidth = panelWidth + buttonWidth + gap + padding;
      canvasHeight = Math.max(panelHeight, buttonHeight) + padding;
      buttonX = canvasWidth - buttonWidth - padding / 2;
      buttonY = (canvasHeight - buttonHeight) / 2;
      panelEndX = buttonX - panelWidth - gap;
      panelEndY = (canvasHeight - panelHeight) / 2;
      break;

    case 'right':
      canvasWidth = panelWidth + buttonWidth + gap + padding;
      canvasHeight = Math.max(panelHeight, buttonHeight) + padding;
      buttonX = padding / 2;
      buttonY = (canvasHeight - buttonHeight) / 2;
      panelEndX = buttonX + buttonWidth + gap;
      panelEndY = (canvasHeight - panelHeight) / 2;
      break;
  }

  const buttonCenterX = buttonX + buttonWidth / 2;
  const buttonCenterY = buttonY + buttonHeight / 2;

  const panelStartX = buttonCenterX - buttonWidth / 4;
  const panelStartY = buttonCenterY - buttonHeight / 4;

  return {
    canvasWidth,
    canvasHeight,
    buttonX,
    buttonY,
    panelStartX,
    panelStartY,
    panelEndX,
    panelEndY,
  };
}

export function LiquidPopup({
  panel,
  button,
  cacheKeys = [],
  captureWaitTime = 16,
  toggled = false,
  gap = 0,
  padding = 32,
  blur = 30,
  alpha = 50,
  bias = -12,
  direction = 'top-left',
}: LiquidPopupProps) {
  const [panelImage, setPanelImage] = useState<SkImage | null>(null);
  const [buttonImage, setButtonImage] = useState<SkImage | null>(null);
  const [panelDimensions, setPanelDimensions] = useState({ width: 0, height: 0 });
  const [buttonDimensions, setButtonDimensions] = useState({ width: 0, height: 0 });
  const [isCapturing, setIsCapturing] = useState(false);
  const previousState = useRef<boolean>(toggled);
  const progress = useSharedValue(0);

  const panelRef = useRef<View>(null) as React.RefObject<View>;
  const buttonRef = useRef<View>(null) as React.RefObject<View>;
  const cachedKeys = useRef<unknown[]>(cacheKeys);

  const positions = useMemo(() => {
    return calculatePositions(
      direction,
      panelDimensions.width,
      panelDimensions.height,
      buttonDimensions.width,
      buttonDimensions.height,
      gap,
      padding
    );
  }, [
    direction,
    panelDimensions.width,
    panelDimensions.height,
    buttonDimensions.width,
    buttonDimensions.height,
    gap,
    padding,
  ]);

  useEffect(() => {
    if (previousState.current !== toggled) {
      if (toggled) {
        progress.value = withTiming(1, { duration: 1000, easing: Easing.out(Easing.cubic) });
      } else {
        progress.value = withTiming(0, { duration: 800, easing: Easing.out(Easing.cubic) });
      }
      previousState.current = toggled;
    }
  }, [toggled]);

  useEffect(() => {
    if (!compareCacheKeys(cacheKeys, cachedKeys.current)) {
      setPanelImage(null);
      cachedKeys.current = [...cacheKeys];
      const timer = setTimeout(captureContent, captureWaitTime);
      return () => clearTimeout(timer);
    }
  }, [cacheKeys, captureWaitTime]);

  useEffect(() => {
    if (panelDimensions.width > 0 && panelDimensions.height > 0 && !panelImage) {
      const timer = setTimeout(captureContent, captureWaitTime);
      return () => clearTimeout(timer);
    }
  }, [panelDimensions.width, panelDimensions.height, panelImage]);

  async function captureContent() {
    if (!panelRef.current || isCapturing) {
      return;
    }
    setIsCapturing(true);
    try {
      const panelImageResult = await makeImageFromView(panelRef);
      const buttonImageResult = await makeImageFromView(buttonRef);
      setPanelImage(panelImageResult);
      setButtonImage(buttonImageResult);
    } catch (error) {
      console.warn('Could not capture content:', error);
      setPanelImage(null);
      setButtonImage(null);
    } finally {
      setIsCapturing(false);
    }
  }

  function handlePanelLayout(event: LayoutChangeEvent) {
    const { width, height } = event.nativeEvent.layout;
    if (width !== panelDimensions.width || height !== panelDimensions.height) {
      setPanelDimensions({ width, height });
    }
  }

  function handleButtonLayout(event: LayoutChangeEvent) {
    const { width, height } = event.nativeEvent.layout;
    if (width !== buttonDimensions.width || height !== buttonDimensions.height) {
      setButtonDimensions({ width, height });
    }
  }

  const rectX = useDerivedValue(() => {
    return interpolate(
      progress.value,
      [0, 1],
      [positions.panelStartX, positions.panelEndX],
      Extrapolation.CLAMP
    );
  });

  const rectY = useDerivedValue(() => {
    return interpolate(
      progress.value,
      [0, 1],
      [positions.panelStartY, positions.panelEndY],
      Extrapolation.CLAMP
    );
  });

  const rectWidth = useDerivedValue(() => {
    return interpolate(
      progress.value,
      [0, 1],
      [buttonDimensions.width / 2, panelDimensions.width],
      Extrapolation.CLAMP
    );
  });

  const rectHeight = useDerivedValue(() => {
    return interpolate(
      progress.value,
      [0, 1],
      [buttonDimensions.height / 2, panelDimensions.height],
      Extrapolation.CLAMP
    );
  });

  const blurAmount = useDerivedValue(() => {
    return interpolate(progress.value, [0, 0.5, 1], [0, blur, 0], Extrapolation.CLAMP);
  });

  const matrix = useDerivedValue(() => {
    const realAlpha = interpolate(progress.value, [0, 1], [alpha, 1], Extrapolation.CLAMP);
    const realBias = interpolate(progress.value, [0, 1], [bias, 0], Extrapolation.CLAMP);

    return [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, realAlpha, realBias];
  });

  const blurLayer = useMemo(() => {
    return (
      <Paint>
        <Blur blur={blurAmount} />
        <ColorMatrix matrix={matrix} />
      </Paint>
    );
  }, []);

  const clip = useDerivedValue(() => {
    const radius = interpolate(
      progress.value,
      [0, 1],
      [buttonDimensions.height / 2, 0],
      Extrapolation.CLAMP
    );
    return rrect(rect(rectX.value, rectY.value, rectWidth.value, rectHeight.value), radius, radius);
  });

  const panelStyle = useAnimatedStyle(() => {
    return {
      position: 'absolute',
      left: positions.panelEndX,
      top: progress.value !== 1 ? 10000 : positions.panelEndY,
    };
  });

  const buttonStyle = useAnimatedStyle(() => {
    return {
      position: 'absolute',
      left: positions.buttonX,
      top: progress.value === 0 || progress.value === 1 ? positions.buttonY : 10000,
    };
  });

  return (
    <View>
      <Canvas
        style={{
          width: positions.canvasWidth,
          height: positions.canvasHeight,
          pointerEvents: 'none',
        }}>
        <Group layer={blurLayer}>
          <Group clip={clip}>
            <Image image={panelImage} x={rectX} y={rectY} width={rectWidth} height={rectHeight} />
          </Group>

          <Image
            image={buttonImage}
            x={positions.buttonX}
            y={positions.buttonY}
            width={buttonDimensions.width}
            height={buttonDimensions.height}
          />
        </Group>
      </Canvas>
      <View
        style={{
          position: 'absolute',
          width: positions.canvasWidth,
          height: positions.canvasHeight,
        }}>
        <Animated.View
          ref={panelRef}
          style={[
            {
              alignSelf: 'flex-start',
            },
            panelStyle,
          ]}
          collapsable={false}
          onLayout={handlePanelLayout}>
          {panel}
        </Animated.View>
        <Animated.View
          ref={buttonRef}
          style={[
            {
              alignSelf: 'flex-start',
            },
            buttonStyle,
          ]}
          collapsable={false}
          onLayout={handleButtonLayout}>
          {button}
        </Animated.View>
      </View>
    </View>
  );
}
