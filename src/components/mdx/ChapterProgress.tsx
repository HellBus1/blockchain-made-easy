import { useStore } from '@nanostores/react';
import { learningChain } from '../../stores/progress';

interface ChapterProgressProps {
  currentChapter: number; // 1 to 9
  chapterId: string;
}

const FOUNDATIONS_CHAPTERS = [
  {
    num: 1,
    id: 'foundations-01',
    title: '1.1 What Money Really Is',
    url: '/learn/foundations/01-what-money-really-is/',
  },
  {
    num: 2,
    id: 'foundations-02',
    title: '1.2 The Double-Spend Problem',
    url: '/learn/foundations/02-the-double-spend-problem/',
  },
  {
    num: 3,
    id: 'foundations-03',
    title: '1.3 The Shared Notebook',
    url: '/learn/foundations/03-the-shared-notebook/',
  },
  {
    num: 4,
    id: 'foundations-04',
    title: '1.4 Gossip Protocol & Consensus',
    url: '/learn/foundations/04-gossip-protocol/',
  },
  {
    num: 5,
    id: 'foundations-05',
    title: '1.5 Hashing: Digital Fingerprints',
    url: '/learn/foundations/05-cryptographic-hashing/',
  },
  {
    num: 6,
    id: 'foundations-06',
    title: '1.6 Blocks & The Immutable Chain',
    url: '/learn/foundations/06-blocks-and-blockchain/',
  },
  {
    num: 7,
    id: 'foundations-07',
    title: '1.7 Proof of Work vs Proof of Stake',
    url: '/learn/foundations/07-pow-vs-pos/',
  },
  {
    num: 8,
    id: 'foundations-08',
    title: '1.8 Minting, Block Rewards & Halving',
    url: '/learn/foundations/08-minting-and-halving/',
  },
  {
    num: 9,
    id: 'foundations-09',
    title: '1.9 Alice Sends 1 Coin to Bob',
    url: '/learn/foundations/09-alice-to-bob-walkthrough/',
  },
];

export default function ChapterProgress({ currentChapter, chapterId }: ChapterProgressProps) {
  const chain = useStore(learningChain);
  const sealedIds = new Set(chain.map((b) => b.chapterId));
  const isCurrentSealed = sealedIds.has(chapterId);

  const completedFoundations = FOUNDATIONS_CHAPTERS.filter((ch) => sealedIds.has(ch.id)).length;
  const progressPct = Math.round((completedFoundations / FOUNDATIONS_CHAPTERS.length) * 100);

  const scrollToSeal = () => {
    const sealElem = document.getElementById('chapter-seal-section');
    if (sealElem) {
      sealElem.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
  };

  return (
    <div className="not-content mb-8 p-4 rounded-xl border border-border/70 bg-card/50 backdrop-blur-sm shadow-xs transition-all">
      {/* Top row: Track & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Track 1: Foundations
          </span>
          <span className="text-muted-foreground/40">•</span>
          <span className="text-xs font-mono font-medium text-foreground">
            Chapter {currentChapter} of 9
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isCurrentSealed ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Block Sealed ✓
            </span>
          ) : (
            <button
              onClick={scrollToSeal}
              type="button"
              className="cursor-pointer inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20 border border-primary/20 transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Unsealed — Jump to Seal ↓
            </button>
          )}

          <a
            href="/dashboard/"
            className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors ml-1 hidden sm:inline"
            title="Open Learning Dashboard"
          >
            Dashboard ({completedFoundations}/9) ↗
          </a>
        </div>
      </div>

      {/* 9-Node Blockchain Stepper */}
      <div className="pt-1">
        <div className="flex items-center justify-between gap-1 sm:gap-2">
          {FOUNDATIONS_CHAPTERS.map((ch, idx) => {
            const isCompleted = sealedIds.has(ch.id);
            const isCurrent = ch.num === currentChapter;

            return (
              <div key={ch.id} className="flex-1 flex items-center">
                <a
                  href={ch.url}
                  title={`${ch.title} ${isCompleted ? '(Sealed)' : isCurrent ? '(Reading now)' : ''}`}
                  className={`w-full group flex flex-col items-center text-center no-underline transition-transform ${
                    isCurrent ? 'scale-105' : 'hover:scale-102'
                  }`}
                >
                  <div
                    className={`w-full h-2 rounded-full transition-all duration-300 ${
                      isCompleted
                        ? 'bg-emerald-500 shadow-xs'
                        : isCurrent
                          ? 'bg-primary ring-2 ring-primary/40 animate-pulse'
                          : 'bg-muted/80 group-hover:bg-muted-foreground/30'
                    }`}
                  />
                  <span
                    className={`mt-1.5 text-[10px] font-mono leading-none ${
                      isCompleted
                        ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                        : isCurrent
                          ? 'text-primary font-bold'
                          : 'text-muted-foreground/60'
                    }`}
                  >
                    {isCompleted ? '✓' : `0${ch.num}`}
                  </span>
                </a>

                {idx < FOUNDATIONS_CHAPTERS.length - 1 && (
                  <div className="hidden sm:block w-1.5 h-0.5 bg-border mx-0.5 shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Progress completion bar subtext */}
      <div className="mt-2.5 flex items-center justify-between text-[11px] text-muted-foreground">
        <span>
          Track Progress: <strong className="text-foreground">{progressPct}%</strong> (
          {completedFoundations} of 9 blocks sealed)
        </span>
        <span className="font-mono text-[10px]">
          {9 - completedFoundations === 0
            ? '🎉 Track 1 Complete!'
            : `${9 - completedFoundations} chapters remaining`}
        </span>
      </div>
    </div>
  );
}
