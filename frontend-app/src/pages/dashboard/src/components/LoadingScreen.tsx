import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Train } from 'lucide-react';

interface LoadingScreenProps {
  onComplete: () => void;
}

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 500); // Small delay before transitioning
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950 flex items-center justify-center relative overflow-hidden">
      {/* Animated Railway Track Background */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 1200 800">
          <defs>
            <pattern id="tracks" patternUnits="userSpaceOnUse" width="120" height="20">
              <rect width="120" height="2" fill="currentColor" y="9" />
              <rect width="80" height="8" fill="currentColor" x="20" y="6" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#tracks)" />
        </svg>
      </div>

      {/* Moving Train Silhouette */}
      <motion.div
        className="absolute top-1/3 text-white/20"
        animate={{ x: [-100, 1300] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      >
        <Train className="h-16 w-16" />
      </motion.div>

      {/* Main Content */}
      <div className="text-center z-10">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-8"
        >
          <div className="relative">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-24 h-24 mx-auto mb-4 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center"
            >
              <Train className="h-12 w-12 text-white" />
            </motion.div>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.5, delay: 0.5 }}
              className="h-1 bg-gradient-to-r from-orange-500 to-red-600 rounded-full"
            />
          </div>
        </motion.div>

        {/* App Name */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">
            Indian Railways
          </h1>
          <p className="text-xl text-blue-200">
            Integrated Management System
          </p>
        </motion.div>

        {/* Loading Progress */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="w-64 mx-auto"
        >
          <div className="bg-white/20 rounded-full h-2 mb-4">
            <motion.div
              className="bg-gradient-to-r from-orange-500 to-red-600 h-2 rounded-full"
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
          <p className="text-blue-200 text-sm">
            Loading System... {progress}%
          </p>
        </motion.div>

        {/* Railway Quote */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="mt-12"
        >
          <p className="text-blue-300 text-sm italic">
            "Connecting Lives, Empowering India"
          </p>
        </motion.div>
      </div>

      {/* Subtle Grid Pattern */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
    </div>
  );
}