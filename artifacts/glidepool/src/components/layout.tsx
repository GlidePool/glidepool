import { Link, useLocation } from "wouter";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Activity, Layers, PieChart } from "lucide-react";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Overview", icon: Activity },
    { href: "/pools", label: "Pools", icon: Layers },
    { href: "/positions", label: "Positions", icon: PieChart },
  ];

  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex flex-col font-sans dark">
      <header className="border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 text-primary font-bold text-xl tracking-tight">
              <span className="w-8 h-8 rounded bg-primary text-primary-foreground flex items-center justify-center font-mono font-black shadow-[0_0_15px_rgba(0,255,255,0.4)]">G</span>
              GlidePool
            </Link>
            
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <div className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer ${
                    location === item.href || (location.startsWith(item.href) && item.href !== "/") 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  }`}>
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </div>
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <ConnectButton />
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
