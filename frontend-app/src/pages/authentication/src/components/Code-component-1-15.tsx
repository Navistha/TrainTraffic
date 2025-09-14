import { useEffect } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface LoadingPageProps {
  onLoadingComplete: () => void;
}

export function LoadingPage({ onLoadingComplete }: LoadingPageProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onLoadingComplete();
    }, 2500); // 2.5 seconds

    return () => clearTimeout(timer);
  }, [onLoadingComplete]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-white flex flex-col items-center justify-center">
      <div className="flex flex-col items-center space-y-8">
        {/* Indian Railways Logo */}
        <div className="w-32 h-32 relative">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1723357646143-68b17c10ee0a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjByYWlsd2F5cyUyMGxvZ28lMjBnb3Zlcm5tZW50JTIwb2ZmaWNpYWx8ZW58MXx8fHwxNzU3NjUxNDM5fDA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Indian Railways Logo"
            className="w-full h-full object-contain"
          />
        </div>
        
        {/* Loading Text */}
        <div className="text-center">
          <p className="text-black text-lg tracking-wide">
            Loading Railway Management Portal...
          </p>
        </div>
        
        {/* Progress Indicator */}
        <div className="flex space-x-2">
          <div className="w-2 h-2 bg-gray-600 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-gray-600 rounded-full animate-pulse [animation-delay:0.2s]"></div>
          <div className="w-2 h-2 bg-gray-600 rounded-full animate-pulse [animation-delay:0.4s]"></div>
        </div>
      </div>
    </div>
  );
}