'use client';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Moon, Sun, Search, Menu, X, TrendingUp, Star, GitCompare, Tag } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { searchApi } from '@/lib/api';
import { useDebounce } from '@/hooks/useDebounce';
import Image from 'next/image';

const navLinks = [
  { href: '/firms', label: 'Prop Firms' },
  { href: '/compare', label: 'Compare', icon: GitCompare },
  { href: '/top-rated', label: 'Top Rated', icon: Star },
  { href: '/trending', label: 'Trending', icon: TrendingUp },
  { href: '/offers', label: 'Offers', icon: Tag },
  { href: '/brokers', label: 'Brokers' },
  { href: '/blog', label: 'Blog' },
];

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 300);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (debouncedSearch.length >= 2) {
      searchApi.search(debouncedSearch).then(r => {
        setSearchResults(r.data);
        setSearchOpen(true);
      });
    } else {
      setSearchResults(null);
      setSearchOpen(false);
    }
  }, [debouncedSearch]);

  // Close search on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl shrink-0">
            <span className="text-gradient">PropFirmHub</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                {link.icon && <link.icon className="h-3.5 w-3.5" />}
                {link.label}
              </Link>
            ))}
          </div>

          {/* Search */}
          <div ref={searchRef} className="relative flex-1 max-w-sm hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search firms, brokers..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {searchOpen && searchResults && (
              <div className="absolute top-full mt-2 w-full bg-popover border border-border rounded-lg shadow-lg overflow-hidden z-50">
                {searchResults.firms?.length > 0 && (
                  <div className="p-2">
                    <p className="text-xs font-semibold text-muted-foreground px-2 py-1">Prop Firms</p>
                    {searchResults.firms.map((f: any) => (
                      <Link key={f.id} href={`/firms/${f.slug}`} className="flex items-center gap-2 px-2 py-2 rounded hover:bg-accent text-sm" onClick={() => setSearchOpen(false)}>
                        {f.logo && <Image src={f.logo} alt={f.name} width={20} height={20} className="rounded" />}
                        <span>{f.name}</span>
                        <span className="ml-auto text-muted-foreground text-xs">★ {f.averageRating.toFixed(1)}</span>
                      </Link>
                    ))}
                  </div>
                )}
                {searchResults.brokers?.length > 0 && (
                  <div className="p-2 border-t border-border">
                    <p className="text-xs font-semibold text-muted-foreground px-2 py-1">Brokers</p>
                    {searchResults.brokers.map((b: any) => (
                      <Link key={b.id} href={`/brokers/${b.slug}`} className="flex items-center gap-2 px-2 py-2 rounded hover:bg-accent text-sm" onClick={() => setSearchOpen(false)}>
                        <span>{b.name}</span>
                      </Link>
                    ))}
                  </div>
                )}
                {searchResults.firms?.length === 0 && searchResults.brokers?.length === 0 && (
                  <p className="text-sm text-muted-foreground p-4 text-center">No results found</p>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-md hover:bg-accent transition-colors"
              aria-label="Toggle theme"
            >
              <Sun className="h-4 w-4 dark:hidden" />
              <Moon className="h-4 w-4 hidden dark:block" />
            </button>

            {/* Mobile menu toggle */}
            <button
              className="lg:hidden p-2 rounded-md hover:bg-accent transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-border bg-background">
          <div className="container px-4 py-3 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium hover:bg-accent transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {link.icon && <link.icon className="h-4 w-4" />}
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
