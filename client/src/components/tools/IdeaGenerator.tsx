import { useState } from 'react';

interface IdeaData {
  topic: string;
  industry: string;
  ideaType: string;
  targetAudience: string;
  constraints: string;
}

const INDUSTRIES = ['Technology', 'Healthcare', 'Education', 'Finance', 'Marketing', 'E-commerce', 'Entertainment', 'Other'];
const IDEA_TYPES = ['Business Ideas', 'Creative Projects', 'Product Concepts', 'Marketing Campaigns', 'Content Ideas', 'Innovation Solutions'];
const TARGET_AUDIENCES = ['General Public', 'Professionals', 'Students', 'Entrepreneurs', 'Creators', 'Business Owners'];

export default function IdeaGenerator() {
  const [ideaData, setIdeaData] = useState<IdeaData>({
    topic: '',
    industry: 'Technology',
    ideaType: 'Business Ideas',
    targetAudience: 'General Public',
    constraints: ''
  });

  const [ideas, setIdeas] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const handleInputChange = (field: keyof IdeaData, value: string) => {
    setIdeaData(prev => ({ ...prev, [field]: value }));
  };

  const generateIdeas = async () => {
    if (!ideaData.topic.trim()) {
      alert('Please enter a topic or area of interest');
      return;
    }

    setIsGenerating(true);
    try {
      const prompt = `You are a creative innovation expert and business strategist. Generate innovative and practical ideas with the following specifications:

IDEA GENERATION REQUEST:
- Topic/Area: ${ideaData.topic}
- Industry: ${ideaData.industry}
- Idea Type: ${ideaData.ideaType}
- Target Audience: ${ideaData.targetAudience}
- Constraints: ${ideaData.constraints || 'No specific constraints'}

REQUIREMENTS:
1. Generate 5-7 unique, innovative ideas
2. Focus on ${ideaData.ideaType.toLowerCase()} for the ${ideaData.industry} industry
3. Target audience: ${ideaData.targetAudience}
4. Consider practical implementation
5. Include feasibility analysis
6. Provide actionable insights
7. Think outside the box while being realistic
8. Consider market trends and opportunities
9. Include potential challenges and solutions
10. Make ideas specific and detailed

FORMAT YOUR RESPONSE AS:
INNOVATIVE IDEAS:

1. [Idea Title]
   - Description: [Detailed explanation]
   - Target Market: [Who would use this]
   - Implementation: [How to execute]
   - Potential Impact: [Expected results]

2. [Idea Title]
   - Description: [Detailed explanation]
   - Target Market: [Who would use this]
   - Implementation: [How to execute]
   - Potential Impact: [Expected results]

[Continue for all ideas...]

MARKET OPPORTUNITIES:
- [Key trends and opportunities in this space]

IMPLEMENTATION TIPS:
- [Practical advice for bringing ideas to life]

Please provide creative, innovative, and actionable ideas that could make a real impact in the ${ideaData.industry} industry.`;

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

      setIdeas(fullResponse);
    } catch (error) {
      console.error('Error generating ideas:', error);
      alert('Failed to generate ideas. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(ideas);
    alert('Ideas copied to clipboard!');
  };

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-slate-50 via-yellow-50 to-orange-100">
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className="space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-3xl blur-lg opacity-20"></div>
              <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-yellow-500 to-orange-600 p-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                      <span className="text-2xl">💡</span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Idea Generator</h2>
                      <p className="text-yellow-100">Spark your creativity</p>
                    </div>
                  </div>
                </div>
                <div className="p-8 space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-800">Topic/Area of Interest *</label>
                    <input
                      type="text"
                      value={ideaData.topic}
                      onChange={(e) => handleInputChange('topic', e.target.value)}
                      className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md"
                      placeholder="AI-powered solutions, sustainable living, remote work..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-800">Industry</label>
                      <select
                        value={ideaData.industry}
                        onChange={(e) => handleInputChange('industry', e.target.value)}
                        className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md"
                      >
                        {INDUSTRIES.map(industry => (
                          <option key={industry} value={industry}>{industry}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-800">Idea Type</label>
                      <select
                        value={ideaData.ideaType}
                        onChange={(e) => handleInputChange('ideaType', e.target.value)}
                        className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md"
                      >
                        {IDEA_TYPES.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-800">Target Audience</label>
                    <select
                      value={ideaData.targetAudience}
                      onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                      className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md"
                    >
                      {TARGET_AUDIENCES.map(audience => (
                        <option key={audience} value={audience}>{audience}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-800">Constraints/Requirements</label>
                    <textarea
                      value={ideaData.constraints}
                      onChange={(e) => handleInputChange('constraints', e.target.value)}
                      className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md resize-none"
                      rows={3}
                      placeholder="Budget limitations, time constraints, specific requirements..."
                    />
                  </div>

                  <div className="pt-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-2xl blur-sm opacity-75"></div>
                      <button
                        onClick={generateIdeas}
                        disabled={isGenerating}
                        className="relative w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                      >
                        <span className="flex items-center justify-center gap-2">
                          {isGenerating ? (
                            <>
                              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              Generating Ideas...
                            </>
                          ) : (
                            <>
                              <span>Generate Ideas</span>
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

          {/* Generated Ideas */}
          <div className="space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-rose-500 to-pink-600 rounded-3xl blur-lg opacity-20"></div>
              <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-rose-500 to-pink-600 p-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                        <span className="text-2xl">✨</span>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white">Generated Ideas</h2>
                        <p className="text-rose-100">Your creative solutions are ready</p>
                      </div>
                    </div>
                    {ideas && (
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
                  {ideas ? (
                    <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-6 shadow-inner">
                      <div className="prose prose-sm max-w-none">
                        <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans leading-relaxed">
                          {ideas}
                        </pre>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <div className="w-20 h-20 bg-gradient-to-br from-rose-100 to-pink-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <span className="text-4xl">💡</span>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">Your Ideas Await</h3>
                      <p className="text-gray-600">Enter your topic and get innovative ideas</p>
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