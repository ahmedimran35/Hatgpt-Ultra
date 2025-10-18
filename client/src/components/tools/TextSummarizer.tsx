import { useState } from 'react';

interface SummarizerData {
  text: string;
  summaryLength: string;
  focus: string;
  format: string;
}

const SUMMARY_LENGTHS = ['Brief (1-2 sentences)', 'Short (1 paragraph)', 'Medium (2-3 paragraphs)', 'Detailed (4+ paragraphs)'];
const FOCUS_AREAS = ['Key points only', 'Main ideas and details', 'Complete overview', 'Specific topics'];
const FORMATS = ['Paragraph', 'Bullet points', 'Numbered list', 'Outline'];

export default function TextSummarizer() {
  const [summarizerData, setSummarizerData] = useState<SummarizerData>({
    text: '',
    summaryLength: 'Medium (2-3 paragraphs)',
    focus: 'Main ideas and details',
    format: 'Paragraph'
  });

  const [summary, setSummary] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const handleInputChange = (field: keyof SummarizerData, value: string) => {
    setSummarizerData(prev => ({ ...prev, [field]: value }));
  };

  const generateSummary = async () => {
    if (!summarizerData.text.trim()) {
      alert('Please enter some text to summarize');
      return;
    }

    setIsGenerating(true);
    try {
      const prompt = `You are a professional content analyst and summarization expert. Create a comprehensive summary with the following requirements:

TEXT TO SUMMARIZE:
"${summarizerData.text}"

SUMMARY REQUIREMENTS:
- Length: ${summarizerData.summaryLength}
- Focus: ${summarizerData.focus}
- Format: ${summarizerData.format}

INSTRUCTIONS:
1. Extract the most important information
2. Maintain the original meaning and context
3. Use clear, concise language
4. Organize information logically
5. Include key facts, figures, and conclusions
6. Preserve the author's main arguments
7. Make it ${summarizerData.summaryLength.toLowerCase()}
8. Format as ${summarizerData.format.toLowerCase()}
9. Focus on ${summarizerData.focus.toLowerCase()}
10. Ensure readability and coherence

FORMAT YOUR RESPONSE AS:
SUMMARY:
[Your summary here]

KEY POINTS:
- [Important point 1]
- [Important point 2]
- [Important point 3]

Please provide a well-structured, informative summary that captures the essence of the original text.`;

      // Use Puter SDK for AI generation
      const puterAny = (globalThis as any).puter;
      if (!puterAny?.ai?.chat) {
        throw new Error('Puter SDK not loaded');
      }

      // Use Puter SDK for AI generation
      const stream = await puterAny.ai.chat(prompt, { model: 'mistral', stream: true });
      
      let fullResponse = '';
      // The puter stream is async iterable
      for await (const chunk of stream) {
        fullResponse += chunk;
      }

      setSummary(fullResponse);
    } catch (error) {
      console.error('Error generating summary:', error);
      alert('Failed to generate summary. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(summary);
    alert('Summary copied to clipboard!');
  };

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-slate-50 via-indigo-50 to-blue-100">
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className="space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-3xl blur-lg opacity-20"></div>
              <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-500 to-blue-600 p-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                      <span className="text-2xl">📄</span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Text Summarizer</h2>
                      <p className="text-indigo-100">Extract key information quickly</p>
                    </div>
                  </div>
                </div>
                <div className="p-8 space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-800">Text to Summarize *</label>
                    <textarea
                      value={summarizerData.text}
                      onChange={(e) => handleInputChange('text', e.target.value)}
                      className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md resize-none"
                      rows={8}
                      placeholder="Paste the text you want to summarize here..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-800">Summary Length</label>
                      <select
                        value={summarizerData.summaryLength}
                        onChange={(e) => handleInputChange('summaryLength', e.target.value)}
                        className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md"
                      >
                        {SUMMARY_LENGTHS.map(length => (
                          <option key={length} value={length}>{length}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-800">Focus Area</label>
                      <select
                        value={summarizerData.focus}
                        onChange={(e) => handleInputChange('focus', e.target.value)}
                        className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md"
                      >
                        {FOCUS_AREAS.map(area => (
                          <option key={area} value={area}>{area}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-800">Output Format</label>
                    <select
                      value={summarizerData.format}
                      onChange={(e) => handleInputChange('format', e.target.value)}
                      className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md"
                    >
                      {FORMATS.map(format => (
                        <option key={format} value={format}>{format}</option>
                      ))}
                    </select>
                  </div>

                  <div className="pt-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-2xl blur-sm opacity-75"></div>
                      <button
                        onClick={generateSummary}
                        disabled={isGenerating}
                        className="relative w-full bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                      >
                        <span className="flex items-center justify-center gap-2">
                          {isGenerating ? (
                            <>
                              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              Summarizing...
                            </>
                          ) : (
                            <>
                              <span>Generate Summary</span>
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                              </svg>
                            </>
                          )}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Generated Summary */}
          <div className="space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-600 rounded-3xl blur-lg opacity-20"></div>
              <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                        <span className="text-2xl">✨</span>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white">Generated Summary</h2>
                        <p className="text-amber-100">Your concise summary is ready</p>
                      </div>
                    </div>
                    {summary && (
                      <button
                        onClick={copyToClipboard}
                        className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl transition-all duration-300 backdrop-blur-sm border border-white/20"
                      >
                        <span className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          Copy
                        </span>
                      </button>
                    )}
                  </div>
                </div>
                <div className="p-8">
                  {summary ? (
                    <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-6 shadow-inner">
                      <div className="prose prose-sm max-w-none">
                        <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans leading-relaxed">
                          {summary}
                        </pre>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <span className="text-4xl">📄</span>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">Your Summary Awaits</h3>
                      <p className="text-gray-600">Paste your text and get a concise summary</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}