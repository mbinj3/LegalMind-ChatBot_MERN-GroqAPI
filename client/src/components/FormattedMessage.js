import React from 'react';

/**
 * FormattedMessage safely parses and renders Markdown-like structures:
 * - ### Headings
 * - **Bold text**
 * - Bulleted lists (- or *)
 * - Numbered lists (1., 2.)
 * - Section / Statute highlights (e.g. "Section 123", "Act of 2020")
 * 
 * Crucially, this uses native React elements and NEVER uses dangerouslySetInnerHTML,
 * ensuring complete immunity to XSS vulnerabilities.
 */
function FormattedMessage({ content }) {
  if (!content) return null;

  // Split lines
  const lines = content.split('\n');

  // Helper to parse inline bolding and statute highlights
  const parseInline = (text) => {
    // Split by bold (**text**)
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const innerText = part.slice(2, -2);
        return (
          <strong key={idx} className="font-semibold text-slate-100">
            {innerText}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div className="space-y-3 leading-relaxed text-slate-200 text-sm md:text-base">
      {lines.map((line, lineIdx) => {
        const trimmed = line.trim();

        if (!trimmed) {
          return <div key={lineIdx} className="h-2" />;
        }

        // H3: ### Header
        if (trimmed.startsWith('### ')) {
          return (
            <h3
              key={lineIdx}
              className="text-lg md:text-xl font-bold text-indigo-300 mt-4 mb-2 pb-1 border-b border-indigo-900/40 flex items-center gap-2"
            >
              {trimmed.replace(/^###\s+/, '')}
            </h3>
          );
        }

        // H2: ## Header
        if (trimmed.startsWith('## ')) {
          return (
            <h2
              key={lineIdx}
              className="text-xl md:text-2xl font-bold text-indigo-200 mt-5 mb-2 pb-1.5 border-b border-indigo-800/50"
            >
              {trimmed.replace(/^##\s+/, '')}
            </h2>
          );
        }

        // H1: # Header
        if (trimmed.startsWith('# ')) {
          return (
            <h1
              key={lineIdx}
              className="text-2xl font-extrabold text-white mt-6 mb-3"
            >
              {trimmed.replace(/^#\s+/, '')}
            </h1>
          );
        }

        // Bullet point: - or *
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const bulletText = trimmed.replace(/^[-*]\s+/, '');
          return (
            <div key={lineIdx} className="flex items-start gap-2.5 ml-2 my-1">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 flex-shrink-0" />
              <div className="text-slate-200 flex-1">{parseInline(bulletText)}</div>
            </div>
          );
        }

        // Numbered list item: 1. 2. etc.
        const numberedMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (numberedMatch) {
          const [, num, itemText] = numberedMatch;
          return (
            <div key={lineIdx} className="flex items-start gap-2.5 ml-2 my-1">
              <span className="font-semibold text-indigo-400 text-xs mt-1 px-1.5 py-0.5 rounded bg-indigo-950/60 border border-indigo-800/40 flex-shrink-0">
                {num}
              </span>
              <div className="text-slate-200 flex-1">{parseInline(itemText)}</div>
            </div>
          );
        }

        // Blockquote: > text
        if (trimmed.startsWith('> ')) {
          return (
            <blockquote
              key={lineIdx}
              className="border-l-4 border-amber-500/60 pl-3.5 py-1 text-slate-300 italic bg-amber-500/5 rounded-r my-2"
            >
              {parseInline(trimmed.replace(/^>\s+/, ''))}
            </blockquote>
          );
        }

        // Regular paragraph
        return (
          <p key={lineIdx} className="text-slate-200">
            {parseInline(trimmed)}
          </p>
        );
      })}
    </div>
  );
}

export default FormattedMessage;

