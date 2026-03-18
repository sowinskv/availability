import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  type: 'alert' | 'confirm';
  onConfirm?: () => void;
  onCancel?: () => void;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  type,
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const content = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 animate-fade-in"
      onClick={handleOverlayClick}
    >
      <div className="bg-white border border-[#e5e5e5] max-w-md w-full mx-4 animate-slide-in">
        <div className="px-8 py-6">
          {title && (
            <div className="text-[10px] text-[#999999] font-medium tracking-wider uppercase mb-3">
              {title}
            </div>
          )}
          <p className="text-[#000000] text-sm mb-6">{message}</p>

          <div className="flex gap-3 justify-end">
            {type === 'confirm' && (
              <button
                onClick={() => {
                  onCancel?.();
                  onClose();
                }}
                className="px-6 py-2.5 text-sm font-medium text-[#666666] hover:text-[#000000] transition-colors uppercase tracking-wide"
              >
                Cancel
              </button>
            )}
            <button
              onClick={() => {
                if (type === 'confirm') {
                  onConfirm?.();
                }
                onClose();
              }}
              className="px-6 py-2.5 bg-[#000000] text-white text-sm font-medium hover:opacity-90 transition-opacity uppercase tracking-wide"
            >
              {type === 'confirm' ? 'Confirm' : 'OK'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
};
