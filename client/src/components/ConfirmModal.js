import React, { useEffect, useRef } from 'react';
import { FaExclamationTriangle, FaTimes, FaFileDownload } from 'react-icons/fa';

function ConfirmModal({
  isOpen,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'danger', // 'danger' | 'primary'
  destructive // backward compatibility fallback
}) {
  const modalRef = useRef(null);
  const cancelBtnRef = useRef(null);
  const previouslyFocusedElementRef = useRef(null);

  // Normalize variant: if destructive is explicitly passed, map it
  const isDanger = variant === 'danger' || (destructive === true && variant !== 'primary');

  useEffect(() => {
    if (!isOpen) return;

    previouslyFocusedElementRef.current = document.activeElement;

    // Lock body scroll
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Autofocus the Cancel button (secondary action) for safety
    setTimeout(() => {
      cancelBtnRef.current?.focus();
    }, 50);

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
        return;
      }

      if (e.key === 'Tab') {
        const focusableElements = Array.from(
          modalRef.current?.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          ) || []
        );

        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
      if (previouslyFocusedElementRef.current && typeof previouslyFocusedElementRef.current.focus === 'function') {
        previouslyFocusedElementRef.current.focus();
      }
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn"
      onClick={onCancel}
    >
      <div
        ref={modalRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        aria-describedby="confirm-modal-description"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-200 outline-none"
      >
        {/* Close Button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
          aria-label="Close dialog"
        >
          <FaTimes className="text-base" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
              isDanger
                ? 'bg-rose-950/60 border border-rose-800/60 text-rose-400'
                : 'bg-indigo-600/20 border border-indigo-500/30 text-indigo-400'
            }`}
          >
            {isDanger ? (
              <FaExclamationTriangle className="text-lg" />
            ) : (
              <FaFileDownload className="text-lg text-indigo-400" />
            )}
          </div>
          <div>
            <h3 id="confirm-modal-title" className="text-lg font-bold text-white">
              {title}
            </h3>
          </div>
        </div>

        {/* Modal Body */}
        <p id="confirm-modal-description" className="text-sm text-slate-300 leading-relaxed mb-6">
          {message}
        </p>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800/80">
          <button
            ref={cancelBtnRef}
            type="button"
            onClick={onCancel}
            className="btn btn-sm btn-ghost text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/60 px-4"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`btn btn-sm text-white px-4 border-none ${
              isDanger
                ? 'bg-rose-600 hover:bg-rose-500 shadow-md shadow-rose-950/50'
                : 'bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-950/50'
            }`}
          >
            {confirmLabel}
          </button>
        </div>

      </div>
    </div>
  );
}

export default ConfirmModal;
