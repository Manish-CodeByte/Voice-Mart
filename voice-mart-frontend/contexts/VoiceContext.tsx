'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

interface VoiceContextType {
  isVoiceEnabled: boolean;
  enableVoice: () => Promise<boolean>;
  disableVoice: () => void;
}

const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

export function VoiceProvider({ children }: { children: React.ReactNode }) {
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);

  const enableVoice = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // We just need to check permission, so we can stop the stream immediately
      stream.getTracks().forEach(track => track.stop());
      
      setIsVoiceEnabled(true);
      toast.success('Voice mode enabled! 🎙️');
      return true;
    } catch (error) {
      console.error('Microphone permission denied:', error);
      toast.error('Microphone permission is required for Voice Mode');
      return false;
    }
  };

  const disableVoice = () => {
    setIsVoiceEnabled(false);
    toast.info('Voice mode disabled');
  };

  return (
    <VoiceContext.Provider value={{ isVoiceEnabled, enableVoice, disableVoice }}>
      {children}
    </VoiceContext.Provider>
  );
}

export function useVoice() {
  const context = useContext(VoiceContext);
  if (context === undefined) {
    throw new Error('useVoice must be used within a VoiceProvider');
  }
  return context;
}
