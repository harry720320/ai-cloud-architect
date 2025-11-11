import { useState } from 'react';
import { useConfigStore, defaultPrompts } from '../store/configStore';
import { anythingLLMApi } from '../lib/api';
import { Loader2, CheckCircle, ArrowRight, Save, Download, AlertTriangle } from 'lucide-react';
import { cn, generateId } from '../lib/utils';
import type { Product, DiscoveryResult, DiscoveryQuestion } from '../types';

export default function CustomerDiscovery() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [projectName, setProjectName] = useState('');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState<Record<string, boolean>>({});
  const { config } = useConfigStore();
  const prompts = config.prompts || defaultPrompts;

  const getPromptForCategory = (category: string) => {
    if (/matrix/i.test(category)) {
      return prompts.matrix;
    }
    if (/sizing/i.test(category)) {
      return prompts.sizing;
    }
    return prompts.general;
  };

  const buildPromptMessage = (category: string, question: string, answer: string) => {
    const basePrompt = getPromptForCategory(category);
    const customerLine = customerName.trim() ? `Customer Name: ${customerName.trim()}` : '';
    const projectLine = projectName.trim() ? `Project Name: ${projectName.trim()}` : '';
    const contextLines = [customerLine, projectLine].filter(Boolean).join('\n');

    return [
      basePrompt.trim(),
      contextLines ? `\n${contextLines}` : '',
      `\nQuestion Category: ${category}`,
      `Question: ${question}`,
      `Customer Response: ${answer}`,
      '\nProvide a clear, actionable reply grounded in the knowledge base.',
    ].join('\n').trim();
  };

  const handleProductSelect = (productId: string) => {
    const product = config.products.find((p) => p.id === productId);
    setSelectedProduct(product || null);
    setAnswers({});
    setResults({});
    setShowResults(false);
    setLoadingQuestions({});
    // Optionally clear customer and project names when changing product
    // setCustomerName('');
    // setProjectName('');
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
    setResults((prev) => {
      if (!(questionId in prev)) return prev;
      const { [questionId]: _, ...rest } = prev;
      if (Object.keys(rest).length === 0) {
        setShowResults(false);
      }
      return rest;
    });
  };

  const setQuestionLoading = (questionId: string, value: boolean) => {
    setLoadingQuestions((prev) => ({ ...prev, [questionId]: value }));
  };

  const getFriendlyErrorMessage = (error: unknown) => {
    let message = '';
    if (typeof error === 'string') {
      message = error;
    } else if (error instanceof Error) {
      message = error.message;
    } else if (error && typeof (error as any).message === 'string') {
      message = (error as any).message;
    }

    if (!message) {
      return 'An unexpected error occurred while generating the answer.';
    }

    if (/not valid for chat/i.test(message)) {
      return 'The configured workspace model is not supported for chat completions. Please update the workspace model in AnythingLLM.';
    }

    if (/cannot connect/i.test(message) || /network error/i.test(message)) {
      return 'Unable to reach AnythingLLM. Please ensure the service is running and accessible.';
    }

    if (message.startsWith('API Error')) {
      const parts = message.split(':').slice(1).join(':').trim();
      return parts || 'Received an error response from AnythingLLM.';
    }

    return message;
  };

  const generateAnswerForQuestion = async (question: DiscoveryQuestion, answer: string) => {
    const categoryMapping = config.categoryMappings.find(
      (m) => m.category === question.category
    );

    if (!categoryMapping) {
      return {
        success: false,
        content: `⚠️ No workspace mapping found for category "${question.category}". Please update the category mappings in Settings.`,
      };
    }

    try {
      const composedMessage = buildPromptMessage(question.category, question.question, answer);
      const response = await anythingLLMApi.searchMessage(
        categoryMapping.workspaceName,
        composedMessage
      );
      if (!response || !response.trim()) {
        return {
          success: false,
          content: '⚠️ Received an empty response. Please try again.',
        };
      }
      return {
        success: true,
        content: response.trim(),
      };
    } catch (error) {
      return {
        success: false,
        content: `⚠️ Unable to generate answer. ${getFriendlyErrorMessage(error)}`,
      };
    }
  };

  const handleGenerate = async () => {
    if (!selectedProduct) return;

    setIsGenerating(true);
    const newResults: Record<string, string> = {};
    const loadingState: Record<string, boolean> = {};
    selectedProduct.questions.forEach((question) => {
      if (answers[question.id]?.trim()) {
        loadingState[question.id] = true;
      }
    });
    setLoadingQuestions(loadingState);

    try {
      for (const question of selectedProduct.questions) {
        const answer = answers[question.id];
        if (!answer?.trim()) continue;
        const result = await generateAnswerForQuestion(question, answer);
        newResults[question.id] = result.content;
        setQuestionLoading(question.id, false);
      }

      if (Object.keys(newResults).length > 0) {
        setResults(newResults);
        setShowResults(true);
      } else {
        setResults({});
        setShowResults(false);
      }
    } finally {
      setIsGenerating(false);
      setLoadingQuestions({});
    }
  };

  const handleGenerateForQuestion = async (question: DiscoveryQuestion) => {
    const answer = answers[question.id];
    if (!answer?.trim()) {
      alert('Please provide an answer before generating a response.');
      return;
    }

    setQuestionLoading(question.id, true);
    try {
      const result = await generateAnswerForQuestion(question, answer);
      setResults((prev) => ({
        ...prev,
        [question.id]: result.content,
      }));
      setShowResults(true);
    } finally {
      setQuestionLoading(question.id, false);
    }
  };

  const allAnswered = selectedProduct?.questions.every((q) => answers[q.id]) ?? false;

  const handleSaveDiscoveryResults = () => {
    if (!selectedProduct || !customerName.trim() || !projectName.trim()) {
      alert('Please fill in Customer Name and Project Name before saving.');
      return;
    }

    const discoveryResult: DiscoveryResult = {
      id: generateId(),
      customerName: customerName.trim(),
      projectName: projectName.trim(),
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      timestamp: new Date().toISOString(),
      answers: { ...answers },
    };

    // Save to localStorage
    const savedResults = JSON.parse(localStorage.getItem('discovery-results') || '[]');
    savedResults.push(discoveryResult);
    localStorage.setItem('discovery-results', JSON.stringify(savedResults));

    alert('Discovery results saved successfully!');
  };

  const handleSaveGeneratedAnswers = () => {
    if (!selectedProduct || !customerName.trim() || !projectName.trim() || Object.keys(results).length === 0) {
      alert('Please generate answers first before saving.');
      return;
    }

    const discoveryResult: DiscoveryResult = {
      id: generateId(),
      customerName: customerName.trim(),
      projectName: projectName.trim(),
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      timestamp: new Date().toISOString(),
      answers: { ...answers },
      generatedAnswers: { ...results },
    };

    // Save to localStorage
    const savedResults = JSON.parse(localStorage.getItem('generated-answers') || '[]');
    savedResults.push(discoveryResult);
    localStorage.setItem('generated-answers', JSON.stringify(savedResults));

    alert('Generated answers saved successfully!');
  };

  const handleExportDiscoveryResults = () => {
    if (!selectedProduct || !customerName.trim() || !projectName.trim()) {
      alert('Please fill in Customer Name and Project Name before exporting.');
      return;
    }

    const exportData = {
      customerName: customerName.trim(),
      projectName: projectName.trim(),
      product: selectedProduct.name,
      timestamp: new Date().toISOString(),
      discoveryResults: selectedProduct.questions.map((q) => ({
        question: q.question,
        category: q.category,
        answer: answers[q.id] || '',
      })),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `discovery-${customerName.trim()}-${projectName.trim()}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportGeneratedAnswers = () => {
    if (!selectedProduct || !customerName.trim() || !projectName.trim() || Object.keys(results).length === 0) {
      alert('Please generate answers first before exporting.');
      return;
    }

    const exportData = {
      customerName: customerName.trim(),
      projectName: projectName.trim(),
      product: selectedProduct.name,
      timestamp: new Date().toISOString(),
      results: selectedProduct.questions.map((q) => ({
        question: q.question,
        category: q.category,
        answer: answers[q.id] || '',
        generatedAnswer: results[q.id] || '',
      })),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `answers-${customerName.trim()}-${projectName.trim()}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Discovery</h2>

      {/* Customer and Project Info */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Customer Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Customer Name *
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Enter customer name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Name *
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Enter project name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Product Selection */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Product Type
        </label>
        <select
          value={selectedProduct?.id || ''}
          onChange={(e) => handleProductSelect(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Please select a product type</option>
          {config.products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name}
            </option>
          ))}
        </select>
      </div>

      {/* Questions */}
      {selectedProduct && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">{selectedProduct.name} - Discovery Questions</h3>
          <div className="space-y-4">
            {selectedProduct.questions.map((question) => {
              const answerValue = answers[question.id] || '';
              const hasAnswer = !!answerValue.trim();
              const isQuestionLoading = !!loadingQuestions[question.id];
              const generatedResult = results[question.id];
              const hasGeneratedResult = !!generatedResult;
              const isErrorResult = hasGeneratedResult && generatedResult.startsWith('⚠️');

              return (
                <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {question.question}
                        </label>
                        <input
                          type="text"
                          value={answerValue}
                          onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                          placeholder="Enter your answer..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      {hasGeneratedResult && !isQuestionLoading && !isErrorResult && (
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" title="Answer generated" />
                      )}
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Category: {question.category}</span>
                      <div className="flex items-center gap-2">
                        {hasGeneratedResult && !isQuestionLoading && isErrorResult && (
                          <AlertTriangle className="h-4 w-4 text-amber-500" title="Generation returned a warning" />
                        )}
                        <button
                        type="button"
                        onClick={() => handleGenerateForQuestion(question)}
                        disabled={!hasAnswer || isGenerating || isQuestionLoading}
                        className="px-3 py-1.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
                      >
                        {isQuestionLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <ArrowRight className="h-4 w-4" />
                            Generate
                          </>
                        )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={handleGenerate}
              disabled={!allAnswered || isGenerating}
              className="flex-1 px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Generating answers...
                </>
              ) : (
                <>
                  Generate Answers
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
            <button
              onClick={handleSaveDiscoveryResults}
              disabled={!customerName.trim() || !projectName.trim() || !allAnswered}
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              title="Save discovery results (answers only)"
            >
              <Save className="h-5 w-5" />
              Save Discovery
            </button>
            <button
              onClick={handleExportDiscoveryResults}
              disabled={!customerName.trim() || !projectName.trim() || !allAnswered}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              title="Export discovery results as JSON"
            >
              <Download className="h-5 w-5" />
              Export Discovery
            </button>
          </div>
        </div>
      )}

      {/* Results */}
      {showResults && selectedProduct && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Generated Results</h3>
            <div className="flex gap-2">
              <button
                onClick={handleSaveGeneratedAnswers}
                disabled={!customerName.trim() || !projectName.trim()}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                title="Save generated answers"
              >
                <Save className="h-4 w-4" />
                Save Answers
              </button>
              <button
                onClick={handleExportGeneratedAnswers}
                disabled={!customerName.trim() || !projectName.trim()}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                title="Export generated answers as JSON"
              >
                <Download className="h-4 w-4" />
                Export Answers
              </button>
            </div>
          </div>
          {selectedProduct.questions.map((question) => {
            const result = results[question.id];
            if (!result) return null;

            return (
              <div key={question.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="mb-2">
                  <h4 className="font-medium text-gray-900">{question.question}</h4>
                  <div className="text-sm text-gray-500 mt-1">
                    Answer: {answers[question.id]}
                  </div>
                </div>
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">{result}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {config.products.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500">No products configured. Please go to Settings to create products.</p>
        </div>
      )}
    </div>
  );
}

