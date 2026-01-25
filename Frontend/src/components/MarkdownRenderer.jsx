import React from 'react';

function parseMarkdown(text) {
  if (!text) return [];
  
  const lines = text.split('\n');
  const elements = [];
  let inCodeBlock = false;
  let codeContent = [];
  let codeLanguage = '';
  let inTable = false;
  let tableRows = [];
  let tableHeaders = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Code blocks
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        elements.push({
          type: 'code-block',
          language: codeLanguage,
          content: codeContent.join('\n'),
          key: `code-${i}`
        });
        codeContent = [];
        codeLanguage = '';
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
        codeLanguage = line.slice(3).trim();
      }
      continue;
    }
    
    if (inCodeBlock) {
      codeContent.push(line);
      continue;
    }
    
    // Tables
    if (line.includes('|') && line.trim().startsWith('|')) {
      const cells = line.split('|').filter(c => c.trim() !== '');
      
      if (!inTable) {
        inTable = true;
        tableHeaders = cells.map(c => c.trim());
      } else if (line.includes('---')) {
        continue;
      } else {
        tableRows.push(cells.map(c => c.trim()));
      }
      
      // Check if next line continues table
      const nextLine = lines[i + 1];
      if (!nextLine || (!nextLine.includes('|') || !nextLine.trim().startsWith('|'))) {
        elements.push({
          type: 'table',
          headers: tableHeaders,
          rows: tableRows,
          key: `table-${i}`
        });
        inTable = false;
        tableHeaders = [];
        tableRows = [];
      }
      continue;
    }
    
    // Headers
    if (line.startsWith('### ')) {
      elements.push({ type: 'h3', content: line.slice(4), key: `h3-${i}` });
      continue;
    }
    if (line.startsWith('## ')) {
      elements.push({ type: 'h2', content: line.slice(3), key: `h2-${i}` });
      continue;
    }
    if (line.startsWith('# ')) {
      elements.push({ type: 'h1', content: line.slice(2), key: `h1-${i}` });
      continue;
    }
    
    // Horizontal rule
    if (line.trim() === '---' || line.trim() === '***') {
      elements.push({ type: 'hr', key: `hr-${i}` });
      continue;
    }
    
    // List items
    if (line.match(/^[\s]*[-*•]\s/)) {
      const indent = line.match(/^[\s]*/)[0].length;
      const content = line.replace(/^[\s]*[-*•]\s/, '');
      elements.push({ type: 'li', content, indent, key: `li-${i}` });
      continue;
    }
    
    // Numbered list
    if (line.match(/^[\s]*\d+[.)]\s/)) {
      const content = line.replace(/^[\s]*\d+[.)]\s/, '');
      elements.push({ type: 'li', content, numbered: true, key: `li-${i}` });
      continue;
    }
    
    // Empty line
    if (line.trim() === '') {
      elements.push({ type: 'br', key: `br-${i}` });
      continue;
    }
    
    // Regular paragraph
    elements.push({ type: 'p', content: line, key: `p-${i}` });
  }
  
  return elements;
}

function formatInlineText(text) {
  if (!text) return text;
  
  // Bold
  text = text.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold">$1</strong>');
  text = text.replace(/__([^_]+)__/g, '<strong class="font-semibold">$1</strong>');
  
  // Italic
  text = text.replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>');
  text = text.replace(/_([^_]+)_/g, '<em class="italic">$1</em>');
  
  // Inline code
  text = text.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-[var(--color-surface-alt)] text-sm font-mono text-[var(--color-accent)]">$1</code>');
  
  return text;
}

export default function MarkdownRenderer({ content, className = '' }) {
  const elements = parseMarkdown(content);
  
  return (
    <div className={`markdown-content space-y-3 ${className}`}>
      {elements.map((el) => {
        switch (el.type) {
          case 'h1':
            return (
              <h1 key={el.key} className="text-xl font-bold mt-4 mb-2"
                dangerouslySetInnerHTML={{ __html: formatInlineText(el.content) }} />
            );
          case 'h2':
            return (
              <h2 key={el.key} className="text-lg font-bold mt-4 mb-2"
                dangerouslySetInnerHTML={{ __html: formatInlineText(el.content) }} />
            );
          case 'h3':
            return (
              <h3 key={el.key} className="text-base font-semibold mt-3 mb-1"
                dangerouslySetInnerHTML={{ __html: formatInlineText(el.content) }} />
            );
          case 'p':
            return (
              <p key={el.key} className="text-[15px] leading-7"
                dangerouslySetInnerHTML={{ __html: formatInlineText(el.content) }} />
            );
          case 'li':
            return (
              <div key={el.key} className="flex items-start gap-3 text-[15px] leading-7" style={{ marginLeft: el.indent ? el.indent * 16 : 0 }}>
                <span className="themed-text-soft mt-0.5">•</span>
                <span dangerouslySetInnerHTML={{ __html: formatInlineText(el.content) }} />
              </div>
            );
          case 'code-block':
            return (
              <div key={el.key} className="rounded-xl overflow-hidden my-4 bg-[var(--color-surface-alt)]">
                {el.language && (
                  <div className="bg-[var(--color-surface)] px-4 py-2 text-xs themed-text-soft font-mono border-b themed-border">
                    {el.language}
                  </div>
                )}
                <pre className="p-4 overflow-x-auto">
                  <code className="text-sm font-mono whitespace-pre-wrap">{el.content}</code>
                </pre>
              </div>
            );
          case 'table':
            return (
              <div key={el.key} className="overflow-x-auto my-4 rounded-xl border themed-border">
                <table className="min-w-full text-[15px]">
                  <thead className="bg-[var(--color-surface-alt)]">
                    <tr>
                      {el.headers.map((header, idx) => (
                        <th key={idx} className="px-4 py-3 text-left font-semibold border-b themed-border"
                          dangerouslySetInnerHTML={{ __html: formatInlineText(header) }} />
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y themed-border">
                    {el.rows.map((row, rowIdx) => (
                      <tr key={rowIdx} className="hover:bg-[var(--color-surface-alt)]">
                        {row.map((cell, cellIdx) => (
                          <td key={cellIdx} className="px-4 py-3"
                            dangerouslySetInnerHTML={{ __html: formatInlineText(cell) }} />
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          case 'hr':
            return <hr key={el.key} className="my-6 themed-border" />;
          case 'br':
            return <div key={el.key} className="h-3" />;
          default:
            return null;
        }
      })}
    </div>
  );
}
