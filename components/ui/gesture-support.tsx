'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion'
import { cn } from '@/lib/utils'

// Gesture event types
export interface GestureEvent {
  type: 'swipe' | 'pinch' | 'tap' | 'longPress' | 'pan'
  direction?: 'up' | 'down' | 'left' | 'right'
  distance?: number
  scale?: number
  velocity?: number
  position?: { x: number; y: number }
  element?: HTMLElement
}

export interface GestureHandlers {
  onSwipe?: (event: GestureEvent) => void
  onPinch?: (event: GestureEvent) => void
  onTap?: (event: GestureEvent) => void
  onLongPress?: (event: GestureEvent) => void
  onPan?: (event: GestureEvent) => void
}

// Touch gesture detector hook
export function useGestures<T extends HTMLElement = HTMLElement>(handlers: GestureHandlers) {
  const elementRef = useRef<T>(null)
  const [isPressed, setIsPressed] = useState(false)
  const [startTime, setStartTime] = useState(0)
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (e.touches.length === 1) {
      setIsPressed(true)
      setStartTime(Date.now())
      setStartPos({
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      })

      // Long press detection
      const longPressTimer = setTimeout(() => {
        if (isPressed) {
          handlers.onLongPress?.({
            type: 'longPress',
            position: { x: e.touches[0].clientX, y: e.touches[0].clientY },
            element: elementRef.current || undefined
          })
        }
      }, 500)

      const cleanup = () => clearTimeout(longPressTimer)
      elementRef.current?.addEventListener('touchend', cleanup, { once: true })
      elementRef.current?.addEventListener('touchcancel', cleanup, { once: true })
    }
  }, [handlers, isPressed])

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!isPressed) return

    const endTime = Date.now()
    const duration = endTime - startTime
    const endPos = e.changedTouches[0] ? {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY
    } : startPos

    const deltaX = endPos.x - startPos.x
    const deltaY = endPos.y - startPos.y
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    const velocity = distance / duration

    setIsPressed(false)

    // Tap detection
    if (duration < 200 && distance < 10) {
      handlers.onTap?.({
        type: 'tap',
        position: endPos,
        element: elementRef.current || undefined
      })
      return
    }

    // Swipe detection
    if (distance > 50 && velocity > 0.1) {
      let direction: 'up' | 'down' | 'left' | 'right'
      
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        direction = deltaX > 0 ? 'right' : 'left'
      } else {
        direction = deltaY > 0 ? 'down' : 'up'
      }

      handlers.onSwipe?.({
        type: 'swipe',
        direction,
        distance,
        velocity,
        element: elementRef.current || undefined
      })
    }
  }, [handlers, isPressed, startTime, startPos])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isPressed || !e.touches[0]) return

    const currentPos = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    }

    const deltaX = currentPos.x - startPos.x
    const deltaY = currentPos.y - startPos.y

    handlers.onPan?.({
      type: 'pan',
      position: currentPos,
      distance: Math.sqrt(deltaX * deltaX + deltaY * deltaY),
      element: elementRef.current || undefined
    })

    // Pinch detection for multi-touch
    if (e.touches.length === 2) {
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      )

      handlers.onPinch?.({
        type: 'pinch',
        scale: distance / 100, // Normalize scale
        element: elementRef.current || undefined
      })
    }
  }, [handlers, isPressed, startPos])

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    element.addEventListener('touchstart', handleTouchStart, { passive: false })
    element.addEventListener('touchend', handleTouchEnd, { passive: false })
    element.addEventListener('touchmove', handleTouchMove, { passive: false })

    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchend', handleTouchEnd)
      element.removeEventListener('touchmove', handleTouchMove)
    }
  }, [handleTouchStart, handleTouchEnd, handleTouchMove])

  return elementRef
}

// Swipeable container component
interface SwipeableProps {
  children: React.ReactNode
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  threshold?: number
  className?: string
}

export function Swipeable({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50,
  className
}: SwipeableProps) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  
  const rotateX = useTransform(y, [-100, 100], [-10, 10])
  const rotateY = useTransform(x, [-100, 100], [10, -10])

  const handlePanEnd = (event: MouseEvent | TouchEvent, info: PanInfo) => {
    const { offset, velocity } = info

    if (Math.abs(offset.x) > threshold || Math.abs(velocity.x) > 500) {
      if (offset.x > 0) {
        onSwipeRight?.()
      } else {
        onSwipeLeft?.()
      }
    }

    if (Math.abs(offset.y) > threshold || Math.abs(velocity.y) > 500) {
      if (offset.y > 0) {
        onSwipeDown?.()
      } else {
        onSwipeUp?.()
      }
    }

    // Reset position
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      className={cn('cursor-grab active:cursor-grabbing', className)}
      style={{
        x,
        y,
        rotateX,
        rotateY,
      }}
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.1}
      onPanEnd={handlePanEnd}
      whileDrag={{ scale: 1.05 }}
    >
      {children}
    </motion.div>
  )
}

// Pinch-to-zoom component
interface PinchZoomProps {
  children: React.ReactNode
  minScale?: number
  maxScale?: number
  className?: string
}

export function PinchZoom({
  children,
  minScale = 0.5,
  maxScale = 3,
  className
}: PinchZoomProps) {
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  const gestureRef = useGestures<HTMLDivElement>({
    onPinch: (event) => {
      if (event.scale) {
        const newScale = Math.min(Math.max(event.scale, minScale), maxScale)
        setScale(newScale)
      }
    },
    onPan: (event) => {
      if (event.position && scale > 1) {
        setPosition(prev => ({
          x: prev.x + (event.position!.x - prev.x) * 0.1,
          y: prev.y + (event.position!.y - prev.y) * 0.1,
        }))
      }
    },
    onTap: () => {
      // Double tap to reset
      setScale(1)
      setPosition({ x: 0, y: 0 })
    }
  })

  return (
    <div
      ref={gestureRef}
      className={cn('overflow-hidden touch-none', className)}
      style={{
        transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
        transformOrigin: 'center',
        transition: 'transform 0.1s ease-out'
      }}
    >
      {children}
    </div>
  )
}

// Gesture-enabled carousel
interface GestureCarouselProps {
  items: React.ReactNode[]
  className?: string
  onIndexChange?: (index: number) => void
}

export function GestureCarousel({
  items,
  className,
  onIndexChange
}: GestureCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const x = useMotionValue(0)

  const handleSwipe = (direction: 'left' | 'right') => {
    let newIndex = currentIndex

    if (direction === 'left' && currentIndex < items.length - 1) {
      newIndex = currentIndex + 1
    } else if (direction === 'right' && currentIndex > 0) {
      newIndex = currentIndex - 1
    }

    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex)
      onIndexChange?.(newIndex)
    }
  }

  const gestureRef = useGestures<HTMLDivElement>({
    onSwipe: (event) => {
      if (event.direction === 'left' || event.direction === 'right') {
        handleSwipe(event.direction)
      }
    }
  })

  return (
    <div className={cn('relative overflow-hidden', className)}>
      <motion.div
        ref={gestureRef}
        className="flex"
        style={{ x }}
        animate={{
          x: `-${currentIndex * 100}%`
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30
        }}
      >
        {items.map((item, index) => (
          <div key={index} className="min-w-full">
            {item}
          </div>
        ))}
      </motion.div>

      {/* Indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {items.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setCurrentIndex(index)
              onIndexChange?.(index)
            }}
            className={cn(
              'w-2 h-2 rounded-full transition-colors',
              index === currentIndex
                ? 'bg-white'
                : 'bg-white/50'
            )}
          />
        ))}
      </div>
    </div>
  )
}

// Pull-to-refresh component
interface PullToRefreshProps {
  children: React.ReactNode
  onRefresh: () => Promise<void>
  threshold?: number
  className?: string
}

export function PullToRefresh({
  children,
  onRefresh,
  threshold = 80,
  className
}: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const y = useMotionValue(0)

  const handlePan = (event: MouseEvent | TouchEvent, info: PanInfo) => {
    if (info.offset.y > 0) {
      setPullDistance(info.offset.y)
      y.set(Math.min(info.offset.y * 0.5, threshold))
    }
  }

  const handlePanEnd = async (_event: MouseEvent | TouchEvent, _info: PanInfo) => {
    if (pullDistance > threshold && !isRefreshing) {
      setIsRefreshing(true)
      try {
        await onRefresh()
      } finally {
        setIsRefreshing(false)
        setPullDistance(0)
        y.set(0)
      }
    } else {
      setPullDistance(0)
      y.set(0)
    }
  }

  const progress = Math.min(pullDistance / threshold, 1)

  return (
    <motion.div
      className={cn('relative', className)}
      style={{ y }}
      onPan={handlePan}
      onPanEnd={handlePanEnd}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
    >
      {/* Refresh indicator */}
      {pullDistance > 0 && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full p-4">
          <div className="flex items-center space-x-2">
            <div
              className={cn(
                'w-6 h-6 border-2 border-blue-500 rounded-full transition-transform',
                isRefreshing && 'animate-spin'
              )}
              style={{
                borderTopColor: 'transparent',
                transform: `rotate(${progress * 360}deg)`
              }}
            />
            <span className="text-sm text-gray-600">
              {isRefreshing ? 'Refreshing...' : progress >= 1 ? 'Release to refresh' : 'Pull to refresh'}
            </span>
          </div>
        </div>
      )}

      {children}
    </motion.div>
  )
}

// Gesture detection utility
export function detectGesture(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  threshold = 30
): GestureEvent | null {
  const deltaX = endX - startX
  const deltaY = endY - startY
  const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

  if (distance < threshold) {
    return {
      type: 'tap',
      position: { x: endX, y: endY }
    }
  }

  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    return {
      type: 'swipe',
      direction: deltaX > 0 ? 'right' : 'left',
      distance,
      velocity: distance / 100 // Simplified velocity calculation
    }
  } else {
    return {
      type: 'swipe',
      direction: deltaY > 0 ? 'down' : 'up',
      distance,
      velocity: distance / 100
    }
  }
}
