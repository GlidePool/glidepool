import { Link, useLocation } from "wouter";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useEffect, useState } from "react";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const isHome = location === "/";
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!isHome) { setScrolled(true); return; }
    setScrolled(window.scrollY > 60);
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  const navItems = [
    { href: "/", label: "Overview", code: "01" },
    { href: "/pools", label: "Pools", code: "02" },
    { href: "/positions", label: "Positions", code: "03" },
    { href: "/advisor", label: "AI Advisor", code: "04" },
  ];

  const headerOpaque = !isHome || scrolled;

  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex flex-col font-sans">
      <header
        className={`${isHome ? "fixed" : "sticky"} top-0 left-0 right-0 z-50 transition-all duration-300 ${
          headerOpaque
            ? "border-b border-white/[0.06] backdrop-blur-xl"
            : "border-b border-transparent"
        }`}
        style={{ background: headerOpaque ? "rgba(8, 8, 8, 0.88)" : "transparent" }}
      >
        <div className="container mx-auto px-6 h-14 flex items-center justify-between gap-8">
          <div className="flex items-center gap-10">
            <Link href="/" className="flex items-center gap-2.5 group shrink-0">
              <img src="/logo.png" alt="GlidePool" className="w-7 h-7 object-contain drop-shadow-[0_0_6px_rgba(0,245,100,0.5)] transition-all group-hover:drop-shadow-[0_0_10px_rgba(0,245,100,0.8)]" />
              <span className="font-bold text-base tracking-tight">GlidePool</span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive =
                  location === item.href ||
                  (location.startsWith(item.href) && item.href !== "/");
                return (
                  <Link key={item.href} href={item.href}>
                    <div
                      className={`px-3.5 py-1.5 rounded text-xs font-mono tracking-wide cursor-pointer transition-all ${
                        isActive
                          ? "text-primary bg-primary/8 border border-primary/20"
                          : "text-white/50 hover:text-white/90 hover:bg-white/[0.05]"
                      }`}
                    >
                      <span className={isActive ? "text-primary/60" : "text-white/25"}>
                        [{item.code}]
                      </span>{" "}
                      {item.label}
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>

          <ConnectButton />
        </div>
      </header>

      <main className={`flex-1 ${isHome ? "" : "container mx-auto px-6 py-8"}`}>
        {children}
      </main>

      <footer className="border-t border-white/[0.05] py-5">
        <div className="container mx-auto px-6 flex items-center justify-between">
          <span className="font-mono text-xs text-white/20">GlidePool — Maverick V2 AI Advisor</span>
          <span className="font-mono text-xs text-white/20">Base Mainnet</span>
        </div>
      </footer>
    </div>
  );
}
