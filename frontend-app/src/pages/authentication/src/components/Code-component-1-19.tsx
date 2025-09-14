import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { RefreshCw } from 'lucide-react';

interface CaptchaComponentProps {
  onCaptchaChange: (isValid: boolean) => void;
}

export function CaptchaComponent({ onCaptchaChange }: CaptchaComponentProps) {
  const [captchaText, setCaptchaText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [isValid, setIsValid] = useState(false);

  const generateCaptcha = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaText(result);
    setUserInput('');
    setIsValid(false);
    onCaptchaChange(false);
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  useEffect(() => {
    const valid = userInput.toUpperCase() === captchaText;
    setIsValid(valid);
    onCaptchaChange(valid);
  }, [userInput, captchaText, onCaptchaChange]);

  return (
    <div className="space-y-2">
      <Label htmlFor="captcha">Enter CAPTCHA</Label>
      <div className="flex space-x-3">
        {/* CAPTCHA Display */}
        <div className="flex-1 flex items-center space-x-2">
          <div className="bg-gray-100 border border-gray-300 px-4 py-2 rounded font-mono tracking-wider select-none">
            {captchaText}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={generateCaptcha}
            className="p-2"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <Input
        id="captcha"
        type="text"
        placeholder="Enter CAPTCHA"
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        className={`${isValid && userInput ? 'border-green-500' : ''} ${
          userInput && !isValid ? 'border-red-500' : ''
        }`}
      />
      {userInput && !isValid && (
        <p className="text-sm text-red-600">CAPTCHA does not match. Please try again.</p>
      )}
    </div>
  );
}