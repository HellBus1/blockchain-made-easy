import { useStore } from '@nanostores/react';
import { learningChain, sealChapterBlockInstant, unsealChapterBlock } from '../../stores/progress';

interface ChapterProgressProps {
  track?: 'foundations' | 'wallets';
  currentChapter: number;
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

const WALLETS_CHAPTERS = [
  {
    num: 1,
    id: 'wallets-01',
    title: '2.1 Keys & Public Addresses',
    url: '/learn/wallets/01-keys-and-addresses/',
  },
  {
    num: 2,
    id: 'wallets-02',
    title: '2.2 Seed Phrases & BIP-39',
    url: '/learn/wallets/02-seed-phrases/',
  },
  {
    num: 3,
    id: 'wallets-03',
    title: '2.3 Custodial vs Self-Custody',
    url: '/learn/wallets/03-custodial-vs-self-custody/',
  },
  {
    num: 4,
    id: 'wallets-04',
    title: '2.4 Hot, Cold & Hardware Wallets',
    url: '/learn/wallets/04-hot-cold-hardware-wallets/',
  },
  {
    num: 5,
    id: 'wallets-05',
    title: '2.5 Sending Safely',
    url: '/learn/wallets/05-sending-safely/',
  },
  {
    num: 6,
    id: 'wallets-06',
    title: '2.6 Scams & Threat Models',
    url: '/learn/wallets/06-scams-and-security/',
  },
];

export default function ChapterProgress({
  track = 'foundations',
  currentChapter,
  chapterId,
}: ChapterProgressProps) {
  const chain = useStore(learningChain);
  const sealedIds = new Set(chain.map((b) => b.chapterId));
  const isCurrentSealed = sealedIds.has(chapterId);

  const chapters = track === 'wallets' ? WALLETS_CHAPTERS : FOUNDATIONS_CHAPTERS;
  const trackName = track === 'wallets' ? 'Track 2: Wallets & Security' : 'Track 1: Foundations';
  const completedCount = chapters.filter((ch) => sealedIds.has(ch.id)).length;
  const currentChapterObj = chapters.find((ch) => ch.num === currentChapter) || chapters[0];

  const handleInstantSign = async () => {
    await sealChapterBlockInstant(chapterId, currentChapterObj.title);
  };

  const handleUnsign = () => {
    unsealChapterBlock(chapterId);
  };

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
            {trackName}
          </span>
          <span className="text-muted-foreground/40">•</span>
          <span className="text-xs font-mono font-medium text-foreground">
            Chapter {currentChapter} of {chapters.length}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isCurrentSealed ? (
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />✓ Chapter
                Checked & Signed
              </span>
              <button
                onClick={handleUnsign}
                type="button"
                className="cursor-pointer text-[11px] text-muted-foreground hover:text-red-500 underline decoration-dotted transition-colors ml-0.5"
                title="Uncheck this chapter"
              >
                (undo)
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleInstantSign}
                type="button"
                className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-sm hover:shadow transition-all duration-150 active:scale-98"
                title="Check off and cryptographically sign this chapter"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Check & Sign Chapter
              </button>
              <button
                onClick={scrollToSeal}
                type="button"
                className="cursor-pointer inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground bg-muted/60 hover:bg-muted border border-border/60 transition-colors"
                title="Scroll down to the interactive Proof of Work mining seal"
              >
                <span>⛏️ PoW Seal ↓</span>
              </button>
            </div>
          )}

          <a
            href="/dashboard/"
            className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors ml-1 hidden sm:inline"
            title="Open Learning Dashboard"
          >
            Dashboard ({completedCount}/{chapters.length}) ↗
          </a>
        </div>
      </div>

      {/* Blockchain Stepper */}
      <div className="pt-1">
        <div className="flex items-center justify-between gap-1 sm:gap-2">
          {chapters.map((ch, idx) => {
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

                {idx < chapters.length - 1 && (
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
          Track Progress:{' '}
          <strong className="text-foreground">
            {Math.round((completedCount / chapters.length) * 100)}%
          </strong>{' '}
          ({completedCount} of {chapters.length} blocks sealed)
        </span>
        <span className="font-mono text-[10px]">
          {chapters.length - completedCount === 0
            ? `🎉 ${trackName} Complete!`
            : `${chapters.length - completedCount} chapters remaining`}
        </span>
      </div>
    </div>
  );
}
