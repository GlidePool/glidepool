import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { base } from '@reown/appkit/networks';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import AgentSetup from "@/pages/agent-setup";
import Monitor from "@/pages/monitor";
import Pools from "@/pages/pools";
import PoolDetail from "@/pages/pool-detail";
import Positions from "@/pages/positions";
import PositionDetail from "@/pages/position-detail";
import Advisor from "@/pages/advisor";
import CliGuide from "@/pages/cli-guide";
import Settings from "@/pages/settings";
import CreatePool from "@/pages/create-pool";
import { Layout } from "@/components/layout";

const queryClient = new QueryClient();

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '';

export const wagmiAdapter = new WagmiAdapter({
  networks: [base],
  projectId,
});

createAppKit({
  adapters: [wagmiAdapter],
  networks: [base],
  defaultNetwork: base,
  projectId,
  metadata: {
    name: 'GlidePool',
    description: 'Autonomous DLMM agent platform for Maverick V2 liquidity on Base mainnet',
    url: 'https://glidepool.com',
    icons: ['https://glidepool.com/logo.png'],
  },
  themeMode: 'dark',
  features: {
    analytics: false,
    email: false,
    socials: false,
    swaps: false,
    onramp: false,
  },
  themeVariables: {
    '--w3m-accent': '#00f564',
    '--w3m-border-radius-master': '0px',
    '--w3m-font-family': 'monospace',
  },
});

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/pools" component={Pools} />
        <Route path="/pools/create" component={CreatePool} />
        <Route path="/pools/:poolAddress" component={PoolDetail} />
        <Route path="/positions" component={Positions} />
        <Route path="/positions/:nftId" component={PositionDetail} />
        <Route path="/advisor" component={Advisor} />
        <Route path="/agent/setup" component={AgentSetup} />
        <Route path="/monitor" component={Monitor} />
        <Route path="/cli" component={CliGuide} />
        <Route path="/settings" component={Settings} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiAdapter.wagmiConfig}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
}

export default App;
