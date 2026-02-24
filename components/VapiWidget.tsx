'use client';

import { useEffect, useRef, useState } from 'react';
import Vapi from '@vapi-ai/web';
import { VAPI_API_KEY } from '@/lib/vapiConfig';

interface VapiWidgetProps {
  assistantId: string;
  assistantName: string;
  onSpeakingChange: (isSpeaking: boolean) => void;
}

export default function VapiWidget({ assistantId, assistantName, onSpeakingChange }: VapiWidgetProps) {
  const vapiRef = useRef<Vapi | null>(null);
  const [callStatus, setCallStatus] = useState<'idle' | 'connecting' | 'active' | 'ending'>('idle');
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    // Initialize Vapi
    const vapi = new Vapi(VAPI_API_KEY);

    vapiRef.current = vapi;

    // Event listeners
    const handleCallStart = () => {
      setCallStatus('active');
      setErrorMessage('');
    };

    const handleCallEnd = () => {
      setCallStatus('ending');
      setTimeout(() => setCallStatus('idle'), 500);
      onSpeakingChange(false);
    };

    const handleSpeechStart = () => {
      onSpeakingChange(true);
    };

    const handleSpeechEnd = () => {
      onSpeakingChange(false);
    };

    const handleVolumeLevel = (level: number) => {
      setVolumeLevel(Math.min(level, 1));
    };

    const handleError = (error: unknown) => {
      let errorMsg = 'An error occurred';
      if (error instanceof Error) {
        errorMsg = error.message;
      } else if (typeof error === 'string') {
        errorMsg = error;
      } else if (error && typeof error === 'object') {
        errorMsg = JSON.stringify(error);
      }
      console.error('Vapi Error:', error, 'Parsed message:', errorMsg);
      setErrorMessage(errorMsg);
      setCallStatus('idle');
    };

    vapi.on('call-start', handleCallStart);
    vapi.on('call-end', handleCallEnd);
    vapi.on('speech-start', handleSpeechStart);
    vapi.on('speech-end', handleSpeechEnd);
    vapi.on('volume-level', handleVolumeLevel);
    vapi.on('error', handleError);

    return () => {
      vapi.stop();
      vapi.removeAllListeners();
    };
  }, [onSpeakingChange]);

  const handleMicClick = async () => {
    if (!vapiRef.current) return;

    try {
      if (callStatus === 'idle') {
        setCallStatus('connecting');
        // Suppress harmless browser audio processor warnings
        const originalWarn = console.warn;
        const originalError = console.error;
        const originalLog = console.log;
        console.warn = (...args) => {
          if (typeof args[0] === 'string' && args[0].includes('audio')) {
            return;
          }
          originalWarn(...args);
        };
        console.error = (...args) => {
          if (typeof args[0] === 'string' && args[0].includes('audio')) {
            return;
          }
          originalError(...args);
        };
        console.log = (...args) => {
          if (typeof args[0] === 'string' && args[0].includes('audio')) {
            return;
          }
          originalLog(...args);
        };
        try {
          await vapiRef.current.start(assistantId);
        } finally {
          console.warn = originalWarn;
          console.error = originalError;
          console.log = originalLog;
        }
      } else if (callStatus === 'active') {
        await vapiRef.current.stop();
      }
    } catch (error) {
      let errorMsg = 'Failed to start call';
      if (error instanceof Error) {
        errorMsg = error.message;
      } else if (typeof error === 'string') {
        errorMsg = error;
      } else if (error && typeof error === 'object') {
        errorMsg = JSON.stringify(error);
      }
      console.error('Mic click error:', error, 'Parsed message:', errorMsg);
      setErrorMessage(errorMsg);
      setCallStatus('idle');
    }
  };

  // Timer management
  useEffect(() => {
    if (callStatus === 'idle') {
      setCallDuration(0);
    }
  }, [callStatus]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (callStatus === 'active') {
      intervalId = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [callStatus]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isButtonActive = callStatus === 'active' || callStatus === 'connecting';

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center pointer-events-none">
      <div className="pointer-events-auto">
        {/* Main card */}
        <div className="bg-secondary/40 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-muted/20 animate-[slide-in-up_0.4s_ease-out]">
          <div className="flex flex-col items-center gap-6 min-w-[300px]">
            {/* Assistant Name */}
            <h1 className="text-2xl font-bold text-foreground">{assistantName}</h1>

            {/* Mic Button */}
            <button
              onClick={handleMicClick}
              disabled={callStatus === 'connecting' || callStatus === 'ending'}
              className={`relative w-24 h-24 rounded-full transition-all duration-300 flex items-center justify-center ${
                isButtonActive
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                  : 'bg-primary hover:bg-blue-500'
              } ${
                callStatus === 'connecting' || callStatus === 'ending'
                  ? 'opacity-75 cursor-not-allowed'
                  : 'cursor-pointer'
              }`}
              style={
                isButtonActive
                  ? {
                      animation: 'pulse-ring 1.5s infinite',
                    }
                  : undefined
              }
            >
              {/* Mic Icon */}
              <svg
                className="w-10 h-10 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                <path d="M17 16.91c-1.48 1.46-3.51 2.36-5.7 2.36-2.2 0-4.2-.9-5.7-2.36m8.02-13.25c0 .45-.35.8-.8.8-.44 0-.8-.35-.8-.8s.36-.8.8-.8c.44 0 .8.35.8.8z" />
              </svg>
            </button>

            {/* Status Label */}
            <div className="text-center">
              <p className="text-sm font-medium text-muted">
                {callStatus === 'idle'}
                {callStatus === 'connecting' && 'Connecting...'}
                {callStatus === 'active' && 'Call Active'}
                {callStatus === 'ending' && 'Ending...'}
              </p>
              {callStatus === 'active' && (
                <p className="text-xs text-foreground/60 mt-1">
                  {formatDuration(callDuration)}
                </p>
              )}
            </div>

            {/* Volume Bars */}
            {callStatus === 'active' && (
              <div className="flex gap-1 h-8 items-end">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-1 transition-all duration-75 rounded-sm ${
                      volumeLevel > (i / 5) ? 'bg-accent' : 'bg-muted/20'
                    }`}
                    style={{ height: `${20 + i * 20}%` }}
                  />
                ))}
              </div>
            )}


            {/* Error Message */}
            {errorMessage && (
              <div className="text-sm text-red-400 text-center bg-red-500/10 px-3 py-2 rounded">
                {errorMessage}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
