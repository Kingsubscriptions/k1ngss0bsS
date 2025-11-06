import React, { useState, useRef, useEffect } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  priority = false,
  placeholder,
  onLoad,
  onError,
  objectFit = 'cover'
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Generate responsive image sources
  const generateSrcSet = (src: string) => {
    if (!src) return '';

    // Skip responsive image generation for external URLs (like Clearbit)
    if (src.startsWith('http') && !src.includes(window.location.hostname)) {
      return '';
    }

    const baseUrl = src.replace(/\.(jpg|jpeg|png|webp)$/i, '');
    const extension = src.match(/\.(jpg|jpeg|png|webp)$/i)?.[1] || 'jpg';

    return `
      ${baseUrl}-320w.${extension} 320w,
      ${baseUrl}-640w.${extension} 640w,
      ${baseUrl}-960w.${extension} 960w,
      ${baseUrl}-1280w.${extension} 1280w,
      ${src} 1920w
    `.trim();
  };

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || !imgRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            if (observerRef.current) {
              observerRef.current.disconnect();
            }
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before the image enters the viewport
        threshold: 0.1
      }
    );

    if (imgRef.current) {
      observerRef.current.observe(imgRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // Check if this is an external URL
  const isExternalUrl = src.startsWith('http') && !src.includes(window.location.hostname);

  // For external URLs, use a simple img tag
  if (isExternalUrl) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        {/* Loading placeholder */}
        {!isLoaded && !hasError && (
          <div
            className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse flex items-center justify-center"
            style={{ width, height }}
            aria-hidden="true"
          >
            <div className="w-8 h-8 border-2 border-gray-300 dark:border-gray-600 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        )}

        <img
          src={hasError ? (placeholder || '/images/default-image.jpg') : src}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          className={`transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } ${className}`}
          onLoad={handleLoad}
          onError={handleError}
          style={{
            width: width || 'auto',
            height: height || 'auto',
            objectFit: objectFit
          }}
        />

        {/* Error state */}
        {hasError && (
          <div
            className="absolute inset-0 bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400"
            style={{ width, height }}
          >
            <div className="text-center">
              <div className="text-2xl mb-2">📷</div>
              <div className="text-sm">Image unavailable</div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // For local images, use the full optimized version
  const fallbackSrc = placeholder || '/images/default-image.jpg';
  const imageSrc = hasError ? fallbackSrc : src;
  const srcSet = hasError ? '' : generateSrcSet(src);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Loading placeholder */}
      {!isLoaded && !hasError && (
        <div
          className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse flex items-center justify-center"
          style={{ width, height }}
          aria-hidden="true"
        >
          <div className="w-8 h-8 border-2 border-gray-300 dark:border-gray-600 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      )}

      {/* Main image */}
      {isInView && (
        <picture>
          {/* WebP format for modern browsers */}
          {!hasError && src.match(/\.(jpg|jpeg|png)$/i) && (
            <source
              srcSet={generateSrcSet(src.replace(/\.(jpg|jpeg|png)$/i, '.webp'))}
              type="image/webp"
            />
          )}

          <img
            ref={imgRef}
            src={imageSrc}
            srcSet={srcSet}
            sizes="(max-width: 640px) 320px, (max-width: 960px) 640px, (max-width: 1280px) 960px, 1280px"
            alt={alt}
            width={width}
            height={height}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            className={`transition-opacity duration-300 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            } ${className}`}
            onLoad={handleLoad}
            onError={handleError}
            style={{
              width: width || 'auto',
              height: height || 'auto',
              objectFit: objectFit
            }}
          />
        </picture>
      )}

      {/* Error state */}
      {hasError && (
        <div
          className="absolute inset-0 bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400"
          style={{ width, height }}
        >
          <div className="text-center">
            <div className="text-2xl mb-2">📷</div>
            <div className="text-sm">Image unavailable</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;
