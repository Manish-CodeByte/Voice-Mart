'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export default function Breadcrumbs() {
  const pathname = usePathname();
  
  // Don't show on home page
  if (pathname === '/') return null;

  const segments = pathname.split('/').filter(Boolean);
  
  const breadcrumbs = [
    { name: 'Home', path: '/' },
    ...segments.map((segment, index) => {
      const path = '/' + segments.slice(0, index + 1).join('/');
      const name = segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      return { name, path };
    }),
  ];

  return (
    <nav className="flex items-center gap-2 text-sm mb-6">
      {breadcrumbs.map((crumb, index) => (
        <div key={crumb.path} className="flex items-center gap-2">
          {index > 0 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
          {index === breadcrumbs.length - 1 ? (
            <span className="font-semibold text-foreground">{crumb.name}</span>
          ) : (
            <Link
              href={crumb.path}
              className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
            >
              {index === 0 && <Home className="h-4 w-4" />}
              {crumb.name}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
