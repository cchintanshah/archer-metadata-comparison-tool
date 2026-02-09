// ==========================================
// Archer Comparison Tool - Main App
// ==========================================

import { Header } from '@/components/Header';
import { EnvironmentSelector } from '@/components/EnvironmentSelector';
import { ActionBar } from '@/components/ActionBar';
import { ResultsSummary } from '@/components/ResultsSummary';
import { ResultsTabs } from '@/components/ResultsTabs';
import { EnvironmentDialog } from '@/components/EnvironmentDialog';
import { CollectionDialog } from '@/components/CollectionDialog';
import { useAppStore } from '@/store/appStore';

export function App() {
  const { summary } = useAppStore();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Environment Selection */}
        <EnvironmentSelector />

        {/* Action Bar */}
        <ActionBar />

        {/* Results */}
        {summary && (
          <>
            <ResultsSummary />
            <ResultsTabs />
          </>
        )}

        {/* Empty State */}
        {!summary && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
              <svg 
                className="w-8 h-8 text-blue-600" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Ready to Compare
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Select source and target environments above, configure your collection options, 
              and click "Compare Environments" to analyze the differences.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 py-6 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500">
          <p>Archer Comparison Tool • Compare RSA Archer GRC Environments</p>
          <p className="mt-1 text-xs">
            Currently running in demo mode with mock data. 
            <a href="#setup" className="text-blue-600 hover:underline ml-1">
              Connect to .NET backend for real API integration
            </a>
          </p>
        </div>
      </footer>

      {/* Dialogs */}
      <EnvironmentDialog />
      <CollectionDialog />
    </div>
  );
}
