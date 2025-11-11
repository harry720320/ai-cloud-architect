import { useState, useEffect, useRef } from 'react';
import { useConfigStore, defaultPrompts } from '../store/configStore';
import { generateId } from '../lib/utils';
import { anythingLLMApi } from '../lib/api';
import { Plus, Trash2, Edit2, Save, X, RefreshCw } from 'lucide-react';
import type { QuestionCategoryMapping, Product, DiscoveryQuestion } from '../types';

export default function Settings() {
  const {
    config,
    addCategoryMapping,
    removeCategoryMapping,
    addProduct,
    updateProduct,
    deleteProduct,
    updatePrompts,
  } = useConfigStore();
  
  const [activeTab, setActiveTab] = useState<'mappings' | 'products'>('mappings');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newMapping, setNewMapping] = useState({ category: '', workspaceName: '' });
  const [newProduct, setNewProduct] = useState({ name: '', questions: [] as Omit<DiscoveryQuestion, 'answer'>[] });
  const [editingQuestion, setEditingQuestion] = useState<{ productId: string; questionIndex: number } | null>(null);
  
  // Workspace fetching state
  const [workspaces, setWorkspaces] = useState<Array<{ slug: string; name: string }>>([]);
  const [isLoadingWorkspaces, setIsLoadingWorkspaces] = useState(false);
  const [showWorkspaceDropdown, setShowWorkspaceDropdown] = useState(false);
  const [workspaceError, setWorkspaceError] = useState<string>('');
  const workspaceDropdownRef = useRef<HTMLDivElement>(null);

  // Question dialog state
  const [showQuestionDialog, setShowQuestionDialog] = useState(false);
  const [newQuestion, setNewQuestion] = useState({ question: '', category: '' });

  // Prompt editing state
  const [promptDrafts, setPromptDrafts] = useState(config.prompts || defaultPrompts);
  const [isPromptDirty, setIsPromptDirty] = useState(false);

  useEffect(() => {
    setPromptDrafts(config.prompts || defaultPrompts);
    setIsPromptDirty(false);
  }, [config.prompts]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (workspaceDropdownRef.current && !workspaceDropdownRef.current.contains(event.target as Node)) {
        setShowWorkspaceDropdown(false);
      }
    };

    if (showWorkspaceDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showWorkspaceDropdown]);

  const handleAddMapping = () => {
    if (newMapping.category && newMapping.workspaceName) {
      addCategoryMapping(newMapping);
      setNewMapping({ category: '', workspaceName: '' });
      setShowWorkspaceDropdown(false);
      setWorkspaceError('');
    }
  };

  const handleAddProduct = () => {
    if (newProduct.name && newProduct.questions.length > 0) {
      const product: Product = {
        id: generateId(),
        name: newProduct.name,
        questions: newProduct.questions.map((q) => ({
          ...q,
          answer: undefined,
        })),
      };
      addProduct(product);
      setNewProduct({ name: '', questions: [] });
    }
  };

  const handleAddQuestionToNewProduct = () => {
    setNewQuestion({ question: '', category: '' });
    setShowQuestionDialog(true);
  };

  const handleSaveQuestion = () => {
    if (newQuestion.question.trim() && newQuestion.category) {
      setNewProduct({
        ...newProduct,
        questions: [
          ...newProduct.questions,
          { id: generateId(), question: newQuestion.question.trim(), category: newQuestion.category },
        ],
      });
      setShowQuestionDialog(false);
      setNewQuestion({ question: '', category: '' });
    }
  };

  const handleCancelQuestion = () => {
    setShowQuestionDialog(false);
    setNewQuestion({ question: '', category: '' });
  };

  // Get available categories from mappings
  const availableCategories = config.categoryMappings.map(m => m.category);

  const handlePromptChange = (key: keyof typeof promptDrafts, value: string) => {
    setPromptDrafts((prev) => {
      const next = { ...prev, [key]: value };
      setIsPromptDirty(
        next.general !== config.prompts.general ||
        next.sizing !== config.prompts.sizing ||
        next.matrix !== config.prompts.matrix
      );
      return next;
    });
  };

  const handleSavePrompts = () => {
    updatePrompts({ ...promptDrafts });
    setIsPromptDirty(false);
  };

  const handleResetPrompts = () => {
    setPromptDrafts({ ...defaultPrompts });
    setIsPromptDirty(
      defaultPrompts.general !== config.prompts.general ||
      defaultPrompts.sizing !== config.prompts.sizing ||
      defaultPrompts.matrix !== config.prompts.matrix
    );
  };

  const handleDeleteQuestionFromNewProduct = (index: number) => {
    setNewProduct({
      ...newProduct,
      questions: newProduct.questions.filter((_, i) => i !== index),
    });
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      questions: product.questions,
    });
  };

  const handleSaveEdit = () => {
    if (editingProduct) {
      updateProduct(editingProduct.id, {
        ...editingProduct,
        name: newProduct.name,
        questions: newProduct.questions,
      });
      setEditingProduct(null);
      setNewProduct({ name: '', questions: [] });
    }
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setNewProduct({ name: '', questions: [] });
  };

  const handleFetchWorkspaces = async () => {
    setIsLoadingWorkspaces(true);
    setWorkspaceError('');
    try {
      const fetchedWorkspaces = await anythingLLMApi.getWorkspaces();
      if (fetchedWorkspaces.length === 0) {
        setWorkspaceError('No workspaces found. Please ensure AnythingLLM is running and has workspaces configured.');
      } else {
        setWorkspaces(fetchedWorkspaces);
        setShowWorkspaceDropdown(true);
      }
    } catch (error: any) {
      setWorkspaceError(`Failed to fetch workspaces: ${error.message || 'Unknown error'}`);
      console.error('Error fetching workspaces:', error);
    } finally {
      setIsLoadingWorkspaces(false);
    }
  };

  const handleSelectWorkspace = (slug: string) => {
    setNewMapping({ ...newMapping, workspaceName: slug });
    setShowWorkspaceDropdown(false);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Settings</h2>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('mappings')}
              className={`${
                activeTab === 'mappings'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Question Category Mappings
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`${
                activeTab === 'products'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Product Discovery Lists
            </button>
          </nav>
        </div>
      </div>

      {/* Category Mappings Tab */}
      {activeTab === 'mappings' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Add Question Category Mapping</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question Category
                </label>
                <input
                  type="text"
                  value={newMapping.category}
                  onChange={(e) => setNewMapping({ ...newMapping, category: e.target.value })}
                  placeholder="e.g., Cloud General, Azure General"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Workspace Name (Slug)
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 relative" ref={workspaceDropdownRef}>
                    <input
                      type="text"
                      value={newMapping.workspaceName}
                      onChange={(e) => setNewMapping({ ...newMapping, workspaceName: e.target.value })}
                      onFocus={() => {
                        if (workspaces.length > 0) {
                          setShowWorkspaceDropdown(true);
                        }
                      }}
                      placeholder="AnythingLLM workspace slug"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    {showWorkspaceDropdown && workspaces.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                        {workspaces.map((workspace) => (
                          <button
                            key={workspace.slug}
                            type="button"
                            onClick={() => handleSelectWorkspace(workspace.slug)}
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                          >
                            <div className="font-medium">{workspace.name}</div>
                            <div className="text-sm text-gray-500">Slug: {workspace.slug}</div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleFetchWorkspaces}
                    disabled={isLoadingWorkspaces}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
                    title="Fetch workspaces from AnythingLLM"
                  >
                    <RefreshCw className={`h-4 w-4 ${isLoadingWorkspaces ? 'animate-spin' : ''}`} />
                    {isLoadingWorkspaces ? 'Loading...' : 'Fetch'}
                  </button>
                </div>
                {workspaceError && (
                  <p className="mt-1 text-sm text-red-600">{workspaceError}</p>
                )}
                {!workspaceError && workspaces.length > 0 && (
                  <p className="mt-1 text-xs text-gray-500">
                    Found {workspaces.length} workspace{workspaces.length !== 1 ? 's' : ''}. Click a workspace to select its slug.
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={handleAddMapping}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Mapping
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Existing Mappings</h3>
            <div className="space-y-2">
              {config.categoryMappings.map((mapping) => (
                <div
                  key={mapping.category}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                >
                  <div>
                    <span className="font-medium">{mapping.category}</span>
                    <span className="text-gray-500 mx-2">→</span>
                    <span className="text-gray-600">{mapping.workspaceName}</span>
                  </div>
                  <button
                    onClick={() => removeCategoryMapping(mapping.category)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          {!editingProduct && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4">Create Product Discovery List</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name
                </label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  placeholder="e.g., Azure Compute, AWS Storage"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Discovery Questions
                  </label>
                  <button
                    onClick={handleAddQuestionToNewProduct}
                    className="px-3 py-1 bg-primary-500 text-white rounded-lg hover:bg-primary-600 flex items-center gap-1 text-sm"
                  >
                    <Plus className="h-4 w-4" />
                    Add Question
                  </button>
                </div>
                <div className="space-y-2">
                  {newProduct.questions.map((q, idx) => (
                    <div key={q.id} className="p-3 border border-gray-200 rounded-lg flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium">{q.question}</div>
                        <div className="text-sm text-gray-500">Category: {q.category}</div>
                      </div>
                      <button
                        onClick={() => handleDeleteQuestionFromNewProduct(idx)}
                        className="text-red-600 hover:text-red-700 ml-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={handleAddProduct}
                disabled={!newProduct.name || newProduct.questions.length === 0}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Create Product
              </button>
            </div>
          )}

          {editingProduct && (
            <div className="bg-white rounded-lg shadow-sm border-2 border-primary-500 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Edit Product</h3>
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveEdit}
                    className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-1"
                  >
                    <Save className="h-4 w-4" />
                    Save
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="px-3 py-1 bg-gray-500 text-white rounded-lg hover:bg-gray-600 flex items-center gap-1"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </button>
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name
                </label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Discovery Questions
                  </label>
                  <button
                    onClick={handleAddQuestionToNewProduct}
                    className="px-3 py-1 bg-primary-500 text-white rounded-lg hover:bg-primary-600 flex items-center gap-1 text-sm"
                  >
                    <Plus className="h-4 w-4" />
                    Add Question
                  </button>
                </div>
                <div className="space-y-2">
                  {newProduct.questions.map((q, idx) => (
                    <div key={q.id} className="p-3 border border-gray-200 rounded-lg flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium">{q.question}</div>
                        <div className="text-sm text-gray-500">Category: {q.category}</div>
                      </div>
                      <button
                        onClick={() => handleDeleteQuestionFromNewProduct(idx)}
                        className="text-red-600 hover:text-red-700 ml-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Existing Products</h3>
            <div className="space-y-3">
              {config.products.map((product) => (
                <div key={product.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-lg">{product.name}</h4>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditProduct(product)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteProduct(product.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    {product.questions.length} question{product.questions.length !== 1 ? 's' : ''}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Prompt Settings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold mb-1">Prompt Settings</h3>
            <p className="text-sm text-gray-600">
              Define the base prompt used when querying the knowledge base from Customer Discovery. Prompts are selected based on the question category.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleResetPrompts}
              className="px-3 py-1 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
            >
              Reset to Defaults
            </button>
            <button
              onClick={handleSavePrompts}
              disabled={!isPromptDirty}
              className="px-3 py-1 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Save Prompts
            </button>
          </div>
        </div>

        <div className="mt-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              General Prompt
            </label>
            <textarea
              value={promptDrafts.general}
              onChange={(e) => handlePromptChange('general', e.target.value)}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Used for all question categories except Sizing and Matrix categories.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sizing Prompt
            </label>
            <textarea
              value={promptDrafts.sizing}
              onChange={(e) => handlePromptChange('sizing', e.target.value)}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Applied to question categories that include the keyword &quot;Sizing&quot;.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Matrix Prompt
            </label>
            <textarea
              value={promptDrafts.matrix}
              onChange={(e) => handlePromptChange('matrix', e.target.value)}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Applied to question categories that include the keyword &quot;Matrix&quot;.
            </p>
          </div>
        </div>
      </div>

      {/* Question Dialog */}
      {showQuestionDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add Discovery Question</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question
              </label>
              <textarea
                value={newQuestion.question}
                onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                placeholder="Enter your discovery question..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question Category
              </label>
              {availableCategories.length === 0 ? (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    No categories available. Please add category mappings first in the "Question Category Mappings" tab.
                  </p>
                </div>
              ) : (
                <select
                  value={newQuestion.category}
                  onChange={(e) => setNewQuestion({ ...newQuestion, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select a category</option>
                  {availableCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={handleCancelQuestion}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveQuestion}
                disabled={!newQuestion.question.trim() || !newQuestion.category}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Question
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

