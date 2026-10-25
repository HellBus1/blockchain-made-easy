import { useState, useEffect, useRef } from 'react';

interface Node {
  id: string;
  name: string;
  city: string;
  x: number; // percentage in SVG coordinate space
  y: number;
  peers: string[]; // Connected peer IDs
  status: 'idle' | 'received-txA' | 'received-txB' | 'mined-block' | 'offline';
  mempool: string[];
}

interface LogEntry {
  id: string;
  time: string;
  type: 'info' | 'success' | 'warn' | 'error';
  message: string;
}

const INITIAL_NODES: Node[] = [
  {
    id: 'JK',
    name: 'Node JK-01',
    city: 'Jakarta',
    x: 68,
    y: 58,
    peers: ['SG', 'TY', 'SY'],
    status: 'idle',
    mempool: [],
  },
  {
    id: 'SG',
    name: 'Node SG-02',
    city: 'Singapore',
    x: 64,
    y: 52,
    peers: ['JK', 'TY', 'LN', 'FR'],
    status: 'idle',
    mempool: [],
  },
  {
    id: 'TY',
    name: 'Node TY-03',
    city: 'Tokyo',
    x: 80,
    y: 35,
    peers: ['JK', 'SG', 'NY'],
    status: 'idle',
    mempool: [],
  },
  {
    id: 'SY',
    name: 'Node SY-04',
    city: 'Sydney',
    x: 85,
    y: 78,
    peers: ['JK', 'SG', 'SP'],
    status: 'idle',
    mempool: [],
  },
  {
    id: 'LN',
    name: 'Node LN-05',
    city: 'London',
    x: 42,
    y: 28,
    peers: ['FR', 'SG', 'NY'],
    status: 'idle',
    mempool: [],
  },
  {
    id: 'FR',
    name: 'Node FR-06',
    city: 'Frankfurt',
    x: 48,
    y: 30,
    peers: ['LN', 'SG', 'SP'],
    status: 'idle',
    mempool: [],
  },
  {
    id: 'NY',
    name: 'Node NY-07',
    city: 'New York',
    x: 26,
    y: 36,
    peers: ['LN', 'TY', 'SP'],
    status: 'idle',
    mempool: [],
  },
  {
    id: 'SP',
    name: 'Node SP-08',
    city: 'São Paulo',
    x: 33,
    y: 72,
    peers: ['NY', 'FR', 'SY'],
    status: 'idle',
    mempool: [],
  },
];

export default function GossipSimulator() {
  const [nodes, setNodes] = useState<Node[]>(INITIAL_NODES);
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: 'init',
      time: '00:00:00',
      type: 'info',
      message: 'Global P2P Gossip Network initialized. 8 independent nodes interconnected.',
    },
  ]);
  const [isRunning, setIsRunning] = useState(false);

  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const addLog = (message: string, type: 'info' | 'success' | 'warn' | 'error' = 'info') => {
    const time = new Date().toTimeString().split(' ')[0];
    setLogs((prev) => [...prev.slice(-30), { id: Math.random().toString(), time, type, message }]);
  };

  const toggleNodeOffline = (nodeId: string) => {
    if (isRunning) return;
    setNodes((prev) =>
      prev.map((n) => {
        if (n.id === nodeId) {
          const isOffline = n.status === 'offline';
          const newStatus = isOffline ? 'idle' : 'offline';
          addLog(
            `${n.city} (${n.name}) is now ${isOffline ? 'ONLINE' : 'OFFLINE (simulating node outage)'}`,
            isOffline ? 'info' : 'warn'
          );
          return { ...n, status: newStatus };
        }
        return n;
      })
    );
  };

  // Reset simulator state
  const resetSimulator = () => {
    setNodes(INITIAL_NODES);
    setIsRunning(false);
    addLog('Simulator reset to baseline idle state.', 'info');
  };

  // Scenario 1: Standard Valid Transaction Propagation
  const broadcastValidTx = async () => {
    if (isRunning) return;
    setIsRunning(true);
    resetSimulator();

    addLog(
      'Alice initiates payment: "Alice -> Bob 1.0 BTC" broadcasted from Jakarta node.',
      'info'
    );

    // Step 0: Jakarta accepts
    await new Promise((r) => setTimeout(r, 400));
    setNodes((prev) =>
      prev.map((n) =>
        n.id === 'JK' && n.status !== 'offline'
          ? { ...n, status: 'received-txA', mempool: ['tx_alice_bob_1btc'] }
          : n
      )
    );
    addLog('Jakarta validates signature & UTXO balance: VALID -> Added to mempool.', 'success');

    // Wave 1: Relay to Jakarta peers (SG, TY, SY)
    await new Promise((r) => setTimeout(r, 600));
    addLog(
      'Jakarta gossips transaction to 3 connected peers (Singapore, Tokyo, Sydney)...',
      'info'
    );
    setNodes((prev) =>
      prev.map((n) =>
        ['SG', 'TY', 'SY'].includes(n.id) && n.status !== 'offline'
          ? { ...n, status: 'received-txA', mempool: ['tx_alice_bob_1btc'] }
          : n
      )
    );

    // Wave 2: Relay to second hop (LN, FR, NY, SP)
    await new Promise((r) => setTimeout(r, 700));
    addLog('Peers verify and gossip outwards to London, Frankfurt, New York, São Paulo...', 'info');
    setNodes((prev) =>
      prev.map((n) =>
        ['LN', 'FR', 'NY', 'SP'].includes(n.id) && n.status !== 'offline'
          ? { ...n, status: 'received-txA', mempool: ['tx_alice_bob_1btc'] }
          : n
      )
    );

    // Completion
    await new Promise((r) => setTimeout(r, 500));
    addLog(
      'GOSSIP COMPLETE: 100% of online global nodes synchronized in 2.2 seconds! Zero central servers used.',
      'success'
    );
    setIsRunning(false);
  };

  // Scenario 2: Double-Spend Race Attack
  const simulateDoubleSpend = async () => {
    if (isRunning) return;
    setIsRunning(true);
    resetSimulator();

    addLog('ATTACK INITIATED: Malicious Alice signs two conflicting spends of Coin #4421!', 'warn');
    addLog('Tx A: "Alice -> Bob 1.0 BTC" broadcast from New York (East)', 'info');
    addLog('Tx B: "Alice -> Carol 1.0 BTC" broadcast from Singapore (West) simultaneously', 'warn');

    await new Promise((r) => setTimeout(r, 400));
    setNodes((prev) =>
      prev.map((n) => {
        if (n.id === 'NY' && n.status !== 'offline')
          return { ...n, status: 'received-txA', mempool: ['Tx A (Bob)'] };
        if (n.id === 'SG' && n.status !== 'offline')
          return { ...n, status: 'received-txB', mempool: ['Tx B (Carol)'] };
        return n;
      })
    );

    // Wave 1: Tx A spreads west; Tx B spreads east
    await new Promise((r) => setTimeout(r, 700));
    addLog('Tx A reaches London and Tokyo. Tx B reaches Jakarta and Frankfurt.', 'info');
    setNodes((prev) =>
      prev.map((n) => {
        if (['LN', 'TY'].includes(n.id) && n.status !== 'offline')
          return { ...n, status: 'received-txA', mempool: ['Tx A (Bob)'] };
        if (['JK', 'FR'].includes(n.id) && n.status !== 'offline')
          return { ...n, status: 'received-txB', mempool: ['Tx B (Carol)'] };
        return n;
      })
    );

    // Collision at remaining nodes: double-spend detected!
    await new Promise((r) => setTimeout(r, 800));
    addLog(
      'CONFLICT DETECTED: Nodes receive second transaction referencing the same unspent coin!',
      'error'
    );
    addLog(
      'Protocol Rule Enforced: First-seen rule. Nodes reject the second conflicting transaction without exception.',
      'warn'
    );
    setNodes((prev) =>
      prev.map((n) => {
        if (n.id === 'SY' && n.status !== 'offline')
          return { ...n, status: 'received-txB', mempool: ['Tx B (Carol)'] };
        if (n.id === 'SP' && n.status !== 'offline')
          return { ...n, status: 'received-txA', mempool: ['Tx A (Bob)'] };
        return n;
      })
    );

    // Consensus resolution: Miner seals Block
    await new Promise((r) => setTimeout(r, 900));
    addLog(
      'MINING EVENT: Frankfurt node mines Block #108, selecting Tx B from its local mempool!',
      'success'
    );
    setNodes((prev) =>
      prev.map((n) =>
        n.id === 'FR' && n.status !== 'offline' ? { ...n, status: 'mined-block' } : n
      )
    );

    // Chain broadcast: All nodes reorganize to the mined block
    await new Promise((r) => setTimeout(r, 800));
    addLog(
      'New Block #108 gossiped globally. Longest valid chain rule resolves race condition.',
      'success'
    );
    addLog(
      'Tx B (Carol) is PERMANENTLY CONFIRMED. Conflicting Tx A is dropped by all nodes. Double-spend defeated!',
      'success'
    );
    setNodes((prev) =>
      prev.map((n) =>
        n.status !== 'offline'
          ? { ...n, status: 'received-txB', mempool: ['Block #108 [Tx B]'] }
          : n
      )
    );

    setIsRunning(false);
  };

  return (
    <div className="my-8 rounded-2xl border border-border bg-card/60 backdrop-blur-md p-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-500 border border-blue-500/20 mb-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            Interactive Peer-to-Peer Simulator
          </div>
          <h3 className="text-xl font-bold text-foreground m-0">
            Global Gossip Protocol Simulator
          </h3>
          <p className="text-xs text-muted-foreground m-0 max-w-xl">
            Watch how transactions pulse across an 8-node worldwide mesh without a single central
            server. Click any node to toggle it offline.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={broadcastValidTx}
            disabled={isRunning}
            type="button"
            className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-primary-foreground bg-primary hover:bg-primary/90 disabled:opacity-50 transition-all shadow-sm"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            Broadcast Valid Tx
          </button>

          <button
            onClick={simulateDoubleSpend}
            disabled={isRunning}
            type="button"
            className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-amber-500 border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 disabled:opacity-50 transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            Simulate Double-Spend Attack
          </button>

          <button
            onClick={resetSimulator}
            disabled={isRunning}
            type="button"
            className="cursor-pointer px-2.5 py-2 rounded-lg text-xs border border-border text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-50 transition-colors"
            title="Reset simulation"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Network Map Visualizer */}
      <div className="relative w-full h-80 sm:h-96 rounded-xl border border-border/80 bg-slate-950/80 overflow-hidden select-none">
        {/* Subtle grid background */}
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: 'radial-gradient(circle, #38bdf8 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* World Map SVG Canvas */}
        <svg className="absolute inset-0 w-full h-full">
          {/* Render peer connection lines */}
          {nodes.map((node) =>
            node.peers.map((peerId) => {
              const peer = nodes.find((n) => n.id === peerId);
              if (!peer || node.id > peer.id) return null; // Prevent duplicate lines

              const isBothOnline = node.status !== 'offline' && peer.status !== 'offline';
              const isTxALine = node.status === 'received-txA' && peer.status === 'received-txA';
              const isTxBLine = node.status === 'received-txB' && peer.status === 'received-txB';

              return (
                <line
                  key={`${node.id}-${peer.id}`}
                  x1={`${node.x}%`}
                  y1={`${node.y}%`}
                  x2={`${peer.x}%`}
                  y2={`${peer.y}%`}
                  stroke={
                    !isBothOnline
                      ? '#334155'
                      : isTxALine
                        ? '#38bdf8'
                        : isTxBLine
                          ? '#f43f5e'
                          : '#1e293b'
                  }
                  strokeWidth={isTxALine || isTxBLine ? 2 : 1.2}
                  strokeDasharray={!isBothOnline ? '4 4' : undefined}
                  className="transition-colors duration-500"
                />
              );
            })
          )}
        </svg>

        {/* Node Points */}
        {nodes.map((node) => {
          let nodeBg = 'bg-slate-800 border-slate-700 text-slate-300';
          let pingColor = '';

          if (node.status === 'offline') {
            nodeBg = 'bg-red-950/60 border-red-800 text-red-400 line-through opacity-60';
          } else if (node.status === 'received-txA') {
            nodeBg = 'bg-sky-500/20 border-sky-400 text-sky-300 ring-2 ring-sky-400/40';
            pingColor = 'bg-sky-400';
          } else if (node.status === 'received-txB') {
            nodeBg = 'bg-rose-500/20 border-rose-400 text-rose-300 ring-2 ring-rose-400/40';
            pingColor = 'bg-rose-400';
          } else if (node.status === 'mined-block') {
            nodeBg =
              'bg-emerald-500/30 border-emerald-400 text-emerald-300 ring-4 ring-emerald-400/50';
            pingColor = 'bg-emerald-400';
          }

          return (
            <div
              key={node.id}
              onClick={() => toggleNodeOffline(node.id)}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
              title={`Click to toggle ${node.city} node offline`}
            >
              {pingColor && (
                <span
                  className={`absolute -inset-1 rounded-full ${pingColor} opacity-75 animate-ping`}
                />
              )}
              <div
                className={`relative px-2 py-1 rounded-lg border font-mono text-[11px] font-semibold transition-all duration-300 flex items-center gap-1.5 shadow-lg group-hover:scale-110 ${nodeBg}`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    node.status === 'offline'
                      ? 'bg-red-500'
                      : node.status === 'mined-block'
                        ? 'bg-emerald-400'
                        : node.status === 'received-txA'
                          ? 'bg-sky-400'
                          : node.status === 'received-txB'
                            ? 'bg-rose-400'
                            : 'bg-emerald-500/60'
                  }`}
                />
                <span>{node.city}</span>
              </div>
            </div>
          );
        })}

        {/* Legend */}
        <div className="absolute bottom-2.5 left-2.5 p-2 rounded-lg bg-slate-900/90 border border-slate-800 text-[10px] font-mono text-slate-300 flex items-center gap-3 backdrop-blur-sm">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-slate-500" /> Idle
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-sky-400" /> Tx A (Bob)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-400" /> Tx B (Carol)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400" /> Mined Block
          </span>
          <span className="text-slate-500 hidden sm:inline">
            | Click city to simulate node outage
          </span>
        </div>
      </div>

      {/* Network Activity Console Log */}
      <div className="mt-4 p-3 rounded-xl border border-border bg-slate-950 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2 text-slate-400 text-[11px]">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            P2P Protocol Stream
          </span>
          <span className="text-[10px] text-slate-500">Live Consensus Messages</span>
        </div>

        <div className="h-28 overflow-y-auto space-y-1 pr-1">
          {logs.map((log) => {
            let textColor = 'text-slate-300';
            if (log.type === 'success') textColor = 'text-emerald-400 font-semibold';
            if (log.type === 'warn') textColor = 'text-amber-400';
            if (log.type === 'error') textColor = 'text-rose-400 font-bold';

            return (
              <div key={log.id} className="leading-snug flex items-start gap-2">
                <span className="text-slate-500 shrink-0 text-[10px]">{log.time}</span>
                <span className={textColor}>{log.message}</span>
              </div>
            );
          })}
          <div ref={logsEndRef} />
        </div>
      </div>
    </div>
  );
}
