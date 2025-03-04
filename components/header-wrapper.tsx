'use client';

import { usePathname } from 'next/navigation';
import { SiteHeader } from "@/components/site-header";
import { useState, useEffect } from 'react';

export function HeaderWrapper() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  
  // Handle hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render anything until mounted to prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  // Check if the current path starts with /dashboard
  const isDashboardRoute = pathname?.startsWith('/dashboard');

  if (isDashboardRoute) {
    return null;
  }

  return <SiteHeader />;
}
