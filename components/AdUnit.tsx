import React, { useEffect, useRef } from 'react';

interface AdUnitProps {
  slot: string;
  format?: 'auto' | 'fluid' | 'rectangle';
  className?: string;
}

const AdUnit: React.FC<AdUnitProps> = ({
  slot,
  format = 'auto',
  className = '',
}) => {
  const adRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const adEl = adRef.current?.querySelector<HTMLInsElement>('ins.adsbygoogle');

    if (!adEl) return;

    // If AdSense already processed this element, don't push again
    const alreadyLoaded = adEl.getAttribute('data-adsbygoogle-status') === 'done';
    if (alreadyLoaded) {
      return;
    }

    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error('AdSense Error', e);
    }
  }, []); // run once per component instance

  return (
    <div
      ref={adRef}
      className={`my-4 flex flex-col items-center justify-center bg-gray-50 dark:bg-white/5 border border-dashed border-gray-300 dark:border-white/10 rounded-lg overflow-hidden ${className}`}
    >
      <span className="text-[10px] uppercase tracking-widest text-gray-400 py-1">
        Sponsored
      </span>

      <div className="w-full min-h-[100px] flex items-center justify-center">
        <ins
          className="adsbygoogle"
          style={{ display: 'block', width: '100%' }}
          data-ad-client="ca-pub-4286398875959777"
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
};

export default AdUnit;
