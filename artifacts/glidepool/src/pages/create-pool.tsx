import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { isAddress, getAddress } from "viem";
import { base } from "viem/chains";
import {
  ArrowLeft, Plus, Wallet2, Loader2, CheckCircle2,
  AlertCircle, ExternalLink, RefreshCw,
} from "lucide-react";
import {
  MAVERICK_V2_FACTORY, FACTORY_ABI, ERC20_READ_ABI,
} from "@/lib/maverick-abi";

// ── Fee tiers ─────────────────────────────────────────────────────────────
const FEE_TIERS = [
  { label: "0.01%",  value: BigInt("100000000000000"),  suggestTs: 1   },
  { label: "0.02%",  value: BigInt("200000000000000"),  suggestTs: 1   },
  { label: "0.05%",  value: BigInt("500000000000000"),  suggestTs: 10  },
  { label: "0.10%",  value: BigInt("1000000000000000"), suggestTs: 10  },
  { label: "0.20%",  value: BigInt("2000000000000000"), suggestTs: 50  },
  { label: "0.50%",  value: BigInt("5000000000000000"), suggestTs: 200 },
  { label: "1.00%",  value: BigInt("10000000000000000"), suggestTs: 500 },
];

// ── Pool modes (kinds) ────────────────────────────────────────────────────
const MODES = [
  { label: "Static",     value: 1,  desc: "Symmetric bins, no rebalancing" },
  { label: "Right",      value: 2,  desc: "Follows price rightward" },
  { label: "Left",       value: 4,  desc: "Follows price leftward" },
  { label: "Both",       value: 8,  desc: "Bidirectional, auto-rebalancing" },
  { label: "All Modes",  value: 15, desc: "Static + Right + Left + Both" },
];

// ── Token info hook ───────────────────────────────────────────────────────
function useTokenInfo(address: string) {
  const valid = isAddress(address);
  const addr = valid ? getAddress(address) : undefined;

  const { data: symbol, isLoading: symbolLoading } = useReadContract({
    address: addr,
    abi: ERC20_READ_ABI,
    functionName: "symbol",
    query: { enabled: !!addr },
  });
  const { data: decimals } = useReadContract({
    address: addr,
    abi: ERC20_READ_ABI,
    functionName: "decimals",
    query: { enabled: !!addr },
  });
  const { data: name } = useReadContract({
    address: addr,
    abi: ERC20_READ_ABI,
    functionName: "name",
    query: { enabled: !!addr },
  });

  return {
    valid,
    loading: symbolLoading && !!addr,
    symbol: symbol as string | undefined,
    decimals: decimals as number | undefined,
    name: name as string | undefined,
  };
}

// ── Token input component ─────────────────────────────────────────────────
function TokenInput({
  label, value, onChange,
}: { label: string; value: string; onChange: (v: string) => void }) {
  const info = useTokenInfo(value);

  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-mono text-[9px] text-white/30 uppercase tracking-widest">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="0x..."
        className="bg-black/60 border border-white/[0.10] px-4 py-3 font-mono text-xs text-white/80 placeholder:text-white/15 focus:outline-none focus:border-primary/40 transition-colors"
        spellCheck={false}
      />
      <div className="h-5 flex items-center">
        {value && !isAddress(value) && (
          <span className="font-mono text-[10px] text-red-400 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> Invalid address
          </span>
        )}
        {info.loading && (
          <span className="font-mono text-[10px] text-white/20 flex items-center gap-1">
            <Loader2 className="w-3 h-3 animate-spin" /> Reading on-chain...
          </span>
        )}
        {info.symbol && (
          <span className="font-mono text-[10px] text-primary/70 flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3" />
            <strong>{info.symbol}</strong>
            {info.name && <span className="text-white/30">({info.name})</span>}
            {info.decimals !== undefined && <span className="text-white/25">· {info.decimals} decimals</span>}
          </span>
        )}
        {isAddress(value) && !info.loading && !info.symbol && (
          <span className="font-mono text-[10px] text-amber-400/70 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> Not an ERC20 token or not on Base
          </span>
        )}
      </div>
    </div>
  );
}

// ── Register pool with GlidePool API ─────────────────────────────────────
async function registerPool(poolAddress: string, registeredBy?: string) {
  const res = await fetch("/api/pools/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ poolAddress, registeredBy }),
  });
  return res.json();
}

// ── Main page ─────────────────────────────────────────────────────────────
export default function CreatePool() {
  const { address, isConnected } = useAccount();

  const [tokenA, setTokenA] = useState("");
  const [tokenB, setTokenB] = useState("");
  const [selectedFee, setSelectedFee] = useState(1);        // index into FEE_TIERS
  const [tickSpacing, setTickSpacing] = useState(10);
  const [kinds, setKinds] = useState(8);                    // Both mode
  const [lookback, setLookback] = useState(3600);           // 1h TWAP oracle
  const [createdPool, setCreatedPool] = useState<string | null>(null);
  const [registering, setRegistering] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [registerError, setRegisterError] = useState("");

  const tokenAInfo = useTokenInfo(tokenA);
  const tokenBInfo = useTokenInfo(tokenB);

  // Auto-set tick spacing from fee suggestion
  useEffect(() => {
    setTickSpacing(FEE_TIERS[selectedFee]?.suggestTs ?? 10);
  }, [selectedFee]);

  // Sort tokens: Maverick V2 factory requires tokenA < tokenB
  const [sortedA, sortedB] = (() => {
    const a = isAddress(tokenA) ? getAddress(tokenA) : null;
    const b = isAddress(tokenB) ? getAddress(tokenB) : null;
    if (!a || !b) return [a, b];
    return a.toLowerCase() < b.toLowerCase() ? [a, b] : [b, a];
  })();

  const fee = FEE_TIERS[selectedFee]?.value ?? FEE_TIERS[1].value;
  const canCreate =
    isConnected &&
    !!sortedA &&
    !!sortedB &&
    sortedA !== sortedB &&
    tokenAInfo.symbol &&
    tokenBInfo.symbol;

  // ── wagmi write ──────────────────────────────────────────────────────────
  const createWrite = useWriteContract();
  const receipt = useWaitForTransactionReceipt({ hash: createWrite.data });

  // Parse pool address from receipt logs when TX confirmed
  useEffect(() => {
    if (receipt.isSuccess && receipt.data?.logs) {
      for (const log of receipt.data.logs) {
        if (log.address.toLowerCase() === MAVERICK_V2_FACTORY.toLowerCase()) {
          // First non-indexed word in data = pool address (padded to 32 bytes)
          const data = log.data;
          if (data && data.length >= 66) {
            const poolAddr = "0x" + data.slice(26, 66);
            if (isAddress(poolAddr)) {
              setCreatedPool(poolAddr);
              break;
            }
          }
          // Try topics[1] if indexed
          if (log.topics[1]) {
            const poolAddr = "0x" + log.topics[1].slice(-40);
            if (isAddress(poolAddr)) {
              setCreatedPool(poolAddr);
              break;
            }
          }
        }
      }
    }
  }, [receipt.isSuccess, receipt.data]);

  const handleCreate = () => {
    if (!sortedA || !sortedB) return;
    createWrite.writeContract({
      address: MAVERICK_V2_FACTORY,
      abi: FACTORY_ABI,
      functionName: "create",
      args: [
        fee as bigint,                  // feeAIn (1e18 scale)
        fee as bigint,                  // feeBIn
        tickSpacing,                    // tickSpacing
        lookback,                       // lookback seconds
        sortedA as `0x${string}`,       // tokenA (sorted lower)
        sortedB as `0x${string}`,       // tokenB (sorted higher)
        kinds,                          // kinds bitmask
        "0x0000000000000000000000000000000000000000" as `0x${string}`, // accessor = permissionless
      ],
      chainId: base.id,
    });
  };

  const handleRegister = async () => {
    if (!createdPool) return;
    setRegistering(true);
    setRegisterError("");
    try {
      const result = await registerPool(createdPool, address);
      if (result.success) {
        setRegistered(true);
      } else {
        setRegisterError(result.error ?? "Registration failed");
      }
    } catch {
      setRegisterError("Network error — try again");
    } finally {
      setRegistering(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[55vh] gap-6 text-center px-4">
        <div className="w-14 h-14 border border-white/[0.10] flex items-center justify-center">
          <Wallet2 className="w-6 h-6 text-white/25" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight mb-2">Connect your wallet</h1>
          <p className="text-sm text-white/40 max-w-xs leading-relaxed font-mono">
            Connect to create a new Maverick V2 pool on Base Mainnet.
          </p>
        </div>
        <w3m-button />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-xl mx-auto animate-in fade-in duration-400">

      {/* Breadcrumb */}
      <Link href="/pools">
        <button className="flex items-center gap-1.5 font-mono text-[10px] text-white/30 hover:text-white/70 transition-colors">
          <ArrowLeft className="w-3 h-3" /> Pools
        </button>
      </Link>

      {/* Header */}
      <div className="border-b border-white/[0.06] pb-5">
        <div className="font-mono text-[9px] text-white/20 uppercase tracking-widest mb-1">Maverick V2 · Base Mainnet</div>
        <h1 className="text-lg sm:text-xl font-bold tracking-tight flex items-center gap-2">
          <Plus className="w-5 h-5 text-primary" /> Create New Pool
        </h1>
        <p className="font-mono text-[10px] text-white/35 mt-0.5">
          Deploy a new DLMM pool for any ERC20 token pair. Fully on-chain, non-custodial.
        </p>
      </div>

      {/* ── Form ── */}
      {!receipt.isSuccess ? (
        <div className="flex flex-col gap-5">

          {/* Token Pair */}
          <div className="border border-white/[0.10] p-5 flex flex-col gap-4">
            <div className="font-mono text-[9px] text-white/25 uppercase tracking-widest">Token Pair</div>
            <TokenInput label="Token A — Contract Address" value={tokenA} onChange={setTokenA} />
            <TokenInput label="Token B — Contract Address" value={tokenB} onChange={setTokenB} />
            {sortedA && sortedB && sortedA !== tokenA.toLowerCase() && (
              <p className="font-mono text-[10px] text-amber-400/60 flex items-center gap-1.5">
                <RefreshCw className="w-3 h-3" />
                Tokens auto-sorted: Maverick V2 requires tokenA &lt; tokenB by address.
                Your pair will be {isAddress(sortedA) ? sortedA.slice(0,10) + "…" : ""} / {isAddress(sortedB) ? sortedB.slice(0,10) + "…" : ""}
              </p>
            )}
          </div>

          {/* Fee Tier */}
          <div className="border border-white/[0.10] p-5 flex flex-col gap-4">
            <div className="font-mono text-[9px] text-white/25 uppercase tracking-widest">Fee Tier</div>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-1">
              {FEE_TIERS.map((f, i) => (
                <button key={i} onClick={() => setSelectedFee(i)}
                  className={[
                    "py-2 px-1 font-mono text-[10px] border transition-all text-center",
                    selectedFee === i
                      ? "border-primary/50 bg-primary/[0.08] text-primary"
                      : "border-white/[0.08] text-white/35 hover:border-white/20 hover:text-white/60",
                  ].join(" ")}>{f.label}</button>
              ))}
            </div>
            <p className="font-mono text-[10px] text-white/20">
              Suggested tick spacing: <span className="text-white/45">{FEE_TIERS[selectedFee]?.suggestTs}</span>
            </p>
          </div>

          {/* Tick Spacing */}
          <div className="border border-white/[0.10] p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="font-mono text-[9px] text-white/25 uppercase tracking-widest">Tick Spacing</div>
              <span className="font-mono text-sm font-bold text-primary/80">{tickSpacing}</span>
            </div>
            <input
              type="range" min={1} max={2000} step={1} value={tickSpacing}
              onChange={(e) => setTickSpacing(Number(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="grid grid-cols-5 gap-1">
              {[1, 10, 50, 200, 500].map((v) => (
                <button key={v} onClick={() => setTickSpacing(v)}
                  className={[
                    "py-1.5 font-mono text-[10px] border transition-all",
                    tickSpacing === v
                      ? "border-primary/40 bg-primary/[0.06] text-primary"
                      : "border-white/[0.07] text-white/30 hover:border-white/15 hover:text-white/55",
                  ].join(" ")}>{v}</button>
              ))}
            </div>
            <p className="font-mono text-[10px] text-white/20">
              Use 1 for stablecoin pairs · 10–50 for correlated assets · 200–500 for volatile pairs
            </p>
          </div>

          {/* Pool Mode */}
          <div className="border border-white/[0.10] p-5 flex flex-col gap-4">
            <div className="font-mono text-[9px] text-white/25 uppercase tracking-widest">Pool Mode</div>
            <div className="flex flex-col gap-1.5">
              {MODES.map((m) => (
                <button key={m.value} onClick={() => setKinds(m.value)}
                  className={[
                    "flex items-center justify-between px-4 py-3 border text-left transition-all",
                    kinds === m.value
                      ? "border-primary/50 bg-primary/[0.06]"
                      : "border-white/[0.08] hover:border-white/15",
                  ].join(" ")}>
                  <div>
                    <span className={`font-mono text-xs font-bold ${kinds === m.value ? "text-primary" : "text-white/60"}`}>
                      {m.label}
                    </span>
                    <span className="font-mono text-[10px] text-white/25 ml-2">{m.desc}</span>
                  </div>
                  <span className={`font-mono text-[9px] px-2 py-0.5 border ${
                    kinds === m.value ? "border-primary/30 text-primary/60" : "border-white/[0.06] text-white/20"
                  }`}>kinds={m.value}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Advanced: Lookback */}
          <details className="border border-white/[0.08] group">
            <summary className="px-5 py-3 font-mono text-[10px] text-white/30 cursor-pointer hover:text-white/55 transition-colors list-none flex items-center justify-between">
              <span>Advanced Options</span>
              <span className="text-white/20">›</span>
            </summary>
            <div className="px-5 pb-5 flex flex-col gap-3 border-t border-white/[0.06] pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-mono text-[9px] text-white/25 uppercase tracking-widest mb-0.5">TWAP Lookback (seconds)</div>
                  <div className="font-mono text-[10px] text-white/20">Oracle window — 3600 = 1h recommended. Use 0 to disable.</div>
                </div>
                <input
                  type="number" min={0} max={86400} value={lookback}
                  onChange={(e) => setLookback(Number(e.target.value))}
                  className="bg-black/60 border border-white/[0.10] px-3 py-2 font-mono text-xs text-white/70 w-24 text-right focus:outline-none focus:border-primary/40 transition-colors"
                />
              </div>
            </div>
          </details>

          {/* Summary */}
          {canCreate && (
            <div className="border border-primary/15 bg-primary/[0.03] p-4 font-mono text-[10px] text-white/40 space-y-1.5">
              <div className="font-mono text-[9px] text-white/20 uppercase tracking-widest mb-2">Pool Summary</div>
              <div className="flex justify-between">
                <span className="text-white/25">Token A (sorted)</span>
                <span className="text-primary/70">{tokenAInfo.symbol ?? "?"} · {sortedA?.slice(0, 10)}…</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/25">Token B (sorted)</span>
                <span className="text-primary/70">{tokenBInfo.symbol ?? "?"} · {sortedB?.slice(0, 10)}…</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/25">Fee</span>
                <span>{FEE_TIERS[selectedFee]?.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/25">Tick Spacing</span>
                <span>{tickSpacing}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/25">Mode</span>
                <span>{MODES.find((m) => m.value === kinds)?.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/25">Accessor</span>
                <span className="text-white/35">0x0000…0000 (permissionless)</span>
              </div>
            </div>
          )}

          {/* Create button */}
          <button
            onClick={handleCreate}
            disabled={!canCreate || createWrite.isPending || receipt.isLoading}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 font-bold text-sm font-mono bg-primary text-[#080808] hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed glow-green"
          >
            {createWrite.isPending ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Waiting for wallet…</>
            ) : receipt.isLoading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Confirming on-chain…</>
            ) : (
              <><Plus className="w-4 h-4" /> Create Pool on Base Mainnet</>
            )}
          </button>

          {createWrite.error && (
            <div className="flex items-start gap-2 text-red-400 font-mono text-[10px] p-3 border border-red-500/20 bg-red-500/[0.04]">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>{createWrite.error.message?.slice(0, 200) ?? "Transaction rejected"}</span>
            </div>
          )}

          <p className="font-mono text-[10px] text-white/20 leading-relaxed">
            This deploys a new pool to the Maverick V2 factory on Base Mainnet. Gas fees apply (~0.001 ETH).
            GlidePool is non-custodial — you sign everything directly in your wallet.
          </p>
        </div>
      ) : (
        /* ── Success state ── */
        <div className="flex flex-col gap-5">
          <div className="border border-primary/30 bg-primary/[0.04] p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-primary shrink-0" />
              <div>
                <div className="font-bold text-base">Pool created successfully!</div>
                <div className="font-mono text-[10px] text-white/35 mt-0.5">
                  Deployed to Base Mainnet · TX confirmed
                </div>
              </div>
            </div>

            {receipt.data?.transactionHash && (
              <div className="border border-white/[0.08] p-3 flex items-center justify-between gap-2">
                <span className="font-mono text-[10px] text-white/30">TX Hash</span>
                <a
                  href={`https://basescan.org/tx/${receipt.data.transactionHash}`}
                  target="_blank" rel="noopener noreferrer"
                  className="font-mono text-[10px] text-primary/70 hover:text-primary transition-colors flex items-center gap-1"
                >
                  {receipt.data.transactionHash.slice(0, 20)}…
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            )}

            {createdPool && (
              <div className="border border-white/[0.08] p-3 flex items-center justify-between gap-2">
                <span className="font-mono text-[10px] text-white/30">Pool Address</span>
                <a
                  href={`https://basescan.org/address/${createdPool}`}
                  target="_blank" rel="noopener noreferrer"
                  className="font-mono text-[10px] text-primary/70 hover:text-primary transition-colors flex items-center gap-1"
                >
                  {createdPool.slice(0, 20)}…
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            )}

            {!createdPool && (
              <p className="font-mono text-[10px] text-white/30">
                Check the TX on BaseScan to find the new pool address in the event logs.
              </p>
            )}
          </div>

          {/* Register with GlidePool */}
          {createdPool && !registered && (
            <div className="border border-white/[0.10] p-5 flex flex-col gap-3">
              <div className="font-mono text-[9px] text-white/25 uppercase tracking-widest">Add to GlidePool Explorer</div>
              <p className="font-mono text-[10px] text-white/35 leading-relaxed">
                Register this pool so it appears in GlidePool's pool explorer and can be used with agents.
              </p>
              <button
                onClick={handleRegister}
                disabled={registering}
                className="inline-flex items-center gap-2 px-4 py-2.5 font-mono text-[10px] font-bold border border-primary/30 text-primary/80 hover:bg-primary/[0.06] transition-all disabled:opacity-50"
              >
                {registering ? <><Loader2 className="w-3 h-3 animate-spin" /> Registering…</> : <><Plus className="w-3 h-3" /> Register Pool with GlidePool</>}
              </button>
              {registerError && (
                <p className="font-mono text-[10px] text-red-400">{registerError}</p>
              )}
            </div>
          )}

          {registered && (
            <div className="border border-primary/20 bg-primary/[0.04] p-4 flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
              <p className="font-mono text-[10px] text-primary/70">Pool registered! It now appears in the Pools explorer.</p>
            </div>
          )}

          <div className="flex gap-3">
            <Link href="/pools">
              <button className="font-mono text-[10px] border border-white/[0.08] px-4 py-2 text-white/40 hover:text-white/70 hover:border-white/15 transition-all">
                ← Pool Explorer
              </button>
            </Link>
            {createdPool && (
              <Link href={`/pools/${createdPool}`}>
                <button className="font-mono text-[10px] border border-primary/25 px-4 py-2 text-primary/70 hover:text-primary hover:bg-primary/[0.05] transition-all">
                  View Pool →
                </button>
              </Link>
            )}
            {createdPool && (
              <Link href="/agent/setup">
                <button className="font-mono text-[10px] border border-primary/25 px-4 py-2 text-primary/70 hover:text-primary hover:bg-primary/[0.05] transition-all">
                  Deploy Agent →
                </button>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
