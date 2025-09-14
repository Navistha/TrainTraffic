import { useEffect } from 'react';
import railwayLogo from '../assets/dff17040dbaf73fc82aee8f062c76046da820e4a.png';

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
          <img
            src={railwayLogo}
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