import React, { useState, useRef, useEffect } from 'react';
import { IoSend } from 'react-icons/io5';
import { FaRegTimesCircle } from 'react-icons/fa';
import Tooltip from './Tooltip';
import { useToast } from './Toast';

const MAX_CHAR_LIMIT = 8000;
const MIN_CHAR_LIMIT = 5;

function ChatInput({ onSendMessage, loading, draftText, setDraftText }) {
  const [errorMsg, setErrorMsg] = useState('');
  const textareaRef = useRef(null);
  const toast = useToast();

  // Auto-resize textarea as content changes
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      // Restrict max height to 180px before showing scrollbar
      textareaRef.current.style.height = `${Math.min(Math.max(scrollHeight, 48), 180)}px`;
    }
  }, [draftText]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (loading) return;

    const trimmed = (draftText || '').trim();

    if (!trimmed) {
      const msg = 'Please enter details of the legal dispute, contract, or case.';
      setErrorMsg(msg);
      toast.warning(msg);
      return;
    }

    if (trimmed.length < MIN_CHAR_LIMIT) {
      const msg = `Please provide at least ${MIN_CHAR_LIMIT} characters describing your case.`;
      setErrorMsg(msg);
      toast.warning(msg);
      return;
    }

    if (trimmed.length > MAX_CHAR_LIMIT) {
      const msg = `Inquiry exceeds maximum allowed length of ${MAX_CHAR_LIMIT} characters.`;
      setErrorMsg(msg);
      toast.error(msg);
      return;
    }

    setErrorMsg('');
    onSendMessage(trimmed);
  };

  const handleKeyDown = (e) => {
    // Submit on Enter without Shift
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const charCount = (draftText || '').length;
  const isOverLimit = charCount > MAX_CHAR_LIMIT;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-4">
      {/* Input container card */}
      <div className="relative rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-md focus-within:border-indigo-500/70 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all p-2 sm:p-3">
        
        <form onSubmit={handleSubmit} className="flex flex-col">
          {/* Main textarea */}
          <div className="flex items-start gap-2">
            <textarea
              ref={textareaRef}
              rows={1}
              value={draftText}
              onChange={(e) => {
                setDraftText(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              onKeyDown={handleKeyDown}
              disabled={loading}
              placeholder="Describe your case, contractual dispute, or legal scenario... (Shift+Enter for newline)"
              className="w-full bg-transparent text-slate-100 placeholder-slate-500 text-sm sm:text-base outline-none resize-none px-2 py-2 leading-relaxed"
            />

            {/* Clear draft button */}
            {draftText && !loading && (
              <button
                type="button"
                onClick={() => {
                  setDraftText('');
                  setErrorMsg('');
                }}
                className="text-slate-500 hover:text-slate-300 p-1.5 transition-colors"
                aria-label="Clear input draft"
              >
                <FaRegTimesCircle className="text-base" />
              </button>
            )}

            {/* Submit button with custom Tooltip */}
            <Tooltip content="Submit legal inquiry">
              <button
                type="submit"
                disabled={loading || !draftText?.trim() || isOverLimit}
                className={`flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl transition-all flex-shrink-0 ${
                  loading || !draftText?.trim() || isOverLimit
                    ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white shadow-md shadow-indigo-600/30'
                }`}
                aria-label="Submit legal inquiry"
              >
                {loading ? (
                  <span className="loading loading-spinner loading-xs text-white"></span>
                ) : (
                  <IoSend className="text-lg translate-x-0.5" />
                )}
              </button>
            </Tooltip>
          </div>

          {/* Bottom metadata bar */}
          <div className="flex items-center justify-between px-2 pt-2 border-t border-slate-800/60 mt-1 text-[11px] text-slate-500">
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline">Press</span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px] border border-slate-700/60">
                Enter ↵
              </kbd>
              <span className="hidden sm:inline">to submit,</span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px] border border-slate-700/60">
                Shift + Enter
              </kbd>
              <span className="hidden sm:inline">for newline</span>
            </div>

            <div className={`font-mono ${isOverLimit ? 'text-rose-400 font-bold' : ''}`}>
              {charCount} / {MAX_CHAR_LIMIT}
            </div>
          </div>
        </form>

      </div>

      {/* Inline validation error */}
      {errorMsg && (
        <p className="text-rose-400 text-xs mt-2 px-2 flex items-center gap-1.5 animate-fadeIn">
          <span>⚠️</span>
          <span>{errorMsg}</span>
        </p>
      )}
    </div>
  );
}

export default ChatInput;
