import * as React from 'react';

type ToastState = { open: boolean; msg: string };

// Singleton handler reference — ToastHost registers its handler here.
let _showHandler: ((msg: string, ms?: number) => void) | null = null;

export function showToast(msg: string, ms = 3500) {
  if (_showHandler) {
    _showHandler(msg, ms);
  } else {
    // fallback to console when host not mounted yet
    // keep this quiet in production but helpful during dev
    // eslint-disable-next-line no-console
    console.warn('ToastHost not mounted yet — message:', msg);
  }
}

export function ToastHost() {
  const [state, setState] = React.useState<ToastState>({ open: false, msg: '' });

  React.useEffect(() => {
    let timer: any = null;

    const handler = (msg: string, ms = 3500) => {
      setState({ open: true, msg });
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => setState({ open: false, msg: '' }), ms || 3500);
    };

    _showHandler = handler;
    return () => {
      _showHandler = null;
      if (timer) clearTimeout(timer);
    };
  }, []);

  if (!state.open) return null;

  return (
    <div className="fixed right-4 bottom-6 z-50 max-w-sm">
      <div className="bg-white border shadow-lg rounded-lg p-3">
        <div className="flex items-start space-x-2">
          <div className="text-sm font-medium whitespace-pre-line">{state.msg}</div>
        </div>
      </div>
    </div>
  );
}

export default ToastHost;
