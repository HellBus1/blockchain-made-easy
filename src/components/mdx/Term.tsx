import React, { useState, useRef, useEffect } from 'react';
import { TERMS, type TermDefinition } from '../../data/terms';

interface TermProps {
  id: string;
  children?: React.ReactNode;
}

export default function Term({ id, children }: TermProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const termData: TermDefinition | undefined = TERMS[id.toLowerCase()];

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  if (!termData) {
    return <span className="underline decoration-dotted">{children || id}</span>;
  }

  const categoryColors: Record<string, string> = {
    consensus: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    cryptography: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
    networking: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    economics: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    wallets: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    architecture: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
  };

  const badgeStyle =
    categoryColors[termData.category] || 'bg-primary/10 text-primary border-primary/20';

  return (
    <span className="relative inline-block">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        className="cursor-help underline decoration-dotted decoration-primary/60 underline-offset-4 font-medium text-foreground hover:text-primary transition-colors focus:outline-none focus:ring-1 focus:ring-primary/40 rounded px-0.5"
        aria-expanded={isOpen}
      >
        {children || termData.name}
      </button>

      {isOpen && (
        <div
          ref={popoverRef}
          onMouseLeave={() => setIsOpen(false)}
          className="absolute z-50 left-1/2 -translate-x-1/2 bottom-full mb-2 w-72 sm:w-80 p-4 rounded-xl border border-border bg-card shadow-xl backdrop-blur-md text-left animate-in fade-in zoom-in-95 duration-150"
          style={{ filter: 'drop-shadow(0 10px 15px rgba(0, 0, 0, 0.2))' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-border/60">
            <span className="font-bold text-sm text-foreground">{termData.name}</span>
            <span
              className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border ${badgeStyle}`}
            >
              {termData.category}
            </span>
          </div>

          {/* Definition */}
          <p className="text-xs text-foreground/90 leading-relaxed mb-2.5">{termData.short}</p>

          {/* Mental Model Analogy */}
          <div className="p-2.5 rounded-lg bg-muted/60 border border-border/60 mb-2.5">
            <div className="text-[10px] uppercase font-bold text-primary tracking-wider mb-1 flex items-center gap-1">
              💡 Everyday Analogy
            </div>
            <p className="text-[11px] text-muted-foreground leading-snug m-0 italic">
              "{termData.analogy}"
            </p>
          </div>

          {/* Footer Link */}
          <div className="flex justify-end pt-1">
            <a
              href={`/glossary/#${termData.id}`}
              className="text-[11px] font-semibold text-primary hover:underline inline-flex items-center gap-1"
            >
              Read in Full Glossary
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </a>
          </div>

          {/* Arrow indicator */}
          <div className="absolute left-1/2 -translate-x-1/2 top-full w-2.5 h-2.5 bg-card border-r border-b border-border rotate-45 -mt-1.5" />
        </div>
      )}
    </span>
  );
}
