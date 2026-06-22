import Link from 'next/link';
import { GitCompare, ArrowRight } from 'lucide-react';

export function CompareToolCTA() {
  return (
    <section className="container mx-auto px-4 py-8">
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 md:p-12 text-white text-center">
        <div className="absolute inset-0 bg-[url('/images/grid.svg')] opacity-10" />
        <div className="relative">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-4">
            <GitCompare className="h-8 w-8" />
          </div>
          <h2 className="text-3xl font-bold mb-3">Compare Prop Firms Side-by-Side</h2>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Select up to 4 prop firms and instantly compare funding sizes, profit splits, drawdown rules, fees, and more in a detailed comparison table.
          </p>
          <Link
            href="/compare"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-colors"
          >
            Start Comparing <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
