// ==========================================
// Collection Options Dialog Component
// ==========================================

import { useState } from 'react';
import { X, Check, Layers, Database, FileText, Settings2, Shield, Bell, Rss, Clock } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { CollectionOptions } from '@/types';
import { cn } from '@/utils/cn';

interface OptionItem {
  key: keyof CollectionOptions;
  label: string;
  description: string;
  icon: React.ReactNode;
  category: 'core' | 'content' | 'security' | 'automation';
}

const options: OptionItem[] = [
  {
    key: 'includeModules',
    label: 'Modules',
    description: 'Application modules and subforms',
    icon: <Layers className="w-4 h-4" />,
    category: 'core',
  },
  {
    key: 'includeFields',
    label: 'Fields',
    description: 'All field definitions within modules',
    icon: <Database className="w-4 h-4" />,
    category: 'core',
  },
  {
    key: 'includeLayouts',
    label: 'Layouts',
    description: 'Form layouts and field arrangements',
    icon: <Settings2 className="w-4 h-4" />,
    category: 'core',
  },
  {
    key: 'includeValuesLists',
    label: 'Values Lists',
    description: 'Dropdown and picklist definitions',
    icon: <FileText className="w-4 h-4" />,
    category: 'core',
  },
  {
    key: 'includeValuesListValues',
    label: 'Values List Values',
    description: 'Individual values within lists',
    icon: <FileText className="w-4 h-4" />,
    category: 'core',
  },
  {
    key: 'includeDDERules',
    label: 'DDE Rules',
    description: 'Data-driven event rules',
    icon: <Settings2 className="w-4 h-4" />,
    category: 'automation',
  },
  {
    key: 'includeDDEActions',
    label: 'DDE Actions',
    description: 'Actions within DDE rules',
    icon: <Settings2 className="w-4 h-4" />,
    category: 'automation',
  },
  {
    key: 'includeReports',
    label: 'Reports',
    description: 'Report definitions and configurations',
    icon: <FileText className="w-4 h-4" />,
    category: 'content',
  },
  {
    key: 'includeDashboards',
    label: 'Dashboards',
    description: 'Dashboard configurations',
    icon: <Layers className="w-4 h-4" />,
    category: 'content',
  },
  {
    key: 'includeWorkspaces',
    label: 'Workspaces',
    description: 'Workspace definitions',
    icon: <Layers className="w-4 h-4" />,
    category: 'content',
  },
  {
    key: 'includeIViews',
    label: 'iViews',
    description: 'Dashboard iView components',
    icon: <Layers className="w-4 h-4" />,
    category: 'content',
  },
  {
    key: 'includeRoles',
    label: 'Roles',
    description: 'Security role definitions',
    icon: <Shield className="w-4 h-4" />,
    category: 'security',
  },
  {
    key: 'includeSecurityParameters',
    label: 'Security Parameters',
    description: 'Access control parameters',
    icon: <Shield className="w-4 h-4" />,
    category: 'security',
  },
  {
    key: 'includeNotifications',
    label: 'Notifications',
    description: 'Notification templates',
    icon: <Bell className="w-4 h-4" />,
    category: 'automation',
  },
  {
    key: 'includeDataFeeds',
    label: 'Data Feeds',
    description: 'Import/export configurations',
    icon: <Rss className="w-4 h-4" />,
    category: 'automation',
  },
  {
    key: 'includeSchedules',
    label: 'Schedules',
    description: 'Scheduled job definitions',
    icon: <Clock className="w-4 h-4" />,
    category: 'automation',
  },
];

const categories = [
  { id: 'core', label: 'Core Metadata', color: 'blue' },
  { id: 'content', label: 'Content & Reporting', color: 'purple' },
  { id: 'security', label: 'Security', color: 'red' },
  { id: 'automation', label: 'Automation', color: 'green' },
];

export function CollectionDialog() {
  const {
    showCollectionDialog,
    collectionOptions,
    setShowCollectionDialog,
    setCollectionOptions,
  } = useAppStore();

  const [localOptions, setLocalOptions] = useState<CollectionOptions>(collectionOptions);

  const handleToggle = (key: keyof CollectionOptions) => {
    if (key === 'selectedModuleIds') return;
    setLocalOptions(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSelectAll = (category: string) => {
    const categoryOptions = options.filter(o => o.category === category);
    const allSelected = categoryOptions.every(o => localOptions[o.key] === true);
    
    const updates: Partial<CollectionOptions> = {};
    categoryOptions.forEach(o => {
      (updates as Record<string, boolean>)[o.key] = !allSelected;
    });
    
    setLocalOptions(prev => ({ ...prev, ...updates }));
  };

  const handleSave = () => {
    setCollectionOptions(localOptions);
    setShowCollectionDialog(false);
  };

  const handleClose = () => {
    setLocalOptions(collectionOptions);
    setShowCollectionDialog(false);
  };

  if (!showCollectionDialog) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Dialog */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Collection Options</h2>
            <p className="text-sm text-gray-500">Select which metadata types to compare</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {categories.map(category => {
            const categoryOptions = options.filter(o => o.category === category.id);
            const selectedCount = categoryOptions.filter(o => localOptions[o.key] === true).length;
            
            return (
              <div key={category.id} className="mb-6 last:mb-0">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">{category.label}</h3>
                  <button
                    onClick={() => handleSelectAll(category.id)}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    {selectedCount === categoryOptions.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {categoryOptions.map(option => {
                    const isSelected = localOptions[option.key] === true;
                    
                    return (
                      <button
                        key={option.key}
                        onClick={() => handleToggle(option.key)}
                        className={cn(
                          'flex items-start gap-3 p-3 rounded-lg border-2 transition-all text-left',
                          isSelected
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        )}
                      >
                        <div className={cn(
                          'w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5',
                          isSelected ? 'bg-blue-500 text-white' : 'bg-gray-200'
                        )}>
                          {isSelected && <Check className="w-3 h-3" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              'text-sm',
                              isSelected ? 'text-blue-600' : 'text-gray-400'
                            )}>
                              {option.icon}
                            </span>
                            <span className={cn(
                              'font-medium',
                              isSelected ? 'text-blue-900' : 'text-gray-900'
                            )}>
                              {option.label}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">{option.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            {Object.values(localOptions).filter(v => v === true).length} types selected
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Apply Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
