import Link from 'next/link';
import { Home, Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
      <div className="glass-panel-heavy p-10 rounded-3xl border border-white/5 max-w-md w-full">
        <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-8 rotate-12">
          <Compass className="w-10 h-10 text-[var(--color-primary)] -rotate-12" />
        </div>
        
        <h1 className="text-6xl font-black text-white mb-4">404</h1>
        <h2 className="text-xl font-bold text-gray-300 mb-2">Protocol Path Not Found</h2>
        <p className="text-gray-500 mb-10 text-sm leading-relaxed">
          The requested agent or resource does not exist in the current AIX coordinate system.
        </p>

        <Link
          href="/"
          className="flex items-center justify-center gap-2 w-full py-4 rounded-full bg-[var(--color-primary)] text-black font-bold hover:brightness-110 transition shadow-[0_0_25px_rgba(57,255,20,0.2)]"
        >
          <Home className="w-5 h-5" />
          Return Home
        </Link>
      </div>
    </div>
  );
}
