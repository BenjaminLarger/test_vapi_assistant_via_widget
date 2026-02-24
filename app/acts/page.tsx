'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import VapiWidget from '@/components/VapiWidget';
import { ASSISTANTS } from '@/lib/vapiConfig';

const ThreeScene = dynamic(() => import('@/components/ThreeScene'), { ssr: false });

export default function ActsPage() {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSpeakingChange = useCallback((speaking: boolean) => {
    setIsSpeaking(speaking);
  }, []);

  return (
    <>
      <ThreeScene isSpeaking={isSpeaking} />
      <VapiWidget
        assistantId={ASSISTANTS.acts.id}
        assistantName={ASSISTANTS.acts.name}
        onSpeakingChange={handleSpeakingChange}
      />
    </>
  );
}
