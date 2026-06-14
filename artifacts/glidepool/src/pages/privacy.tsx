export default function Privacy() {
  return (
    <div className="flex flex-col gap-8 max-w-2xl mx-auto animate-in fade-in duration-400">

      <div className="border-b border-white/[0.06] pb-5">
        <div className="font-mono text-[9px] text-white/20 uppercase tracking-widest mb-1">Legal</div>
        <h1 className="text-lg sm:text-xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="font-mono text-[10px] text-white/35 mt-0.5">Last updated: June 2026</p>
      </div>

      {[
        {
          title: "Overview",
          body: `GlidePool is a non-custodial, read-only AI advisor layer for Maverick V2 DLMM liquidity positions on Base Mainnet. We take privacy seriously. This policy explains what data we collect, why, and how it is handled.`,
        },
        {
          title: "Data We Collect",
          body: `When you use GlidePool, we collect:

· Wallet address — used as your identity to associate agents and positions. Never linked to real-world identity.
· Pool and position data — read directly from Base Mainnet on-chain. Not stored beyond the current session cache.
· Agent configuration — strategy, budget, and interval settings you submit via the Deploy Agent form. Stored in our PostgreSQL database tied to your wallet address.
· LLM conversation history — prompts sent to Claude Opus 4 and responses received, stored per-agent in the database for the Monitor page. Contains only on-chain pool data and your stated goal — no personal information.
· Usage logs — server-side request logs (IP address, timestamp, endpoint). Retained for up to 30 days for debugging purposes.`,
        },
        {
          title: "Data We Do NOT Collect",
          body: `· Private keys — never. Your wallet signs all transactions in your own browser.
· Funds or assets — GlidePool is non-custodial. We have no access to your tokens.
· Email address, phone number, or any personally identifiable information.
· Cookies or tracking pixels for advertising.
· Third-party analytics SDKs (no Google Analytics, Mixpanel, etc.).`,
        },
        {
          title: "x402 Micropayments",
          body: `If X402_ENABLED is active on the server, the AI Advisor endpoint requires a 0.05 USDC payment on Base before returning a response. The USDC transfer is verified on-chain via the Base RPC — we confirm the transaction hash, sender, and amount. The payment transaction hash is logged for audit purposes. No payment card data is ever collected.`,
        },
        {
          title: "Third-Party Services",
          body: `· Base Mainnet RPC (mainnet.base.org) — all on-chain reads go through the public Base RPC endpoint.
· Anthropic (Claude Opus 4) — pool state snapshots and user goals are sent to Anthropic's API to generate recommendations. Anthropic's own privacy policy applies to data processed by their models.
· Replit — GlidePool is hosted on Replit infrastructure. Replit's privacy policy governs infrastructure-level data handling.`,
        },
        {
          title: "Data Retention",
          body: `Agent configurations and LLM decision logs are retained as long as your agent exists. You can delete an agent at any time via the API (DELETE /api/agents/:id), which removes all associated records. Server request logs are purged after 30 days.`,
        },
        {
          title: "Your Rights",
          body: `You can request deletion of all data associated with your wallet address at any time by stopping your agents via the Monitor page. Since GlidePool does not collect personally identifiable information, there is no account to close. On-chain data (transactions you signed) is permanent by nature of the blockchain and cannot be deleted.`,
        },
        {
          title: "Changes to This Policy",
          body: `We may update this policy as the product evolves. Material changes will be noted on this page with an updated date. Continued use of GlidePool after changes constitutes acceptance.`,
        },
        {
          title: "Contact",
          body: `GlidePool is open-source software. For privacy concerns or data deletion requests, open an issue in the project repository or contact the maintainers directly via the on-chain address listed in the smart contract.`,
        },
      ].map(({ title, body }) => (
        <div key={title} className="flex flex-col gap-2">
          <h2 className="font-bold text-sm text-white/80 border-b border-white/[0.06] pb-1.5">{title}</h2>
          <p className="font-mono text-[10px] text-white/35 leading-relaxed whitespace-pre-line">{body}</p>
        </div>
      ))}

      <div className="border border-white/[0.06] px-5 py-4 font-mono text-[10px] text-white/20 leading-relaxed">
        GlidePool is non-custodial — we never hold your keys, funds, or personal data. All on-chain actions require your explicit wallet signature.
      </div>
    </div>
  );
}
