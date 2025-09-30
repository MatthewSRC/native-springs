import React, { useEffect, useState } from 'react';
import { View, TextStyle } from 'react-native';
import Animated from 'react-native-reanimated';

interface WaveTextProps {
  children: string;
  textSpacing?: number;
  style?: TextStyle;
  waveColors?: [string, string];
  waveDuration?: number;
  waveDelay?: number;
  waveInterval?: number;
  waveSpeed?: number;
}

export function WaveText({
  children,
  textSpacing = 4,
  style = {},
  waveColors = ['#fa7f7c', '#87cce8'],
  waveDuration = 2000,
  waveDelay = 100,
  waveInterval = 1000,
  waveSpeed = 500,
}: WaveTextProps) {
  return (
    <View style={{ gap: textSpacing, flexDirection: 'row', alignItems: 'center' }}>
      {children.split('').map((char, index) => (
        <WaveLetter
          key={index}
          index={index}
          char={char}
          style={style}
          waveColors={waveColors}
          waveDuration={waveDuration}
          waveDelay={waveDelay}
          waveInterval={waveInterval}
          waveSpeed={waveSpeed}
        />
      ))}
    </View>
  );
}

function WaveLetter({
  index,
  char,
  style,
  waveColors,
  waveDuration,
  waveDelay,
  waveInterval,
  waveSpeed,
}: {
  index: number;
  char: string;
  style: TextStyle;
  waveColors: [string, string];
  waveDuration: number;
  waveDelay: number;
  waveInterval: number;
  waveSpeed: number;
}) {
  const [isWaving, setWaving] = useState(false);

  useEffect(() => {
    const startWave = () => {
      setTimeout(() => setWaving(true), index * waveDelay);

      setTimeout(() => setWaving(false), waveDuration + index * waveDelay);
    };

    startWave();
    const interval = setInterval(startWave, waveDuration + waveInterval);

    return () => clearInterval(interval);
  }, [index, waveDuration, waveDelay, waveInterval]);

  return (
    <Animated.Text
      style={[
        style,
        {
          transitionProperty: 'color',
          color: isWaving ? waveColors[1] : waveColors[0],
          transitionDuration: `${waveSpeed}ms`,
        },
      ]}>
      {char}
    </Animated.Text>
  );
}
