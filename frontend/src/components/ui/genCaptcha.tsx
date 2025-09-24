// components/Captcha.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Button } from './button.js';
import { RefreshCw } from 'lucide-react';

// Utility function to generate random text
export const generateCaptchaText = (length: number = 6) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let captcha = '';
  for (let i = 0; i < length; i++) {
    captcha += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return captcha;
};

interface CaptchaProps {
  onChange?: (text: string) => void; // optional callback to pass captcha text to parent
}

const Captcha: React.FC<CaptchaProps> = ({ onChange }) => {
  const [captchaText, setCaptchaText] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawCaptcha = (text: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background
    ctx.fillStyle = '#f2f2f2';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Random lines for noise
    for (let i = 0; i < 5; i++) {
      ctx.strokeStyle = `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${
        Math.floor(Math.random() * 255)
      })`;
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.stroke();
    }

    // Draw CAPTCHA characters
    ctx.font = '28px Arial';
    ctx.fillStyle = 'black';
    ctx.textBaseline = 'middle';
    for (let i = 0; i < text.length; i++) {
      ctx.save();
      const x = 20 + i * 25;
      const y = canvas.height / 2;
      const angle = (Math.random() - 0.5) * 0.5;
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillText(text[i] ?? '', 0, 0);
      ctx.restore();
    }
  };

  const generateNewCaptcha = () => {
    const newText = generateCaptchaText(6);
    setCaptchaText(newText);
    drawCaptcha(newText);
    if (onChange) onChange(newText); // send text to parent
  };

  useEffect(() => {
    generateNewCaptcha(); // generate on mount
  }, []);

  return (
    <div className="flex items-center space-x-2">
      <canvas ref={canvasRef} width={180} height={50} className="border rounded select-none" />
      <Button type="button" variant="outline" size="sm" onClick={generateNewCaptcha}>
        <RefreshCw className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default Captcha;
