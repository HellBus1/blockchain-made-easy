import React, { useState } from 'react';
import { useStore } from '@nanostores/react';
import {
  learningChain,
  resetLearningChain,
  verifyChainIntegrity,
  type SealedBlock,
} from '../../stores/progress';

export default function LearningChainExplorer() {
  const chain = useStore(learningChain);
  const [selectedBlock, setSelectedBlock] = useState<SealedBlock | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const integrity = verifyChainIntegrity(chain);

  // Chapters completed across Tracks 1 & 2
  const totalChapters = 15;
  const sealedChapters = chain.filter((b) => b.chapterId !== 'genesis').length;
  const progressPct = Math.min(100, Math.round((sealedChapters / totalChapters) * 100));

  const handleExport = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(chain, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `bme-learning-chain-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].chapterId === 'genesis') {
          learningChain.set(parsed);
          setSelectedBlock(null);
        } else {
          setImportError('Invalid chain file format: Must contain valid genesis block.');
        }
      } catch {
        setImportError('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleReset = () => {
    if (
      confirm(
        'Are you sure you want to reset your learning chain back to Genesis Block #0? This cannot be undone.'
      )
    ) {
      resetLearningChain();
      setSelectedBlock(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(text);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  return (
    <div className="space-y-6 my-8">
      {/* Top Banner: Chain Health & Progress */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-border bg-card/70 backdrop-blur-sm">
          <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
            Chain Height
          </div>
          <div className="text-2xl font-bold font-mono text-foreground mt-1 flex items-baseline gap-2">
            #{chain.length - 1}
            <span className="text-xs font-sans font-normal text-muted-foreground">
              ({chain.length} total blocks)
            </span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Genesis + {chain.length - 1} completed chapters
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card/70 backdrop-blur-sm">
          <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
            Curriculum Progress
          </div>
          <div className="text-2xl font-bold font-mono text-primary mt-1 flex items-baseline gap-2">
            {progressPct}%
            <span className="text-xs font-sans font-normal text-muted-foreground">
              ({sealedChapters}/{totalChapters} Chapters Mined)
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-primary h-full transition-all duration-500 rounded-full"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card/70 backdrop-blur-sm">
          <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
            Cryptographic Integrity
          </div>
          <div className="mt-1 flex items-center gap-2">
            {integrity.isValid ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                100% Cryptographically Valid
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-500/10 text-rose-500 border border-rose-500/20">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                Broken at Block #{integrity.brokenAtIndex}
              </span>
            )}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Every block verified against its previous hash
          </div>
        </div>
      </div>

      {/* Main Chain Visualization */}
      <div className="p-6 rounded-2xl border border-border bg-card/40 backdrop-blur-md shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-foreground m-0">Your Immutable Learning Chain</h3>
            <p className="text-xs text-muted-foreground m-0">
              Each block represents a chapter verified through Proof of Work and sealed locally in
              your browser.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap text-xs">
            <button
              onClick={handleExport}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-muted text-foreground transition-colors cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Export JSON
            </button>

            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-muted text-foreground transition-colors cursor-pointer">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
              Import JSON
              <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            </label>

            <button
              onClick={handleReset}
              type="button"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-destructive/20 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
              title="Reset chain"
            >
              Reset
            </button>
          </div>
        </div>

        {importError && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs">
            {importError}
          </div>
        )}

        {/* Scrollable Block Chain Rail */}
        <div className="overflow-x-auto pb-4 pt-2">
          <div className="flex items-center gap-3 min-w-max">
            {chain.map((block, index) => {
              const isGenesis = block.blockNumber === 0;
              const isSelected = selectedBlock?.blockNumber === block.blockNumber;

              return (
                <React.Fragment key={block.blockNumber}>
                  {index > 0 && (
                    <div className="flex items-center text-muted-foreground/60">
                      <svg
                        className="w-6 h-6 animate-pulse"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        />
                      </svg>
                    </div>
                  )}

                  <div
                    onClick={() => setSelectedBlock(block)}
                    className={`cursor-pointer w-64 p-4 rounded-xl border transition-all duration-200 select-none ${
                      isSelected
                        ? 'border-primary ring-2 ring-primary/20 bg-primary/5 shadow-md scale-102'
                        : isGenesis
                          ? 'border-amber-500/40 bg-amber-500/5 hover:border-amber-500'
                          : 'border-border bg-card/90 hover:border-primary/50 hover:bg-card'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                          isGenesis
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                            : 'bg-primary/10 text-primary border border-primary/20'
                        }`}
                      >
                        Block #{block.blockNumber}
                      </span>
                      <span className="text-[11px] font-mono text-muted-foreground">
                        Nonce: {block.nonce}
                      </span>
                    </div>

                    <h4 className="text-sm font-semibold text-foreground line-clamp-1 m-0">
                      {block.chapterTitle}
                    </h4>

                    <div className="mt-3 space-y-1 font-mono text-[11px]">
                      <div className="text-muted-foreground flex justify-between">
                        <span>Hash:</span>
                        <span className="text-foreground font-semibold">
                          {block.hash.slice(0, 6)}...{block.hash.slice(-4)}
                        </span>
                      </div>
                      <div className="text-muted-foreground/80 flex justify-between">
                        <span>Prev:</span>
                        <span>
                          {block.prevHash.slice(0, 6)}...{block.prevHash.slice(-4)}
                        </span>
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Selected Block Details Inspector */}
        {selectedBlock && (
          <div className="mt-6 p-4 rounded-xl border border-primary/30 bg-primary/5 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-sm text-primary">
                  Block #{selectedBlock.blockNumber} Inspector
                </span>
                <span className="text-xs text-muted-foreground">
                  (Mined on {new Date(selectedBlock.timestamp).toLocaleString()})
                </span>
              </div>
              <button
                onClick={() => setSelectedBlock(null)}
                className="text-xs text-muted-foreground hover:text-foreground cursor-pointer self-start sm:self-auto"
              >
                Close Inspector ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 bg-background/80 rounded-lg border border-border">
                <div className="text-muted-foreground text-[10px] uppercase font-sans font-semibold">
                  Chapter Reference
                </div>
                <div className="text-foreground font-bold text-sm mt-0.5 font-sans">
                  {selectedBlock.chapterTitle}
                </div>
                <div className="text-muted-foreground text-xs mt-1">
                  ID: <span className="text-primary">{selectedBlock.chapterId}</span>
                </div>
              </div>

              <div className="p-3 bg-background/80 rounded-lg border border-border">
                <div className="text-muted-foreground text-[10px] uppercase font-sans font-semibold">
                  Proof of Work Nonce
                </div>
                <div className="text-foreground font-bold text-sm mt-0.5">
                  {selectedBlock.nonce.toLocaleString()}
                </div>
                <div className="text-muted-foreground text-xs mt-1">
                  Difficulty Target:{' '}
                  <span className="text-emerald-500 font-bold">2 Leading Zeros</span>
                </div>
              </div>

              <div className="p-3 bg-background/80 rounded-lg border border-border md:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-muted-foreground text-[10px] uppercase font-sans font-semibold">
                    Full Block SHA-256 Hash
                  </span>
                  <button
                    onClick={() => copyToClipboard(selectedBlock.hash)}
                    className="text-primary hover:underline text-[11px] cursor-pointer"
                  >
                    {copiedHash === selectedBlock.hash ? 'Copied ✓' : 'Copy Full Hash'}
                  </button>
                </div>
                <div className="text-foreground font-bold break-all bg-muted/40 p-2 rounded">
                  {selectedBlock.hash}
                </div>
              </div>

              <div className="p-3 bg-background/80 rounded-lg border border-border md:col-span-2">
                <div className="text-muted-foreground text-[10px] uppercase font-sans font-semibold mb-1">
                  Previous Block Pointer (prevHash)
                </div>
                <div className="text-muted-foreground break-all bg-muted/40 p-2 rounded">
                  {selectedBlock.prevHash}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
