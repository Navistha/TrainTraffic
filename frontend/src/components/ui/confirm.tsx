import * as React from 'react';

type AnchorRect = {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
};

type ConfirmProps = {
  open: boolean;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  // optional anchor to render popover near an element
  anchorRect?: AnchorRect | null;
};

export function ConfirmModal({ open, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', onConfirm, onCancel, anchorRect = null }: ConfirmProps) {
  if (!open) return null;

  // If an anchor rect is provided, render a small popover positioned below the anchor
  if (anchorRect) {
    const top = anchorRect.bottom + 8 + (window.scrollY || 0);
    // try to align left but keep within viewport
    let left = anchorRect.left + (window.scrollX || 0);
    const maxLeft = (window.innerWidth || document.documentElement.clientWidth) - 320;
    if (left > maxLeft) left = Math.max(8, maxLeft);

    return (
      <div style={{ position: 'absolute', top: `${top}px`, left: `${left}px`, zIndex: 60 }}>
        <div className="bg-white rounded-lg shadow-md w-80 p-3 border">
          {title && <h4 className="font-semibold mb-1">{title}</h4>}
          {message && <div className="text-sm text-muted-foreground mb-3 whitespace-pre-line">{message}</div>}
          <div className="flex justify-end space-x-2">
            <button className="px-3 py-1 rounded border" onClick={onCancel}>{cancelLabel}</button>
            <button className="px-3 py-1 rounded bg-blue-600 text-white" onClick={onConfirm}>{confirmLabel}</button>
          </div>
        </div>
      </div>
    );
  }

  // Default centered full-screen modal (fallback)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-4">
        {title && <h3 className="font-semibold mb-2">{title}</h3>}
        {message && <div className="text-sm text-muted-foreground mb-4 whitespace-pre-line">{message}</div>}
        <div className="flex justify-end space-x-2">
          <button className="px-3 py-1 rounded border" onClick={onCancel}>{cancelLabel}</button>
          <button className="px-3 py-1 rounded bg-blue-600 text-white" onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
