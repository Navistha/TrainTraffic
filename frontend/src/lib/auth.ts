import { useState } from 'react';

export function logoutWithDelay(onComplete?: () => void, delay = 800) {
  // show a loading animation for `delay` ms, then clear tokens and call onComplete
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userGovtId');
      localStorage.removeItem('userName');
      localStorage.removeItem('userRole');
      if (onComplete) onComplete();
      resolve();
    }, delay);
  });
}

export function loginCompleteWithDelay(onComplete?: () => void, delay = 800) {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      if (onComplete) onComplete();
      resolve();
    }, delay);
  });
}
