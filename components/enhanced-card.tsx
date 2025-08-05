'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export interface CardActionProps {
  label: string;
  href?: string;
  onClick?: () => void;
  variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'secondary' | 'link';
  icon?: React.ReactNode;
  external?: boolean;
}

export interface EnhancedCardProps {
  title: string;
  description?: string;
  image?: {
    src: string;
    alt: string;
    aspectRatio?: 'square' | '16:9' | '4:3' | '1:1';
  };
  icon?: React.ReactNode;
  actions?: CardActionProps[];
  className?: string;
  isLoading?: boolean;
  variant?: 'default' | 'elevated' | 'outlined' | 'compact';
  orientation?: 'vertical' | 'horizontal';
  children?: React.ReactNode;
  fullWidthAction?: boolean;
  headerBg?: boolean;
  onClick?: () => void;
}

const SkeletonCard = ({ orientation, image, variant }: Pick<EnhancedCardProps, 'orientation' | 'image' | 'variant'>) => {
  return (
    <Card className={cn(
      'animate-pulse overflow-hidden',
      {
        'sm:flex-row': orientation === 'horizontal',
        'shadow-md': variant === 'elevated',
      }
    )}>
      {image && (
        <div className={cn(
          'bg-gray-200',
          {
            'h-48': image.aspectRatio === '16:9',
            'h-64': image.aspectRatio === '4:3' || !image.aspectRatio,
            'aspect-square': image.aspectRatio === 'square' || image.aspectRatio === '1:1',
            'sm:w-1/3': orientation === 'horizontal',
          }
        )} />
      )}
      
      <div className="p-6">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
        <div className="h-9 bg-gray-200 rounded w-32"></div>
      </div>
    </Card>
  );
};

export function EnhancedCard({
  title,
  description,
  image,
  icon,
  actions = [],
  className,
  isLoading = false,
  variant = 'default',
  orientation = 'vertical',
  children,
  fullWidthAction = false,
  headerBg = false,
  onClick,
}: EnhancedCardProps) {
  const [isClient, setIsClient] = useState(false);
  
  // Only enable hover animations after hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Display skeleton during loading state
  if (isLoading) {
    return <SkeletonCard orientation={orientation} image={image} variant={variant} />;
  }

  // Define card wrapper based on variant and interaction
  const cardWrapperClasses = cn(
    'rounded-lg overflow-hidden transition-all duration-300',
    {
      'border border-gray-200': variant !== 'outlined',
      'border-2 border-gray-300': variant === 'outlined',
      'shadow-sm': variant === 'default',
      'shadow-md': variant === 'elevated',
      'sm:flex-row': orientation === 'horizontal',
      'hover:shadow-lg': isClient,
      'cursor-pointer': onClick,
      'max-w-sm': variant === 'compact',
    },
    className
  );

  // Define card header styles
  const headerClasses = cn(
    {
      'bg-gray-50': headerBg,
      'p-4': variant !== 'compact',
      'p-3': variant === 'compact',
      'pt-0 px-0': image,
    }
  );

  // Define card content styles
  const contentClasses = cn(
    {
      'p-4 pt-0': variant !== 'compact' && !image,
      'p-4': variant !== 'compact' && image,
      'p-3': variant === 'compact',
      'sm:flex-1': orientation === 'horizontal',
    }
  );

  // Define card footer styles
  const footerClasses = cn(
    'flex items-center',
    {
      'p-4 pt-0': variant !== 'compact',
      'p-3 pt-0': variant === 'compact',
      'flex-col space-y-2 w-full': fullWidthAction,
      'space-x-3': !fullWidthAction,
      'justify-end': !fullWidthAction,
    }
  );

  const CardComponent = onClick ? motion.div : 'div';
  const motionProps = onClick ? {
    whileHover: { scale: isClient ? 1.02 : 1 },
    whileTap: { scale: isClient ? 0.98 : 1 },
    onClick,
  } : {};

  const cardContent = (
    <>
      {/* Image section */}
      {image && (
        <div className={cn(
          'relative w-full overflow-hidden',
          {
            'h-48': image.aspectRatio === '16:9',
            'h-64': image.aspectRatio === '4:3' || !image.aspectRatio,
            'aspect-square': image.aspectRatio === 'square' || image.aspectRatio === '1:1',
            'sm:w-1/3': orientation === 'horizontal',
          }
        )}>
          <Image
            src={image.src}
            alt={image.alt}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes={orientation === 'horizontal' ? '(min-width: 640px) 33vw, 100vw' : '100vw'}
          />
        </div>
      )}

      <div className="flex flex-col flex-1">
        {/* Card Header - Title, description and icon */}
        <CardHeader className={headerClasses}>
          {icon && <div className="text-primary-500 mb-2">{icon}</div>}
          <CardTitle className={cn(
            {
              'text-xl': variant !== 'compact',
              'text-base': variant === 'compact',
            }
          )}>
            {title}
          </CardTitle>
          {description && (
            <CardDescription className={cn(
              {
                'line-clamp-3': !children,
                'text-sm': variant === 'compact',
              }
            )}>
              {description}
            </CardDescription>
          )}
        </CardHeader>

        {/* Card Content - Custom content */}
        {children && (
          <CardContent className={contentClasses}>
            {children}
          </CardContent>
        )}

        {/* Card Footer - Action buttons */}
        {actions.length > 0 && (
          <CardFooter className={footerClasses}>
            {actions.map((action, index) => {
              const actionContent = (
                <Button
                  key={`action-button-${index}`}
                  variant={action.variant || 'default'}
                  className={cn({
                    'w-full justify-between': fullWidthAction,
                    'group-hover:bg-primary-700': action.variant !== 'outline' && action.variant !== 'ghost',
                  })}
                  onClick={action.onClick}
                >
                  {action.label}
                  {action.icon || (action.external ? (
                    <ExternalLink className="ml-2 h-4 w-4" />
                  ) : (
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  ))}
                </Button>
              );

              return action.href ? (
                <Link 
                  key={`action-link-${index}`}
                  href={action.href}
                  target={action.external ? '_blank' : undefined}
                  rel={action.external ? 'noopener noreferrer' : undefined}
                  className={fullWidthAction ? 'w-full' : ''}
                >
                  {actionContent}
                </Link>
              ) : actionContent;
            })}
          </CardFooter>
        )}
      </div>
    </>
  );

  return (
    <CardComponent
      className={cn('group', cardWrapperClasses)}
      {...motionProps}
    >
      {cardContent}
    </CardComponent>
  );
}
