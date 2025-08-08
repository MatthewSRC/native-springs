import { ReactElement, useState } from 'react';
import { View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  interpolate,
  withTiming,
  Extrapolation,
  SharedValue,
} from 'react-native-reanimated';
import { runOnJS } from 'react-native-worklets';

export function StackCarousel({
  content,
  itemHeight,
  itemCount = 4,
  baseSpacing = 60,
  snapsDuration = 200,
}: Props) {
  const [baseIndex, setBaseIndex] = useState(0);
  const scrollOffset = useSharedValue(0);
  const totalOffset = useSharedValue(0);

  function rebaseIndex(offsetChange: number) {
    const newBaseIndex =
      (((baseIndex + offsetChange) % content.length) + content.length) % content.length;
    setBaseIndex(newBaseIndex);

    totalOffset.value -= offsetChange;
  }

  const gesture = Gesture.Pan()
    .onChange((e) => {
      scrollOffset.value = e.translationY;
    })
    .onEnd(() => {
      const itemsMoved = Math.round(scrollOffset.value / itemHeight);

      if (itemsMoved !== 0) {
        totalOffset.value = withTiming(
          totalOffset.value + itemsMoved,
          {
            duration: snapsDuration,
          },
          (finished) => {
            if (!finished) return;
            const currentTotalOffset = totalOffset.value + itemsMoved;
            if (Math.abs(currentTotalOffset) > content.length) {
              const rebaseAmount = Math.round(currentTotalOffset / content.length) * content.length;
              runOnJS(rebaseIndex)(rebaseAmount);
            }
          }
        );
      } else {
        totalOffset.value = withTiming(totalOffset.value, {
          duration: snapsDuration,
        });
      }

      scrollOffset.value = withTiming(0, {
        duration: snapsDuration,
      });
    });

  function getCurrentItems() {
    const items = [];
    const bufferSize = content.length * 2;

    for (let i = -bufferSize; i < bufferSize; i++) {
      const itemIndex = (((baseIndex + i) % content.length) + content.length) % content.length;
      items.push({
        element: content[itemIndex],
        position: i,
        key: `${baseIndex}-${i}`,
      });
    }
    return items;
  }

  const items = getCurrentItems();

  return (
    <GestureDetector gesture={gesture}>
      <View>
        {items.map(({ element, position, key }) => (
          <StackCarouselSlot
            position={position}
            key={key}
            itemCount={itemCount}
            itemHeight={itemHeight}
            scrollOffset={scrollOffset}
            totalOffset={totalOffset}
            baseSpacing={baseSpacing}>
            {element}
          </StackCarouselSlot>
        ))}
      </View>
    </GestureDetector>
  );
}

function StackCarouselSlot({
  scrollOffset,
  position,
  itemCount,
  itemHeight,
  totalOffset,
  baseSpacing,
  children,
}: {
  children: ReactElement;
  scrollOffset: SharedValue<number>;
  position: number;
  itemHeight: number;
  itemCount: number;
  baseSpacing: number;
  totalOffset: SharedValue<number>;
}) {
  const rStyle = useAnimatedStyle(() => {
    const currentScrollOffset = scrollOffset.value / itemHeight;
    const currentPosition = position - currentScrollOffset - totalOffset.value;

    const isVisible = currentPosition >= -3 && currentPosition <= itemCount + 2;

    if (!isVisible) {
      return { opacity: 0, pointerEvents: 'none', display: 'none' };
    }

    const visualPosition = itemCount - 1 - currentPosition;

    const scale = interpolate(visualPosition, [0, itemCount - 1], [1.0, 0.3], Extrapolation.CLAMP);

    const translateY = -visualPosition * baseSpacing;

    const opacity = interpolate(
      visualPosition,
      [-1, 0, itemCount - 1, itemCount],
      [0, 1.0, 1, 0],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ scale: Math.max(0.1, scale) }, { translateY }],
      opacity: Math.max(0, opacity),
      pointerEvents: opacity <= 0.01 ? 'none' : 'auto',
      display: opacity <= 0.01 ? 'none' : 'flex',
    };
  });

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: '100%',
          height: '100%',
        },
        rStyle,
      ]}>
      {children}
    </Animated.View>
  );
}

interface Props {
  content: ReactElement[];
  itemCount?: number;
  baseSpacing?: number;
  itemHeight: number;
  snapsDuration?: number;
}
