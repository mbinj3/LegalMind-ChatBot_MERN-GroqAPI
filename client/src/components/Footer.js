import React from 'react';
import { FaShieldAlt } from 'react-icons/fa';

function Footer({ onOpenAbout }) {
  return (
    <footer className="w-full border-t border-slate-800/80 bg-slate-950/70 text-slate-400 text-xs py-4 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
        
        {/* Compliance disclaimer */}
        <div className="flex items-center gap-2 text-slate-400/90 max-w-2xl">
          <FaShieldAlt className="text-indigo-400 text-sm flex-shrink-0 hidden sm:inline" />
          <p className="leading-relaxed">
            <span className="font-semibold text-slate-300">Notice:</span> LegalMind AI provides automated statutory research and analytical summaries for informational purposes. It does not provide legal advice or establish an attorney-client relationship.
          </p>
        </div>

        {/* Links & Attribution */}
        <div className="flex items-center gap-4 text-slate-400 flex-shrink-0">
          <button
            onClick={onOpenAbout}
            className="hover:text-indigo-300 transition-colors underline-offset-4 hover:underline"
          >
            Legal Terms & Limits
          </button>
          <span>•</span>
          <span className="text-slate-500">
            Powered by <strong className="text-slate-400 font-medium">Groq</strong>
          </span>
        </div>

      </div>
    </footer>
  );
}

export default Footer;
