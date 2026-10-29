import React, { useEffect, useRef } from 'react';
import { FaBalanceScale, FaShieldAlt, FaTimes } from 'react-icons/fa';

function AboutModal({ isOpen, onClose }) {
  const modalRef = useRef(null);
  const previouslyFocusedElementRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    // Remember currently focused element to return focus on close
    previouslyFocusedElementRef.current = document.activeElement;

    // Lock body scroll
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Move focus inside the modal
    const focusable = modalRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable && focusable.length > 0) {
      focusable[0].focus();
    }

    // Keyboard handlers: Esc and focus trap
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
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
      // Return focus on close
      if (previouslyFocusedElementRef.current && typeof previouslyFocusedElementRef.current.focus === 'function') {
        previouslyFocusedElementRef.current.focus();
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="about-modal-title"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-200 outline-none"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
          title="Close modal"
          aria-label="Close modal"
        >
          <FaTimes className="text-base" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <FaBalanceScale className="text-xl" />
          </div>
          <div>
            <h3 id="about-modal-title" className="text-lg font-bold text-white">
              About LegalMind AI
            </h3>
            <p className="text-xs text-indigo-300">Intelligent Legal Framework Synthesis</p>
          </div>
        </div>

        {/* Modal Content */}
        <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed max-h-[70vh] overflow-y-auto pr-1">
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs">
            <div className="flex items-start gap-2">
              <FaShieldAlt className="text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <strong className="block font-semibold">Important Legal Disclaimer:</strong>
                LegalMind is an artificial intelligence research utility. It parses factual scenarios and provides automated summaries and references to statutes and common legal doctrines. It does not provide legal advice, representation, or opinions of counsel.
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-1">How your data is handled</h4>
            <p className="text-slate-400">
              Your description is sent to a third-party AI service to generate the analysis. LegalMind doesn't store your queries on a server. Your chat history is saved only in this browser and can be cleared anytime.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-1">Best Practices for Analysis</h4>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li>Include key facts, relevant timelines, jurisdictions, and contractual provisions.</li>
              <li>Omit confidential personally identifiable information (PII) such as SSNs, banking numbers, or real identities.</li>
              <li>Always verify statutory citations with current jurisdictional statutes and counsel.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="btn btn-sm btn-primary bg-indigo-600 hover:bg-indigo-500 border-none text-white px-5"
          >
            I Understand
          </button>
        </div>

      </div>
    </div>
  );
}

export default AboutModal;
