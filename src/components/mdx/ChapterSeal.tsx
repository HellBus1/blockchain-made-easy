import { useState } from 'react';
import { useStore } from '@nanostores/react';
import {
  learningChain,
  mineChapterBlockWithPoW,
  sealChapterBlockInstant,
  unsealChapterBlock,
} from '../../stores/progress';

interface ChapterSealProps {
  chapterId: string;
  chapterTitle: string;
  nextChapterUrl?: string;
  nextChapterTitle?: string;
  track?: string;
}

export default function ChapterSeal({
  chapterId,
  chapterTitle,
  nextChapterUrl,
  nextChapterTitle,
}: ChapterSealProps) {
  const chain = useStore(learningChain);
  const existingBlock = chain.find((b) => b.chapterId === chapterId);

  const [isMining, setIsMining] = useState(false);
  const [candidateNonce, setCandidateNonce] = useState(0);
  const [candidateHash, setCandidateHash] = useState('');
  const [copied, setCopied] = useState(false);

  // If already sealed, display the sealed block
  const isSealed = Boolean(existingBlock);

  const handleInstantSign = async () => {
    if (isMining || isSealed) return;
    try {
      await sealChapterBlockInstant(chapterId, chapterTitle);
    } catch (err) {
      console.error('Instant sign error:', err);
    }
  };

  const handleMine = async () => {
    if (isMining || isSealed) return;
    setIsMining(true);
    setCandidateNonce(1);
    setCandidateHash('computing initial proof...');

    try {
      await mineChapterBlockWithPoW(chapterId, chapterTitle, (nonce, hash) => {
        setCandidateNonce(nonce);
        setCandidateHash(hash);
      });
    } catch (err) {
      console.error('Mining error:', err);
    } finally {
      setIsMining(false);
    }
  };

  const handleUnseal = () => {
    if (
      confirm(
        `Unseal Block #${existingBlock?.blockNumber}? This will remove it from your learning chain.`
      )
    ) {
      unsealChapterBlock(chapterId);
    }
  };

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      id="chapter-seal-section"
      className="my-10 rounded-xl border border-border bg-card/60 backdrop-blur-sm p-6 shadow-sm transition-all hover:shadow-md"
    >
      {!isSealed && !isMining && (
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Chapter Completion & Verification
            </div>
            <h3 className="text-xl font-bold tracking-tight text-foreground m-0">
              Finished Reading? Check & Sign Your Chapter
            </h3>
            <p className="text-sm text-muted-foreground m-0 max-w-xl">
              Permanently mark this chapter complete and cryptographically seal Block #
              {chain.length} into your local blockchain ledger.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleInstantSign}
              type="button"
              className="cursor-pointer whitespace-nowrap inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg font-semibold text-sm text-white bg-emerald-600 hover:bg-emerald-500 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Check & Sign Block #{chain.length}
            </button>

            <button
              onClick={handleMine}
              type="button"
              className="cursor-pointer whitespace-nowrap inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-sm text-foreground bg-muted hover:bg-muted/80 border border-border shadow-xs hover:shadow transition-all duration-150"
              title="Run SHA-256 Proof of Work micro-mining animation"
            >
              <span>⛏️ Mine with PoW</span>
            </button>
          </div>
        </div>
      )}

      {isMining && (
        <div className="space-y-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/30">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              </div>
              <div>
                <h4 className="text-base font-semibold text-foreground m-0">
                  Mining Block #{chain.length}...
                </h4>
                <p className="text-xs text-muted-foreground m-0">
                  Brute-forcing nonce for SHA-256 target with leading zeros
                </p>
              </div>
            </div>
            <div className="text-right font-mono text-xs text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20">
              Nonce: #{candidateNonce}
            </div>
          </div>

          <div className="p-3 bg-muted/60 rounded-lg border border-border/60 font-mono text-xs break-all text-muted-foreground">
            <span className="text-primary font-bold">Candidate: </span>
            {candidateHash}
          </div>

          <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
            <div className="bg-primary h-full w-2/3 animate-[pulse_1s_ease-in-out_infinite]" />
          </div>
        </div>
      )}

      {isSealed && existingBlock && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div>
                <h4 className="text-base font-bold text-foreground m-0 flex items-center gap-2">
                  Block #{existingBlock.blockNumber} Sealed & Verified
                  <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Nonce: {existingBlock.nonce}
                  </span>
                </h4>
                <p className="text-xs text-muted-foreground m-0">
                  Mined {new Date(existingBlock.timestamp).toLocaleString()}
                </p>
              </div>
            </div>

            <button
              onClick={handleUnseal}
              type="button"
              className="text-xs text-muted-foreground hover:text-destructive transition-colors self-start sm:self-auto cursor-pointer"
            >
              Reset this block
            </button>
          </div>

          {/* Block Hashes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-2.5 rounded-lg bg-muted/40 border border-border/50">
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">
                Previous Block Hash
              </div>
              <div className="truncate text-foreground/80" title={existingBlock.prevHash}>
                {existingBlock.prevHash.slice(0, 16)}...{existingBlock.prevHash.slice(-8)}
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-between gap-2">
              <div className="overflow-hidden">
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wider mb-0.5">
                  Mined Block Hash
                </div>
                <div className="truncate text-foreground font-bold" title={existingBlock.hash}>
                  <span className="text-emerald-500">{existingBlock.hash.slice(0, 2)}</span>
                  {existingBlock.hash.slice(2, 16)}...{existingBlock.hash.slice(-8)}
                </div>
              </div>
              <button
                onClick={() => copyHash(existingBlock.hash)}
                type="button"
                className="px-2 py-1 text-[11px] rounded bg-background border border-border hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors whitespace-nowrap"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Next Navigation */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
            <a
              href="/dashboard/"
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground bg-muted/50 hover:bg-muted transition-colors no-underline"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              View Learning Chain on Dashboard
            </a>

            {nextChapterUrl && (
              <a
                href={nextChapterUrl}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-primary-foreground bg-primary hover:bg-primary/90 transition-all shadow-sm hover:shadow no-underline"
              >
                <span>Continue: {nextChapterTitle || 'Next Lesson'}</span>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
