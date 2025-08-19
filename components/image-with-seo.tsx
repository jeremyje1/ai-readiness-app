'use client';

import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface ImageWithSEOProps {
  src: string;
  alt: string; // Required for SEO
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: boolean;
  loading?: 'eager' | 'lazy';
  className?: string;
  sizes?: string;
  quality?: number;
  onLoad?: () => void;
  onError?: () => void;
  fetchPriority?: 'high' | 'low' | 'auto';
  // Additional SEO-related props
  caption?: string;
  title?: string;
  keywords?: string[];
}

export default function ImageWithSEO({
  src,
  alt,
  width,
  height,
  fill = false,
  priority = false,
  loading = 'lazy',
  className,
  sizes,
  quality = 85,
  onLoad,
  onError,
  fetchPriority,
  caption,
  title,
  keywords,
}: ImageWithSEOProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  // Ensure alt text is meaningful (not empty, not just "image")
  if (!alt || alt === 'image' || alt === 'photo' || alt === 'picture') {
    console.warn(`[SEO Warning] Missing or generic alt text: "${alt}" for image: ${src}`);
  }
  
  // Generate structured data for the image
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ImageObject',
    contentUrl: src,
    description: alt,
    ...(title && { name: title }),
    ...(keywords?.length && { keywords: keywords.join(', ') }),
  };

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  if (hasError) {
    return (
      <div 
        className={cn(
          'bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400',
          className
        )}
        style={{ width, height }}
        role="img"
        aria-label={alt}
      >
        Image Failed to Load
      </div>
    );
  }

  return (
    <figure className="relative">
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        fill={fill}
        priority={priority}
        loading={loading}
        sizes={sizes}
        quality={quality}
        fetchPriority={fetchPriority}
        className={cn(
          'transition-opacity',
          isLoaded ? 'opacity-100' : 'opacity-0',
          className
        )}
        onLoad={handleLoad}
        onError={handleError}
        // Important SEO attributes
        title={title || alt}
      />
      
      {/* Add structured data for SEO */}
      <script 
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      {/* Optional caption for improved SEO */}
      {caption && (
        <figcaption className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
