import { createContext, ReactNode, useContext, useImperativeHandle, forwardRef } from 'react';
import { LayoutChangeEvent, View, ViewStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  interpolate,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { runOnJS } from 'react-native-worklets';

interface ActionSliderProps {
  children?: ReactNode | null;
  SliderComponent: ReactNode;
  containerStyle?: ViewStyle;
  sliderStyle?: ViewStyle;
  successRange?: number;
  snapOnReleaseDuration?: number | null;
  snapBackOnSuccess?: boolean;
  onSuccess?: () => void;
  onFail?: () => void;
  disabled?: boolean;
}

export const ActionSlider = forwardRef<ActionSliderRef, ActionSliderProps>(
  (
    {
      children,
      SliderComponent,
      containerStyle,
      sliderStyle,
      onSuccess = () => {},
      onFail = () => {},
      successRange = 10,
      snapBackOnSuccess = true,
      snapOnReleaseDuration = 500,
      disabled = false,
    },
    ref
  ) => {
    const containerDimensions = useSharedValue<ComponentDimensions>(null);
    const sliderDimensions = useSharedValue<ComponentDimensions>(null);

    const translationX = useSharedValue(0);
    const startX = useSharedValue(0);
    const progress = useSharedValue(0);
    const swipeEnabled = useSharedValue(!disabled);

    useImperativeHandle(
      ref,
      () => ({
        reset: (animated: boolean = true, duration: number = 300) => {
          if (animated) {
            swipeEnabled.value = false;
            translationX.value = withTiming(
              0,
              {
                duration,
                easing: Easing.out(Easing.cubic),
              },
              (finished) => {
                if (finished) {
                  swipeEnabled.value = !disabled;
                }
              }
            );
            progress.value = withTiming(0, {
              duration,
              easing: Easing.out(Easing.cubic),
            });
          } else {
            translationX.value = 0;
            progress.value = 0;
          }
        },
      }),
      [disabled]
    );

    function onComponentLayout(
      e: LayoutChangeEvent,
      sharedDimensions: SharedValue<ComponentDimensions>
    ) {
      sharedDimensions.value = e.nativeEvent.layout;
    }

    const gesture = Gesture.Pan()
      .onBegin(() => {
        if (!swipeEnabled.value) return;
        startX.value = translationX.value;
      })
      .onUpdate((e) => {
        if (!swipeEnabled.value) return;

        if (!containerDimensions.value || !sliderDimensions.value) {
          translationX.value = 0;
          return;
        }

        const actualTranslationX = startX.value + e.translationX;
        const { width: containerWidth } = containerDimensions.value;
        const { width: sliderWidth } = sliderDimensions.value;
        const maxWidth = containerWidth - sliderWidth;

        if (maxWidth <= 0) {
          translationX.value = 0;
          return;
        }

        const value = Math.max(0, Math.min(actualTranslationX, maxWidth));
        translationX.value = value;
        progress.value = interpolate(value, [0, maxWidth], [0, 100]);
      })
      .onEnd(() => {
        if (!containerDimensions.value || !sliderDimensions.value) {
          translationX.value = 0;
          return;
        }

        const isSuccess = progress.value > 100 - successRange;

        if (isSuccess) runOnJS(onSuccess)();
        else runOnJS(onFail)();

        if (snapOnReleaseDuration !== null) {
          swipeEnabled.value = false;

          if (!isSuccess || snapBackOnSuccess) {
            translationX.value = withTiming(
              0,
              {
                duration: snapOnReleaseDuration,
                easing: Easing.out(Easing.cubic),
              },
              (finished) => {
                if (finished) {
                  swipeEnabled.value = !disabled;
                }
              }
            );
            progress.value = withTiming(0, {
              duration: snapOnReleaseDuration,
              easing: Easing.out(Easing.cubic),
            });
          } else {
            const { width: containerWidth } = containerDimensions.value;
            const { width: sliderWidth } = sliderDimensions.value;
            const maxWidth = containerWidth - sliderWidth;

            translationX.value = withTiming(
              maxWidth,
              {
                duration: snapOnReleaseDuration,
                easing: Easing.out(Easing.cubic),
              },
              (finished) => {
                if (finished) swipeEnabled.value = !disabled;
              }
            );
            progress.value = withTiming(100, {
              duration: snapOnReleaseDuration,
              easing: Easing.out(Easing.cubic),
            });
          }
        }
      });

    const sliderAnimatedStyle = useAnimatedStyle(() => {
      return {
        transform: [{ translateX: translationX.value }],
        alignSelf: 'flex-start',
        ...sliderStyle,
      };
    });

    const contextValue = {
      progress,
      translationX,
    };

    return (
      <ActionSliderContext.Provider value={contextValue}>
        <View style={[containerStyle, { overflow: 'hidden' }]}>
          <View onLayout={(e) => onComponentLayout(e, containerDimensions)}>
            {children}
            <GestureDetector gesture={gesture}>
              <Animated.View
                style={sliderAnimatedStyle}
                onLayout={(e) => onComponentLayout(e, sliderDimensions)}>
                {SliderComponent}
              </Animated.View>
            </GestureDetector>
          </View>
        </View>
      </ActionSliderContext.Provider>
    );
  }
);

const ActionSliderContext = createContext<{
  translationX: SharedValue<number>;
  progress: SharedValue<number>;
} | null>(null);

export const useActionSliderContext = () => {
  const context = useContext(ActionSliderContext);
  if (!context) {
    throw new Error('useActionSliderContext must be used within ActionSlider');
  }
  return context;
};

export interface ActionSliderRef {
  reset: (animated?: boolean, duration?: number) => void;
}

type ComponentDimensions = { width: number; height: number } | null;
