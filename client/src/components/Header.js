import React from 'react';
import { FaBalanceScale, FaTrashAlt, FaDownload, FaInfoCircle, FaLock } from 'react-icons/fa';

function Header({ onClearChat, onExportChat, onOpenAbout, hasMessages }) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Brand & Identity */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-md shadow-indigo-500/20 text-white">
            <FaBalanceScale className="text-xl" />
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full" title="AI Engine Online"></span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-white">
                Legal<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">Mind</span>
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-950/80 text-indigo-300 border border-indigo-700/40">
                AI Counsel
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Intelligent Case Analysis & Statute Discovery
            </p>
          </div>
        </div>

        {/* Action Controls & Status */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Storage status badge */}
          <div
            className="tooltip tooltip-bottom hidden md:inline-block before:text-xs before:max-w-xs before:leading-relaxed"
            data-tip="Chats are stored only in your browser. Queries are sent to an AI provider for processing."
          >
            <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-800/60 border border-slate-700/60 px-2.5 py-1 rounded-full cursor-help">
              <FaLock className="text-[11px] text-slate-400" />
              <span>Saved locally</span>
            </div>
          </div>

          {/* Export Chat */}
          {hasMessages && (
            <button
              onClick={onExportChat}
              className="btn btn-ghost btn-sm text-slate-300 hover:text-white hover:bg-slate-800 gap-1.5 text-xs"
              title="Export Conversation as Markdown"
            >
              <FaDownload className="text-xs" />
              <span className="hidden sm:inline">Export</span>
            </button>
          )}

          {/* Clear Chat */}
          {hasMessages && (
            <button
              onClick={onClearChat}
              className="btn btn-ghost btn-sm text-rose-400/80 hover:text-rose-300 hover:bg-rose-950/30 gap-1.5 text-xs"
              title="Clear all messages"
            >
              <FaTrashAlt className="text-xs" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          )}

          {/* About / Disclaimer Modal Trigger */}
          <button
            onClick={onOpenAbout}
            className="btn btn-circle btn-ghost btn-sm text-slate-400 hover:text-indigo-300 hover:bg-slate-800"
            title="About LegalMind & Disclaimers"
            aria-label="About LegalMind"
          >
            <FaInfoCircle className="text-base" />
          </button>
        </div>

      </div>
    </header>
  );
}

export default Header;
