import React, { useEffect } from 'react';

interface AdUnitProps {
  slot: string;
  format?: 'auto' | 'fluid' | 'rectangle';
  className?: string;
}

const AdUnit: React.FC<AdUnitProps> = ({ slot, format = 'auto', className = '' }) => {
  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error('AdSense Error', e);
    }
  }, []);

  return (
    <div className={`my-4 flex flex-col items-center justify-center bg-gray-50 dark:bg-white/5 border border-dashed border-gray-300 dark:border-white/10 rounded-lg overflow-hidden ${className}`}>
      <span className="text-[10px] uppercase tracking-widest text-gray-400 py-1">Sponsored</span>
      <div className="w-full min-h-[100px] flex items-center justify-center text-gray-400 text-xs">
         {/* In production, the ins tag would be populated. For now, a placeholder UI. */}
         <ins className="adsbygoogle"
             style={{ display: 'block', width: '100%', textAlign: 'center' }}
             data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
             data-ad-slot={slot}
             data-ad-format={format}
             data-full-width-responsive="true"></ins>
         <div className="absolute pointer-events-none">Google AdSense</div>
      </div>
    </div>
  );
};

export default AdUnit;