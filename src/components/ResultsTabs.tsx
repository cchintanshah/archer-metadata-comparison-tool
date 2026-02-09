// ==========================================
// Results Tabs Component
// ==========================================

import { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronUp, Filter } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { ComparisonStatus, ComparisonType, Severity } from '@/types';
import { cn } from '@/utils/cn';

type TabType = 'notInTarget' | 'notInSource' | 'mismatches' | 'matched';

interface TabConfig {
  id: TabType;
  label: string;
  status: ComparisonStatus;
  bgColor: string;
  borderColor: string;
  textColor: string;
}

export function ResultsTabs() {
  const { 
    results, 
    activeTab, 
    setActiveTab, 
    environments,
    sourceEnvironmentId,
    targetEnvironmentId 
  } = useAppStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<ComparisonType | 'all'>('all');
  const [sortColumn, setSortColumn] = useState<string>('itemName');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const sourceEnv = environments.find(e => e.id === sourceEnvironmentId);
  const targetEnv = environments.find(e => e.id === targetEnvironmentId);

  const tabs: TabConfig[] = [
    {
      id: 'notInTarget',
      label: `Not in ${targetEnv?.displayName || 'Target'}`,
      status: ComparisonStatus.MissingInTarget,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-300',
      textColor: 'text-red-700',
    },
    {
      id: 'notInSource',
      label: `Not in ${sourceEnv?.displayName || 'Source'}`,
      status: ComparisonStatus.MissingInSource,
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-300',
      textColor: 'text-orange-700',
    },
    {
      id: 'mismatches',
      label: 'Mismatches',
      status: ComparisonStatus.Mismatch,
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-300',
      textColor: 'text-yellow-700',
    },
    {
      id: 'matched',
      label: 'Matched',
      status: ComparisonStatus.Match,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-300',
      textColor: 'text-green-700',
    },
  ];

  // Get filtered results for each tab
  const tabResults = useMemo(() => {
    const counts: Record<TabType, number> = {
      notInTarget: 0,
      notInSource: 0,
      mismatches: 0,
      matched: 0,
    };

    const processedItems = new Set<string>();

    for (const result of results) {
      const key = `${result.comparisonType}::${result.itemIdentifier}::${result.status}`;
      if (result.status === ComparisonStatus.Mismatch) {
        // Count unique items for mismatches
        const itemKey = `${result.comparisonType}::${result.itemIdentifier}`;
        if (!processedItems.has(itemKey)) {
          processedItems.add(itemKey);
          counts.mismatches++;
        }
      } else if (!processedItems.has(key)) {
        processedItems.add(key);
        switch (result.status) {
          case ComparisonStatus.MissingInTarget:
            counts.notInTarget++;
            break;
          case ComparisonStatus.MissingInSource:
            counts.notInSource++;
            break;
          case ComparisonStatus.Match:
            counts.matched++;
            break;
        }
      }
    }

    return counts;
  }, [results]);

  // Filter and sort results for current tab
  const currentTabConfig = tabs.find(t => t.id === activeTab)!;
  
  const filteredResults = useMemo(() => {
    let filtered = results.filter(r => r.status === currentTabConfig.status);

    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(r =>
        r.itemName.toLowerCase().includes(search) ||
        (r.parentName?.toLowerCase().includes(search)) ||
        (r.propertyName?.toLowerCase().includes(search)) ||
        r.comparisonType.toLowerCase().includes(search)
      );
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(r => r.comparisonType === typeFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal: string | undefined;
      let bVal: string | undefined;

      switch (sortColumn) {
        case 'type':
          aVal = a.comparisonType;
          bVal = b.comparisonType;
          break;
        case 'parent':
          aVal = a.parentName || '';
          bVal = b.parentName || '';
          break;
        case 'property':
          aVal = a.propertyName || '';
          bVal = b.propertyName || '';
          break;
        case 'severity':
          aVal = a.severity;
          bVal = b.severity;
          break;
        default:
          aVal = a.itemName;
          bVal = b.itemName;
      }

      const comparison = (aVal || '').localeCompare(bVal || '');
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [results, currentTabConfig.status, searchTerm, typeFilter, sortColumn, sortDirection]);

  // Get unique types for filter
  const availableTypes = useMemo(() => {
    const types = new Set<ComparisonType>();
    results
      .filter(r => r.status === currentTabConfig.status)
      .forEach(r => types.add(r.comparisonType));
    return Array.from(types).sort();
  }, [results, currentTabConfig.status]);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ column }: { column: string }) => {
    if (sortColumn !== column) return null;
    return sortDirection === 'asc' ? 
      <ChevronUp className="w-4 h-4" /> : 
      <ChevronDown className="w-4 h-4" />;
  };

  const getSeverityBadge = (severity: Severity) => {
    const styles = {
      [Severity.Critical]: 'bg-red-100 text-red-700',
      [Severity.Warning]: 'bg-yellow-100 text-yellow-700',
      [Severity.Info]: 'bg-blue-100 text-blue-700',
    };
    return (
      <span className={cn('px-2 py-0.5 rounded text-xs font-medium', styles[severity])}>
        {severity}
      </span>
    );
  };

  if (results.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Tab Headers */}
      <div className="flex border-b border-gray-200 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex-1 min-w-[120px] px-4 py-3 text-sm font-medium transition-colors',
              'border-b-2 -mb-px whitespace-nowrap',
              activeTab === tab.id
                ? `${tab.bgColor} ${tab.borderColor} ${tab.textColor}`
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            )}
          >
            {tab.label}
            <span className={cn(
              'ml-2 px-2 py-0.5 rounded-full text-xs',
              activeTab === tab.id ? 'bg-white/50' : 'bg-gray-100'
            )}>
              {tabResults[tab.id]}
            </span>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="p-4 border-b border-gray-200 flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as ComparisonType | 'all')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            {availableTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className={cn('text-sm', currentTabConfig.bgColor)}>
            <tr>
              <th 
                className="text-left px-4 py-3 font-medium cursor-pointer hover:bg-black/5"
                onClick={() => handleSort('type')}
              >
                <div className="flex items-center gap-1">
                  Type <SortIcon column="type" />
                </div>
              </th>
              <th 
                className="text-left px-4 py-3 font-medium cursor-pointer hover:bg-black/5"
                onClick={() => handleSort('parent')}
              >
                <div className="flex items-center gap-1">
                  Parent <SortIcon column="parent" />
                </div>
              </th>
              <th 
                className="text-left px-4 py-3 font-medium cursor-pointer hover:bg-black/5"
                onClick={() => handleSort('itemName')}
              >
                <div className="flex items-center gap-1">
                  Item Name <SortIcon column="itemName" />
                </div>
              </th>
              {activeTab === 'mismatches' && (
                <>
                  <th 
                    className="text-left px-4 py-3 font-medium cursor-pointer hover:bg-black/5"
                    onClick={() => handleSort('property')}
                  >
                    <div className="flex items-center gap-1">
                      Property <SortIcon column="property" />
                    </div>
                  </th>
                  <th className="text-left px-4 py-3 font-medium">
                    {sourceEnv?.displayName || 'Source'} Value
                  </th>
                  <th className="text-left px-4 py-3 font-medium">
                    {targetEnv?.displayName || 'Target'} Value
                  </th>
                </>
              )}
              <th 
                className="text-left px-4 py-3 font-medium cursor-pointer hover:bg-black/5"
                onClick={() => handleSort('severity')}
              >
                <div className="flex items-center gap-1">
                  Severity <SortIcon column="severity" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredResults.length === 0 ? (
              <tr>
                <td colSpan={activeTab === 'mismatches' ? 7 : 4} className="px-4 py-8 text-center text-gray-500">
                  No results found
                </td>
              </tr>
            ) : (
              filteredResults.slice(0, 100).map((result) => (
                <tr 
                  key={result.id} 
                  className={cn(
                    'border-b border-gray-100 hover:bg-gray-50 transition-colors',
                    result.severity === Severity.Critical && 'bg-red-50/30'
                  )}
                >
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                      {result.comparisonType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-sm">
                    {result.parentName || '-'}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {result.itemName}
                  </td>
                  {activeTab === 'mismatches' && (
                    <>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {result.propertyName || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <code className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                          {result.sourceValue || '-'}
                        </code>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <code className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs">
                          {result.targetValue || '-'}
                        </code>
                      </td>
                    </>
                  )}
                  <td className="px-4 py-3">
                    {getSeverityBadge(result.severity)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {filteredResults.length > 100 && (
          <div className="px-4 py-3 bg-gray-50 text-center text-sm text-gray-500">
            Showing first 100 of {filteredResults.length} results. Export to Excel for full data.
          </div>
        )}
      </div>
    </div>
  );
}
