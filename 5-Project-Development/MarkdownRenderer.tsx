import React from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  // Parse lines into paragraphs, lists, headers, etc.
  const lines = content.split('\n');

  const renderedElements: React.ReactNode[] = [];
  let currentList: string[] = [];
  let listType: 'ul' | 'ol' | null = null;

  const flushList = () => {
    if (currentList.length > 0 && listType) {
      if (listType === 'ul') {
        renderedElements.push(
          <ul key={`list-${renderedElements.length}`} className="my-3 space-y-1.5 list-disc list-outside pl-5 text-slate-700">
            {currentList.map((item, idx) => (
              <li key={idx} className="leading-relaxed">
                {parseInlineFormatting(item)}
              </li>
            ))}
          </ul>
        );
      } else {
        renderedElements.push(
          <ol key={`list-${renderedElements.length}`} className="my-3 space-y-1.5 list-decimal list-outside pl-5 text-slate-700">
            {currentList.map((item, idx) => (
              <li key={idx} className="leading-relaxed">
                {parseInlineFormatting(item)}
              </li>
            ))}
          </ol>
        );
      }
      currentList = [];
      listType = null;
    }
  };

  lines.forEach((rawLine, index) => {
    const line = rawLine.trim();

    if (!line) {
      flushList();
      return;
    }

    // Heading 1 (#)
    if (line.startsWith('# ')) {
      flushList();
      renderedElements.push(
        <h1 key={index} className="text-xl sm:text-2xl font-bold text-slate-900 mt-5 mb-2.5 pb-1 border-b border-slate-200">
          {parseInlineFormatting(line.slice(2))}
        </h1>
      );
      return;
    }

    // Heading 2 (##)
    if (line.startsWith('## ')) {
      flushList();
      renderedElements.push(
        <h2 key={index} className="text-lg sm:text-xl font-bold text-slate-800 mt-4 mb-2 flex items-center gap-2">
          {parseInlineFormatting(line.slice(3))}
        </h2>
      );
      return;
    }

    // Heading 3 (###)
    if (line.startsWith('### ')) {
      flushList();
      renderedElements.push(
        <h3 key={index} className="text-base sm:text-lg font-semibold text-indigo-900 mt-3 mb-1.5">
          {parseInlineFormatting(line.slice(4))}
        </h3>
      );
      return;
    }

    // Unordered list (- or *)
    if (line.startsWith('- ') || line.startsWith('* ')) {
      if (listType !== 'ul') {
        flushList();
        listType = 'ul';
      }
      currentList.push(line.slice(2));
      return;
    }

    // Ordered list (1., 2., etc.)
    const orderedMatch = line.match(/^(\d+)\.\s+(.*)$/);
    if (orderedMatch) {
      if (listType !== 'ol') {
        flushList();
        listType = 'ol';
      }
      currentList.push(orderedMatch[2]);
      return;
    }

    // Blockquote (> )
    if (line.startsWith('> ')) {
      flushList();
      renderedElements.push(
        <blockquote key={index} className="my-3 pl-4 border-l-4 border-indigo-400 italic text-slate-700 bg-indigo-50/50 py-2 rounded-r-lg">
          {parseInlineFormatting(line.slice(2))}
        </blockquote>
      );
      return;
    }

    // Normal paragraph
    flushList();
    renderedElements.push(
      <p key={index} className="my-2 leading-relaxed text-slate-700">
        {parseInlineFormatting(line)}
      </p>
    );
  });

  flushList();

  return <div className={`text-slate-700 text-sm sm:text-base ${className}`}>{renderedElements}</div>;
};

// Helper to format **bold**, `code`, and *italic*
function parseInlineFormatting(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  // Regex to split by bold (**text**), inline code (`code`), or italic (*text*)
  const tokens = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g);

  tokens.forEach((token, idx) => {
    if (!token) return;

    if (token.startsWith('**') && token.endsWith('**')) {
      const inner = token.slice(2, -2);
      parts.push(
        <strong key={idx} className="font-semibold text-slate-900">
          {inner}
        </strong>
      );
    } else if (token.startsWith('`') && token.endsWith('`')) {
      const inner = token.slice(1, -1);
      parts.push(
        <code key={idx} className="px-1.5 py-0.5 rounded bg-slate-100 text-indigo-700 font-mono text-xs sm:text-sm font-medium">
          {inner}
        </code>
      );
    } else if (token.startsWith('*') && token.endsWith('*')) {
      const inner = token.slice(1, -1);
      parts.push(
        <em key={idx} className="italic text-slate-800">
          {inner}
        </em>
      );
    } else {
      parts.push(token);
    }
  });

  return parts;
}
