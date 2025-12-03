'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Loader2, Volume2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useVoice } from '@/contexts/VoiceContext';
import { useLanguage } from '@/app/context/LanguageContext';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';

export default function VoiceAssistant() {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const router = useRouter();
  const { addToCart, items, updateQuantity } = useCart();
  const { isVoiceEnabled } = useVoice();
  const { lang, setLang } = useLanguage(); // Fixed: use 'lang' not 'language'
  const { setTheme } = useTheme();

  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  useEffect(() => {
    // Initialize audio element
    audioRef.current = new Audio();
    audioRef.current.onended = () => setIsPlaying(false);
    
    // Load voices for TTS
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        console.log('Voices loaded:', voices.length);
        setVoicesLoaded(true);
      }
    };
    
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    
    return () => {
        if (audioContextRef.current) {
            audioContextRef.current.close();
        }
        window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);



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
      // Get current page context
      const currentPath = window.location.pathname;
      const context: any = {
        page: currentPath,
      };
      
      // If on product page, extract product ID
      if (currentPath.includes('/shop/') && currentPath !== '/shop') {
        const productId = currentPath.split('/shop/')[1];
        context.productId = productId;
        
        // Try to get product name from page (if available)
        const productNameElement = document.querySelector('h1');
        if (productNameElement) {
          context.productName = productNameElement.textContent || '';
        }
      }
      
      // Send language code and context with the voice command
      const result = await api.sendVoiceCommand(audioBlob, lang, context);

      if (result.success) {
        console.log('Voice Command Result:', result);
        
        // 1. Play Audio Response
        if (result.audioResponse) {
          playAudio(result.audioResponse);
        } else if (result.responseText) {
            speakFallback(result.responseText);
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

  const speakFallback = (text: string) => {
    if ('speechSynthesis' in window) {
      console.log('Speaking:', text);
      
      // CRITICAL FIX: Resume speechSynthesis to bypass Chrome's autoplay policy
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
      
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      // Try to find a good voice
      const voices = window.speechSynthesis.getVoices();
      console.log('Available voices:', voices.length);
      
      // Prefer Indian English female voice if available, else any English
      const preferredVoice = voices.find(v => v.lang.includes('IN') && v.name.includes('Female')) 
                          || voices.find(v => v.lang.includes('IN'))
                          || voices.find(v => v.lang.includes('en'))
                          || voices[0];
                          
      if (preferredVoice) {
        utterance.voice = preferredVoice;
        console.log('Using voice:', preferredVoice.name);
      }
      
      utterance.onstart = () => {
        console.log('TTS Started');
        setIsPlaying(true);
      };
      utterance.onend = () => {
        console.log('TTS Ended');
        setIsPlaying(false);
      };
      utterance.onerror = (e) => {
        console.error('TTS Error:', e);
        console.error('Error details:', e.error, e.charIndex);
        setIsPlaying(false);
      };
      
      // Small delay to ensure voices are ready
      setTimeout(() => {
        window.speechSynthesis.speak(utterance);
        console.log('Speech queued');
      }, 100);
    } else {
      console.error('Speech synthesis not supported');
    }
  };

  useEffect(() => {
    if (isVoiceEnabled && voicesLoaded) {
        // Greet the user after voices are loaded
        console.log('Greeting user...');
        setTimeout(() => {
          speakFallback("Hello! I am your voice assistant. How can I help you today?");
        }, 500);
    }
  }, [isVoiceEnabled, voicesLoaded]);

  const playAudio = (base64Audio: string) => {
    if (audioRef.current) {
      audioRef.current.src = `data:audio/mp3;base64,${base64Audio}`;
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const executeAction = async (result: any) => {
    const { action, item, entities } = result;

    switch (action) {
      case 'set_theme':
        if (item.includes('dark')) setTheme('dark');
        else if (item.includes('light')) setTheme('light');
        else if (item.includes('system')) setTheme('system');
        break;

      case 'change_language':
        // Map language names to codes
        const langMap: Record<string, string> = {
          'english': 'en',
          'kannada': 'kn',
          'hindi': 'hi',
          'tamil': 'ta',
          'telugu': 'te',
          'malayalam': 'ml',
          'tulu': 'tcy',
          'en': 'en',
          'kn': 'kn',
          'hi': 'hi',
          'ta': 'ta',
          'te': 'te',
          'ml': 'ml',
          'tcy': 'tcy',
        };
        
        // Valid languages in the switcher
        const validLanguages = ['en', 'kn', 'tcy', 'hi', 'ta', 'te', 'ml'];
        
        const newLang = langMap[item.toLowerCase()] || item.toLowerCase();
        
        // Only change if it's a valid language
        if (validLanguages.includes(newLang)) {
          setLang(newLang);
          const langNames: Record<string, string> = {
            'en': 'English',
            'kn': 'Kannada',
            'hi': 'Hindi',
            'ta': 'Tamil',
            'te': 'Telugu',
            'ml': 'Malayalam',
            'tcy': 'Tulu',
          };
          toast.success(`Language changed to ${langNames[newLang] || newLang}`);
        } else {
          toast.error(`Language "${item}" not supported`);
        }
        break;

      case 'select_payment':
        // Trigger custom event for checkout page to handle
        const paymentMap: Record<string, string> = {
          'cod': 'cod',
          'cash': 'cod',
          'card': 'card',
          'credit': 'card',
          'debit': 'card',
          'upi': 'upi',
          'netbanking': 'netbanking',
          'net banking': 'netbanking',
        };
        
        const paymentMethod = paymentMap[item.toLowerCase()] || item.toLowerCase();
        
        // Dispatch custom event that checkout page can listen to
        window.dispatchEvent(new CustomEvent('voice-select-payment', { 
          detail: { method: paymentMethod } 
        }));
        
        toast.success(`Payment method: ${item}`);
        break;

      case 'cancel_order':
        // Dispatch custom event for orders page to handle
        const orderIdentifier = entities?.product || item;
        window.dispatchEvent(new CustomEvent('voice-cancel-order', { 
          detail: { orderId: orderIdentifier } 
        }));
        
        toast.info(`Cancelling order...`);
        break;

      case 'checkout':
        router.push('/checkout');
        break;

      case 'navigate':
        // Map common route names to actual paths
        const routes: Record<string, string> = {
          'cart': '/cart',
          'home': '/',
          'shop': '/shop',
          'orders': '/orders',
          'wishlist': '/wishlist',
          'profile': '/profile',
        };
        
        // Find matching route
        const routeKey = Object.keys(routes).find(key => 
          item.toLowerCase().includes(key)
        );
        
        if (routeKey) {
          router.push(routes[routeKey]);
          toast.success(`Navigating to ${routeKey}`);
        } else {
          toast.error(`Unknown page: ${item}`);
        }
        break;

      case 'search':
        // Phase 4: Enhanced search with price filters
        if (item || entities?.product) {
          const query = entities?.product || item;
          let url = `/shop?search=${encodeURIComponent(query)}`;
          
          // Add price filters if available
          if (entities?.maxPrice) {
            url += `&maxPrice=${entities.maxPrice}`;
            toast.info(`Searching for ${query} under ₹${entities.maxPrice}`);
          }
          if (entities?.minPrice) {
            url += `&minPrice=${entities.minPrice}`;
          }
          
          router.push(url);
        } else {
          // Voice-only price search (e.g., "show products under 5000")
          if (entities?.maxPrice || entities?.minPrice) {
            let url = `/shop?`;
            if (entities.maxPrice) url += `maxPrice=${entities.maxPrice}`;
            if (entities.minPrice) url += `&minPrice=${entities.minPrice}`;
            
            toast.info(`Searching products in your price range`);
            router.push(url);
          }
        }
        break;

      case 'add_to_cart':
        if (item || entities?.product) {
          try {
            const query = entities?.product || item;
            
            // If we have productId from context, use it directly (most reliable)
            if (entities?.productId) {
              await addToCart(entities.productId, entities?.quantity || 1);
              toast.success(`Added ${query} to cart!`);
            } else {
              // Smart search: try multiple strategies
              const response = await api.searchProducts(query);
              let products = response.data as any[];
              
              // Strategy 1: Exact match
              let product = products?.find(p => 
                p.name.toLowerCase() === query.toLowerCase()
              );
              
              // Strategy 2: Partial match (contains all keywords)
              if (!product && products?.length > 0) {
                const keywords = query.toLowerCase().split(' ').filter((k: string) => k.length > 2);
                product = products.find(p => {
                  const productName = p.name.toLowerCase();
                  return keywords.every((keyword: string) => productName.includes(keyword));
                });
              }
              
              // Strategy 3: Any keyword match (most lenient)
              if (!product && products?.length > 0) {
                const keywords = query.toLowerCase().split(' ').filter((k: string) => k.length > 2);
                product = products.find(p => {
                  const productName = p.name.toLowerCase();
                  return keywords.some((keyword: string) => productName.includes(keyword));
                });
              }
              
              // Strategy 4: Just use first result if any products found
              if (!product && products?.length > 0) {
                product = products[0];
              }
              
              if (product) {
                await addToCart(product._id, entities?.quantity || 1);
                toast.success(`Added ${product.name} to cart!`);
              } else {
                toast.error(`Could not find "${query}"`);
                // Fallback: search page
                router.push(`/shop?search=${encodeURIComponent(query)}`);
              }
            }
          } catch (error) {
            console.error('Error adding to cart:', error);
            toast.error('Failed to add to cart');
          }
        }
        break;
        
      case 'remove_from_cart':
        const cartItem = items.find(i => 
          i.productName.toLowerCase().includes(item.toLowerCase())
        );
        if (cartItem) {
          updateQuantity(cartItem.productId, 0);
          toast.success(`Removed ${cartItem.productName} from cart`);
        } else {
          toast.error(`"${item}" not found in cart`);
        }
        break;

      case 'add_to_wishlist':
        // Search and navigate to product
        if (item || entities?.product) {
          const query = entities?.product || item;
          router.push(`/shop?search=${encodeURIComponent(query)}`);
          toast.info(`Searching for ${query}`);
        }
        break;

      default:
        break;
    }
  };

  if (!isVoiceEnabled) return null;

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
