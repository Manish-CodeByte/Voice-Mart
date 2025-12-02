'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Loader2, Volume2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useVoice } from '@/contexts/VoiceContext';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';

export default function VoiceAssistant() {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const router = useRouter();
  const { addToCart, items, updateQuantity } = useCart();
  const { isVoiceEnabled } = useVoice();
  const { setTheme } = useTheme();

  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  useEffect(() => {
    // Initialize audio element
    audioRef.current = new Audio();
    audioRef.current.onended = () => setIsPlaying(false);
    
    return () => {
        if (audioContextRef.current) {
            audioContextRef.current.close();
        }
    };
  }, []);

  if (!isVoiceEnabled) return null;

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      // Silence Detection Setup
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      analyser.fftSize = 256;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      sourceRef.current = source;

      const checkForSilence = () => {
          // Check if recorder is still active
          if (mediaRecorderRef.current?.state !== 'recording') return;
          
          analyser.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / bufferLength;
          
          if (average > 10) { // Lower threshold for sensitivity
              // User is speaking, clear timer
              if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
              silenceTimerRef.current = setTimeout(() => {
                  if (mediaRecorderRef.current?.state === 'recording') {
                      mediaRecorderRef.current.stop();
                      setIsListening(false);
                      toast.info('Processing...');
                  }
              }, 1500); // Stop after 1.5s of silence
          }
          
          requestAnimationFrame(checkForSilence);
      };
      
      // Start silence check loop
      // We need to set isListening to true first, but state updates are async.
      // So we'll start the loop inside the onstart or just rely on the fact that we call setIsListening(true) below.
      // Actually, we can just start the loop.
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' });
        await processAudio(audioBlob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
        
        // Close audio context
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
             audioContextRef.current.close();
        }
      };

      mediaRecorderRef.current.start();
      setIsListening(true);
      toast.info('Listening...', { duration: 2000 });
      
      // Start checking for silence
      checkForSilence();
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error('Could not access microphone');
    }
  };

  const stopListening = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsListening(false);
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);
    try {
      const result = await api.sendVoiceCommand(audioBlob);

      if (result.success) {
        console.log('Voice Command Result:', result);
        
        // 1. Play Audio Response
        if (result.audioResponse) {
          playAudio(result.audioResponse);
        } else if (result.responseText) {
            toast.success(result.responseText);
        }

        // 2. Execute Action
        await executeAction(result);
      } else {
        toast.error('Sorry, I didn\'t catch that.');
      }
    } catch (error) {
      console.error('Error processing voice command:', error);
      toast.error('Failed to process voice command');
    } finally {
      setIsProcessing(false);
    }
  };

  const playAudio = (base64Audio: string) => {
    if (audioRef.current) {
      audioRef.current.src = `data:audio/mp3;base64,${base64Audio}`;
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const executeAction = async (result: any) => {
    const { action, item } = result;

    switch (action) {
      case 'set_theme':
        if (item.includes('dark')) setTheme('dark');
        else if (item.includes('light')) setTheme('light');
        else if (item.includes('system')) setTheme('system');
        break;

      case 'checkout':
        router.push('/checkout');
        break;

      case 'update_quantity':
        // item might be "3" or "quantity to 3"
        // We need to know WHICH product. 
        // Current prompt doesn't extract product AND quantity separately well.
        // We'll assume the user said "Change quantity of [Product] to [Quantity]"
        // But for now, let's just handle "Update quantity" if we can infer product.
        // This is complex. Let's stick to simple "Increase quantity" for now?
        // Or better, if the user is ON a product page, update that product?
        // For now, let's handle the case where 'item' contains the number.
        // And we might need to ask "Which product?" if not specified.
        // Let's keep it simple: If user says "Set quantity to 3", we might not know for what.
        // We'll skip complex quantity logic for this iteration or try to parse.
        toast.info("Quantity updates are coming soon!"); 
        break;

      case 'add_to_wishlist':
        // Search for product, then add.
        if (item) {
             // We'd need to search -> get ID -> add.
             // For now, redirect to shop with search
             router.push(`/shop?search=${encodeURIComponent(item)}`);
             toast.info(`Searching ${item} to add to wishlist`);
        }
        break;

      case 'navigate':
        if (item.includes('cart')) router.push('/cart');
        else if (item.includes('home')) router.push('/');
        else if (item.includes('order')) router.push('/orders');
        else if (item.includes('wishlist')) router.push('/wishlist');
        break;

      case 'search':
        if (item) {
          router.push(`/shop?search=${encodeURIComponent(item)}`);
        }
        break;

      case 'add_to_cart':
        if (item) {
            router.push(`/shop?search=${encodeURIComponent(item)}`);
            toast.info(`Searching for ${item} to add to cart`);
        }
        break;
        
      case 'remove_from_cart':
         const cartItem = items.find(i => i.productName.toLowerCase().includes(item.toLowerCase()));
         if (cartItem) {
             // updateQuantity(cartItem.productId, 0); // Assuming 0 removes it
             toast.info(`Please remove ${item} manually from cart for safety`);
             router.push('/cart');
         }
         break;

      default:
        break;
    }
  };

  return (
    <button
      onClick={isListening ? stopListening : startListening}
      disabled={isProcessing || isPlaying}
      className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-xl transition-all duration-300 ${
        isListening 
          ? 'bg-red-500 animate-pulse scale-110' 
          : isProcessing
          ? 'bg-yellow-500'
          : isPlaying
          ? 'bg-green-500'
          : 'bg-primary hover:bg-primary/90'
      } text-white`}
    >
      {isListening ? (
        <MicOff className="h-6 w-6" />
      ) : isProcessing ? (
        <Loader2 className="h-6 w-6 animate-spin" />
      ) : isPlaying ? (
        <Volume2 className="h-6 w-6 animate-pulse" />
      ) : (
        <Mic className="h-6 w-6" />
      )}
    </button>
  );
}
