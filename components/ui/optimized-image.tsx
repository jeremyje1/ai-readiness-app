'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  priority?: boolean
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  className?: string
  sizes?: string
  quality?: number
  fill?: boolean
  loading?: 'lazy' | 'eager'
  onLoad?: () => void
  onError?: () => void
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  placeholder = 'blur',
  blurDataURL,
  className,
  sizes,
  quality = 85,
  fill = false,
  loading = 'lazy',
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [_hasError, setHasError] = useState(false)
  const [currentSrc, setCurrentSrc] = useState(src)

  // Generate blur placeholder if not provided
  const generateBlurDataURL = (w = 8, h = 8) => {
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.fillStyle = '#f3f4f6'
      ctx.fillRect(0, 0, w, h)
    }
    return canvas.toDataURL()
  }

  // Generate responsive sizes if not provided
  const getResponsiveSizes = () => {
    if (sizes) return sizes
    if (fill) return '100vw'
    if (width) {
      return `(max-width: 768px) 100vw, (max-width: 1200px) 50vw, ${width}px`
    }
    return '100vw'
  }

  // Generate optimized srcSet for different formats
  const _generateSrcSet = (baseSrc: string) => {
    const formats = ['webp', 'avif']
    const sizes = [400, 800, 1200, 1600]
    
    return formats.map(format => 
      sizes.map(size => 
        `${baseSrc}?w=${size}&q=${quality}&f=${format} ${size}w`
      ).join(', ')
    )
  }

  const handleLoad = () => {
    setIsLoaded(true)
    onLoad?.()
  }

  const handleError = () => {
    setHasError(true)
    setCurrentSrc('/images/placeholder.jpg') // Fallback image
    onError?.()
  }

  // WebP/AVIF support detection
  const [supportsWebP, setSupportsWebP] = useState(false)
  const [supportsAVIF, setSupportsAVIF] = useState(false)

  useEffect(() => {
    // Check WebP support
    const webpTest = document.createElement('img')
    webpTest.onload = webpTest.onerror = () => {
      setSupportsWebP(webpTest.height === 2)
    }
    webpTest.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA'

    // Check AVIF support
    const avifTest = document.createElement('img')
    avifTest.onload = avifTest.onerror = () => {
      setSupportsAVIF(avifTest.height === 2)
    }
    avifTest.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A='
  }, [])

  // Get optimal format
  const getOptimalSrc = (baseSrc: string) => {
    if (supportsAVIF) {
      return `${baseSrc}?q=${quality}&f=avif`
    }
    if (supportsWebP) {
      return `${baseSrc}?q=${quality}&f=webp`
    }
    return `${baseSrc}?q=${quality}`
  }

  const imageProps = {
    src: getOptimalSrc(currentSrc),
    alt,
    className: cn(
      'transition-opacity duration-300',
      isLoaded ? 'opacity-100' : 'opacity-0',
      className
    ),
    sizes: getResponsiveSizes(),
    quality,
    priority,
    placeholder,
    blurDataURL: blurDataURL || generateBlurDataURL(),
    onLoad: handleLoad,
    onError: handleError,
    loading: priority ? 'eager' : loading,
  }

  if (fill) {
    return (
      <Image
        {...imageProps}
        fill
      />
    )
  }

  return (
    <Image
      {...imageProps}
      width={width}
      height={height}
    />
  )
}

// Lazy loading image with intersection observer
export function LazyImage({
  src,
  alt,
  className,
  threshold = 0.1,
  rootMargin = '50px',
  ...props
}: OptimizedImageProps & {
  threshold?: number
  rootMargin?: string
}) {
  const [isVisible, setIsVisible] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  const imgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold, rootMargin }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [threshold, rootMargin])

  return (
    <div ref={imgRef} className={cn('relative', className)}>
      {isVisible && (
        <OptimizedImage
          src={src}
          alt={alt}
          onLoad={() => setHasLoaded(true)}
          className={cn(
            'transition-opacity duration-500',
            hasLoaded ? 'opacity-100' : 'opacity-0'
          )}
          {...props}
        />
      )}
      
      {!hasLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded" />
      )}
    </div>
  )
}

// Picture element with multiple formats
export function ResponsivePicture({
  src,
  alt,
  width,
  height,
  className,
  quality = 85,
  sizes = '100vw',
}: {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  quality?: number
  sizes?: string
}) {
  const [isLoaded, setIsLoaded] = useState(false)

  const generateSourceSet = (format: string) => {
    const breakpoints = [400, 800, 1200, 1600, 2000]
    return breakpoints
      .map(bp => `${src}?w=${bp}&q=${quality}&f=${format} ${bp}w`)
      .join(', ')
  }

  return (
    <picture className={className}>
      {/* AVIF format */}
      <source
        srcSet={generateSourceSet('avif')}
        sizes={sizes}
        type="image/avif"
      />
      
      {/* WebP format */}
      <source
        srcSet={generateSourceSet('webp')}
        sizes={sizes}
        type="image/webp"
      />
      
      {/* Fallback */}
      <img
        src={`${src}?w=${width || 800}&q=${quality}`}
        alt={alt}
        width={width}
        height={height}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        className={cn(
          'transition-opacity duration-300',
          isLoaded ? 'opacity-100' : 'opacity-0'
        )}
      />
    </picture>
  )
}

// Background image with optimization
export function OptimizedBackground({
  src,
  className,
  children,
  quality = 85,
  overlay = false,
  overlayOpacity = 0.5,
}: {
  src: string
  className?: string
  children?: React.ReactNode
  quality?: number
  overlay?: boolean
  overlayOpacity?: number
}) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [supportsWebP, setSupportsWebP] = useState(false)

  useEffect(() => {
    // Test WebP support
    const webpTest = document.createElement('img')
    webpTest.onload = webpTest.onerror = () => {
      setSupportsWebP(webpTest.height === 2)
    }
    webpTest.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA'

    // Preload background image
    const img = document.createElement('img')
    img.onload = () => setIsLoaded(true)
    img.src = supportsWebP 
      ? `${src}?q=${quality}&f=webp`
      : `${src}?q=${quality}`
  }, [src, quality, supportsWebP])

  const optimizedSrc = supportsWebP 
    ? `${src}?q=${quality}&f=webp`
    : `${src}?q=${quality}`

  return (
    <div
      className={cn('relative', className)}
      style={{
        backgroundImage: isLoaded ? `url(${optimizedSrc})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {overlay && (
        <div 
          className="absolute inset-0 bg-black"
          style={{ opacity: overlayOpacity }}
        />
      )}
      
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}

// Hook for preloading images
export function useImagePreloader(images: string[]) {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set())
  const [loadingProgress, setLoadingProgress] = useState(0)

  useEffect(() => {
    let loadedCount = 0
    
    const preloadImage = (src: string) => {
      return new Promise<void>((resolve) => {
        const img = document.createElement('img')
        img.onload = img.onerror = () => {
          loadedCount++
          setLoadedImages(prev => new Set(prev).add(src))
          setLoadingProgress((loadedCount / images.length) * 100)
          resolve()
        }
        img.src = src
      })
    }

    Promise.all(images.map(preloadImage))
  }, [images])

  return {
    loadedImages,
    loadingProgress,
    isComplete: loadedImages.size === images.length
  }
}

// Image loading placeholder component
export function ImagePlaceholder({
  width,
  height,
  className,
  showSpinner = true,
}: {
  width?: number
  height?: number
  className?: string
  showSpinner?: boolean
}) {
  return (
    <div
      className={cn(
        'bg-gray-200 animate-pulse flex items-center justify-center',
        className
      )}
      style={{ width, height }}
    >
      {showSpinner && (
        <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
      )}
    </div>
  )
}
