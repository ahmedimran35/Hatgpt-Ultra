import { useState } from 'react';

interface CodeData {
  code: string;
  language: string;
  explanationLevel: string;
  focusAreas: string;
}

const PROGRAMMING_LANGUAGES = ['JavaScript', 'Python', 'Java', 'C++', 'TypeScript', 'React', 'Node.js', 'Other'];
const EXPLANATION_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const FOCUS_AREAS = ['General explanation', 'Performance optimization', 'Security', 'Best practices', 'Debugging', 'Architecture'];

export default function CodeExplainer() {
  const [codeData, setCodeData] = useState<CodeData>({
    code: '',
    language: 'JavaScript',
    explanationLevel: 'Intermediate',
    focusAreas: 'General explanation'
  });

  const [explanation, setExplanation] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const handleInputChange = (field: keyof CodeData, value: string) => {
    setCodeData(prev => ({ ...prev, [field]: value }));
  };

  const generateExplanation = async () => {
    if (!codeData.code.trim()) {
      alert('Please enter some code to explain');
      return;
    }

    setIsGenerating(true);
    try {
      const prompt = `You are a senior software engineer and technical mentor. Provide a comprehensive code explanation with the following details:

CODE TO ANALYZE:
\`\`\`${codeData.language.toLowerCase()}
${codeData.code}
\`\`\`

ANALYSIS REQUIREMENTS:
- Programming Language: ${codeData.language}
- Explanation Level: ${codeData.explanationLevel}
- Focus Areas: ${codeData.focusAreas || 'General explanation'}

EXPLANATION STRUCTURE:
1. **Overview**: What the code does and its purpose
2. **Line-by-Line Analysis**: Detailed breakdown of each section
3. **Key Concepts**: Important programming concepts used
4. **Algorithm/Logic**: How the code works step-by-step
5. **Best Practices**: What's done well and what could improve
6. **Potential Issues**: Common pitfalls or edge cases
7. **Alternatives**: Different approaches or optimizations
8. **Real-world Applications**: Where this pattern is useful

TARGET AUDIENCE: ${codeData.explanationLevel.toLowerCase()}

FORMAT:
- Use clear headings and bullet points
- Include code examples where helpful
- Explain technical terms
- Provide practical insights
- Make it educational and actionable

Provide a thorough, educational explanation that helps the developer understand both the code and the underlying concepts.`;

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

      setExplanation(fullResponse);
    } catch (error) {
      console.error('Error generating explanation:', error);
      alert('Failed to generate code explanation. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(explanation);
    alert('Code explanation copied to clipboard!');
  };

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-slate-50 via-slate-50 to-gray-100">
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className="space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-slate-500 to-gray-600 rounded-3xl blur-lg opacity-20"></div>
              <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-slate-500 to-gray-600 p-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                      <span className="text-2xl">💻</span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Code Explainer</h2>
                      <p className="text-slate-100">Understand your code better</p>
                    </div>
                  </div>
                </div>
                <div className="p-8 space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-800">Code *</label>
                    <textarea
                      value={codeData.code}
                      onChange={(e) => handleInputChange('code', e.target.value)}
                      className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md resize-none font-mono text-sm"
                      rows={8}
                      placeholder="function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-800">Programming Language</label>
                      <select
                        value={codeData.language}
                        onChange={(e) => handleInputChange('language', e.target.value)}
                        className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md"
                      >
                        {PROGRAMMING_LANGUAGES.map(lang => (
                          <option key={lang} value={lang}>{lang}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-800">Explanation Level</label>
                      <select
                        value={codeData.explanationLevel}
                        onChange={(e) => handleInputChange('explanationLevel', e.target.value)}
                        className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md"
                      >
                        {EXPLANATION_LEVELS.map(level => (
                          <option key={level} value={level}>{level}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-800">Focus Areas</label>
                    <select
                      value={codeData.focusAreas}
                      onChange={(e) => handleInputChange('focusAreas', e.target.value)}
                      className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md"
                    >
                      {FOCUS_AREAS.map(area => (
                        <option key={area} value={area}>{area}</option>
                      ))}
                    </select>
                  </div>

                  <div className="pt-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-slate-500 to-gray-600 rounded-2xl blur-sm opacity-75"></div>
                      <button
                        onClick={generateExplanation}
                        disabled={isGenerating}
                        className="relative w-full bg-gradient-to-r from-slate-500 to-gray-600 hover:from-slate-600 hover:to-gray-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                      >
                        <span className="flex items-center justify-center gap-2">
                          {isGenerating ? (
                            <>
                              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              Analyzing Code...
                            </>
                          ) : (
                            <>
                              <span>Explain Code</span>
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

          {/* Generated Explanation */}
          <div className="space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl blur-lg opacity-20"></div>
              <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                        <span className="text-2xl">✨</span>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white">Code Explanation</h2>
                        <p className="text-emerald-100">Your detailed analysis is ready</p>
                      </div>
                    </div>
                    {explanation && (
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
                  {explanation ? (
                    <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-6 shadow-inner">
                      <div className="prose prose-sm max-w-none">
                        <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans leading-relaxed">
                          {explanation}
                        </pre>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <span className="text-4xl">💻</span>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">Your Code Analysis Awaits</h3>
                      <p className="text-gray-600">Paste your code and get a detailed explanation</p>
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