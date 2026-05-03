'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV = [
  { href: '/',            emoji: '🏠', label: 'Dashboard'   },
  { href: '/marketplace', emoji: '🛒', label: 'Marketplace' },
  { href: '/agents',      emoji: '🤖', label: 'Agents'      },
  { href: '/simulate',    emoji: '⚡', label: 'Simulate'    },
  { href: '/settings',    emoji: '🔑', label: 'Settings'    },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-zinc-900 border-r border-zinc-800
                      flex flex-col z-10">
      {/* Logo */}
      <div className="p-6 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌱</span>
          <div>
            <p className="font-bold text-white">AIX Studio</p>
            <p className="text-xs text-zinc-500">v0.369</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {NAV.map(item => {
          const active = pathname === item.href ||
                         (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm
                transition-all duration-150
                ${ active
                  ? 'bg-blue-600/20 text-blue-300 border border-blue-700/50'
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200' }`}>
              <span className="text-lg">{item.emoji}</span>
              <span>{item.label}</span>
              {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-zinc-800">
        <p className="text-xs text-zinc-600 text-center">
          الإبداع الحقيقي مش إنك تكتب كود أكتر…
        </p>
      </div>
    </aside>
  );
}
