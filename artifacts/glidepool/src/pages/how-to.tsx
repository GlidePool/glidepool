import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

const GUIDES = [
  {
    title: "How to deploy your first agent",
    steps: [
      { n: "01", label: "Connect your wallet", body: "Click \"Connect Wallet\" in the top nav. Select MetaMask, Coinbase Wallet, or any WalletConnect-compatible wallet. Make sure you are on Base Mainnet (chain ID 8453). GlidePool will not prompt you to sign anything at this step." },
      { n: "02", label: "Browse available pools", body: "Go to Pools. Each card shows TVL, current price, active tick, and fee rate — all read live from Base Mainnet. Pick a pool that matches your risk profile. WETH/USDC and DAI/USDC are good starting points for lower volatility." },
      { n: "03", label: "Open Deploy Agent", body: "Click \"Deploy Agent\" in the nav or from a pool detail page. Select the pool you want the agent to monitor." },
      { n: "04", label: "Choose a strategy", body: "Conservative (Static bins) — tight range, no auto-rebalance. Best for stable pairs.\nBalanced (Both mode) — follows price both ways. Suitable for most pairs.\nAgressive (Right/Left mode) — directional trend-following. Higher fee capture, higher IL risk." },
      { n: "05", label: "Set budget and interval", body: "Budget USDC — the maximum USDC the agent is authorized to use for x402 AI calls per cycle. If x402 is disabled on the server, this field is informational only.\nAnalysis interval — how often (in seconds) the agent requests a new Claude Opus 4 analysis. Minimum 30s, recommended 60–300s." },
      { n: "06", label: "Submit", body: "Click Deploy Agent. No wallet signature is required — the form POSTs your wallet address and config to the GlidePool API. Your agent is now active and the server loop begins monitoring immediately." },
      { n: "07", label: "Monitor decisions", body: "Go to Monitor. You will see LLM decisions appearing within the first analysis interval. Each decision shows the action (hold, rebalance, withdraw), risk level, and Claude's full reasoning. If a transaction proposal is generated, a Sign button appears — click it to approve the on-chain action with your wallet." },
    ],
  },
  {
    title: "How to add a Clanker token pool",
    steps: [
      { n: "01", label: "Find the token contract address", body: "Go to the Clanker UI or search on Basescan (basescan.org). Copy the ERC20 contract address of the Clanker token you want to pair. It will look like 0x… and be deployed on Base Mainnet." },
      { n: "02", label: "Check if a Maverick V2 pool already exists", body: "Search Basescan for the token address and look for interactions with the Maverick V2 Factory (0x0A7e848Aca42d879EF06507Fca0E7b33A0a63c1e). If a pool exists, copy its address — you can register it directly without paying gas to deploy a new one." },
      { n: "03", label: "Go to Create Pool", body: "In GlidePool, click Create Pool in the nav or footer." },
      { n: "04", label: "Enter token addresses", body: "Paste the Clanker token address as Token A. Enter your pair token (WETH, USDC, etc.) as Token B. GlidePool reads the ERC20 symbol, name, and decimals on-chain and shows a green confirmation badge when the address is valid." },
      { n: "05", label: "Configure the pool", body: "Choose a fee tier (0.10% or 1.00% is typical for meme/Clanker tokens — higher volatility = higher fee). Select Both mode for bidirectional price following. Tick spacing auto-suggests based on fee tier — you can adjust." },
      { n: "06", label: "Deploy and register", body: "Click Create Pool on Base Mainnet. Sign the transaction in your wallet. After confirmation, the new pool address is shown — click Register Pool with GlidePool to add it to the explorer. It will appear in the Pools list immediately." },
    ],
  },
  {
    title: "How to review and approve a rebalance",
    steps: [
      { n: "01", label: "Wait for a rebalance recommendation", body: "When Claude Opus 4 detects that your pool's active tick has drifted outside the optimal bin range, it will recommend a rebalance action. This appears in the Monitor page as a pending decision." },
      { n: "02", label: "Read the reasoning", body: "Expand the decision to read Claude's full reasoning. It will explain the current pool state (activeTick, TVL, price), why it recommends rebalancing, and what the new bin configuration should be." },
      { n: "03", label: "Review the transaction proposal", body: "The agent builds the remove-liquidity and add-liquidity calldata. You can see the proposed bin range, withdraw percentage, and expected token amounts before signing." },
      { n: "04", label: "Sign in your wallet", body: "Click Sign in the Monitor page. Your wallet opens a transaction confirmation. Review the calldata — it calls the Maverick V2 Router on Base Mainnet. GlidePool never pre-signs or submits transactions on your behalf." },
      { n: "05", label: "Track on Basescan", body: "After signing, a Basescan link appears in the Monitor page. The transaction is submitted from your wallet and confirmed on Base Mainnet in ~2 seconds." },
    ],
  },
  {
    title: "How to pause or stop an agent",
    steps: [
      { n: "01", label: "Go to Monitor", body: "The Monitor page lists all your active agents and their current status." },
      { n: "02", label: "Pause", body: "Click Pause on an agent to suspend the analysis loop. The agent record and all LLM history are preserved. No on-chain action occurs — pausing only stops the server-side analysis loop." },
      { n: "03", label: "Resume", body: "Click Resume to restart the loop from where it left off. The agent picks up on the next analysis cycle." },
      { n: "04", label: "Stop permanently", body: "Click Stop to permanently halt the agent. The LLM decision history is retained for review. You can create a new agent for the same pool at any time." },
    ],
  },
];

function Guide({ guide }: { guide: typeof GUIDES[0] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-white/[0.10] overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/[0.02] transition-colors"
      >
        <span className="font-bold text-sm text-white/80">{guide.title}</span>
        {open
          ? <ChevronDown className="w-4 h-4 text-white/30 shrink-0" />
          : <ChevronRight className="w-4 h-4 text-white/30 shrink-0" />}
      </button>

      {open && (
        <div className="border-t border-white/[0.06] divide-y divide-white/[0.05]">
          {guide.steps.map((step) => (
            <div key={step.n} className="flex gap-4 px-5 py-4">
              <div className="font-mono text-[9px] text-primary/50 shrink-0 pt-0.5 w-6">{step.n}</div>
              <div className="flex flex-col gap-1 min-w-0">
                <div className="font-bold text-xs text-white/70">{step.label}</div>
                <p className="font-mono text-[10px] text-white/35 leading-relaxed whitespace-pre-line">{step.body}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function HowTo() {
  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto animate-in fade-in duration-400">

      <div className="border-b border-white/[0.06] pb-5">
        <div className="font-mono text-[9px] text-white/20 uppercase tracking-widest mb-1">Guides</div>
        <h1 className="text-lg sm:text-xl font-bold tracking-tight">How-To Guides</h1>
        <p className="font-mono text-[10px] text-white/35 mt-0.5">
          Step-by-step walkthroughs for the most common GlidePool tasks.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {GUIDES.map((g) => <Guide key={g.title} guide={g} />)}
      </div>

      <div className="border border-white/[0.06] px-5 py-4 font-mono text-[10px] text-white/20 leading-relaxed">
        GlidePool is non-custodial — every on-chain action (rebalance, add/remove liquidity) requires your explicit wallet signature. The server never holds your keys or funds.
      </div>
    </div>
  );
}
