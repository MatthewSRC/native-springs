import { ReactNode, useRef } from 'react';
import { useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  SharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

interface Props {
  children: ReactNode[];
}

const MARGIN = 16;

export function ParallaxCarousel({ children }: Props) {
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const EXTENDED_CARD_WIDTH = SCREEN_WIDTH * 0.65;

  const CARD_WITH_MARGIN = EXTENDED_CARD_WIDTH + MARGIN;
  const SCROLL_PADDING = SCREEN_WIDTH / 2 - EXTENDED_CARD_WIDTH / 2;

  const scrollX = useSharedValue(0);
  const velocityX = useSharedValue(0);
  const previousScrollX = useRef(0);
  const lastTimestamp = useRef(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (e) => {
      const currentScrollX = e.contentOffset.x;
      const currentTime = Date.now();

      if (e.velocity && e.velocity.x !== undefined) {
        velocityX.value = Math.max(-2, Math.min(2, e.velocity.x));
      } else {
        const timeDiff = currentTime - lastTimestamp.current;
        if (timeDiff > 0) {
          const scrollDiff = currentScrollX - previousScrollX.current;
          const calculatedVelocity = (scrollDiff / timeDiff) * 1000;
          velocityX.value = Math.max(-2, Math.min(2, calculatedVelocity / 1000));
        }
      }

      scrollX.value = currentScrollX;
      previousScrollX.current = currentScrollX;
      lastTimestamp.current = currentTime;
    },
    onMomentumEnd: (e) => {
      if (e.velocity && e.velocity.x !== undefined) {
        velocityX.value = Math.max(-2, Math.min(2, e.velocity.x));
      } else {
        velocityX.value = withTiming(0, { duration: 300 });
      }
    },
    onBeginDrag: () => {
      velocityX.value = 0;
    },
  });

  const translationX = useAnimatedStyle(() => {
    const currentIndex = scrollX.value / CARD_WITH_MARGIN;

    // Calculate how much the visual layout differs from the scroll layout
    let visualScrollOffset = 0;

    // For each card, calculate the difference between its scroll width and visual width
    for (let i = 0; i < children.length; i++) {
      const distance = Math.abs(i - currentIndex);
      const scale = Math.max(0.5, 1 / (distance * 1.2 + 1));
      const visualWidth = EXTENDED_CARD_WIDTH * scale + MARGIN;
      const scrollWidth = CARD_WITH_MARGIN;
      const widthDifference = scrollWidth - visualWidth;

      // Only count cards to the left of current position
      if (i < currentIndex) {
        visualScrollOffset += widthDifference;
      } else if (i === Math.floor(currentIndex)) {
        const progress = currentIndex - Math.floor(currentIndex);
        visualScrollOffset += widthDifference * progress;
      }
    }

    return {
      transform: [
        {
          translateX: withTiming(-scrollX.value + visualScrollOffset, {
            duration: 200,
            easing: Easing.out(Easing.quad),
          }),
        },
      ],
    };
  });

  return (
    <View>
      <Animated.View
        style={[
          translationX,
          {
            paddingHorizontal: SCROLL_PADDING,
            flexDirection: 'row',
            position: 'absolute',
          },
        ]}>
        {children.map((item, index) => (
          <ParallaxView
            key={index}
            index={index}
            scrollX={scrollX}
            velocityX={velocityX}
            extendedWidth={EXTENDED_CARD_WIDTH}
            cardWithMargin={CARD_WITH_MARGIN}>
            {item}
          </ParallaxView>
        ))}
      </Animated.View>
      <Animated.ScrollView
        onScroll={scrollHandler}
        showsHorizontalScrollIndicator={false}
        overScrollMode="never"
        horizontal
        contentContainerStyle={{
          paddingHorizontal: SCROLL_PADDING,
        }}>
        {children.map((_, index) => (
          <View key={index} style={{ width: EXTENDED_CARD_WIDTH, marginHorizontal: MARGIN / 2 }} />
        ))}
      </Animated.ScrollView>
    </View>
  );
}

function ParallaxView({
  children,
  index,
  scrollX,
  velocityX,
  extendedWidth,
  cardWithMargin,
}: {
  children: ReactNode;
  index: number;
  scrollX: SharedValue<number>;
  velocityX: SharedValue<number>;
  extendedWidth: number;
  cardWithMargin: number;
}) {
  const outsideStyle = useAnimatedStyle(() => {
    const currentIndex = scrollX.value / cardWithMargin;
    const distance = Math.abs(index - currentIndex);
    const scale = Math.max(0.5, 1 / (distance * 1.2 + 1));

    return {
      width: withTiming(extendedWidth * scale, {
        duration: 200,
        easing: Easing.out(Easing.quad),
      }),
    };
  });

  const insideStyle = useAnimatedStyle(() => {
    const currentIndex = scrollX.value / cardWithMargin;
    const parallaxOffset = (index - currentIndex) * extendedWidth * 0.1;
    const velocityOffset = velocityX.value * extendedWidth * 0.05;

    return {
      transform: [
        {
          translateX: withTiming(parallaxOffset + velocityOffset, {
            duration: 300,
            easing: Easing.out(Easing.quad),
          }),
        },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        outsideStyle,
        {
          overflow: 'hidden',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 24,
          marginHorizontal: MARGIN / 2,
        },
      ]}>
      <Animated.View style={insideStyle}>{children}</Animated.View>
    </Animated.View>
  );
}
