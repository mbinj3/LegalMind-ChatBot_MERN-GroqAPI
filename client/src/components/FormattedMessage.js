import React from 'react';

/**
 * FormattedMessage safely parses and renders:
 * - Markdown tables (cleaning pipes | and rendering beautiful responsive tables)
 * - Headers (###, ##, #)
 * - Lists (bulleted, numbered)
 * - Bold (**text**) and Italic (*text*)
 * - <br>, <br/>, <br /> HTML tags replaced with clean breaks
 * - Horizontal rules (---)
 * - Blockquotes (> quote)
 *
 * All rendered using native React elements - zero dangerouslySetInnerHTML.
 */
function FormattedMessage({ content }) {
  if (!content) return null;

  // Pre-process: replace literal <br>, <br/>, <br /> with newlines or delimiters
  // Also clean up any lingering isolated asterisks or odd markdown artifacts
  const normalizedContent = content
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/\r\n/g, '\n');

  // Helper to parse inline text: bold (**), italic (*), and newlines
  const parseInline = (text) => {
    if (!text) return null;

    // Handle internal newlines that came from <br>
    const subLines = text.split('\n');
    if (subLines.length > 1) {
      return subLines.map((sub, i) => (
        <React.Fragment key={i}>
          {parseInlineSegment(sub)}
          {i < subLines.length - 1 && <br />}
        </React.Fragment>
      ));
    }

    return parseInlineSegment(text);
  };

  const parseInlineSegment = (segment) => {
    // Match bold (**text**) or italic (*text*)
    const tokens = segment.split(/(\*\*.*?\*\*|\*[^*]+?\*)/g);

    return tokens.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
        return (
          <strong key={idx} className="font-semibold text-slate-100">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('*') && part.endsWith('*') && part.length >= 2 && !part.startsWith('**')) {
        return (
          <em key={idx} className="italic text-slate-300">
            {part.slice(1, -1)}
          </em>
        );
      }
      return part;
    });
  };

  // Group lines into blocks (tables, lists, paragraphs, headers)
  const rawLines = normalizedContent.split('\n');
  const blocks = [];
  let currentTable = null;

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i];
    const trimmed = line.trim();

    // Check if line is a table row (starts and ends with | or contains multiple |)
    const isTableRow = trimmed.startsWith('|') && trimmed.endsWith('|') && trimmed.includes('|');
    const isTableSeparator = isTableRow && /^\|[\s-:]+\|[\s\-:|]*$/.test(trimmed);

    if (isTableRow) {
      if (!currentTable) {
        currentTable = { type: 'table', headers: [], rows: [] };
        // Parse header row
        const cells = trimmed
          .slice(1, -1)
          .split('|')
          .map((c) => c.trim());
        currentTable.headers = cells;
      } else if (isTableSeparator) {
        // Separator row, skip but continue table
        continue;
      } else {
        // Data row
        const cells = trimmed
          .slice(1, -1)
          .split('|')
          .map((c) => c.trim());
        currentTable.rows.push(cells);
      }
    } else {
      if (currentTable) {
        blocks.push(currentTable);
        currentTable = null;
      }
      blocks.push({ type: 'line', text: line, trimmed });
    }
  }

  if (currentTable) {
    blocks.push(currentTable);
  }

  return (
    <div className="space-y-3.5 leading-relaxed text-slate-200 text-sm md:text-base">
      {blocks.map((block, bIdx) => {
        // Render Table block
        if (block.type === 'table') {
          return (
            <div
              key={bIdx}
              className="my-4 overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60 shadow-lg"
            >
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/80 text-indigo-300">
                    {block.headers.map((h, hIdx) => (
                      <th
                        key={hIdx}
                        className="py-3 px-4 font-semibold uppercase tracking-wider text-[11px] sm:text-xs"
                      >
                        {parseInline(h)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {block.rows.map((row, rIdx) => (
                    <tr
                      key={rIdx}
                      className="hover:bg-slate-900/40 transition-colors"
                    >
                      {row.map((cell, cIdx) => (
                        <td
                          key={cIdx}
                          className="py-3 px-4 text-slate-300 align-top leading-relaxed"
                        >
                          {parseInline(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        // Render line block
        const { trimmed } = block;

        if (!trimmed) {
          return <div key={bIdx} className="h-1.5" />;
        }

        // Horizontal rule: --- or ***
        if (/^[-*_]{3,}$/.test(trimmed)) {
          return (
            <hr
              key={bIdx}
              className="my-5 border-t border-slate-800/80"
            />
          );
        }

        // H3: ### Header
        if (trimmed.startsWith('### ')) {
          return (
            <h3
              key={bIdx}
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
              key={bIdx}
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
              key={bIdx}
              className="text-2xl font-extrabold text-white mt-6 mb-3"
            >
              {trimmed.replace(/^#\s+/, '')}
            </h1>
          );
        }

        // Bullet point: - or *
        if (trimmed.startsWith('- ') || (trimmed.startsWith('* ') && !trimmed.startsWith('**'))) {
          const bulletText = trimmed.replace(/^[-*]\s+/, '');
          return (
            <div key={bIdx} className="flex items-start gap-2.5 ml-2 my-1">
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
            <div key={bIdx} className="flex items-start gap-2.5 ml-2 my-1">
              <span className="font-semibold text-indigo-400 text-xs mt-0.5 px-1.5 py-0.5 rounded bg-indigo-950/60 border border-indigo-800/40 flex-shrink-0">
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
              key={bIdx}
              className="border-l-4 border-amber-500/60 pl-3.5 py-1 text-slate-300 italic bg-amber-500/5 rounded-r my-2"
            >
              {parseInline(trimmed.replace(/^>\s+/, ''))}
            </blockquote>
          );
        }

        // Regular paragraph
        return (
          <p key={bIdx} className="text-slate-200">
            {parseInline(trimmed)}
          </p>
        );
      })}
    </div>
  );
}

export default FormattedMessage;
