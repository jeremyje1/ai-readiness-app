'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { getOptimizedImageUrl } from '@/lib/image-utils';

interface ResponsiveImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  sizes?: string;
  className?: string;
  priority?: boolean;
  quality?: number;
  loading?: 'eager' | 'lazy';
  fetchPriority?: 'high' | 'low' | 'auto';
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
  // SEO enhancements
  title?: string;
  caption?: string;
  attribution?: string;
  license?: string;
  structuredData?: boolean;
  // Overlay props
  overlay?: boolean;
  overlayType?: 'solid' | 'gradient' | 'vignette' | 'diagonal' | 'vertical';
  overlayOpacity?: number;
  overlayColor?: string;
  overlayGradient?: string;
}

/**
 * An SEO-optimized, responsive image component with lazy loading
 * and improved accessibility
 */
export default function ResponsiveImage({
  src,
  alt,
  width,
  height,
  fill = false,
  sizes = '100vw',
  className = '',
  priority = false,
  quality = 85,
  loading = 'lazy',
  fetchPriority = 'auto',
  placeholder = 'empty',
  blurDataURL,
  onLoad,
  onError,
  title,
  caption,
  attribution,
  license,
  structuredData = true,
  // Overlay props
  overlay = false,
  overlayType = 'gradient',
  overlayOpacity = 0.5,
  overlayColor = '#000000',
  overlayGradient = 'from-black/50 via-black/40 to-black/60',
}: ResponsiveImageProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);
  const shouldUseBlur = placeholder === 'blur';

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const imgSrc = getOptimizedImageUrl(src, {
    quality: quality.toString(),
    format: 'webp',
  });

  // Intersection observer for lazy loading and performance metrics
  useEffect(() => {
    if (!imageRef.current || priority) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
          
          // Log performance for first meaningful paint (client-side only)
          if (typeof window !== 'undefined' && performance && performance.mark) {
            performance.mark(`image-in-view-${src.split('/').pop()}`);
          }
        }
      });
    }, {
      rootMargin: '200px', // Load images 200px before they enter the viewport
      threshold: 0.01
    });

    observer.observe(imageRef.current);
    return () => observer.disconnect();
  }, [src, priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    if (onLoad) onLoad();
    
    // Log image load timing for performance monitoring (client-side only)
    if (typeof window !== 'undefined' && performance && performance.mark) {
      performance.mark(`image-loaded-${src.split('/').pop()}`);
    }
  };

  const handleError = () => {
    setHasError(true);
    if (onError) onError();
    
    // Log error for monitoring
    console.error(`Image failed to load: ${src}`);
  };

  // Generate structured data JSON-LD for the image
  const getStructuredData = () => {
    if (!structuredData) return null;
    
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const absoluteSrc = src.startsWith('http') ? src : `${baseUrl}${src}`;
    
    const data: Record<string, any> = {
      '@context': 'https://schema.org',
      '@type': 'ImageObject',
      contentUrl: absoluteSrc,
      description: alt,
      name: title || alt,
    };
    
    if (caption) data.caption = caption;
    if (attribution) data.creditText = attribution;
    if (license) data.license = license;
    
    return JSON.stringify(data);
  };

  // Fallback for loading errors
  if (hasError) {
    return (
      <figure className={cn('relative', className)}>
        <div 
          className="flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-500"
          style={{ width, height, aspectRatio: width && height ? width / height : undefined }}
          role="img"
          aria-label={alt}
        >
          <span className="text-sm">Image not available</span>
        </div>
        {caption && <figcaption className="mt-2 text-sm text-gray-500">{caption}</figcaption>}
      </figure>
    );
  }

  return (
    <figure ref={imageRef} className={cn('relative', className)}>
      {isMounted && structuredData && getStructuredData() && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: getStructuredData()! }}
        />
      )}
      {(isInView || priority) && (
        <div
          className={cn(
            'transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
          style={fill ? undefined : { width, height }}
        >
          <Image
            src={imgSrc}
            alt={alt}
            width={fill ? undefined : width}
            height={fill ? undefined : height}
            fill={fill}
            sizes={sizes}
            priority={priority}
            loading={priority ? undefined : loading}
            fetchPriority={fetchPriority}
            title={title || alt}
            onLoad={handleLoad}
            onError={handleError}
            placeholder={shouldUseBlur ? 'blur' : 'empty'}
            blurDataURL={blurDataURL}
            className={cn(
              'max-w-full h-auto object-cover',
              fill && 'absolute inset-0'
            )}
          />
          
          {/* Image overlay for better text contrast */}
          {overlay && (
            <div 
              className={cn(
                "absolute inset-0",
                overlayType === 'gradient' 
                  ? `bg-gradient-to-r ${overlayGradient}`
                  : overlayType === 'vignette'
                  ? 'bg-vignette'
                  : overlayType === 'diagonal'
                  ? 'bg-diagonal-overlay'
                  : overlayType === 'vertical'
                  ? 'bg-gradient-overlay'
                  : ''
              )}
              style={overlayType === 'solid' ? { 
                backgroundColor: overlayColor,
                opacity: overlayOpacity
              } : (overlayOpacity !== 0.5) ? {
                opacity: overlayOpacity * 2 // Adjusting opacity for gradient overlays
              } : undefined}
            />
          )}
        </div>
      )}
      
      {caption && (
        <figcaption className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {caption}
          {attribution && (
            <span className="block text-xs opacity-75">
              Credit: {attribution}
            </span>
          )}
        </figcaption>
      )}
    </figure>
  );
}
