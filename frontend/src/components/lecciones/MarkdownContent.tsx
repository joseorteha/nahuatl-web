'use client';

interface MarkdownContentProps {
  content: string;
  className?: string;
}

export default function MarkdownContent({ content, className = '' }: MarkdownContentProps) {
  
  // Función para procesar el markdown manualmente
  const processMarkdown = (text: string) => {
    if (!text) return '';
    
    let processed = text;
    
    // Headers
    processed = processed.replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold text-slate-900 dark:text-slate-100 mt-6 mb-3">$1</h3>');
    processed = processed.replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-8 mb-4">$1</h2>');
    processed = processed.replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-8 mb-4">$1</h1>');
    
    // Bold
    processed = processed.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900 dark:text-slate-100">$1</strong>');
    
    // Italic
    processed = processed.replace(/\*(.*?)\*/g, '<em class="italic text-slate-700 dark:text-slate-300">$1</em>');
    
    // Lists
    processed = processed.replace(/^\- (.*$)/gim, '<li class="ml-6 mb-2 text-slate-700 dark:text-slate-300 list-disc">$1</li>');
    
    // Line breaks
    processed = processed.replace(/\n\n/g, '</p><p class="mb-4 text-slate-700 dark:text-slate-300 leading-relaxed">');
    
    // Wrap in paragraph if not already wrapped
    if (!processed.startsWith('<')) {
      processed = '<p class="mb-4 text-slate-700 dark:text-slate-300 leading-relaxed">' + processed + '</p>';
    }
    
    return processed;
  };

  return (
    <div 
      className={`prose prose-slate dark:prose-invert max-w-none ${className}`}
      style={{
        fontSize: '1.0625rem',
        lineHeight: '1.75'
      }}
    >
      <style jsx>{`
        :global(.prose) {
          --tw-prose-body: rgb(51 65 85);
          --tw-prose-headings: rgb(15 23 42);
          --tw-prose-lead: rgb(71 85 105);
          --tw-prose-links: rgb(6 182 212);
          --tw-prose-bold: rgb(15 23 42);
          --tw-prose-counters: rgb(100 116 139);
          --tw-prose-bullets: rgb(148 163 184);
          --tw-prose-hr: rgb(226 232 240);
          --tw-prose-quotes: rgb(15 23 42);
          --tw-prose-quote-borders: rgb(226 232 240);
          --tw-prose-captions: rgb(100 116 139);
          --tw-prose-code: rgb(15 23 42);
          --tw-prose-pre-code: rgb(226 232 240);
          --tw-prose-pre-bg: rgb(30 41 59);
          --tw-prose-th-borders: rgb(226 232 240);
          --tw-prose-td-borders: rgb(226 232 240);
        }
        
        :global(.dark .prose) {
          --tw-prose-body: rgb(203 213 225);
          --tw-prose-headings: rgb(241 245 249);
          --tw-prose-lead: rgb(148 163 184);
          --tw-prose-links: rgb(34 211 238);
          --tw-prose-bold: rgb(241 245 249);
          --tw-prose-counters: rgb(148 163 184);
          --tw-prose-bullets: rgb(100 116 139);
          --tw-prose-hr: rgb(51 65 85);
          --tw-prose-quotes: rgb(241 245 249);
          --tw-prose-quote-borders: rgb(51 65 85);
          --tw-prose-captions: rgb(148 163 184);
          --tw-prose-code: rgb(241 245 249);
          --tw-prose-pre-code: rgb(226 232 240);
          --tw-prose-pre-bg: rgb(15 23 42);
          --tw-prose-th-borders: rgb(51 65 85);
          --tw-prose-td-borders: rgb(51 65 85);
        }

        :global(.prose h1) {
          font-size: 2rem;
          font-weight: 800;
          margin-top: 2rem;
          margin-bottom: 1rem;
          line-height: 1.2;
        }

        :global(.prose h2) {
          font-size: 1.75rem;
          font-weight: 700;
          margin-top: 1.75rem;
          margin-bottom: 0.875rem;
          line-height: 1.3;
        }

        :global(.prose h3) {
          font-size: 1.5rem;
          font-weight: 600;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          line-height: 1.4;
        }

        :global(.prose p) {
          margin-bottom: 1.25rem;
          line-height: 1.75;
        }

        :global(.prose ul), :global(.prose ol) {
          margin-top: 1rem;
          margin-bottom: 1rem;
          padding-left: 1.5rem;
        }

        :global(.prose li) {
          margin-bottom: 0.5rem;
          line-height: 1.75;
        }

        :global(.prose strong) {
          font-weight: 600;
        }

        :global(.prose blockquote) {
          border-left: 4px solid rgb(6 182 212);
          padding-left: 1rem;
          margin: 1.5rem 0;
          font-style: italic;
          color: rgb(71 85 105);
        }

        :global(.dark .prose blockquote) {
          border-left-color: rgb(34 211 238);
          color: rgb(148 163 184);
        }

        :global(.prose code) {
          background-color: rgb(241 245 249);
          padding: 0.125rem 0.375rem;
          border-radius: 0.25rem;
          font-size: 0.875em;
        }

        :global(.dark .prose code) {
          background-color: rgb(30 41 59);
        }

        :global(.prose pre) {
          background-color: rgb(30 41 59);
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 1.5rem 0;
        }

        :global(.dark .prose pre) {
          background-color: rgb(15 23 42);
        }
      `}</style>
      <div dangerouslySetInnerHTML={{ __html: processMarkdown(content) }} />
    </div>
  );
}
