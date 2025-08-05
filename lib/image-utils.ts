/**
 * Image optimization utility functions for SEO and performance
 */

/**
 * Interface for image metadata parameters
 */
interface ImageMetadataParams {
  description?: string;
  keywords?: string[];
  caption?: string;
  creator?: string;
  license?: string;
  [key: string]: any;
}

/**
 * Generate structured metadata for images
 * @param altText - Alternative text for the image
 * @param title - Title of the image
 * @param additional - Additional metadata
 * @returns Image metadata
 */
export function generateImageMetadata(altText: string, title: string, additional: ImageMetadataParams = {}) {
  return {
    alt: altText,
    title: title,
    longdesc: additional.description || title,
    keywords: additional.keywords || [],
    caption: additional.caption || '',
    creator: additional.creator || 'NorthPath Strategies',
    license: additional.license || 'All Rights Reserved',
    ...additional,
  };
}

/**
 * Get optimal image size based on device and usage context
 * @param usage - Where the image is being used
 * @param deviceType - Device viewing the image
 * @returns Width and height for the image
 */
export function getOptimalImageSize(usage: string, deviceType = 'desktop') {
  const sizes = {
    hero: {
      desktop: { width: 1920, height: 1080 },
      tablet: { width: 1200, height: 675 },
      mobile: { width: 750, height: 420 },
    },
    thumbnail: {
      desktop: { width: 400, height: 300 },
      tablet: { width: 300, height: 225 },
      mobile: { width: 200, height: 150 },
    },
    avatar: {
      desktop: { width: 128, height: 128 },
      tablet: { width: 96, height: 96 },
      mobile: { width: 64, height: 64 },
    },
    card: {
      desktop: { width: 600, height: 400 },
      tablet: { width: 500, height: 333 },
      mobile: { width: 350, height: 233 },
    },
    banner: {
      desktop: { width: 1400, height: 400 },
      tablet: { width: 1024, height: 300 },
      mobile: { width: 640, height: 200 },
    },
    og: {
      desktop: { width: 1200, height: 630 },
      tablet: { width: 1200, height: 630 },
      mobile: { width: 1200, height: 630 },
    },
    icon: {
      desktop: { width: 32, height: 32 },
      tablet: { width: 32, height: 32 },
      mobile: { width: 32, height: 32 },
    },
  };

  // Default to desktop if device type is not recognized
  const device = ['desktop', 'tablet', 'mobile'].includes(deviceType) 
    ? deviceType 
    : 'desktop';
  
  // Return the size or a default if usage is not found
  return sizes[usage]?.[device] || { width: 800, height: 600 };
}

/**
 * Generate responsive image sources for different screen sizes
 * @param {string} basePath - Base path of the image 
 * @param {string} filename - Image filename without extension
 * @param {string} ext - Image extension/format
 * @returns {Array} Array of source objects with srcSet and media queries
 */
export function getResponsiveImageSources(basePath: string, filename: string, ext = 'jpg') {
  const widths = {
    mobile: 640,
    tablet: 1024,
    desktop: 1920,
    retina: 2560,
  };

  return [
    {
      srcSet: `${basePath}/${filename}-${widths.mobile}.${ext}`,
      media: `(max-width: 640px)`,
      width: widths.mobile,
    },
    {
      srcSet: `${basePath}/${filename}-${widths.tablet}.${ext}`,
      media: `(max-width: 1024px)`,
      width: widths.tablet,
    },
    {
      srcSet: `${basePath}/${filename}-${widths.desktop}.${ext}`,
      media: `(max-width: 1920px)`,
      width: widths.desktop,
    },
    {
      srcSet: `${basePath}/${filename}-${widths.retina}.${ext}`,
      media: `(min-width: 1921px)`,
      width: widths.retina,
    },
  ];
}

// Second declaration of generateImageMetadata removed to fix duplicate function error

/**
 * Generate image URL with optimization parameters
 * @param {string} src - Source URL of the image
 * @param {object} params - Optimization parameters
 * @returns {string} Optimized image URL
 */
export function getOptimizedImageUrl(src: string, params = {}) {
  // Default optimization parameters
  const defaultParams = {
    quality: '80',
    format: 'webp',
    width: null,
    height: null,
  };

  const finalParams = { ...defaultParams, ...params };
  
  // If src is already optimized or external, return it
  if (src.includes('?') || src.startsWith('http') || src.startsWith('data:')) {
    return src;
  }
  
  // Build query string for parameters
  const queryParams = Object.entries(finalParams)
    .filter(([_, value]) => value !== null)
    .map(([key, value]) => `${key}=${value}`)
    .join('&');
    
  return queryParams ? `${src}?${queryParams}` : src;
}
