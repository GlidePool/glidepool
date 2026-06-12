import { WagmiProvider, createConfig, http } from 'wagmi';
import { base } from 'wagmi/chains';
import { RainbowKitProvider, getDefaultConfig, darkTheme } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

// Import pages
import Landing from "@/pages/landing";
import Pools from "@/pages/pools";
import PoolDetail from "@/pages/pool-detail";
import Positions from "@/pages/positions";
import PositionDetail from "@/pages/position-detail";
import Advisor from "@/pages/advisor";
import { Layout } from "@/components/layout";

const queryClient = new QueryClient();

const wagmiConfig = getDefaultConfig({
  appName: 'GlidePool',
  projectId: 'GLIDEPOOL_DEMO_ID',
  chains: [base],
  transports: { [base.id]: http('https://mainnet.base.org') }
});

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/pools" component={Pools} />
        <Route path="/pools/:poolAddress" component={PoolDetail} />
        <Route path="/positions" component={Positions} />
        <Route path="/positions/:nftId" component={PositionDetail} />
        <Route path="/advisor" component={Advisor} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>
        <RainbowKitProvider theme={darkTheme({ accentColor: 'hsl(191 97% 55%)', accentColorForeground: 'hsl(222 47% 6%)' })}>
          <TooltipProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
            <Toaster />
          </TooltipProvider>
        </RainbowKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
}

export default App;
