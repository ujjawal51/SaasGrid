'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;

    let visitorId = '';
    try {
      visitorId = localStorage.getItem('saaterra_vid');
      if (!visitorId) {
        visitorId = 'vid_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
        localStorage.setItem('saaterra_vid', visitorId);
      }
      
      document.cookie = `saaterra_vid=${visitorId}; path=/; max-age=31536000; SameSite=Lax`;
    } catch {
      visitorId = 'vid_fallback_' + Date.now();
    }

    const trackPageView = async () => {
      try {
        const isSoftwarePage = pathname.startsWith('/software/');
        const softwareSlug = isSoftwarePage ? pathname.split('/software/')[1]?.split('/')[0] : null;

        fetch('/api/analytics/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          keepalive: true,
          body: JSON.stringify({
            eventType: 'page_view',
            path: pathname,
            softwareSlug: softwareSlug || null,
            visitorId,
            deviceType: window.innerWidth < 768 ? 'Mobile' : 'Desktop',
          }),
        }).catch(() => {});
      } catch (err) {
        
      }
    };

    trackPageView();
  }, [pathname]);

  return null;
}
