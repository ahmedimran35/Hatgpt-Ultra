import { useState } from 'react';

interface BlogData {
  topic: string;
  targetAudience: string;
  tone: string;
  length: string;
  keyPoints: string;
  callToAction: string;
}

const BLOG_TONES = ['Professional', 'Casual', 'Friendly', 'Authoritative'];
const BLOG_LENGTHS = ['Short (500-800 words)', 'Medium (800-1200 words)', 'Long (1200+ words)'];

export default function BlogWriter() {
  const [blogData, setBlogData] = useState<BlogData>({
    topic: '',
    targetAudience: '',
    tone: 'Professional',
    length: 'Medium (800-1200 words)',
    keyPoints: '',
    callToAction: ''
  });

  const [generatedBlog, setGeneratedBlog] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const handleInputChange = (field: keyof BlogData, value: string) => {
    setBlogData(prev => ({ ...prev, [field]: value }));
  };

  const generateBlog = async () => {
    if (!blogData.topic || !blogData.targetAudience) {
      alert('Please fill in all required fields');
      return;
    }

    setIsGenerating(true);
    try {
      const prompt = `You are a professional content writer and SEO expert. Create an engaging, high-quality blog post with the following specifications:

BLOG DETAILS:
- Topic: ${blogData.topic}
- Target Audience: ${blogData.targetAudience}
- Tone: ${blogData.tone}
- Length: ${blogData.length}
- Key Points: ${blogData.keyPoints}
- Call to Action: ${blogData.callToAction}

CONTENT REQUIREMENTS:
1. Create a compelling, SEO-friendly headline
2. Write an engaging introduction that hooks readers
3. Structure content with clear headings and subheadings
4. Include all key points with supporting details
5. Use ${blogData.tone.toLowerCase()} tone throughout
6. Make it approximately ${blogData.length.toLowerCase()}
7. Include relevant examples and insights
8. End with a strong call-to-action
9. Use bullet points and formatting for readability
10. Optimize for search engines and user engagement

FORMAT:
- Headline: [Compelling Title]
- Introduction: [Hook and overview]
- Main Content: [Structured sections with key points]
- Conclusion: [Summary and call-to-action]

Write a complete, professional blog post that provides value to the target audience.`;

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

      setGeneratedBlog(fullResponse);
    } catch (error) {
      console.error('Error generating blog:', error);
      alert('Failed to generate blog post. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedBlog);
    alert('Blog post copied to clipboard!');
  };

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-slate-50 via-orange-50 to-amber-100">
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className="space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-600 rounded-3xl blur-lg opacity-20"></div>
              <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-orange-500 to-amber-600 p-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                      <span className="text-2xl">📝</span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Blog Details</h2>
                      <p className="text-orange-100">Create engaging blog content</p>
                    </div>
                  </div>
                </div>
                <div className="p-8 space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-800">Topic *</label>
                    <input
                      type="text"
                      value={blogData.topic}
                      onChange={(e) => handleInputChange('topic', e.target.value)}
                      className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md"
                      placeholder="The Future of AI in Healthcare"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-800">Target Audience *</label>
                    <input
                      type="text"
                      value={blogData.targetAudience}
                      onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                      className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md"
                      placeholder="Healthcare professionals, tech enthusiasts"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-800">Tone</label>
                      <select
                        value={blogData.tone}
                        onChange={(e) => handleInputChange('tone', e.target.value)}
                        className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md"
                      >
                        {BLOG_TONES.map(tone => (
                          <option key={tone} value={tone}>{tone}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-800">Length</label>
                      <select
                        value={blogData.length}
                        onChange={(e) => handleInputChange('length', e.target.value)}
                        className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md"
                      >
                        {BLOG_LENGTHS.map(length => (
                          <option key={length} value={length}>{length}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-800">Key Points to Include</label>
                    <textarea
                      value={blogData.keyPoints}
                      onChange={(e) => handleInputChange('keyPoints', e.target.value)}
                      className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md resize-none"
                      rows={3}
                      placeholder="List the key points you want to cover in your blog post..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-800">Call to Action</label>
                    <input
                      type="text"
                      value={blogData.callToAction}
                      onChange={(e) => handleInputChange('callToAction', e.target.value)}
                      className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md"
                      placeholder="Subscribe to our newsletter, Download our guide, etc."
                    />
                  </div>

                  <div className="pt-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-600 rounded-2xl blur-sm opacity-75"></div>
                      <button
                        onClick={generateBlog}
                        disabled={isGenerating}
                        className="relative w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                      >
                        <span className="flex items-center justify-center gap-2">
                          {isGenerating ? (
                            <>
                              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              Generating Blog...
                            </>
                          ) : (
                            <>
                              <span>Generate Blog Post</span>
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

          {/* Generated Blog */}
          <div className="space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl blur-lg opacity-20"></div>
              <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                        <span className="text-2xl">✨</span>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white">Generated Blog Post</h2>
                        <p className="text-indigo-100">Your engaging content is ready</p>
                      </div>
                    </div>
                    {generatedBlog && (
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
                  {generatedBlog ? (
                    <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-6 shadow-inner">
                      <div className="prose prose-sm max-w-none">
                        <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans leading-relaxed">
                          {generatedBlog}
                        </pre>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <span className="text-4xl">📝</span>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">Your Blog Post Awaits</h3>
                      <p className="text-gray-600">Fill in your details and generate engaging content</p>
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