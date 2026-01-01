
import React, { useEffect } from 'react';

interface AdComponentProps {
  slot: string;
}

const AdComponent: React.FC<AdComponentProps> = ({ slot }) => {
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      }
    } catch (e) {
      console.warn('AdSense blocked or failed', e);
    }
  }, []);

  return (
    <div className="ad-container my-8 opacity-40 hover:opacity-100 transition-opacity">
      <ins className="adsbygoogle"
           style={{ display: 'block' }}
           data-ad-client="ca-pub-XXXXXXXXXXXXXXX"
           data-ad-slot={slot}
           data-ad-format="auto"
           data-full-width-responsive="true"></ins>
    </div>
  );
};

export default AdComponent;
