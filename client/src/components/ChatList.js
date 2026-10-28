import React, { useState } from 'react';
import { FaBalanceScale, FaUser, FaRegCopy, FaCheck, FaGavel, FaExclamationTriangle, FaRedo } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import FormattedMessage from './FormattedMessage';

const SAMPLE_CASES = [
  {
    title: 'Breach of Commercial Contract',
    tag: 'Contract Law',
    prompt: 'A SaaS client abruptly terminated our 2-year annual agreement 4 months in without providing the contractually required 60-day written cure notice. What breach remedies and damages can be claimed?'
  },
  {
    title: 'Wrongful Whistleblower Termination',
    tag: 'Employment Law',
    prompt: 'An employee was terminated 5 days after reporting accounting irregularities to human resources. What statutory protections, retaliation claims, and evidentiary requirements apply?'
  },
  {
    title: 'Tenant Security Deposit Retention',
    tag: 'Tenancy & Property',
    prompt: 'A landlord withheld a $2,500 deposit for normal carpet wear and tear and failed to provide an itemized repair statement within the mandatory 30-day statutory window. What are the tenant rights?'
  },
  {
    title: 'Proprietary IP & NDA Violation',
    tag: 'Intellectual Property',
    prompt: 'A departing senior developer copied proprietary codebase repository architecture onto a personal hard drive before joining a direct competitor. What emergency injunctions or statutes apply?'
  }
];

function MessageBubble({ message, onRetry }) {
  const [copied, setCopied] = useState(false);
  const isUser = message.sender === 'user';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard', err);
    }
  };

  const formattedTime = message.timestamp
    ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex gap-3 max-w-3xl w-full ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar */}
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md ${
            isUser
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-800 text-indigo-400 border border-indigo-500/30'
          }`}
        >
          {isUser ? <FaUser className="text-sm" /> : <FaBalanceScale className="text-base" />}
        </div>

        {/* Bubble Container */}
        <div className="flex-1 min-w-0">
          {/* Header info */}
          <div className={`flex items-center gap-2 mb-1 text-xs text-slate-400 ${isUser ? 'justify-end' : 'justify-start'}`}>
            <span className="font-semibold text-slate-300">
              {isUser ? 'You' : 'LegalMind AI'}
            </span>
            {message.model && (
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800/80 text-indigo-300 border border-slate-700/60 font-mono">
                {message.model}
              </span>
            )}
            <span>•</span>
            <span>{formattedTime}</span>
          </div>

          {/* Bubble body */}
          <div
            className={`p-4 sm:p-5 rounded-2xl shadow-lg border transition-all ${
              isUser
                ? 'bg-indigo-950/40 border-indigo-800/50 text-indigo-50 rounded-tr-none'
                : 'bg-slate-900/90 border-slate-800 text-slate-100 rounded-tl-none'
            }`}
          >
            {isUser ? (
              <p className="whitespace-pre-wrap text-sm md:text-base leading-relaxed break-words">
                {message.text}
              </p>
            ) : (
              <FormattedMessage content={message.text} />
            )}
          </div>

          {/* Bubble Actions for AI message */}
          {!isUser && (
            <div className="flex items-center justify-between mt-1.5 px-1 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 hover:text-indigo-300 transition-colors py-1 px-2 rounded hover:bg-slate-800/60"
                  title="Copy analysis to clipboard"
                >
                  {copied ? (
                    <>
                      <FaCheck className="text-emerald-400 text-xs" />
                      <span className="text-emerald-400 font-medium">Copied</span>
                    </>
                  ) : (
                    <>
                      <FaRegCopy className="text-xs" />
                      <span>Copy Analysis</span>
                    </>
                  )}
                </button>
              </div>

              <span>{message.text.length} characters</span>
            </div>
          )}

          {/* Error handling if message failed */}
          {message.error && (
            <div className="mt-2 p-3 rounded-lg bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaExclamationTriangle className="text-rose-400 flex-shrink-0" />
                <span>{message.error}</span>
              </div>
              {onRetry && (
                <button
                  onClick={() => onRetry(message.retryQuery)}
                  className="btn btn-xs btn-outline btn-error gap-1"
                >
                  <FaRedo className="text-[10px]" />
                  <span>Retry</span>
                </button>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

function ChatList({ messages, loading, onSelectSample, bottomRef, onRetry }) {
  if (messages.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-8 sm:py-12 px-4 flex flex-col items-center">
        
        {/* Hero Banner */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center justify-center p-3 sm:p-4 rounded-2xl bg-gradient-to-tr from-indigo-900/60 via-indigo-600/20 to-violet-900/60 border border-indigo-500/30 text-indigo-400 shadow-xl shadow-indigo-950/50 mb-5">
            <FaGavel className="text-3xl sm:text-4xl text-indigo-300" />
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Decoding Law with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-300 to-indigo-300">Intelligent Analysis</span>
          </h1>

          <p className="mt-3 text-sm sm:text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
            Submit your case facts, contracts, or disputes. LegalMind synthesizes the facts, maps relevant statutory codes, and outlines concrete legal strategies.
          </p>
        </div>

        {/* Sample Templates Grid */}
        <div className="w-full">
          <div className="flex items-center gap-2 mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400 px-1">
            <HiSparkles className="text-indigo-400 text-sm" />
            <span>Select a sample scenario or enter your case details below:</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {SAMPLE_CASES.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectSample(item.prompt)}
                className="text-left p-4 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500/50 transition-all duration-200 group flex flex-col justify-between shadow-sm hover:shadow-indigo-950/50"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-slate-200 group-hover:text-indigo-300 text-sm transition-colors">
                      {item.title}
                    </span>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-indigo-400 border border-slate-700/60">
                      {item.tag}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {item.prompt}
                  </p>
                </div>
                <span className="text-[11px] text-indigo-400/80 group-hover:text-indigo-300 mt-3 font-medium flex items-center gap-1">
                  Use this template →
                </span>
              </button>
            ))}
          </div>
        </div>

      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} onRetry={onRetry} />
      ))}

      {/* Loading state indicator */}
      {loading && (
        <div className="flex w-full mb-6 justify-start">
          <div className="flex gap-3 max-w-3xl w-full">
            <div className="w-9 h-9 rounded-xl bg-slate-800 text-indigo-400 border border-indigo-500/30 flex items-center justify-center flex-shrink-0 animate-pulse">
              <FaBalanceScale className="text-base" />
            </div>
            <div className="flex-1 p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 rounded-tl-none">
              <div className="flex items-center gap-3">
                <span className="loading loading-spinner loading-sm text-indigo-400"></span>
                <span className="text-sm font-medium text-indigo-300 animate-pulse">
                  Analyzing legal provisions, relevant statutes, and precedents...
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Auto-scroll anchor */}
      <div ref={bottomRef} className="h-4" />
    </div>
  );
}

export default ChatList;

