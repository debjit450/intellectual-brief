import React, { useEffect, useRef, useState } from 'react';

interface AdUnitProps {
  slot: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal' | 'vertical';
  className?: string;
  lazy?: boolean; // Enable lazy loading with Intersection Observer
  minHeight?: string; // Minimum height to prevent layout shift
}

const AdUnit: React.FC<AdUnitProps> = ({
  slot,
  format = 'auto',
  className = '',
  lazy = true,
  minHeight = '100px',
}) => {
  const adRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(!lazy);
  const [isLoaded, setIsLoaded] = useState(false);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || isVisible) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '100px', // Start loading 100px before ad comes into view
        threshold: 0.1,
      }
    );

    if (adRef.current) {
      observer.observe(adRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [lazy, isVisible]);

  // Load ad when visible
  useEffect(() => {
    if (!isVisible || isLoaded) return;

    const adEl = adRef.current?.querySelector<HTMLInsElement>('ins.adsbygoogle');
    if (!adEl) return;

    // If AdSense already processed this element, don't push again
    const alreadyLoaded = adEl.getAttribute('data-adsbygoogle-status') === 'done';
    if (alreadyLoaded) {
      setIsLoaded(true);
      return;
    }

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      try {
        // @ts-ignore
        if (window.adsbygoogle && !adEl.getAttribute('data-adsbygoogle-status')) {
          // @ts-ignore
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          setIsLoaded(true);
        }
      } catch (e) {
        console.error('AdSense Error', e);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isVisible, isLoaded]);

  return (
    <div
      ref={adRef}
      className={`my-6 md:my-8 flex flex-col items-center justify-center overflow-hidden ${className}`}
      style={{ minHeight: isVisible ? undefined : minHeight }}
    >
      {isVisible && (
        <>
          <span className="text-[9px] uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500 mb-2 font-mono">
            Advertisement
          </span>
          <div className="w-full flex items-center justify-center" style={{ minHeight }}>
            <ins
              className="adsbygoogle"
              style={{ 
                display: 'block', 
                width: '100%',
                minHeight: minHeight,
              }}
              data-ad-client="ca-pub-4286398875959777"
              data-ad-slot={slot}
              data-ad-format={format}
              data-full-width-responsive="true"
            />
          </div>
        </>
      )}
      {!isVisible && lazy && (
        <div 
          className="w-full flex items-center justify-center bg-neutral-50 dark:bg-neutral-900/30"
          style={{ minHeight }}
        >
          <span className="text-[9px] uppercase tracking-[0.2em] text-neutral-300 dark:text-neutral-700 font-mono">
            Loading...
          </span>
        </div>
      )}
    </div>
  );
};

export default AdUnit;
