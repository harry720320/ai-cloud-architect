import { useState, useEffect } from 'react';
import { useConfigStore, defaultPrompts } from '../store/configStore';
import { anythingLLMApi } from '../lib/api';
import { Loader2, Send } from 'lucide-react';
import { cn } from '../lib/utils';
import MarkdownRenderer from '../components/MarkdownRenderer';

export default function KnowledgebaseSearch() {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { config, isLoading: configLoading, loadConfig } = useConfigStore();

  // Load config on mount if not loaded
  useEffect(() => {
    if (!config && !configLoading) {
      loadConfig();
    }
  }, [config, configLoading, loadConfig]);

  // Get categories from config (use default config if not loaded)
  // Always ensure we have a config object, even if empty
  const safeConfig = config || { categoryMappings: [], products: [], prompts: defaultPrompts };
  const categoryMappings = safeConfig.categoryMappings || [];
  const categories = categoryMappings.length > 0 
    ? [...new Set(categoryMappings.map((m) => m.category))]
    : [];

  // Show loading state only if actively loading and no config yet
  if (configLoading && !config) {
    return (
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Knowledgebase Search</h2>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
          <span className="ml-3 text-gray-600">Loading configuration...</span>
        </div>
      </div>
    );
  }

  const handleSend = async () => {
    if (!message.trim() || !selectedCategory || !safeConfig) return;

    const userMessage = { role: 'user' as const, content: message };
    setMessages((prev) => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);

    try {
      const categoryMapping = safeConfig.categoryMappings.find(
        (m) => m.category === selectedCategory
      );

      if (!categoryMapping) {
        throw new Error(`Category ${selectedCategory} does not have a corresponding workspace mapping`);
      }

      const response = await anythingLLMApi.searchMessage(
        categoryMapping.workspaceName,
        userMessage.content
      );

      setMessages((prev) => [...prev, { role: 'assistant', content: response }]);
    } catch (error: any) {
      console.error('Error:', error);
      const errorMessage = error?.message || 'Sorry, an error occurred while fetching the response. Please try again later.';
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `❌ Error: ${errorMessage}` },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Knowledgebase Search</h2>

      {/* Category Selection */}
      <div className="mb-6">
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
          Select Question Category
        </label>
        <select
          id="category"
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setMessages([]);
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          disabled={categories.length === 0}
        >
          <option value="">
            {categories.length === 0 
              ? 'No categories configured. Please go to Settings to add category mappings.' 
              : 'Please select a question category'}
          </option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        {categories.length === 0 && (
          <p className="mt-2 text-sm text-gray-500">
            No question categories configured. Please go to <strong>Settings</strong> to add category mappings.
          </p>
        )}
      </div>

      {/* Chat Area */}
      {selectedCategory && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="h-96 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 mt-8">
                Start chatting with the knowledge base...
              </div>
            )}
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={cn(
                  'flex',
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    'max-w-[80%] rounded-lg px-4 py-3',
                    msg.role === 'user'
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  )}
                >
                  {msg.role === 'user' ? (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  ) : msg.content.startsWith('❌ Error:') || msg.content.startsWith('⚠️') ? (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  ) : (
                    <MarkdownRenderer content={msg.content} />
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg px-4 py-2">
                  <Loader2 className="h-5 w-5 animate-spin text-primary-500" />
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Enter your question..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={!message.trim() || isLoading}
                className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

