// ==========================================
// Environment Dialog Component
// ==========================================

import { useState, useEffect } from 'react';
import { X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { testConnection } from '@/services/mockDataService';
import { cn } from '@/utils/cn';

export function EnvironmentDialog() {
  const {
    showEnvironmentDialog,
    editingEnvironment,
    setShowEnvironmentDialog,
    addEnvironment,
    updateEnvironment,
  } = useAppStore();

  const [displayName, setDisplayName] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [instanceName, setInstanceName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Initialize form when editing
  useEffect(() => {
    if (editingEnvironment) {
      setDisplayName(editingEnvironment.displayName);
      setBaseUrl(editingEnvironment.baseUrl);
      setInstanceName(editingEnvironment.instanceName);
      setUsername(editingEnvironment.username);
      setPassword('');
    } else {
      setDisplayName('');
      setBaseUrl('');
      setInstanceName('');
      setUsername('');
      setPassword('');
    }
    setTestResult(null);
  }, [editingEnvironment, showEnvironmentDialog]);

  const handleClose = () => {
    setShowEnvironmentDialog(false, null);
  };

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const result = await testConnection({
        id: editingEnvironment?.id || 'test',
        displayName,
        baseUrl,
        instanceName,
        username,
        encryptedPassword: password,
      });
      setTestResult(result);
    } catch {
      setTestResult({ success: false, message: 'Failed to test connection' });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    const envData = {
      displayName,
      baseUrl,
      instanceName,
      username,
      encryptedPassword: password || editingEnvironment?.encryptedPassword || '',
    };

    if (editingEnvironment) {
      updateEnvironment(editingEnvironment.id, envData);
    } else {
      addEnvironment(envData);
    }

    handleClose();
  };

  const isValid = displayName && baseUrl && instanceName && username;

  if (!showEnvironmentDialog) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Dialog */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {editingEnvironment ? 'Edit Environment' : 'Add Environment'}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Display Name *
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g., Production"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Base URL *
            </label>
            <input
              type="url"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://archer.company.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Instance Name *
            </label>
            <input
              type="text"
              value={instanceName}
              onChange={(e) => setInstanceName(e.target.value)}
              placeholder="e.g., ArcherProd"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username *
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password {editingEnvironment ? '' : '*'}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={editingEnvironment ? '(unchanged)' : 'Enter password'}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Test Result */}
          {testResult && (
            <div className={cn(
              'flex items-center gap-2 p-3 rounded-lg',
              testResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            )}>
              {testResult.success ? (
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
              )}
              <span className="text-sm">{testResult.message}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
          <button
            onClick={handleTest}
            disabled={!isValid || isTesting}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors',
              isValid && !isTesting
                ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            )}
          >
            {isTesting && <Loader2 className="w-4 h-4 animate-spin" />}
            Test Connection
          </button>
          
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!isValid}
              className={cn(
                'px-6 py-2 rounded-lg font-medium transition-colors',
                isValid
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              )}
            >
              {editingEnvironment ? 'Save Changes' : 'Add Environment'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
