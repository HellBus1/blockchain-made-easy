import { useState } from 'react';

interface Scenario {
  id: string;
  title: string;
  type: 'phishing' | 'poisoning' | 'permit' | 'legitimate';
  subtitle: string;
  requestedAction: string;
  contractAddress: string;
  rawCalldata: string;
  decodedParameters: Record<string, string>;
  isMalicious: boolean;
  redFlags: string[];
  explanation: string;
}

const SCENARIOS: Scenario[] = [
  {
    id: 'scam-1',
    title: 'Scenario 1: Claim Free Airdrop',
    type: 'phishing',
    subtitle:
      'A tweet mentions you: "Congratulations! You won 5,000 $USDC. Connect wallet to claim before timer expires."',
    requestedAction: 'Signature: setApprovalForAll',
    contractAddress: '0x3f5c...91b2 (Unverified Contract)',
    rawCalldata:
      '0xa22cb4650000000000000000000000009f8c47b92019c0174b0f92b740192a0174092b100000000000000000000000000000000000000000000000000000000000000001',
    decodedParameters: {
      Operator: '0x9f8c47b92019c0174b0f92b740192a0174092b1 (Attacker Controlled)',
      Approved: 'true (Unlimited permission to transfer all tokens)',
    },
    isMalicious: true,
    redFlags: [
      'Calls setApprovalForAll rather than a transfer or claim function.',
      'Grants unlimited permission to drain all your NFT/Token holdings from that contract.',
      'Unverified smart contract with no public audit or track record.',
    ],
    explanation:
      'This is an Approval Phishing Drainer. A real airdrop contract sends tokens to you or requires a simple `claim()` function. It will NEVER ask you to approve someone else as an operator over your existing wallet assets.',
  },
  {
    id: 'scam-2',
    title: 'Scenario 2: Quick Copy-Paste Transfer',
    type: 'poisoning',
    subtitle:
      'You need to send 2.0 ETH to your exchange deposit address. You quickly open transaction history and copy the address.',
    requestedAction: 'Transfer: 2.0 ETH',
    contractAddress: '0x71C8294a500918F395213bC27d092B083aF2',
    rawCalldata: '0x (Standard Native ETH Value Transfer)',
    decodedParameters: {
      'Target Address': '0x71C8294a500918F395213bC27d092B083aF2',
      'Real Address': '0x71C840b12749102830192490192837403aF2',
      'Prefix / Suffix': 'Both start with 0x71C8 and end with 3aF2',
    },
    isMalicious: true,
    redFlags: [
      'Look closely at the middle 28 characters: they are completely different!',
      'Attacker sent a 0-value transaction to your wallet earlier using a vanity-generated lookalike address.',
      'Relying only on the first 4 and last 4 characters when copying from history.',
    ],
    explanation:
      'This is Address Poisoning. Attackers run GPU farms to generate addresses that match your frequent counterparties’ first 4 and last 4 digits. Always save addresses in an Address Book or verify the full 42 characters.',
  },
  {
    id: 'scam-3',
    title: 'Scenario 3: Discord Server Verification',
    type: 'permit',
    subtitle:
      'You join a crypto Discord channel. A bot sends a link to "verify your wallet balance for role access" via gasless signature.',
    requestedAction: 'EIP-712 Off-Chain Signature: Permit2 Batch',
    contractAddress: '0x000000000022D473030F116dDEE9F6B43aC78BA3 (Permit2 Standard)',
    rawCalldata: 'EIP-712 Typed Data Signature (Gasless)',
    decodedParameters: {
      Spender: '0x882a...e41 (Unknown Spender Contract)',
      Permitted: 'USDC, USDT, WETH (Maximum Amount: 2²⁵⁶ - 1)',
      Deadline: 'Valid for 30 days',
    },
    isMalicious: true,
    redFlags: [
      'EIP-712 signatures don’t require gas, making them look innocent, but they authorize immediate token transfers.',
      'No community verification bot requires signing token permissions or Permit2 allowances.',
      'Permit2 signatures bypass standard wallet approval warning dialogues.',
    ],
    explanation:
      'This is Permit2 Signature Phishing. EIP-712 off-chain signatures allow a third party to submit the transaction and take your tokens later without you ever paying gas or seeing an on-chain transaction prompt.',
  },
  {
    id: 'scam-4',
    title: 'Scenario 4: Token Swap on Uniswap V3',
    type: 'legitimate',
    subtitle:
      'You are on the verified app.uniswap.org frontend swapping 0.5 ETH for DAI stablecoin.',
    requestedAction: 'exactInputSingle (Uniswap V3 Swap Router)',
    contractAddress: '0xE592427A0AEce92De3Edee1F18E0157C05861564 (Official Router)',
    rawCalldata: '0x414bf382000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2...',
    decodedParameters: {
      TokenIn: 'WETH (Wrapped Ether)',
      TokenOut: 'DAI (Multi-Collateral Stablecoin)',
      Recipient: 'Your Own Connected Address',
      AmountIn: '0.50 ETH',
      MinAmountOut: '1,642.15 DAI (0.5% Slippage Tolerance)',
    },
    isMalicious: false,
    redFlags: [],
    explanation:
      'This is a completely Legitimate DEX Swap. The router contract is the verified Uniswap V3 address, the recipient is your own address, the slippage is bounded, and you are swapping specific amounts without granting unbounded permissions.',
  },
];

export default function ScamInspector() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userChoice, setUserChoice] = useState<'sign' | 'reject' | null>(null);
  const [showPayload, setShowPayload] = useState(false);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState<Record<number, boolean>>({});

  const scenario = SCENARIOS[currentIndex];
  const hasAnsweredCurrent = answered[currentIndex] !== undefined;

  const handleDecision = (decision: 'sign' | 'reject') => {
    if (hasAnsweredCurrent) return;
    setUserChoice(decision);
    const isCorrect =
      (decision === 'reject' && scenario.isMalicious) ||
      (decision === 'sign' && !scenario.isMalicious);

    if (isCorrect) {
      setScore((s) => s + 1);
    }
    setAnswered((prev) => ({ ...prev, [currentIndex]: isCorrect }));
  };

  const handleNext = () => {
    setUserChoice(null);
    setShowPayload(false);
    if (currentIndex < SCENARIOS.length - 1) {
      setCurrentIndex((i) => i + 1);
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setUserChoice(null);
    setShowPayload(false);
    setScore(0);
    setAnswered({});
  };

  return (
    <div className="not-content my-8 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-md shadow-lg overflow-hidden transition-all">
      {/* Header & Score Bar */}
      <div className="px-5 py-4 border-b border-border/70 bg-muted/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <h4 className="text-sm font-semibold text-foreground">
            Web3 Transaction Defense Inspector (Live Scenario {currentIndex + 1} of{' '}
            {SCENARIOS.length})
          </h4>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-primary/10 text-primary border border-primary/20 font-medium">
            Defense Score: {score} / {Object.keys(answered).length}
          </span>
          <button
            onClick={handleReset}
            type="button"
            className="text-xs text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
          >
            Reset Test
          </button>
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-5">
        {/* Scenario Context */}
        <div className="space-y-1">
          <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
            {scenario.title}
          </span>
          <p className="text-sm font-medium text-foreground leading-relaxed">{scenario.subtitle}</p>
        </div>

        {/* Mock Wallet Transaction Prompt Box */}
        <div className="p-4 sm:p-5 rounded-xl border border-border bg-background shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold font-mono">
                W
              </div>
              <span className="text-xs font-semibold text-foreground">Signature Request</span>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground">
              Ethereum Mainnet
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div>
              <span className="text-[11px] text-muted-foreground block font-sans">
                Action Requested:
              </span>
              <span className="font-semibold text-foreground">{scenario.requestedAction}</span>
            </div>

            <div>
              <span className="text-[11px] text-muted-foreground block font-sans">
                Target Contract:
              </span>
              <span className="text-primary break-all">{scenario.contractAddress}</span>
            </div>

            {/* Decoded Parameters Table */}
            <div className="p-3 rounded-lg bg-muted/30 border border-border/60 space-y-1.5 font-sans">
              <span className="text-[11px] font-semibold text-muted-foreground block font-mono">
                Decoded Function Parameters:
              </span>
              {Object.entries(scenario.decodedParameters).map(([key, val]) => (
                <div
                  key={key}
                  className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1"
                >
                  <span className="text-muted-foreground">{key}:</span>
                  <span className="font-mono font-medium text-foreground text-right">{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Raw Calldata Toggle */}
          <div>
            <button
              onClick={() => setShowPayload(!showPayload)}
              type="button"
              className="text-xs text-primary hover:underline cursor-pointer flex items-center gap-1 font-medium"
            >
              <span>{showPayload ? '▼ Hide Raw Calldata' : '▶ Inspect Raw Hex Calldata'}</span>
            </button>
            {showPayload && (
              <div className="mt-2 p-2.5 rounded-lg bg-muted/60 font-mono text-[11px] text-muted-foreground break-all select-all border border-border">
                {scenario.rawCalldata}
              </div>
            )}
          </div>
        </div>

        {/* Decision Action Buttons */}
        {!hasAnsweredCurrent ? (
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              onClick={() => handleDecision('reject')}
              type="button"
              className="w-full sm:w-1/2 cursor-pointer py-3 px-4 rounded-xl font-semibold text-sm bg-red-600 hover:bg-red-700 text-white transition-all shadow-xs flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              Reject Transaction (Malicious / Suspect)
            </button>
            <button
              onClick={() => handleDecision('sign')}
              type="button"
              className="w-full sm:w-1/2 cursor-pointer py-3 px-4 rounded-xl font-semibold text-sm bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-xs flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Sign & Confirm (Legitimate)
            </button>
          </div>
        ) : (
          /* Post-Decision Feedback Banner */
          <div className="space-y-4 pt-2">
            {answered[currentIndex] ? (
              <div className="p-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 flex items-start gap-3">
                <span className="p-1 rounded-full bg-emerald-500/20 text-emerald-500 mt-0.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </span>
                <div className="space-y-1">
                  <h5 className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    Correct Decision! You chose to {userChoice === 'sign' ? 'Sign' : 'Reject'}.
                  </h5>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {scenario.explanation}
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-red-500/40 bg-red-500/10 flex items-start gap-3">
                <span className="p-1 rounded-full bg-red-500/20 text-red-500 mt-0.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </span>
                <div className="space-y-1">
                  <h5 className="text-sm font-bold text-red-600 dark:text-red-400">
                    Fatal Decision! You chose to {userChoice === 'sign' ? 'Sign' : 'Reject'}. Funds
                    Would Be Lost.
                  </h5>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {scenario.explanation}
                  </p>
                </div>
              </div>
            )}

            {/* Red Flags List */}
            {scenario.redFlags.length > 0 && (
              <div className="p-4 rounded-xl border border-border/80 bg-muted/20 space-y-2">
                <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  🔍 On-Chain Security Red Flags:
                </span>
                <ul className="text-xs text-muted-foreground space-y-1 pl-4 list-disc">
                  {scenario.redFlags.map((flag, idx) => (
                    <li key={idx}>{flag}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Next Scenario Button */}
            <div className="flex justify-end pt-2">
              {currentIndex < SCENARIOS.length - 1 ? (
                <button
                  onClick={handleNext}
                  type="button"
                  className="cursor-pointer px-4 py-2 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors inline-flex items-center gap-1.5"
                >
                  Next Scenario →
                </button>
              ) : (
                <button
                  onClick={handleReset}
                  type="button"
                  className="cursor-pointer px-4 py-2 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors inline-flex items-center gap-1.5"
                >
                  Completed! Try Again (Score: {score}/{SCENARIOS.length}) ↺
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
