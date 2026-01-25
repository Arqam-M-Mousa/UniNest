import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface MarkdownElement {
  type: string;
  content?: string;
  language?: string;
  headers?: string[];
  rows?: string[][];
  indent?: number;
  numbered?: boolean;
  key: string;
}

function parseMarkdown(text: string): MarkdownElement[] {
  if (!text) return [];
  
  const lines = text.split('\n');
  const elements: MarkdownElement[] = [];
  let inCodeBlock = false;
  let codeContent: string[] = [];
  let codeLanguage = '';
  let inTable = false;
  let tableRows: string[][] = [];
  let tableHeaders: string[] = [];
  
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
      const indent = line.match(/^[\s]*/)?.[0].length || 0;
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

function formatInlineText(text: string): string {
  if (!text) return text;
  
  // Bold + Italic (must come before bold and italic)
  text = text.replace(/\*\*\*([^*]+)\*\*\*/g, '***$1***');
  
  // Bold
  text = text.replace(/\*\*([^*]+)\*\*/g, '**$1**');
  text = text.replace(/__([^_]+)__/g, '**$1**');
  
  // Italic
  text = text.replace(/\*([^*]+)\*/g, '*$1*');
  text = text.replace(/_([^_]+)_/g, '*$1*');
  
  // Inline code
  text = text.replace(/`([^`]+)`/g, '`$1`');
  
  return text;
}

function renderInlineText(text: string, colors: any, baseStyle: any) {
  const parts: any[] = [];
  let currentText = text;
  let key = 0;
  
  // Match bold+italic, bold, italic, and code (order matters!)
  const regex = /(\*\*\*[^*]+\*\*\*|\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  let match;
  let lastIndex = 0;
  
  while ((match = regex.exec(currentText)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      parts.push(
        <Text key={key++} style={baseStyle}>
          {currentText.substring(lastIndex, match.index)}
        </Text>
      );
    }
    
    const matched = match[0];
    if (matched.startsWith('***') && matched.endsWith('***')) {
      // Bold + Italic
      parts.push(
        <Text key={key++} style={[baseStyle, styles.bold, styles.italic]}>
          {matched.slice(3, -3)}
        </Text>
      );
    } else if (matched.startsWith('**') && matched.endsWith('**')) {
      // Bold
      parts.push(
        <Text key={key++} style={[baseStyle, styles.bold]}>
          {matched.slice(2, -2)}
        </Text>
      );
    } else if (matched.startsWith('*') && matched.endsWith('*')) {
      // Italic
      parts.push(
        <Text key={key++} style={[baseStyle, styles.italic]}>
          {matched.slice(1, -1)}
        </Text>
      );
    } else if (matched.startsWith('`') && matched.endsWith('`')) {
      // Code
      parts.push(
        <Text key={key++} style={[styles.inlineCode, { backgroundColor: colors.background }]}>
          {matched.slice(1, -1)}
        </Text>
      );
    }
    
    lastIndex = regex.lastIndex;
  }
  
  // Add remaining text
  if (lastIndex < currentText.length) {
    parts.push(
      <Text key={key++} style={baseStyle}>
        {currentText.substring(lastIndex)}
      </Text>
    );
  }
  
  return parts.length > 0 ? parts : <Text style={baseStyle}>{text}</Text>;
}

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const { colors } = useTheme();
  const elements = parseMarkdown(content);
  
  return (
    <View style={styles.container}>
      {elements.map((el) => {
        switch (el.type) {
          case 'h1':
            return (
              <Text key={el.key} style={[styles.h1, { color: colors.text }]}>
                {renderInlineText(el.content || '', colors, [styles.h1, { color: colors.text }])}
              </Text>
            );
          case 'h2':
            return (
              <Text key={el.key} style={[styles.h2, { color: colors.text }]}>
                {renderInlineText(el.content || '', colors, [styles.h2, { color: colors.text }])}
              </Text>
            );
          case 'h3':
            return (
              <Text key={el.key} style={[styles.h3, { color: colors.text }]}>
                {renderInlineText(el.content || '', colors, [styles.h3, { color: colors.text }])}
              </Text>
            );
          case 'p':
            return (
              <Text key={el.key} style={[styles.paragraph, { color: colors.text }]}>
                {renderInlineText(el.content || '', colors, [styles.paragraph, { color: colors.text }])}
              </Text>
            );
          case 'li':
            return (
              <View key={el.key} style={[styles.listItem, { marginLeft: (el.indent || 0) * 16 }]}>
                <Text style={[styles.bullet, { color: colors.secondary }]}>•</Text>
                <Text style={[styles.listText, { color: colors.text }]}>
                  {renderInlineText(el.content || '', colors, [styles.listText, { color: colors.text }])}
                </Text>
              </View>
            );
          case 'code-block':
            return (
              <View key={el.key} style={[styles.codeBlock, { backgroundColor: colors.background, borderColor: colors.border }]}>
                {el.language && (
                  <Text style={[styles.codeLanguage, { color: colors.secondary }]}>
                    {el.language}
                  </Text>
                )}
                <Text style={[styles.codeText, { color: colors.text }]}>
                  {el.content}
                </Text>
              </View>
            );
          case 'table':
            return (
              <View key={el.key} style={[styles.table, { borderColor: colors.border }]}>
                <View style={[styles.tableHeader, { backgroundColor: colors.background }]}>
                  {el.headers?.map((header, idx) => (
                    <Text key={idx} style={[styles.tableHeaderText, { color: colors.text }]}>
                      {header}
                    </Text>
                  ))}
                </View>
                {el.rows?.map((row, rowIdx) => (
                  <View key={rowIdx} style={[styles.tableRow, { borderTopColor: colors.border }]}>
                    {row.map((cell, cellIdx) => (
                      <Text key={cellIdx} style={[styles.tableCell, { color: colors.text }]}>
                        {cell}
                      </Text>
                    ))}
                  </View>
                ))}
              </View>
            );
          case 'hr':
            return <View key={el.key} style={[styles.hr, { backgroundColor: colors.border }]} />;
          case 'br':
            return <View key={el.key} style={styles.br} />;
          default:
            return null;
        }
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  h1: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 8,
  },
  h2: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 6,
  },
  h3: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 4,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 4,
  },
  bold: {
    fontWeight: 'bold',
  },
  italic: {
    fontStyle: 'italic',
  },
  inlineCode: {
    fontFamily: 'monospace',
    fontSize: 13,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 3,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 4,
    paddingRight: 8,
  },
  bullet: {
    marginRight: 8,
    fontSize: 15,
    lineHeight: 22,
  },
  listText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  codeBlock: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
    marginVertical: 8,
  },
  codeLanguage: {
    fontSize: 11,
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  codeText: {
    fontFamily: 'monospace',
    fontSize: 13,
    lineHeight: 18,
  },
  table: {
    borderWidth: 1,
    borderRadius: 8,
    marginVertical: 8,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  tableHeaderText: {
    flex: 1,
    fontWeight: 'bold',
    fontSize: 14,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderTopWidth: 1,
  },
  tableCell: {
    flex: 1,
    fontSize: 14,
  },
  hr: {
    height: 1,
    marginVertical: 16,
  },
  br: {
    height: 8,
  },
});
