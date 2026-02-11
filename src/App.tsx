// ==========================================
// Archer Comparison Tool - Main Application
// ==========================================

import { useAppStore } from './store/appStore';
import { Header } from './components/Header';
import { EnvironmentSelector } from './components/EnvironmentSelector';
import { ActionBar } from './components/ActionBar';
import { ResultsSummary } from './components/ResultsSummary';
import { ResultsTabs } from './components/ResultsTabs';
import { EnvironmentDialog } from './components/EnvironmentDialog';
import { CollectionOptionsDialog } from './components/CollectionOptionsDialog';

function App() {
  const { 
    tabResults, 
    comparisonSummary, 
    error, 
    setError 
  } = useAppStore();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <Header />

      {/* Environment Selection */}
      <EnvironmentSelector />

      {/* Action Bar */}
      <ActionBar />

      {/* Error Display */}
      {error && (
        <div className="mx-4 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2 text-red-700">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-500 hover:text-red-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className="p-4 space-y-4">
        {/* Results Summary */}
        <ResultsSummary />

        {/* Results Tabs */}
        {comparisonSummary && comparisonSummary.totalItems > 0 && (
          <ResultsTabs tabResults={tabResults} summary={comparisonSummary} />
        )}
      </div>

      {/* Dialogs */}
      <EnvironmentDialog />
      <CollectionOptionsDialog />
    </div>
  );
}

export default App;
