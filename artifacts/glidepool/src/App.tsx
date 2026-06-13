import { WagmiProvider, createConfig, http } from 'wagmi';
import { base } from 'wagmi/chains';
import {
  RainbowKitProvider,
  getDefaultConfig,
  darkTheme,
  type DisclaimerComponent,
} from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import Landing from "@/pages/landing";
import Pools from "@/pages/pools";
import PoolDetail from "@/pages/pool-detail";
import Positions from "@/pages/positions";
import PositionDetail from "@/pages/position-detail";
import Advisor from "@/pages/advisor";
import { Layout } from "@/components/layout";

const queryClient = new QueryClient();

const Disclaimer: DisclaimerComponent = ({ Text, Link }) => (
  <Text>
    By connecting, you agree to GlidePool&apos;s{' '}
    <Link href="https://glidepool.xyz/terms">Terms of Service</Link>.
    GlidePool is non-custodial — your keys, your assets.
  </Text>
);

const wagmiConfig = getDefaultConfig({
  appName: 'GlidePool',
  appDescription: 'AI advisor for Maverick V2 DLMM liquidity on Base mainnet',
  appUrl: 'https://glidepool.com',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID ?? '',
  chains: [base],
  transports: { [base.id]: http('https://mainnet.base.org') },
});

const glideTheme = darkTheme({
  accentColor: 'hsl(145 100% 48%)',
  accentColorForeground: 'hsl(222 47% 6%)',
  borderRadius: 'medium',
  fontStack: 'system',
  overlayBlur: 'small',
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
        <RainbowKitProvider
          theme={glideTheme}
          locale="en-US"
          appInfo={{
            appName: 'GlidePool',
            disclaimer: Disclaimer,
          }}
        >
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
