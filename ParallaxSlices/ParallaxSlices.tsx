import { ReactElement, ReactNode } from "react";
import { useWindowDimensions, View } from "react-native";
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  SharedValue,
} from "react-native-reanimated";

interface ParallaxSlicesProps {
  children: ReactElement;
  minSegmentWidth?: number;
  dividerWidth?: number;
  parallaxFactor?: number;
  borderRadius?: number;
  width?: number;
  height?: number;
  imageWidthMultiplier?: number;
  dividerColor?: string;
}

function calculateSegmentWidth(
  totalWidth: number,
  numSegments: number,
  divWidth: number
) {
  const totalDividerWidth = (numSegments - 1) * divWidth;
  const availableForSegments = totalWidth - totalDividerWidth;
  return availableForSegments / numSegments;
}

function calculateOptimalSegments(
  totalWidth: number,
  minWidth: number,
  divWidth: number
) {
  const maxSegments = Math.floor(
    (totalWidth + divWidth) / (minWidth + divWidth)
  );
  const actualSegmentWidth = calculateSegmentWidth(
    totalWidth,
    maxSegments,
    divWidth
  );

  return {
    numSegments: maxSegments,
    segmentWidth: actualSegmentWidth,
  };
}

export function ParallaxSlices({
  children,
  minSegmentWidth = 100,
  dividerWidth = 40,
  parallaxFactor = 0.5,
  borderRadius = 0,
  width,
  height,
  imageWidthMultiplier = 2,
  dividerColor = "transparent",
}: ParallaxSlicesProps) {
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();
  const scrollX = useSharedValue(0);

  const containerWidth = width || SCREEN_WIDTH;
  const containerHeight = height || SCREEN_HEIGHT * 0.8;

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (e) => {
      const currentScrollX = e.contentOffset.x;
      scrollX.value = currentScrollX;
    },
  });

  const { numSegments, segmentWidth } = calculateOptimalSegments(
    containerWidth * imageWidthMultiplier,
    minSegmentWidth,
    dividerWidth
  );

  const totalScrollWidth =
    numSegments * segmentWidth + (numSegments - 1) * dividerWidth;
  const maxScrollX = totalScrollWidth - containerWidth;

  const requiredImageWidth = totalScrollWidth + maxScrollX * parallaxFactor;

  return (
    <View style={{ width: containerWidth, height: containerHeight }}>
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: containerWidth,
          height: containerHeight,
        }}
      />

      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsHorizontalScrollIndicator={false}
        bounces={false}
        overScrollMode="never"
        style={{
          width: containerWidth,
          height: containerHeight,
        }}
        contentContainerStyle={{
          width: totalScrollWidth,
        }}
        horizontal
      >
        <View
          style={{
            flexDirection: "row",
            width: totalScrollWidth,
            height: containerHeight,
          }}
        >
          {Array.from(Array(numSegments).keys()).map((_, i) => (
            <ParallaxSegment
              key={`segment-${i}`}
              segmentIndex={i}
              segmentWidth={segmentWidth}
              segmentHeight={containerHeight}
              dividerWidth={dividerWidth}
              borderRadius={borderRadius}
              requiredImageWidth={requiredImageWidth}
              maxScrollX={maxScrollX}
              parallaxFactor={parallaxFactor}
              scrollX={scrollX}
              isLast={i === numSegments - 1}
              dividerColor={dividerColor}
            >
              {children}
            </ParallaxSegment>
          ))}
        </View>
      </Animated.ScrollView>
    </View>
  );
}

function ParallaxSegment({
  children,
  segmentIndex,
  segmentWidth,
  segmentHeight,
  dividerWidth,
  borderRadius,
  requiredImageWidth,
  maxScrollX,
  parallaxFactor,
  scrollX,
  isLast,
  dividerColor,
}: {
  children: ReactNode;
  segmentIndex: number;
  segmentWidth: number;
  segmentHeight: number;
  dividerWidth: number;
  borderRadius: number;
  requiredImageWidth: number;
  maxScrollX: number;
  parallaxFactor: number;
  scrollX: SharedValue<number>;
  isLast: boolean;
  dividerColor: string;
}) {
  const segmentScrollPosition = segmentIndex * (segmentWidth + dividerWidth);

  const imageStyle = useAnimatedStyle(() => {
    const imageGlobalPosition = interpolate(
      scrollX.value,
      [0, maxScrollX],
      [0, -maxScrollX * parallaxFactor],
      "clamp"
    );

    const imagePositionInSegment = imageGlobalPosition - segmentScrollPosition;

    return {
      transform: [{ translateX: imagePositionInSegment }],
    };
  });

  return (
    <View style={{ flexDirection: "row" }}>
      <View
        style={{
          width: segmentWidth,
          height: segmentHeight,
          borderRadius,
          overflow: "hidden",
        }}
      >
        <Animated.View
          style={[
            {
              width: requiredImageWidth,
              height: segmentHeight,
            },
            imageStyle,
          ]}
        >
          {children}
        </Animated.View>
      </View>

      {!isLast && (
        <View
          style={{
            width: dividerWidth,
            height: segmentHeight,
            backgroundColor: dividerColor,
          }}
        />
      )}
    </View>
  );
}
