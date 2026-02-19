'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import VapiWidget from '@/components/VapiWidget';

const ThreeScene = dynamic(() => import('@/components/ThreeScene'), {
  ssr: false,
});

export default function Home() {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSpeakingChange = useCallback((speaking: boolean) => {
    setIsSpeaking(speaking);
  }, []);

  return (
    <>
      <ThreeScene isSpeaking={isSpeaking} />
      <VapiWidget onSpeakingChange={handleSpeakingChange} />
    </>
  );
}
