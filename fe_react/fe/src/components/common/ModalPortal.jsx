import { useEffect } from 'react';
import { createPortal } from 'react-dom';

const DEFAULT_OVERLAY_CLASS =
  'fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in text-left text-sm';

export default function ModalPortal({ children, className = DEFAULT_OVERLAY_CLASS, onBackdropClick }) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return createPortal(
    <div className={className} onClick={onBackdropClick}>
      {children}
    </div>,
    document.body
  );
}
