import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  interpolateColor,
} from 'react-native-reanimated';
import { runOnJS } from 'react-native-worklets';

import { useScrollKeyframe, ScrollDirection, ScrollStoryboard } from './ScrollStoryboard';

function DirectionalCard({ title, color, emoji }: { title: string; color: string; emoji: string }) {
  const { progress, entryDirection, registerDirectionalEntry, registerDirectionalExit } =
    useScrollKeyframe();

  const scale = useSharedValue(0.3);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(100);
  const rotation = useSharedValue(0);

  const progressStyle = useAnimatedStyle(() => {
    const progressScale = interpolate(progress, [0, 0.5, 1], [1, 1.1, 1]);
    const progressOpacity = interpolate(progress, [0, 0.2, 0.8, 1], [0.7, 1, 1, 0.7]);

    return {
      transform: [{ scale: progressScale }],
      opacity: progressOpacity,
    };
  });

  const containerStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { translateY: translateY.value },
        { rotateZ: `${rotation.value}deg` },
      ],
      opacity: opacity.value,
    };
  });

  useEffect(() => {
    const unregisterEntry = registerDirectionalEntry((direction, complete) => {
      'worklet';

      if (direction === ScrollDirection.TOP) {
        // Entering from top (scrolling down) - slide up
        translateY.value = withSpring(0, { damping: 15, stiffness: 200 });
        scale.value = withSpring(1, { damping: 15, stiffness: 200 });
        opacity.value = withTiming(1, { duration: 400 });
        rotation.value = withSpring(360, { damping: 20, stiffness: 300 }, () => {
          rotation.value = 0;
          runOnJS(complete)();
        });
      } else {
        // Entering from bottom (scrolling up) - slide down
        translateY.value = withSpring(0, { damping: 20, stiffness: 150 });
        scale.value = withSpring(1, { damping: 20, stiffness: 150 });
        opacity.value = withTiming(1, { duration: 400 });
        rotation.value = withSpring(-360, { damping: 20, stiffness: 300 }, () => {
          rotation.value = 0;
          runOnJS(complete)();
        });
      }
    });

    const unregisterExit = registerDirectionalExit((direction, complete) => {
      'worklet';

      if (direction === ScrollDirection.TOP) {
        // Exiting from top (scrolling up) - fly up and scale up
        translateY.value = withTiming(-150, { duration: 600 });
        scale.value = withTiming(2, { duration: 600 });
        opacity.value = withTiming(0, { duration: 400 });
        rotation.value = withTiming(720, { duration: 600 }, () => {
          runOnJS(complete)();
        });
      } else {
        // Exiting from bottom (scrolling down) - shrink and drop
        translateY.value = withTiming(150, { duration: 600 });
        scale.value = withTiming(0.1, { duration: 600 });
        opacity.value = withTiming(0, { duration: 400 });
        rotation.value = withTiming(-720, { duration: 600 }, () => {
          runOnJS(complete)();
        });
      }
    });

    return () => {
      unregisterEntry();
      unregisterExit();
    };
  }, [registerDirectionalEntry, registerDirectionalExit]);

  return (
    <Animated.View style={[styles.card, { backgroundColor: color }, containerStyle]}>
      <Animated.View style={progressStyle}>
        <Text style={styles.emoji}>{emoji}</Text>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.progressText}>Progress: {Math.round(progress * 100)}%</Text>
        <Text style={styles.directionText}>Entered from: {entryDirection}</Text>
        <Text style={styles.instructionText}>
          {entryDirection === ScrollDirection.TOP
            ? '↓ Scrolled down to enter - spinning clockwise!'
            : entryDirection === ScrollDirection.BOTTOM
              ? '↑ Scrolled up to enter - spinning counter-clockwise!'
              : 'Scroll to see direction-aware animations!'}
        </Text>
      </Animated.View>
    </Animated.View>
  );
}

function ColorMorphCard() {
  const { progress, registerDirectionalEntry, registerDirectionalExit } = useScrollKeyframe();

  const scale = useSharedValue(0.5);
  const opacity = useSharedValue(0);
  const rotation = useSharedValue(0);

  const colorStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      progress,
      [0, 0.33, 0.66, 1],
      ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4']
    );

    return { backgroundColor };
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }, { rotateY: `${rotation.value}deg` }],
      opacity: opacity.value,
    };
  });

  useEffect(() => {
    const unregisterEntry = registerDirectionalEntry((direction, complete) => {
      'worklet';

      scale.value = withSpring(1, { damping: 12, stiffness: 150 });
      opacity.value = withTiming(1, { duration: 500 });
      rotation.value = withSpring(
        direction === ScrollDirection.TOP ? 360 : -360,
        { damping: 15, stiffness: 200 },
        () => {
          rotation.value = 0;
          runOnJS(complete)();
        }
      );
    });

    const unregisterExit = registerDirectionalExit((direction, complete) => {
      'worklet';

      if (direction === ScrollDirection.TOP) {
        scale.value = withTiming(3, { duration: 500 });
        rotation.value = withTiming(-180, { duration: 500 });
        opacity.value = withTiming(0, { duration: 400 }, () => {
          runOnJS(complete)();
        });
      } else {
        scale.value = withTiming(0.1, { duration: 500 });
        rotation.value = withTiming(180, { duration: 500 });
        opacity.value = withTiming(0, { duration: 400 }, () => {
          runOnJS(complete)();
        });
      }
    });

    return () => {
      unregisterEntry();
      unregisterExit();
    };
  }, [registerDirectionalEntry, registerDirectionalExit]);

  return (
    <Animated.View style={[styles.card, colorStyle, animatedStyle]}>
      <Text style={styles.emoji}>🌈</Text>
      <Text style={styles.cardTitle}>Color Morph</Text>
      <Text style={styles.progressText}>Progress: {Math.round(progress * 100)}%</Text>
      <Text style={styles.instructionText}>Watch the colors change based on scroll progress!</Text>
      <Text style={styles.instructionText}>Entry/exit animations differ by direction.</Text>
    </Animated.View>
  );
}

export default function ScrollStoryboardDemo() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>ScrollStoryboard Demo</Text>
        <Text style={styles.subtitle}>
          🔥 Direction-aware entry/exit animations + scroll progress
        </Text>
        <Text style={styles.instructions}>
          Scroll up and down to see different animations based on direction!
        </Text>
      </View>

      <ScrollStoryboard.Timeline length={2500}>
        <ScrollStoryboard.Keyframe
          position={{ start: 0, end: 400 }}
          onEnter={(direction) => console.log('Welcome entered from:', direction)}
          onExit={(direction) => console.log('Welcome exited to:', direction)}>
          <DirectionalCard title="Welcome!" color="#FF6B6B" emoji="👋" />
        </ScrollStoryboard.Keyframe>

        <ScrollStoryboard.Keyframe position={{ start: 500, end: 900 }}>
          <ColorMorphCard />
        </ScrollStoryboard.Keyframe>

        <ScrollStoryboard.Keyframe
          position={{ start: 1000, end: 1400 }}
          onEnter={(direction) => console.log('Final entered from:', direction)}
          onExit={(direction) => console.log('Final exited to:', direction)}>
          <DirectionalCard title="Amazing!" color="#96CEB4" emoji="✨" />
        </ScrollStoryboard.Keyframe>

        <ScrollStoryboard.Keyframe
          position={{ start: 1600, end: 2000 }}
          onEnter={(direction) => console.log('Bonus card entered from:', direction)}>
          <DirectionalCard title="Compound!" color="#845EC2" emoji="🚀" />
        </ScrollStoryboard.Keyframe>
      </ScrollStoryboard.Timeline>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#2c2c2c',
    borderBottomWidth: 1,
    borderBottomColor: '#404040',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#FF6B6B',
    textAlign: 'center',
    marginBottom: 8,
  },
  instructions: {
    fontSize: 14,
    color: '#CCCCCC',
    textAlign: 'center',
    lineHeight: 20,
  },
  card: {
    position: 'absolute',
    left: 20,
    right: 20,
    height: 280,
    borderRadius: 20,
    padding: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
    textAlign: 'center',
  },
  progressText: {
    fontSize: 18,
    color: 'white',
    marginBottom: 8,
    fontWeight: '600',
    textAlign: 'center',
  },
  directionText: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
    textAlign: 'center',
    marginBottom: 12,
  },
  instructionText: {
    fontSize: 14,
    color: 'white',
    opacity: 0.8,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 4,
  },
});
