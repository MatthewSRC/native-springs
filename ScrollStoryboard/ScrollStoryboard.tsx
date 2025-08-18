import React, { ReactNode, useState, useEffect, useRef, useContext, useCallback, JSX } from 'react';
import { ScrollView, View, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';

export interface ScrollPosition {
  start: number;
  end: number;
}

export enum ScrollDirection {
  TOP = 'top',
  BOTTOM = 'bottom',
  NONE = 'none',
}

interface ScrollTimelineContextType {
  scrollY: number;
}

const ScrollTimelineContext = React.createContext<ScrollTimelineContextType | null>(null);

export const useScrollTimeline = () => {
  const context = useContext(ScrollTimelineContext);
  if (!context) {
    throw new Error('useScrollTimeline must be used within ScrollStoryboard.Timeline');
  }
  return context;
};

export interface ScrollTimelineProps {
  children: React.ReactNode;
  length?: number;
  onScroll?: (scrollY: number) => void;
  scrollEventThrottle?: number;
}

function ScrollTimeline({
  children,
  length = 2000,
  onScroll,
  scrollEventThrottle = 16,
}: ScrollTimelineProps): JSX.Element {
  const [scrollY, setScrollY] = useState(0);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = event.nativeEvent.contentOffset.y;
    setScrollY(y);
    onScroll?.(y);
  };

  return (
    <ScrollTimelineContext.Provider value={{ scrollY }}>
      <View>
        <View
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
          }}>
          {children}
        </View>

        <ScrollView
          onScroll={handleScroll}
          scrollEventThrottle={scrollEventThrottle}
          decelerationRate="fast"
          showsVerticalScrollIndicator={false}>
          <View style={{ height: length }} />
        </ScrollView>
      </View>
    </ScrollTimelineContext.Provider>
  );
}

export interface ScrollKeyframeProps {
  position: ScrollPosition;
  onEnter?: (direction: ScrollDirection) => void;
  onExit?: (direction: ScrollDirection) => void;
  children: ReactNode;
  minScrollDelta?: number;
}

export interface ScrollKeyframeContextType {
  isActive: boolean;
  scrollY: number;
  position: { start: number; end: number };
  entryDirection: ScrollDirection;
  exitDirection: ScrollDirection;
  registerExitHandler: (handler: (direction: ScrollDirection) => Promise<void>) => () => void;
  registerEntryHandler: (handler: (direction: ScrollDirection) => Promise<void>) => () => void;
  registerDirectionalExit: (
    animationFn: (direction: ScrollDirection, completeCallback: () => void) => void
  ) => () => void;
  registerDirectionalEntry: (
    animationFn: (direction: ScrollDirection, completeCallback: () => void) => void
  ) => () => void;
}

const ScrollKeyframeContext = React.createContext<ScrollKeyframeContextType>({
  isActive: false,
  scrollY: 0,
  position: { start: 0, end: 0 },
  entryDirection: ScrollDirection.NONE,
  exitDirection: ScrollDirection.NONE,
  registerExitHandler: () => () => {},
  registerEntryHandler: () => () => {},
  registerDirectionalExit: () => () => {},
  registerDirectionalEntry: () => () => {},
});

function ScrollKeyframe({
  position,
  onEnter,
  onExit,
  children,
  minScrollDelta = 5,
}: ScrollKeyframeProps): JSX.Element | null {
  if (position.start >= position.end) {
    throw new Error(
      `Invalid position range: start (${position.start}) must be less than end (${position.end})`
    );
  }

  const { scrollY } = useScrollTimeline();

  const [isActive, setIsActive] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [exitDirection, setExitDirection] = useState<ScrollDirection>(ScrollDirection.NONE);
  const [entryDirection, setEntryDirection] = useState<ScrollDirection>(ScrollDirection.NONE);

  const prevScrollYRef = useRef<number>(0);
  const exitHandlersRef = useRef<((direction: ScrollDirection) => Promise<void>)[]>([]);
  const entryHandlersRef = useRef<((direction: ScrollDirection) => Promise<void>)[]>([]);

  const currentAnimationRef = useRef<AbortController | null>(null);
  const hasEntryAnimated = useRef(false);
  const pendingEntryDirection = useRef<ScrollDirection | null>(null);
  const isMountedRef = useRef(true);
  const lastProcessedScrollY = useRef(0);

  const cancelCurrentAnimation = () => {
    if (currentAnimationRef.current) {
      currentAnimationRef.current.abort();
      currentAnimationRef.current = null;
    }
  };

  const runAnimationHandlers = async (
    handlers: ((direction: ScrollDirection) => Promise<void>)[],
    direction: ScrollDirection,
    abortSignal: AbortSignal
  ): Promise<void> => {
    if (handlers.length === 0 || abortSignal.aborted) {
      return;
    }

    await Promise.all(handlers.map((handler) => handler(direction)));
  };

  const updateStateAfterAnimation = (type: 'enter' | 'exit'): void => {
    if (type === 'exit') {
      setShouldRender(false);
      hasEntryAnimated.current = false;
      pendingEntryDirection.current = null;
    } else if (type === 'enter') {
      hasEntryAnimated.current = true;
    }
  };

  const runAnimation = async (
    type: 'enter' | 'exit',
    direction: ScrollDirection,
    handlers: ((direction: ScrollDirection) => Promise<void>)[],
    callback?: (direction: ScrollDirection) => void
  ): Promise<void> => {
    cancelCurrentAnimation();

    const abortController = new AbortController();
    currentAnimationRef.current = abortController;

    try {
      callback?.(direction);

      await runAnimationHandlers(handlers, direction, abortController.signal);

      if (!abortController.signal.aborted && isMountedRef.current) {
        updateStateAfterAnimation(type);
      }
    } catch (error) {
      console.error('ScrollKeyframe: Animation handler error', error);
    } finally {
      if (currentAnimationRef.current === abortController) {
        currentAnimationRef.current = null;
      }
    }
  };

  const getScrollDirection = (currentY: number, prevY: number): ScrollDirection => {
    return currentY > prevY ? ScrollDirection.BOTTOM : ScrollDirection.TOP;
  };

  const handleEntry = useCallback(
    (normalizedScrollY: number) => {
      const direction = getScrollDirection(normalizedScrollY, prevScrollYRef.current);

      cancelCurrentAnimation();
      hasEntryAnimated.current = false;

      setIsActive(true);
      setShouldRender(true);
      setEntryDirection(direction);

      if (entryHandlersRef.current.length > 0) {
        runAnimation('enter', direction, entryHandlersRef.current, onEnter);
      } else {
        pendingEntryDirection.current = direction;
        onEnter?.(direction);
      }
    },
    [onEnter]
  );

  const handleExit = useCallback(
    (normalizedScrollY: number) => {
      const direction =
        normalizedScrollY < position.start ? ScrollDirection.TOP : ScrollDirection.BOTTOM;

      cancelCurrentAnimation();

      setIsActive(false);
      setExitDirection(direction);

      runAnimation('exit', direction, exitHandlersRef.current, onExit);
    },
    [position.start, onExit]
  );

  const registerExitHandler = useCallback(
    (handler: (direction: ScrollDirection) => Promise<void>) => {
      if (!exitHandlersRef.current.includes(handler)) {
        exitHandlersRef.current.push(handler);
      }
      return () => {
        exitHandlersRef.current = exitHandlersRef.current.filter((h) => h !== handler);
      };
    },
    []
  );

  const registerEntryHandler = useCallback(
    (handler: (direction: ScrollDirection) => Promise<void>) => {
      if (!entryHandlersRef.current.includes(handler)) {
        entryHandlersRef.current.push(handler);
      }

      if (pendingEntryDirection.current !== null && !hasEntryAnimated.current) {
        const direction = pendingEntryDirection.current;
        pendingEntryDirection.current = null;
        runAnimation('enter', direction, [handler]);
      }

      return () => {
        entryHandlersRef.current = entryHandlersRef.current.filter((h) => h !== handler);
      };
    },
    []
  );

  const registerDirectionalExit = useCallback(
    (animationFn: (direction: ScrollDirection, completeCallback: () => void) => void) => {
      const exitHandler = (direction: ScrollDirection) => {
        return new Promise<void>((resolve) => {
          animationFn(direction, resolve);
        });
      };

      return registerExitHandler(exitHandler);
    },
    [registerExitHandler]
  );

  const registerDirectionalEntry = useCallback(
    (animationFn: (direction: ScrollDirection, completeCallback: () => void) => void) => {
      const entryHandler = (direction: ScrollDirection) => {
        return new Promise<void>((resolve) => {
          animationFn(direction, resolve);
        });
      };

      return registerEntryHandler(entryHandler);
    },
    [registerEntryHandler]
  );

  useEffect(() => {
    const scrollDelta = Math.abs(scrollY - lastProcessedScrollY.current);

    if (scrollDelta < minScrollDelta && scrollY !== 0) {
      return;
    }

    lastProcessedScrollY.current = scrollY;

    const normalizedScrollY = Math.max(0, scrollY);
    const shouldBeActive = normalizedScrollY >= position.start && normalizedScrollY <= position.end;

    if (shouldBeActive === isActive) {
      prevScrollYRef.current = normalizedScrollY;
      return;
    }

    if (shouldBeActive) {
      handleEntry(normalizedScrollY);
    } else {
      handleExit(normalizedScrollY);
    }

    prevScrollYRef.current = normalizedScrollY;
  }, [scrollY, position.start, position.end, isActive, minScrollDelta, handleEntry, handleExit]);

  useEffect(() => {
    exitHandlersRef.current = [];
    entryHandlersRef.current = [];
    isMountedRef.current = true;
    return () => {
      exitHandlersRef.current = [];
      entryHandlersRef.current = [];
      isMountedRef.current = false;
      cancelCurrentAnimation();
    };
  }, []);

  const contextValue = {
    isActive,
    scrollY,
    position,
    entryDirection,
    exitDirection,
    registerExitHandler,
    registerEntryHandler,
    registerDirectionalExit,
    registerDirectionalEntry,
  };

  return shouldRender ? (
    <ScrollKeyframeContext.Provider value={contextValue}>{children}</ScrollKeyframeContext.Provider>
  ) : null;
}

export function useScrollKeyframe() {
  const context = useContext(ScrollKeyframeContext);

  const progress = (() => {
    if (!context.isActive) return 0;

    const { start, end } = context.position;
    const range = end - start;

    if (range <= 0) return 0;

    const normalizedScrollY = Math.max(0, context.scrollY);
    const raw = (normalizedScrollY - start) / range;
    return Math.max(0, Math.min(1, raw));
  })();

  return {
    ...context,
    progress,
  };
}

export const ScrollStoryboard = {
  Timeline: ScrollTimeline,
  Keyframe: ScrollKeyframe,
};
