// ==========================================
// Action Bar Component
// ==========================================

import { Settings, Play, Download, Loader2 } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { collectMetadata } from '@/services/metadataCollector';
import { compareMetadata, generateSummary } from '@/services/comparisonEngine';
import { exportToExcel } from '@/services/excelExporter';
import { cn } from '@/utils/cn';

export function ActionBar() {
  const {
    environments,
    sourceEnvironmentId,
    targetEnvironmentId,
    collectionOptions,
    isComparing,
    comparisonProgress,
    comparisonStatus,
    results,
    summary,
    setShowCollectionDialog,
    setComparing,
    setComparisonProgress,
    setResults,
  } = useAppStore();

  const sourceEnv = environments.find(e => e.id === sourceEnvironmentId);
  const targetEnv = environments.find(e => e.id === targetEnvironmentId);
  const canCompare = sourceEnv && targetEnv && !isComparing;
  const hasResults = results.length > 0 && summary;

  const handleCompare = async () => {
    if (!sourceEnv || !targetEnv) return;

    setComparing(true);
    setComparisonProgress(0, 'Initializing comparison...');

    try {
      // Collect from source
      setComparisonProgress(10, `Connecting to ${sourceEnv.displayName}...`);
      const sourceMetadata = await collectMetadata(
        sourceEnv,
        collectionOptions,
        true,
        (msg, prog) => setComparisonProgress(10 + (prog * 0.35), msg)
      );

      // Collect from target
      setComparisonProgress(50, `Connecting to ${targetEnv.displayName}...`);
      const targetMetadata = await collectMetadata(
        targetEnv,
        collectionOptions,
        false,
        (msg, prog) => setComparisonProgress(50 + (prog * 0.35), msg)
      );

      // Compare
      setComparisonProgress(90, 'Analyzing differences...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const comparisonResults = compareMetadata(sourceMetadata, targetMetadata);
      const comparisonSummary = generateSummary(comparisonResults);

      setResults(comparisonResults, comparisonSummary);
    } catch (error) {
      console.error('Comparison failed:', error);
      setComparing(false);
      setComparisonProgress(0, 'Comparison failed. Please try again.');
    }
  };

  const handleExport = () => {
    if (!summary || !sourceEnv || !targetEnv) return;

    exportToExcel({
      sourceName: sourceEnv.displayName,
      targetName: targetEnv.displayName,
      results,
      summary,
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex flex-wrap items-center gap-4">
        {/* Configure Button */}
        <button
          onClick={() => setShowCollectionDialog(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
        >
          <Settings className="w-5 h-5" />
          Configure Collection
        </button>

        {/* Compare Button */}
        <button
          onClick={handleCompare}
          disabled={!canCompare}
          className={cn(
            "flex items-center gap-2 px-6 py-2.5 font-medium rounded-lg transition-all",
            canCompare
              ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          )}
        >
          {isComparing ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Play className="w-5 h-5" />
          )}
          {isComparing ? 'Comparing...' : 'Compare Environments'}
        </button>

        {/* Export Button */}
        <button
          onClick={handleExport}
          disabled={!hasResults}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 font-medium rounded-lg transition-colors",
            hasResults
              ? "bg-green-600 text-white hover:bg-green-700"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          )}
        >
          <Download className="w-5 h-5" />
          Export to Excel
        </button>

        {/* Progress Indicator */}
        {isComparing && (
          <div className="flex-1 ml-4">
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-gray-200 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${comparisonProgress}%` }}
                />
              </div>
              <span className="text-sm text-gray-600 whitespace-nowrap">
                {Math.round(comparisonProgress)}%
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">{comparisonStatus}</p>
          </div>
        )}
      </div>

      {/* Selected Metadata Types Summary */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-gray-500">Collecting:</span>
          {collectionOptions.includeModules && (
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">Modules</span>
          )}
          {collectionOptions.includeFields && (
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">Fields</span>
          )}
          {collectionOptions.includeLayouts && (
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">Layouts</span>
          )}
          {collectionOptions.includeValuesLists && (
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">Values Lists</span>
          )}
          {collectionOptions.includeDDERules && (
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">DDE Rules</span>
          )}
          {collectionOptions.includeReports && (
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">Reports</span>
          )}
          {collectionOptions.includeDashboards && (
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">Dashboards</span>
          )}
          {collectionOptions.includeRoles && (
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">Roles</span>
          )}
          {collectionOptions.includeDataFeeds && (
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">Data Feeds</span>
          )}
        </div>
      </div>
    </div>
  );
}
