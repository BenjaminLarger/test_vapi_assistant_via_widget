'use client';

import { useEffect, useRef, useState } from 'react';
import Vapi from '@vapi-ai/web';
import { VAPI_API_KEY, VAPI_ASSISTANT_ID } from '@/lib/vapiConfig';

interface VapiWidgetProps {
  onSpeakingChange: (isSpeaking: boolean) => void;
}

export default function VapiWidget({ onSpeakingChange }: VapiWidgetProps) {
  const vapiRef = useRef<Vapi | null>(null);
  const [callStatus, setCallStatus] = useState<'idle' | 'connecting' | 'active' | 'ending'>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Initialize Vapi
    console.log('Initializing Vapi with API key:', VAPI_API_KEY ? 'Set' : 'Missing', 'Assistant ID:', VAPI_ASSISTANT_ID ? 'Set' : 'Missing');
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
          await vapiRef.current.start(VAPI_ASSISTANT_ID);
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

  const handleToggleMute = () => {
    if (vapiRef.current) {
      if (isMuted) {
        vapiRef.current.setMuted(false);
      } else {
        vapiRef.current.setMuted(true);
      }
      setIsMuted(!isMuted);
    }
  };

  const isButtonActive = callStatus === 'active' || callStatus === 'connecting';

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center pointer-events-none">
      <div className="pointer-events-auto">
        {/* Main card */}
        <div className="bg-secondary/40 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-muted/20">
          <div className="flex flex-col items-center gap-6 min-w-[300px]">
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
                {callStatus === 'idle' && 'Click to start'}
                {callStatus === 'connecting' && 'Connecting...'}
                {callStatus === 'active' && 'Call Active'}
                {callStatus === 'ending' && 'Ending...'}
              </p>
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

            {/* Controls */}
            <div className="flex gap-3">
              <button
                onClick={handleToggleMute}
                disabled={callStatus === 'idle'}
                className={`p-2 rounded-full transition-colors ${
                  isMuted
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-muted/20 text-foreground hover:bg-muted/40'
                } ${callStatus === 'idle' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {/* Mute Icon */}
                {isMuted ? (
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M16.6915026,12.4744748 L3.50612381,13.2599618 C3.19218622,13.2599618 3.03521743,13.4170592 3.03521743,13.5741566 L1.15159189,20.0151496 C0.8376543,20.8006365 0.99,21.89 1.77946707,22.52 C2.41,22.99 3.50612381,23.1 4.13399899,22.8429026 L21.714504,14.0454487 C22.6563168,13.5741566 23.1272231,12.6315722 22.9702544,11.6889879 L21.714504,3.20212963 C21.5575352,2.20844526 20.9899159,1.4230585 20.1604501,1.4230585 C19.3309843,1.4230585 18.5915971,1.89175585 18.5915971,2.89915502 L17.1624885,10.9563176 C17.1624885,11.1134151 16.9449242,11.2705125 16.6915026,11.2705125 C16.4381263,11.2705125 16.4381263,11.0568172 16.4381263,10.9563176 L3.03521743,2.89915502 C2.41,1.89175585 1.77946707,1.4230585 0.8376543,1.4230585 C0.8376543,1.4230585 0.99,0.7965779 1.77946707,0.423339712 C2.41,0 3.50612381,0 4.13399899,0.529857969 L21.714504,9.14343957 C22.6563168,9.6815534 23.1272231,10.6624444 22.9702544,11.6889879 Z" />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                    <path d="M17 16.91c-1.48 1.46-3.51 2.36-5.7 2.36-2.2 0-4.2-.9-5.7-2.36M16 19H8c-.55 0-1 .45-1 1s.45 1 1 1h8c.55 0 1-.45 1-1s-.45-1-1-1z" />
                  </svg>
                )}
              </button>
            </div>

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
