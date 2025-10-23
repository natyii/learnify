'use client';
import { useEffect } from 'react';

export default function RegisterSW() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if ('serviceWorker' in navigator) {
      const onReady = () => {
        navigator.serviceWorker.register('/sw.js').catch((err) => {
          console.warn('SW registration failed', err);
        });
      };
      if (document.readyState === 'complete') onReady();
      else window.addEventListener('load', onReady);
    }
  }, []);
  return null;
}
