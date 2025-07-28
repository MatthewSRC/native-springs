import React, { ReactNode, createContext, useContext } from 'react';
import { LayoutChangeEvent, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { SpringConfig } from 'react-native-reanimated/lib/typescript/animation/springUtils';

interface DragRevealProps {
  children: ReactNode;
  springConfig?: SpringConfig;
  velocityThreshold?: number;
}

type DragRevealConfig = Omit<DragRevealProps, 'children'>;

const DragRevealContext = createContext<{
  config: DragRevealConfig;
  revealComponentDimensions: SharedValue<{ width: number; height: number }>;
  translationY: SharedValue<number>;
} | null>(null);

export const useDragRevealContext = () => {
  const context = useContext(DragRevealContext);
  if (!context) {
    throw new Error('DragReveal compound components must be used within DragReveal');
  }
  return context;
};

interface MainProps {
  children: ReactNode;
}

interface DragProps {
  children: ReactNode;
}

interface RevealProps {
  children: ReactNode;
}

function Main({ children }: MainProps) {
  return <View>{children}</View>;
}

function Drag({ children }: DragProps) {
  const { config, revealComponentDimensions, translationY } = useDragRevealContext();
  const startY = useSharedValue(0);

  const pan = Gesture.Pan()
    .onBegin(() => {
      startY.value = translationY.value;
    })
    .onUpdate((e) => {
      translationY.value = Math.min(
        Math.max(0, startY.value + e.translationY),
        revealComponentDimensions.value.height
      );
    })
    .onEnd((e) => {
      const threshold = revealComponentDimensions.value.height / 2;
      const springConfigWithVelocity = {
        ...config.springConfig,
        velocity: config.velocityThreshold !== -1 ? e.velocityY : undefined,
      };

      if (config.velocityThreshold !== -1) {
        if (e.velocityY > config.velocityThreshold!) {
          translationY.value = withSpring(
            revealComponentDimensions.value.height,
            springConfigWithVelocity
          );
          return;
        }
        if (e.velocityY < -config.velocityThreshold!) {
          translationY.value = withSpring(0, springConfigWithVelocity);
          return;
        }
      }

      if (translationY.value > threshold) {
        translationY.value = withSpring(
          revealComponentDimensions.value.height,
          springConfigWithVelocity
        );
      } else {
        translationY.value = withSpring(0, springConfigWithVelocity);
      }
    });

  return (
    <GestureDetector gesture={pan}>
      <Animated.View>{children}</Animated.View>
    </GestureDetector>
  );
}

function Reveal({ children }: RevealProps) {
  const { revealComponentDimensions, translationY } = useDragRevealContext();

  function handleLayout(event: LayoutChangeEvent) {
    const { width, height } = event.nativeEvent.layout;
    revealComponentDimensions.value = { width, height };
  }

  const revealStyle = useAnimatedStyle(() => {
    return { height: translationY.value };
  });

  return (
    <View>
      <Animated.View
        style={{ zIndex: -1, position: 'absolute', bottom: 0 }}
        onLayout={handleLayout}>
        {children}
      </Animated.View>
      <Animated.View style={revealStyle} />
    </View>
  );
}

export function DragReveal({
  children,
  springConfig = {
    damping: 20,
    stiffness: 150,
    mass: 1,
    overshootClamping: true,
    restDisplacementThreshold: 0.1,
    restSpeedThreshold: 0.1,
  },
  velocityThreshold = 500,
}: DragRevealProps) {
  const revealComponentDimensions = useSharedValue<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });
  const translationY = useSharedValue(0);

  const contextValue = {
    config: { springConfig, velocityThreshold },
    revealComponentDimensions,
    translationY,
  };

  return <DragRevealContext.Provider value={contextValue}>{children}</DragRevealContext.Provider>;
}

DragReveal.Main = Main;
DragReveal.Drag = Drag;
DragReveal.Reveal = Reveal;
