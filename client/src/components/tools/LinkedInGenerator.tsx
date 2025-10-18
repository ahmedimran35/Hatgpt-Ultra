import { useState } from 'react';

interface LinkedInData {
  topic: string;
  industry: string;
  tone: string;
  purpose: string;
  keyPoints: string;
  hashtags: string;
}

const LINKEDIN_TONES = ['Professional', 'Inspirational', 'Educational', 'Personal', 'Thought Leadership'];
const INDUSTRIES = ['Technology', 'Healthcare', 'Finance', 'Marketing', 'Education', 'Consulting', 'Other'];

export default function LinkedInGenerator() {
  const [linkedinData, setLinkedinData] = useState<LinkedInData>({
    topic: '',
    industry: 'Technology',
    tone: 'Professional',
    purpose: '',
    keyPoints: '',
    hashtags: ''
  });

  const [generatedPost, setGeneratedPost] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const handleInputChange = (field: keyof LinkedInData, value: string) => {
    setLinkedinData(prev => ({ ...prev, [field]: value }));
  };

  const generatePost = async () => {
    if (!linkedinData.topic || !linkedinData.purpose) {
      alert('Please fill in all required fields');
      return;
    }

    setIsGenerating(true);
    try {
      const prompt = `You are a LinkedIn marketing expert and professional content strategist. Create an engaging, high-performing LinkedIn post with these specifications:

LINKEDIN POST DETAILS:
- Topic: ${linkedinData.topic}
- Industry: ${linkedinData.industry}
- Tone: ${linkedinData.tone}
- Purpose: ${linkedinData.purpose}
- Key Points: ${linkedinData.keyPoints}
- Hashtags: ${linkedinData.hashtags}

CONTENT STRATEGY:
1. Start with a compelling hook that grabs attention
2. Use storytelling or personal experience
3. Include valuable insights for the ${linkedinData.industry} industry
4. Keep it professional but engaging
5. Use ${linkedinData.tone.toLowerCase()} tone throughout
6. Include relevant data or examples
7. End with a strong call-to-action
8. Optimize for LinkedIn's algorithm
9. Use line breaks for readability
10. Include strategic hashtags

FORMAT:
- Hook: [Attention-grabbing opening]
- Body: [Valuable content with key points]
- Call-to-Action: [Engaging CTA]
- Hashtags: [Relevant hashtags]

Write a complete LinkedIn post that drives engagement and provides value to your professional network.`;

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

      setGeneratedPost(fullResponse);
    } catch (error) {
      console.error('Error generating LinkedIn post:', error);
      alert('Failed to generate LinkedIn post. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPost);
    alert('LinkedIn post copied to clipboard!');
  };

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className="space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl blur-lg opacity-20"></div>
              <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                      <span className="text-2xl">💼</span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">LinkedIn Post</h2>
                      <p className="text-blue-100">Create engaging professional content</p>
                    </div>
                  </div>
                </div>
                <div className="p-8 space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-800">Topic *</label>
                    <input
                      type="text"
                      value={linkedinData.topic}
                      onChange={(e) => handleInputChange('topic', e.target.value)}
                      className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md"
                      placeholder="The Future of Remote Work"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-800">Industry</label>
                      <select
                        value={linkedinData.industry}
                        onChange={(e) => handleInputChange('industry', e.target.value)}
                        className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md"
                      >
                        {INDUSTRIES.map(industry => (
                          <option key={industry} value={industry}>{industry}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-800">Tone</label>
                      <select
                        value={linkedinData.tone}
                        onChange={(e) => handleInputChange('tone', e.target.value)}
                        className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md"
                      >
                        {LINKEDIN_TONES.map(tone => (
                          <option key={tone} value={tone}>{tone}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-800">Purpose *</label>
                    <textarea
                      value={linkedinData.purpose}
                      onChange={(e) => handleInputChange('purpose', e.target.value)}
                      className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md resize-none"
                      rows={3}
                      placeholder="What do you want to achieve with this post? (Share insights, build network, generate leads, etc.)"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-800">Key Points to Include</label>
                    <textarea
                      value={linkedinData.keyPoints}
                      onChange={(e) => handleInputChange('keyPoints', e.target.value)}
                      className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md resize-none"
                      rows={3}
                      placeholder="List the main points you want to cover in your post..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-800">Hashtags</label>
                    <input
                      type="text"
                      value={linkedinData.hashtags}
                      onChange={(e) => handleInputChange('hashtags', e.target.value)}
                      className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md"
                      placeholder="#RemoteWork #FutureOfWork #Productivity"
                    />
                  </div>

                  <div className="pt-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl blur-sm opacity-75"></div>
                      <button
                        onClick={generatePost}
                        disabled={isGenerating}
                        className="relative w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                      >
                        <span className="flex items-center justify-center gap-2">
                          {isGenerating ? (
                            <>
                              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              Generating Post...
                            </>
                          ) : (
                            <>
                              <span>Generate LinkedIn Post</span>
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

          {/* Generated LinkedIn Post */}
          <div className="space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-3xl blur-lg opacity-20"></div>
              <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-teal-500 to-cyan-600 p-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                        <span className="text-2xl">✨</span>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white">Generated Post</h2>
                        <p className="text-teal-100">Your LinkedIn content is ready</p>
                      </div>
                    </div>
                    {generatedPost && (
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
                  {generatedPost ? (
                    <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-6 shadow-inner">
                      <div className="prose prose-sm max-w-none">
                        <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans leading-relaxed">
                          {generatedPost}
                        </pre>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <div className="w-20 h-20 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <span className="text-4xl">💼</span>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">Your LinkedIn Post Awaits</h3>
                      <p className="text-gray-600">Fill in your details and generate engaging professional content</p>
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