/**
 * React hook wrapping the Web Speech API for instant speech-to-text.
 * Falls back to server-side STT when the browser API is unavailable.
 */
import { useState, useCallback, useRef, useEffect } from 'react';
import {
  SpeechRecognitionService,
  isSpeechRecognitionSupported,
  serverSideSTT,
} from '@/lib/speech-recognition';

export interface UseSpeechRecognitionOptions {
  /** BCP-47 language code */
  lang?: string;
  /** Keep listening after each utterance */
  continuous?: boolean;
}

export interface UseSpeechRecognitionReturn {
  /** Whether the Web Speech API is available */
  isSupported: boolean;
  /** Whether currently listening */
  isListening: boolean;
  /** Partial transcript as user speaks (Web Speech API only) */
  interimTranscript: string;
  /** Final transcript from completed speech segment */
  finalTranscript: string;
  /** Start listening */
  startListening: () => void;
  /** Stop listening */
  stopListening: () => void;
  /** Clear all transcripts */
  resetTranscript: () => void;
}

export function useSpeechRecognition(
  options: UseSpeechRecognitionOptions = {},
): UseSpeechRecognitionReturn {
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const serviceRef = useRef<SpeechRecognitionService | null>(null);
  const fallbackRef = useRef<{ stop: () => void } | null>(null);
  const isSupported = isSpeechRecognitionSupported();

  // Clean up on unmount
  useEffect(() => {
    return () => {
      serviceRef.current?.dispose();
      fallbackRef.current?.stop();
    };
  }, []);

  const startListening = useCallback(() => {
    if (isListening) return;

    setInterimTranscript('');
    setFinalTranscript('');

    if (isSupported) {
      const service = new SpeechRecognitionService({
        lang: options.lang || 'en-US',
        continuous: options.continuous ?? false,
        interimResults: true,
        onStart: () => setIsListening(true),
        onInterimResult: (text) => setInterimTranscript(text),
        onFinalResult: (text) => {
          setFinalTranscript((prev) => prev + text);
          setInterimTranscript('');
        },
        onError: (err) => console.warn('[SpeechRecognition] error:', err),
        onEnd: () => setIsListening(false),
      });

      serviceRef.current = service;
      service.start();
    } else {
      // Fallback to server-side STT
      setIsListening(true);
      serverSideSTT(
        (transcript) => {
          setFinalTranscript(transcript);
          setIsListening(false);
        },
        (error) => {
          console.warn('[ServerSTT] error:', error);
          setIsListening(false);
        },
      ).then((handle) => {
        fallbackRef.current = handle;
      });
    }
  }, [isListening, isSupported, options.lang, options.continuous]);

  const stopListening = useCallback(() => {
    if (serviceRef.current?.isListening) {
      serviceRef.current.stop();
    }
    if (fallbackRef.current) {
      fallbackRef.current.stop();
      fallbackRef.current = null;
    }
  }, []);

  const resetTranscript = useCallback(() => {
    setInterimTranscript('');
    setFinalTranscript('');
  }, []);

  return {
    isSupported,
    isListening,
    interimTranscript,
    finalTranscript,
    startListening,
    stopListening,
    resetTranscript,
  };
}
