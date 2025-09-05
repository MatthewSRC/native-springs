import {
  Canvas,
  Fill,
  Shader,
  Skia,
  useImage,
  ImageShader,
} from "@shopify/react-native-skia";
import * as React from "react";
import { Dimensions } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import {
  useSharedValue,
  useDerivedValue,
  useFrameCallback,
} from "react-native-reanimated";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface ThermalAppleProps {
  width?: number;
  height?: number;
  heatBuildupRate?: number;
  heatDecayRate?: number;
  trailRadius?: number;
  backgroundHeatIntensity?: number;
  thermalSpeed?: number;
  borderFlowSpeed?: number;
  borderIntensity?: number;
  borderWidth?: number;
}

interface TouchPoint {
  x: number;
  y: number;
  intensity: number;
  age: number;
}

const MAX_TOUCH_POINTS = 10;

export function ThermalApple({
  width = SCREEN_WIDTH,
  height = SCREEN_HEIGHT,
  heatBuildupRate = 0.03,
  heatDecayRate = 0.985,
  trailRadius = 0.25,
  backgroundHeatIntensity = 0.03,
  thermalSpeed = 0.15,
  borderFlowSpeed = 0.4,
  borderIntensity = 1.1,
  borderWidth = 0.02,
}: ThermalAppleProps) {
  const canvasSize = { width, height };

  // Used image from
  // https://github.com/samhenrigold/apple-event-shader/tree/main/public
  // Download and adjust the path as needed
  const logoImage = useImage(require("./assets/logo__dcojfwkzna2q.png"));

  // Touch tracking
  const touchX = useSharedValue(0.5);
  const touchY = useSharedValue(0.5);
  const isActive = useSharedValue(0);
  const currentTouchHeat = useSharedValue(0); // Build up heat gradually for current touch
  const time = useSharedValue(0);

  // Heat trail points array
  const touchPoints = useSharedValue<TouchPoint[]>([]);

  // Pre-calculate thermal colors from web version
  // could be made configurable if desired
  const thermalColors = React.useMemo(() => {
    const hexToRgb = (hex: string) => {
      const r = parseInt(hex.slice(0, 2), 16) / 255;
      const g = parseInt(hex.slice(2, 4), 16) / 255;
      const b = parseInt(hex.slice(4, 6), 16) / 255;
      return [r, g, b];
    };

    return {
      uColor1: hexToRgb("000000"),
      uColor2: hexToRgb("073dff"),
      uColor3: hexToRgb("53d5fd"),
      uColor4: hexToRgb("fefcdd"),
      uColor5: hexToRgb("ffec6a"),
      uColor6: hexToRgb("f9d400"),
      uColor7: hexToRgb("a61904"),
    };
  }, []);

  const thermalShader = Skia.RuntimeEffect.Make(`
    uniform shader image;
    uniform float2 uResolution;
    uniform float uTime;
    uniform float2 uTouch;
    uniform float uActive;
    uniform float uCurrentTouchHeat;
    uniform float uBackgroundHeatIntensity;
    uniform float uThermalSpeed;
    uniform float uTrailRadius;
    
    // Border animation parameters
    uniform float uBorderFlowSpeed;
    uniform float uBorderIntensity;
    uniform float uBorderWidth;
    
    // Touch points for heat trails
    uniform float uNumPoints;
    uniform float2 uPoints[${MAX_TOUCH_POINTS}];
    uniform float uIntensities[${MAX_TOUCH_POINTS}];
    
    // Apple thermal gradient colors
    uniform float3 uColor1, uColor2, uColor3, uColor4, uColor5, uColor6, uColor7;
    uniform float4 uBlend, uFade, uMaxBlend;
    
    uniform float uEffectIntensity;
    uniform float uColorSaturation;
    uniform float uGradientShift;
    uniform float uAmount;
    
    // Convert RGB to luminance for saturation adjustment
    float3 linearRgbToLuminance(float3 c) {
      float f = dot(c, float3(0.2126729, 0.7151522, 0.0721750));
      return float3(f);
    }
    
    // Adjust color saturation
    float3 saturation(float3 c, float s) {
      return mix(linearRgbToLuminance(c), c, s);
    }
    
    
    float noise(float2 p) {
      return fract(sin(dot(p, float2(12.9898, 78.233))) * 43758.5453);
    }
    
    float smoothNoise(float2 p) {
      float2 i = floor(p);
      float2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      
      float a = noise(i);
      float b = noise(i + float2(1.0, 0.0));
      float c = noise(i + float2(0.0, 1.0));
      float d = noise(i + float2(1.0, 1.0));
      
      return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
    }
    
    float3 gradient(float t) {
      // Apply gradient shift and color cycling 
      t = clamp(t + uGradientShift, 0.0, 1.0);
      
      float p1 = uBlend.x, p2 = uBlend.y, p3 = uBlend.z, p4 = uBlend.w;
      float p5 = uMaxBlend.x, p6 = uMaxBlend.y;
      float f1 = uFade.x, f2 = uFade.y, f3 = uFade.z, f4 = uFade.w;
      float f5 = uMaxBlend.z, f6 = uMaxBlend.w;
      
      // Smooth transitions between color stops
      float b1 = smoothstep(p1 - f1 * 0.5, p1 + f1 * 0.5, t);
      float b2 = smoothstep(p2 - f2 * 0.5, p2 + f2 * 0.5, t);
      float b3 = smoothstep(p3 - f3 * 0.5, p3 + f3 * 0.5, t);
      float b4 = smoothstep(p4 - f4 * 0.5, p4 + f4 * 0.5, t);
      float b5 = smoothstep(p5 - f5 * 0.5, p5 + f5 * 0.5, t);
      float b6 = smoothstep(p6 - f6 * 0.5, p6 + f6 * 0.5, t);
      
      // Blend colors based on temperature
      float3 col = uColor1;
      col = mix(col, uColor2, b1);
      col = mix(col, uColor3, b2);
      col = mix(col, uColor4, b3);
      col = mix(col, uColor5, b4);
      col = mix(col, uColor6, b5);
      col = mix(col, uColor7, b6);
      
      return col;
    }
    
    // Create distance field from logo edges for softer heat flow
    float logoDistance(float2 uv) {
      float2 texelSize = 2.0 / uResolution;
      float center = image.eval(uv * uResolution).g;
      
      // If we're outside the logo, return 0
      if (center < 0.5) return 0.0;
      
      // Sample in multiple directions to find distance to edge
      float minDist = 1.0;
      for (int i = 0; i < 8; i++) {
        float angle = float(i) * 3.14159 / 4.0;
        float2 dir = float2(cos(angle), sin(angle));
        
        // Step outward until we hit the edge
        for (float step = 1.0; step <= 20.0; step += 1.0) {
          float2 samplePos = uv + dir * texelSize * step;
          float sample = image.eval(samplePos * uResolution).g;
          if (sample < 0.5) {
            minDist = min(minDist, step * length(texelSize));
            break;
          }
        }
      }
      
      return minDist;
    }
    
    // Flowing thermal heat animation along logo border
    float borderThermalFlow(float2 uv) {
      float logoMask = image.eval(uv * uResolution).g;
      if (logoMask < 0.5) return 0.0;
      
      float distToEdge = logoDistance(uv);
      
      // Create heat zone near borders - much wider and softer
      float heatZone = 1.0 - smoothstep(0.0, uBorderWidth * 3.0, distToEdge);
      if (heatZone < 0.01) return 0.0;
      
      // Much faster flowing animation from top to bottom
      float flowTime = uTime * uBorderFlowSpeed * 10.0; // 10x faster
      
      // Create multiple wave layers for more complex flow
      float wave1 = sin((uv.y * 12.0) - flowTime) * 0.5 + 0.5;
      float wave2 = sin((uv.y * 8.0) - flowTime * 1.3 + uv.x * 2.0) * 0.5 + 0.5;
      float wave3 = sin((uv.y * 15.0) - flowTime * 0.7) * 0.5 + 0.5;
      
      // Combine waves for complex flow pattern
      float combinedWave = (wave1 * 0.5 + wave2 * 0.3 + wave3 * 0.2);
      
      // Add turbulent noise for organic heat feel
      float turbulence = smoothNoise(float2(uv.x * 8.0, uv.y * 10.0 - flowTime * 0.5));
      combinedWave = mix(combinedWave, turbulence, 0.4);
      
      // Create thermal pulses that travel down
      float thermalPulse = pow(combinedWave, 2.0);
      
      // Apply heat zone mask and intensity
      return thermalPulse * heatZone * uBorderIntensity;
    }
    
    half4 main(float2 coord) {
      float2 uv = coord / uResolution;
      
      // Sample the logo mask
      half4 maskSample = image.eval(coord);
      float mask = maskSample.g; // Use GREEN CHANNEL 
      
      // Early exit if completely outside logo
      if (mask < 0.01) {
        return half4(0.0, 0.0, 0.0, 0.0);
      }
      
      // Time-based flow offset
      float flowOffset = uTime * uThermalSpeed * 2.0;
      
      // Calculate touch heat
      float heatDraw = 0.0;
      for (int i = 0; i < ${MAX_TOUCH_POINTS}; i++) {
        if (float(i) >= uNumPoints) break;
        float2 pointPos = uPoints[i];
        float intensity = uIntensities[i];
        
        float dist = distance(uv, pointPos);
        float heat = 1.0 - smoothstep(0.0, uTrailRadius, dist);
        heat = pow(heat, 2.0);
        heatDraw += heat * intensity;
      }
      
      // Add current touch with gradual buildup
      if (uActive > 0.5) {
        float dist = distance(uv, uTouch);
        float heat = 1.0 - smoothstep(0.0, uTrailRadius * 0.5, dist);
        heat = pow(heat, 3.0);
        heatDraw += heat * uCurrentTouchHeat * 0.6; // Use gradual heat buildup
      }
      
      // Apply mask to heat 
      heatDraw *= mix(0.1, 1.0, mask);
      
      // Background thermal map from noise
      float heatWave = smoothNoise(float2(uv.x * 4.0, uv.y * 6.0 - flowOffset));
      float map = pow(heatWave, 1.5); // Power like web version
      
      // Add flowing border thermal animation - blend naturally
      float borderThermal = borderThermalFlow(uv);
      
      // Apply vertical gradient mask
      float msk = smoothstep(0.2, 0.5, uv.y);
      map = mix(map * 0.91, map, msk);
      map = mix(0.0, map, uAmount); // Apply amount control
      
      // Blend border thermal naturally with background heat
      map = map + borderThermal * 0.7; // Additive blending for heat accumulation
      
      // Apply circular fade from center
      float fade = distance(uv, float2(0.5, 0.52));
      fade = smoothstep(0.5, 0.62, 1.0 - fade);
      
      float3 finalColor = gradient(map + heatDraw);
      finalColor = saturation(finalColor, uColorSaturation);  // Apply controllable saturation
      finalColor *= fade;                    // Apply circular fade
      finalColor = mix(float3(0.0), finalColor, uAmount * uEffectIntensity); // Apply overall amount with intensity multiplier
      
      // Apply mask to final color output
      finalColor = mix(float3(0.0), finalColor, step(0.5, mask));
      
      return half4(finalColor, step(0.5, mask));
    }
  `)!;

  // Update touch points trail system
  useFrameCallback((frameInfo) => {
    time.value = frameInfo.timestamp / 1000;
    // Build up or cool down current touch heat gradually
    if (isActive.value > 0.5) {
      currentTouchHeat.value = Math.min(currentTouchHeat.value + 0.02, 1.0);
    } else {
      currentTouchHeat.value *= 0.96;
      if (currentTouchHeat.value < 0.01) {
        currentTouchHeat.value = 0;
      }
    }

    // Update existing points - work with a copy then assign back
    const currentPoints = [...touchPoints.value];
    let pointsChanged = false;

    // Age existing points and remove old ones
    for (let i = currentPoints.length - 1; i >= 0; i--) {
      currentPoints[i].age += frameInfo.timeSincePreviousFrame || 1 / 60;
      currentPoints[i].intensity *= heatDecayRate;

      if (currentPoints[i].age > 2000 || currentPoints[i].intensity < 0.005) {
        currentPoints.splice(i, 1);
        pointsChanged = true;
      }
    }

    // Only mark as changed if we actually modified the array structure or it's the first frame
    if (pointsChanged || currentPoints.length > 0) {
      pointsChanged = true;
    }

    // Add heat to existing nearby point or create new one
    if (isActive.value > 0.5) {
      const currentX = touchX.value;
      const currentY = touchY.value;

      let foundNearbyPoint = false;
      const mergeDistance = 0.04;

      for (let i = 0; i < currentPoints.length; i++) {
        const dx = currentPoints[i].x - currentX;
        const dy = currentPoints[i].y - currentY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < mergeDistance) {
          // Heat up existing point gradually
          currentPoints[i].intensity = Math.min(
            currentPoints[i].intensity + heatBuildupRate,
            1.0
          );
          currentPoints[i].age = 0; // Reset age to keep it alive
          foundNearbyPoint = true;
          pointsChanged = true;
          break;
        }
      }

      // Only create new point if no nearby point found
      if (!foundNearbyPoint) {
        currentPoints.push({
          x: currentX,
          y: currentY,
          intensity: heatBuildupRate * 2,
          age: 0,
        });
        pointsChanged = true;

        // With faster decay and higher limit, points should naturally disappear
        // but still enforce max limit to avoid excessive accumulation
        while (currentPoints.length > MAX_TOUCH_POINTS) {
          currentPoints.shift();
        }
      }
    }

    if (pointsChanged) {
      touchPoints.value = currentPoints;
    }
  });

  const pan = Gesture.Pan()
    .onBegin((e) => {
      touchX.value = e.x / canvasSize.width;
      touchY.value = e.y / canvasSize.height;
      isActive.value = 1;
    })
    .onUpdate((e) => {
      touchX.value = e.x / canvasSize.width;
      touchY.value = e.y / canvasSize.height;
      isActive.value = 1;
    })
    .onEnd(() => {
      isActive.value = 0;
    });

  const tap = Gesture.Tap()
    .onStart((e) => {
      touchX.value = e.x / canvasSize.width;
      touchY.value = e.y / canvasSize.height;
      isActive.value = 1;
    })
    .onEnd(() => {
      isActive.value = 0;
    });

  const gesture = Gesture.Race(pan, tap);

  const thermalUniforms = useDerivedValue(() => {
    const points: number[] = [];
    const intensities: number[] = [];

    const currentPoints = touchPoints.value.slice(0, MAX_TOUCH_POINTS);
    for (let i = 0; i < MAX_TOUCH_POINTS; i++) {
      if (i < currentPoints.length) {
        points.push(currentPoints[i].x, currentPoints[i].y);
        intensities.push(currentPoints[i].intensity);
      } else {
        points.push(0, 0);
        intensities.push(0);
      }
    }

    const uniforms = {
      uResolution: [canvasSize.width, canvasSize.height],
      uTime: time.value,
      uTouch: [touchX.value, touchY.value],
      uActive: isActive.value,
      uCurrentTouchHeat: currentTouchHeat.value,
      uBackgroundHeatIntensity: backgroundHeatIntensity,
      uThermalSpeed: thermalSpeed,
      uTrailRadius: trailRadius,
      uBorderFlowSpeed: borderFlowSpeed,
      uBorderIntensity: borderIntensity,
      uBorderWidth: borderWidth,
      uNumPoints: Math.min(touchPoints.value.length, MAX_TOUCH_POINTS),
      uPoints: points,
      uIntensities: intensities,
      ...thermalColors,
      uBlend: [0.4, 0.7, 0.81, 0.91],
      uFade: [1, 1, 0.72, 0.52],
      uMaxBlend: [0.8, 0.87, 0.5, 0.27],
      uEffectIntensity: 1.0,
      uColorSaturation: 1.3,
      uGradientShift: 0.0,
      uAmount: 1.0,
    };

    return uniforms;
  });
  return (
    <GestureDetector gesture={gesture}>
      <Canvas
        style={{
          width: canvasSize.width,
          height: canvasSize.height,
        }}
      >
        {logoImage && thermalShader && (
          <Fill>
            <Shader source={thermalShader} uniforms={thermalUniforms}>
              <ImageShader
                image={logoImage}
                fit="contain"
                rect={{
                  x: 0,
                  y: 0,
                  width: canvasSize.width,
                  height: canvasSize.height,
                }}
              />
            </Shader>
          </Fill>
        )}
      </Canvas>
    </GestureDetector>
  );
}
