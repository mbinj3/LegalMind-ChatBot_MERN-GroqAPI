import React from 'react';
import { FaBalanceScale, FaShieldAlt, FaTimes } from 'react-icons/fa';

function AboutModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
          title="Close modal"
        >
          <FaTimes className="text-base" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <FaBalanceScale className="text-xl" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">About LegalMind AI</h3>
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
            <h4 className="font-semibold text-white mb-1">Architecture & Privacy</h4>
            <p className="text-slate-400">
              Queries are processed using secure Groq LLaMA 3.3 serverless inference with in-memory rate limiting and HTTP security headers. Your local chat session is saved in your browser storage so you can review previous queries.
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

