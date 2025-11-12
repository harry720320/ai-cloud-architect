import { useState, useEffect, useCallback } from 'react';
import { discoveryApi } from '../lib/backendApi';
import { useConfigStore } from '../store/configStore';
import { Trash2, Eye, Download, Loader2, Calendar, User, FolderOpen, Package } from 'lucide-react';
import type { Product } from '../types';

interface DiscoveryResultItem {
  id: string;
  customer_name: string;
  project_name: string;
  product_id: string;
  product_name: string;
  answers: Record<string, string>;
  generated_answers?: Record<string, string> | null;
  timestamp: string;
}

export default function DiscoveryResults() {
  const [results, setResults] = useState<DiscoveryResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedResult, setSelectedResult] = useState<DiscoveryResultItem | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { config, loadConfig } = useConfigStore();

  const loadResults = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await discoveryApi.getAllDiscoveryResults();
      setResults(data);
    } catch (err: any) {
      console.error('Failed to load discovery results:', err);
      setError(err.response?.data?.error || err.message || 'Failed to load discovery results');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadResults();
  }, [loadResults]);

  useEffect(() => {
    if (!config) {
      loadConfig();
    }
  }, [config, loadConfig]);

  const handleDelete = async (id: string, customerName: string, projectName: string) => {
    if (!window.confirm(`Are you sure you want to delete the discovery result for "${customerName}" - "${projectName}"?`)) {
      return;
    }

    try {
      setDeletingId(id);
      await discoveryApi.deleteDiscoveryResult(id);
      await loadResults(); // Reload results after deletion
    } catch (err: any) {
      console.error('Failed to delete discovery result:', err);
      alert(err.response?.data?.error || err.message || 'Failed to delete discovery result');
    } finally {
      setDeletingId(null);
    }
  };

  const handleViewDetail = (result: DiscoveryResultItem) => {
    setSelectedResult(result);
    setShowDetailModal(true);
  };

  const handleCloseDetail = () => {
    setShowDetailModal(false);
    setSelectedResult(null);
  };

  const handleExport = (result: DiscoveryResultItem, type: 'answers' | 'generatedAnswers') => {
    const data = type === 'answers' ? result.answers : result.generated_answers;
    if (!data || Object.keys(data).length === 0) {
      alert(`No ${type === 'answers' ? 'answers' : 'generated answers'} available to export.`);
      return;
    }

    const exportData = {
      id: result.id,
      customerName: result.customer_name,
      projectName: result.project_name,
      productName: result.product_name,
      timestamp: result.timestamp,
      [type === 'answers' ? 'answers' : 'generatedAnswers']: data,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${result.customer_name}_${result.project_name}_${type === 'answers' ? 'answers' : 'generated_answers'}_${new Date(result.timestamp).toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getProduct = (productId: string): Product | null => {
    if (!config || !config.products) return null;
    return config.products.find(p => p.id === productId) || null;
  };

  const getQuestionText = (productId: string, questionId: string): string => {
    const product = getProduct(productId);
    if (!product) return questionId;
    const question = product.questions.find(q => q.id === questionId);
    return question?.question || questionId;
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Discovery Results</h2>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
          <span className="ml-3 text-gray-600">Loading discovery results...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Discovery Results</h2>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: {error}</p>
          <button
            onClick={loadResults}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Discovery Results</h2>
        <button
          onClick={loadResults}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 flex items-center gap-2"
        >
          <Loader2 className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {results.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No discovery results found.</p>
          <p className="text-gray-400 text-sm mt-2">
            Start a new Customer Discovery session to create your first result.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {results.map((result) => (
            <div
              key={result.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5 text-gray-400" />
                      <span className="font-semibold text-lg text-gray-900">{result.customer_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FolderOpen className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-700">{result.project_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-600">{result.product_name}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(result.timestamp).toLocaleString()}</span>
                  </div>
                  <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
                    <span>
                      {Object.keys(result.answers || {}).length} answer{Object.keys(result.answers || {}).length !== 1 ? 's' : ''}
                    </span>
                    {result.generated_answers && Object.keys(result.generated_answers).length > 0 && (
                      <span>
                        {Object.keys(result.generated_answers).length} generated answer{Object.keys(result.generated_answers).length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleViewDetail(result)}
                    className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2 text-sm"
                    title="View details"
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </button>
                  <button
                    onClick={() => handleExport(result, 'answers')}
                    className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2 text-sm"
                    title="Export answers"
                  >
                    <Download className="h-4 w-4" />
                    Answers
                  </button>
                  {result.generated_answers && Object.keys(result.generated_answers).length > 0 && (
                    <button
                      onClick={() => handleExport(result, 'generatedAnswers')}
                      className="px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 flex items-center gap-2 text-sm"
                      title="Export generated answers"
                    >
                      <Download className="h-4 w-4" />
                      Generated
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(result.id, result.customer_name, result.project_name)}
                    disabled={deletingId === result.id}
                    className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
                    title="Delete result"
                  >
                    {deletingId === result.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Discovery Result Details</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedResult.customer_name} - {selectedResult.project_name}
                </p>
              </div>
              <button
                onClick={handleCloseDetail}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                    <p className="text-gray-900">{selectedResult.customer_name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                    <p className="text-gray-900">{selectedResult.project_name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                    <p className="text-gray-900">{selectedResult.product_name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Timestamp</label>
                    <p className="text-gray-900">{new Date(selectedResult.timestamp).toLocaleString()}</p>
                  </div>
                </div>

                {/* Answers */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Discovery Answers</h4>
                  <div className="space-y-3">
                    {Object.entries(selectedResult.answers || {}).map(([questionId, answer]) => {
                      const questionText = getQuestionText(selectedResult.product_id, questionId);
                      return (
                        <div key={questionId} className="border border-gray-200 rounded-lg p-4">
                          <p className="text-sm font-semibold text-gray-900 mb-2">{questionText}</p>
                          <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded border border-gray-100">{answer}</p>
                        </div>
                      );
                    })}
                    {(!selectedResult.answers || Object.keys(selectedResult.answers).length === 0) && (
                      <p className="text-gray-500 text-sm">No answers recorded.</p>
                    )}
                  </div>
                </div>

                {/* Generated Answers */}
                {selectedResult.generated_answers && Object.keys(selectedResult.generated_answers).length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Generated Answers</h4>
                    <div className="space-y-3">
                      {Object.entries(selectedResult.generated_answers).map(([questionId, answer]) => {
                        const questionText = getQuestionText(selectedResult.product_id, questionId);
                        return (
                          <div key={questionId} className="border border-gray-200 rounded-lg p-4 bg-blue-50">
                            <p className="text-sm font-semibold text-gray-900 mb-2">{questionText}</p>
                            <p className="text-gray-900 whitespace-pre-wrap bg-white p-3 rounded border border-gray-200">{answer}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 p-6 border-t border-gray-200">
              <button
                onClick={() => handleExport(selectedResult, 'answers')}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export Answers
              </button>
              {selectedResult.generated_answers && Object.keys(selectedResult.generated_answers).length > 0 && (
                <button
                  onClick={() => handleExport(selectedResult, 'generatedAnswers')}
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export Generated Answers
                </button>
              )}
              <button
                onClick={handleCloseDetail}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

