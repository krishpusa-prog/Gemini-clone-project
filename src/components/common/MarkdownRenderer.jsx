import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';
import './MarkdownRenderer.css';

const CustomCodeBlock = ({node, inline, className, children, ...props}) => {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');
  const codeContent = String(children).replace(/\n$/, '');

  const handleCopy = () => {
    navigator.clipboard.writeText(codeContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return !inline && match ? (
    <div className="code-block-wrapper" style={{ position: 'relative', marginTop: '1rem', marginBottom: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1e1e1e', padding: '8px 16px', borderTopLeftRadius: '8px', borderTopRightRadius: '8px', color: '#888', fontSize: '0.8rem' }}>
        <span>{match[1]}</span>
        <button 
          onClick={handleCopy}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#888', display: 'flex', alignItems: 'center', gap: '4px' }}
          title="Copy code"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          <span>{copied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>
      <SyntaxHighlighter
        {...props}
        children={codeContent}
        style={vscDarkPlus}
        language={match[1]}
        PreTag="div"
        customStyle={{ margin: 0, borderTopLeftRadius: 0, borderTopRightRadius: 0, borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px' }}
      />
    </div>
  ) : (
    <code {...props} className={className}>
      {children}
    </code>
  );
};

const MarkdownRenderer = ({ content }) => {
  return (
    <div className="markdown-content">
      <ReactMarkdown
        components={{
          code: CustomCodeBlock
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
