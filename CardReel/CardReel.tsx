import { ReactElement } from 'react';
import { View } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

export function CardReel({
  children,
  cardHeight,
  cardWidth,
  cardSpacing = 12,
  displayedCards = 3,
  overScroll = false,
}: CardReelProps) {
  const REAL_CARD_HEIGHT = cardHeight + cardSpacing;

  let MIN_PROGRESS: number;
  let MAX_PROGRESS: number;

  if (overScroll) {
    MIN_PROGRESS = -displayedCards * REAL_CARD_HEIGHT;
    MAX_PROGRESS = children.length * REAL_CARD_HEIGHT;
  } else {
    MIN_PROGRESS = 0;
    MAX_PROGRESS = Math.max(0, (children.length - displayedCards) * REAL_CARD_HEIGHT);
  }

  const progress = useSharedValue(0);
  const startY = useSharedValue(0);

  const gesture = Gesture.Pan()
    .onBegin(() => {
      startY.value = progress.value;
    })
    .onUpdate((e) => {
      const translationY = startY.value + e.translationY;

      progress.value = Math.max(MIN_PROGRESS, Math.min(MAX_PROGRESS, translationY));
    })
    .onEnd(() => {
      const snappedProgress = Math.round(progress.value / REAL_CARD_HEIGHT) * REAL_CARD_HEIGHT;

      progress.value = withTiming(Math.max(MIN_PROGRESS, Math.min(MAX_PROGRESS, snappedProgress)), {
        duration: 300,
        easing: Easing.out(Easing.cubic),
      });
    });

  return (
    <View
      style={{
        height: REAL_CARD_HEIGHT * displayedCards,
        width: cardWidth,
      }}>
      <GestureDetector gesture={gesture}>
        <View style={{ height: displayedCards * REAL_CARD_HEIGHT }}>
          {children.map((item, index) => (
            <Card
              key={'card' + index}
              item={item}
              index={index}
              cardHeight={REAL_CARD_HEIGHT}
              progress={progress}
              displayedCards={displayedCards}
            />
          ))}
        </View>
      </GestureDetector>
    </View>
  );
}

function Card({
  item,
  index,
  cardHeight,
  progress,
  displayedCards,
}: {
  item: ReactElement;
  index: number;
  cardHeight: number;
  progress: SharedValue<number>;
  displayedCards: number;
}) {
  const rStyle = useAnimatedStyle(() => {
    const translateY = index * cardHeight - progress.value;

    const viewportTop = 0;
    const viewportBottom = displayedCards * cardHeight;
    const cardTop = translateY;
    const cardBottom = translateY + cardHeight;

    const visibleTop = Math.max(viewportTop, cardTop);
    const visibleBottom = Math.min(viewportBottom, cardBottom);
    const visibleHeight = Math.max(0, visibleBottom - visibleTop);
    const passingValue = visibleHeight / cardHeight;

    let scale: number;
    let opacity: number;

    if (cardTop < viewportTop && cardBottom > viewportTop) {
      scale = 1 + 0.2 * (1 - passingValue);
      opacity = passingValue;
    } else if (cardTop < viewportBottom && cardBottom > viewportBottom) {
      scale = 0.8 + 0.2 * passingValue;
      opacity = passingValue;
    } else if (passingValue > 0) {
      scale = 1;
      opacity = 1;
    } else {
      scale = 0.8;
      opacity = 0;
    }

    return {
      position: 'absolute',
      alignSelf: 'center',
      opacity,
      transform: [{ translateY }, { scale }],
    };
  });

  return <Animated.View style={rStyle}>{item}</Animated.View>;
}

interface CardReelProps {
  children: ReactElement[];
  cardHeight: number;
  cardWidth: number;
  displayedCards?: number;
  cardSpacing?: number;
  overScroll?: boolean;
}
