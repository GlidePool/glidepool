import { Link } from "wouter";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5 text-center px-4">
      <div className="w-14 h-14 border border-red-500/20 flex items-center justify-center">
        <AlertCircle className="w-6 h-6 text-red-400" />
      </div>
      <div>
        <div className="font-mono text-[9px] text-white/20 uppercase tracking-widest mb-2">Error</div>
        <h1 className="text-xl font-bold tracking-tight mb-2">404 - Page Not Found</h1>
        <p className="font-mono text-[10px] text-white/30 max-w-xs leading-relaxed">
          The page you're looking for doesn't exist or has been moved.
        </p>
      </div>
      <Link href="/">
        <button className="font-mono text-[10px] text-primary/70 hover:text-primary border border-primary/20 px-4 py-2 transition-colors">
          ← Back to Home
        </button>
      </Link>
    </div>
  );
}
