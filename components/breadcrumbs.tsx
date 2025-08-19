'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ChevronRight, Home } from 'lucide-react';
import { useEffect, useState } from 'react';

interface BreadcrumbsProps {
  items?: {
    label: string;
    href: string;
  }[];
  homeLabel?: string;
  className?: string;
  separator?: React.ReactNode;
}

/**
 * Breadcrumbs component for improved SEO and navigation
 * If no items are provided, it will generate them from the current path
 */
export default function Breadcrumbs({
  items,
  homeLabel = 'Home',
  className,
  separator = <ChevronRight className="h-4 w-4 mx-2 text-gray-500" aria-hidden="true" />,
}: BreadcrumbsProps) {
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Generate breadcrumb items from the current path if none are provided
  // Only generate dynamic breadcrumbs on the client to prevent hydration mismatches
  const breadcrumbItems = items || (isClient ? generateBreadcrumbItems(pathname, homeLabel) : [{ label: homeLabel, href: '/' }]);

  return (
    <nav 
      aria-label="Breadcrumbs" 
      className={cn('py-3 text-sm', className)}
    >
      <ol className="flex flex-wrap items-center">
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;
          
          return (
            <li 
              key={item.href} 
              className="flex items-center"
              aria-current={isLast ? 'page' : undefined}
            >
              {index === 0 ? (
                <Link 
                  href={item.href}
                  className="flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  aria-label={index === 0 ? `Go to ${item.label}` : undefined}
                >
                  {index === 0 && <Home className="h-4 w-4 mr-1" aria-hidden="true" />}
                  <span>{item.label}</span>
                </Link>
              ) : (
                <Link 
                  href={item.href}
                  className={cn(
                    "hover:text-gray-700 dark:hover:text-gray-300",
                    isLast
                      ? "font-medium text-gray-900 dark:text-white"
                      : "text-gray-500 dark:text-gray-400"
                  )}
                >
                  {item.label}
                </Link>
              )}
              
              {!isLast && separator}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/**
 * Generate breadcrumb items from a pathname
 */
function generateBreadcrumbItems(pathname: string, homeLabel = 'Home') {
  // Start with home
  const items = [{ label: homeLabel, href: '/' }];
  
  if (pathname === '/') return items;

  // Split path into segments and build breadcrumb paths
  const segments = pathname.split('/').filter(Boolean);
  let currentPath = '';

  segments.forEach((segment, i) => {
    currentPath += `/${segment}`;
    
    // Format the label by capitalizing and replacing hyphens
    const label = segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    items.push({ label, href: currentPath });
  });

  return items;
}
