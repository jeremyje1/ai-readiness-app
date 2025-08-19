'use client'

import { useState, useEffect } from 'react'
import { motion, useScroll, useSpring } from 'framer-motion'
import { ChevronUpIcon } from '@heroicons/react/24/outline'

export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  })

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 to-secondary-500 transform origin-left z-50"
      style={{ scaleX }}
    />
  )
}

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false)
  const { scrollY } = useScroll()

  useEffect(() => {
    const unsubscribe = scrollY.onChange((latest) => {
      setIsVisible(latest > 300)
    })

    return () => unsubscribe()
  }, [scrollY])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  return (
    <motion.button
      onClick={scrollToTop}
      className="fixed bottom-8 right-8 p-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-40"
      initial={{ opacity: 0, scale: 0 }}
      animate={{ 
        opacity: isVisible ? 1 : 0, 
        scale: isVisible ? 1 : 0 
      }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      transition={{ duration: 0.2 }}
    >
      <ChevronUpIcon className="w-6 h-6" />
    </motion.button>
  )
}

interface ParallaxSectionProps {
  children: React.ReactNode
  offset?: number
  className?: string
}

export function ParallaxSection({ 
  children, 
  offset = 50,
  className = '' 
}: ParallaxSectionProps) {
  const { scrollY } = useScroll()
  const y = useSpring(scrollY, { stiffness: 100, damping: 30 })

  return (
    <motion.div
      className={className}
      style={{
        y: y.get() * (offset / 100)
      }}
    >
      {children}
    </motion.div>
  )
}

interface InViewAnimationProps {
  children: React.ReactNode
  className?: string
  delay?: number
  duration?: number
  direction?: 'up' | 'down' | 'left' | 'right'
}

export function InViewAnimation({
  children,
  className = '',
  delay = 0,
  duration = 0.6,
  direction = 'up'
}: InViewAnimationProps) {
  const directions = {
    up: { y: 50 },
    down: { y: -50 },
    left: { x: 50 },
    right: { x: -50 }
  }

  return (
    <motion.div
      className={className}
      initial={{ 
        opacity: 0, 
        ...directions[direction]
      }}
      whileInView={{ 
        opacity: 1, 
        x: 0, 
        y: 0 
      }}
      transition={{ 
        duration, 
        delay,
        ease: "easeOut"
      }}
      viewport={{ once: true, margin: "-100px" }}
    >
      {children}
    </motion.div>
  )
}

interface CounterProps {
  from: number
  to: number
  duration?: number
  suffix?: string
  prefix?: string
}

export function AnimatedCounter({ 
  from, 
  to, 
  duration = 2, 
  suffix = '', 
  prefix = '' 
}: CounterProps) {
  const [count, setCount] = useState(from)

  useEffect(() => {
    const controls = {
      duration: duration * 1000,
      ease: 'easeOut'
    }

    const startTime = Date.now()
    const startValue = from
    const endValue = to
    const totalChange = endValue - startValue

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / controls.duration, 1)
      
      // Easing function
      const easeOut = 1 - Math.pow(1 - progress, 3)
      const currentValue = startValue + (totalChange * easeOut)
      
      setCount(Math.floor(currentValue))
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          animate()
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    const element = document.getElementById(`counter-${from}-${to}`)
    if (element) observer.observe(element)

    return () => observer.disconnect()
  }, [from, to, duration])

  return (
    <span id={`counter-${from}-${to}`}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  )
}

export function SmoothScroll() {
  useEffect(() => {
    const handleAnchorClick = (e: Event) => {
      const target = e.target as HTMLAnchorElement
      if (target.hash) {
        e.preventDefault()
        const element = document.querySelector(target.hash)
        if (element) {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          })
        }
      }
    }

    const links = document.querySelectorAll('a[href^="#"]')
    links.forEach(link => {
      link.addEventListener('click', handleAnchorClick)
    })

    return () => {
      links.forEach(link => {
        link.removeEventListener('click', handleAnchorClick)
      })
    }
  }, [])

  return null
}
