// ==========================================
// Header Component
// ==========================================

import { GitCompareArrows } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-gradient-to-r from-blue-700 to-blue-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/10 rounded-lg">
            <GitCompareArrows className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Archer Comparison Tool</h1>
            <p className="text-blue-200 text-sm">Compare RSA Archer GRC Environments</p>
          </div>
        </div>
      </div>
    </header>
  );
}
