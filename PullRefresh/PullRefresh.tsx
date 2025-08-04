import React, { createContext, ReactElement, useContext, useEffect } from 'react';
import { FlatList, FlatListProps, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

interface PullRefreshProps<T> extends FlatListProps<T> {
  refreshComponent: ReactElement;
  refreshing: boolean;
  onRefresh: () => void;
  refreshViewBaseHeight?: number;
  refreshViewMaxHeight?: number;
  progressThresholdToRefresh?: number;
  backAnimationDuration?: number;
}

const PullRefreshContext = createContext<{
  refreshProgress: SharedValue<number>;
} | null>(null);

export const usePullRefreshContext = () => {
  const context = useContext(PullRefreshContext);
  if (!context) {
    throw new Error('Must be used within PullRefreshContext provider');
  }
  return context;
};

export function PullRefresh<T>({
  refreshComponent,
  refreshing,
  onRefresh,
  refreshViewBaseHeight = 150,
  refreshViewMaxHeight = 200,
  progressThresholdToRefresh = 50,
  backAnimationDuration = 400,
  ...flatListProps
}: PullRefreshProps<T>) {
  const listOffsetY = useSharedValue(0);
  const isAnimating = useSharedValue(false);
  const refreshProgress = useSharedValue(0);
  const contextValue = {
    refreshProgress,
  };

  function scrollHandler(e: NativeSyntheticEvent<NativeScrollEvent>) {
    listOffsetY.value = e.nativeEvent.contentOffset.y;
  }

  useEffect(() => {
    if (!refreshing) {
      isAnimating.value = true;
      refreshProgress.value = withTiming(0, { duration: backAnimationDuration }, (finished) => {
        if (finished) isAnimating.value = false;
      });
    }
  }, [refreshing]);

  const lastDragY = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      if (refreshing || isAnimating.value) return;
      lastDragY.value = 0;
      // Why is this needed? Because there's a subtle issue where translationY can continue updating
      // even after the animation has finished. By setting refreshProgress to a non-zero value here,
      // we ensure that the update logic in onChange only kicks in when a new touch actually begins,
      // avoiding interference from any incomplete touches.
      refreshProgress.value = 1;
    })
    .onChange((e) => {
      if (refreshing || isAnimating.value || refreshProgress.value === 0) return;

      const deltaY = e.translationY - lastDragY.value;
      lastDragY.value = e.translationY;

      if (listOffsetY.value <= 0 || refreshProgress.value > 1) {
        const next = Math.max(0, Math.min(refreshProgress.value + deltaY, refreshViewMaxHeight));
        refreshProgress.value = next;
      }
    })
    .onEnd(() => {
      if (refreshing || isAnimating.value) return;

      const thresholdPx =
        (refreshViewBaseHeight * Math.min(Math.max(progressThresholdToRefresh, 0), 100)) / 100;

      isAnimating.value = true;

      if (refreshProgress.value >= thresholdPx) {
        refreshProgress.value = withSpring(refreshViewBaseHeight, {}, (finished) => {
          if (finished) isAnimating.value = false;
        });
        runOnJS(onRefresh)();
      } else {
        refreshProgress.value = withTiming(0, { duration: backAnimationDuration }, (finished) => {
          if (finished) {
            isAnimating.value = false;
          }
        });
      }

      lastDragY.value = 0;
    });

  const nativeGesture = Gesture.Native();
  const composedGestures = Gesture.Simultaneous(panGesture, nativeGesture);

  const rStyle = useAnimatedStyle(() => {
    return { height: refreshProgress.value };
  });

  return (
    <PullRefreshContext.Provider value={contextValue}>
      <GestureDetector gesture={composedGestures}>
        <FlatList
          {...flatListProps}
          scrollEventThrottle={16}
          onScroll={scrollHandler}
          ListHeaderComponent={
            <>
              <Animated.View style={rStyle}>{refreshComponent}</Animated.View>
              {flatListProps.ListHeaderComponent}
            </>
          }
        />
      </GestureDetector>
    </PullRefreshContext.Provider>
  );
}
