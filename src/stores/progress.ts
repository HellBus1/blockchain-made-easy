import { persistentAtom } from '@nanostores/persistent';

export interface SealedBlock {
  blockNumber: number;
  chapterId: string;
  chapterTitle: string;
  timestamp: number;
  prevHash: string;
  nonce: number;
  hash: string;
}

export const GENESIS_BLOCK: SealedBlock = {
  blockNumber: 0,
  chapterId: 'genesis',
  chapterTitle: 'Genesis: Welcome to Blockchain Made Easy',
  timestamp: 1231006505000, // Jan 3, 2009 (Bitcoin Genesis Block timestamp)
  prevHash: '0000000000000000000000000000000000000000000000000000000000000000',
  nonce: 2083236893,
  hash: '000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f',
};

export async function computeSha256(data: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const buffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(data));
    return Array.from(new Uint8Array(buffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  // Fallback simple hash for non-crypto environments (SSR safe)
  let h = 0;
  for (let i = 0; i < data.length; i++) {
    h = (Math.imul(31, h) + data.charCodeAt(i)) | 0;
  }
  return Math.abs(h).toString(16).padStart(64, '0');
}

export const learningChain = persistentAtom<SealedBlock[]>('bme_learning_chain', [GENESIS_BLOCK], {
  encode: JSON.stringify,
  decode: (val) => {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Ensure all blocks have nonce
        return parsed.map((b, idx) => ({
          ...b,
          nonce: typeof b.nonce === 'number' ? b.nonce : idx === 0 ? 2083236893 : 42,
        }));
      }
      return [GENESIS_BLOCK];
    } catch {
      return [GENESIS_BLOCK];
    }
  },
});

export function isChapterCompleted(chapterId: string): boolean {
  const chain = learningChain.get();
  return chain.some((block) => block.chapterId === chapterId);
}

export function getChapterBlock(chapterId: string): SealedBlock | undefined {
  const chain = learningChain.get();
  return chain.find((block) => block.chapterId === chapterId);
}

/**
 * Mines a block with a simulated PoW challenge (requiring hash to start with "00").
 * Includes animated progress updates so the user visually experiences the nonce search.
 */
export async function mineChapterBlockWithPoW(
  chapterId: string,
  chapterTitle: string,
  onProgress?: (nonce: number, candidateHash: string) => void
): Promise<SealedBlock> {
  const chain = learningChain.get();
  const existing = chain.find((b) => b.chapterId === chapterId);
  if (existing) {
    return existing;
  }

  const prevBlock = chain[chain.length - 1];
  const nextBlockNum = chain.length;
  const now = Date.now();
  const targetPrefix = '00';

  let nonce = 0;
  let candidateHash = '';

  // Run search in batches with UI yielding to allow ~1.2s smooth visual mining
  const startTime = Date.now();
  const minDurationMs = 1100; // minimum animation time for visceral feel

  while (true) {
    nonce++;
    const payload = `${prevBlock.hash}:${nextBlockNum}:${chapterId}:${chapterTitle}:${now}:${nonce}`;
    candidateHash = await computeSha256(payload);

    if (nonce % 15 === 0) {
      if (onProgress) {
        onProgress(nonce, candidateHash);
      }
      // Yield to main thread for smooth 60fps render
      await new Promise((r) => setTimeout(r, 20));
    }

    if (candidateHash.startsWith(targetPrefix)) {
      const elapsed = Date.now() - startTime;
      if (elapsed < minDurationMs) {
        // Continue ticking for a brief moment to reach desired visceral timing
        await new Promise((r) => setTimeout(r, minDurationMs - elapsed));
      }
      break;
    }

    // Safety fallback: if 2000 iterations reached, accept current hash
    if (nonce > 2000) {
      break;
    }
  }

  const newBlock: SealedBlock = {
    blockNumber: nextBlockNum,
    chapterId,
    chapterTitle,
    timestamp: now,
    prevHash: prevBlock.hash,
    nonce,
    hash: candidateHash,
  };

  learningChain.set([...chain, newBlock]);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('bme:chain-updated', { detail: newBlock }));
  }

  return newBlock;
}

/**
 * Instantly seals and signs a chapter block into the chain without running the PoW loop.
 * Useful for one-click "Check & Sign" chapter completion.
 */
export async function sealChapterBlockInstant(
  chapterId: string,
  chapterTitle: string
): Promise<SealedBlock> {
  const chain = learningChain.get();
  const existing = chain.find((b) => b.chapterId === chapterId);
  if (existing) {
    return existing;
  }

  const prevBlock = chain[chain.length - 1];
  const nextBlockNum = chain.length;
  const now = Date.now();
  const nonce = Math.floor(Math.random() * 90000) + 1000;
  const payload = `${prevBlock.hash}:${nextBlockNum}:${chapterId}:${chapterTitle}:${now}:${nonce}`;
  const hash = await computeSha256(payload);

  const newBlock: SealedBlock = {
    blockNumber: nextBlockNum,
    chapterId,
    chapterTitle,
    timestamp: now,
    prevHash: prevBlock.hash,
    nonce,
    hash,
  };

  learningChain.set([...chain, newBlock]);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('bme:chain-updated', { detail: newBlock }));
  }

  return newBlock;
}

export function unsealChapterBlock(chapterId: string): void {
  const chain = learningChain.get();
  if (chapterId === 'genesis') return;
  const filtered = chain.filter((b) => b.chapterId !== chapterId);
  learningChain.set(filtered.length > 0 ? filtered : [GENESIS_BLOCK]);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('bme:chain-updated'));
  }
}

export function resetLearningChain(): void {
  learningChain.set([GENESIS_BLOCK]);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('bme:chain-updated'));
  }
}

export function verifyChainIntegrity(chain: SealedBlock[]): {
  isValid: boolean;
  brokenAtIndex?: number;
} {
  if (chain.length === 0) return { isValid: false, brokenAtIndex: 0 };

  for (let i = 1; i < chain.length; i++) {
    const prev = chain[i - 1];
    const curr = chain[i];
    if (curr.prevHash !== prev.hash) {
      return { isValid: false, brokenAtIndex: i };
    }
  }
  return { isValid: true };
}
