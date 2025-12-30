
import React, { useEffect } from 'react';

interface AdComponentProps {
  slot: string;
}

const AdComponent: React.FC<AdComponentProps> = ({ slot }) => {
  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error('AdSense error', e);
    }
  }, []);

  return (
    <div className="ad-container">
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
