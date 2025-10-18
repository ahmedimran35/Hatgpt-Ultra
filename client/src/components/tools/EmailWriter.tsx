import { useState } from 'react';

interface EmailData {
  recipient: string;
  subject: string;
  purpose: string;
  tone: string;
  length: string;
  keyPoints: string;
}

const EMAIL_TONES = ['Professional', 'Friendly', 'Formal', 'Casual'];
const EMAIL_LENGTHS = ['Short', 'Medium', 'Long'];

export default function EmailWriter() {
  const [emailData, setEmailData] = useState<EmailData>({
    recipient: '',
    subject: '',
    purpose: '',
    tone: 'Professional',
    length: 'Medium',
    keyPoints: ''
  });

  const [generatedEmail, setGeneratedEmail] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const handleInputChange = (field: keyof EmailData, value: string) => {
    setEmailData(prev => ({ ...prev, [field]: value }));
  };

  const generateEmail = async () => {
    if (!emailData.recipient || !emailData.purpose) {
      alert('Please fill in all required fields');
      return;
    }

    setIsGenerating(true);
    try {
      const prompt = `You are a professional email communication expert. Write a compelling, well-structured email with the following requirements:

EMAIL DETAILS:
- Recipient: ${emailData.recipient}
- Subject: ${emailData.subject}
- Purpose: ${emailData.purpose}
- Tone: ${emailData.tone}
- Key Points: ${emailData.keyPoints}
- Length: ${emailData.length}

WRITING GUIDELINES:
1. Use a clear, engaging subject line
2. Start with a professional greeting
3. Write a compelling opening that captures attention
4. Structure the body with clear paragraphs
5. Include all key points naturally
6. Use appropriate tone (${emailData.tone.toLowerCase()})
7. End with a strong call-to-action
8. Use professional closing
9. Keep it ${emailData.length.toLowerCase()}
10. Make it scannable with bullet points if needed

FORMAT:
- Subject: [Subject Line]
- Body: [Email Content]
- Closing: [Professional Closing]

Write a complete, professional email that achieves the purpose effectively.`;

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

      setGeneratedEmail(fullResponse);
    } catch (error) {
      console.error('Error generating email:', error);
      alert('Failed to generate email. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedEmail);
    alert('Email copied to clipboard!');
  };

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-100">
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className="space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl blur-lg opacity-20"></div>
              <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                      <span className="text-2xl">📧</span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Email Details</h2>
                      <p className="text-emerald-100">Craft your professional email</p>
                    </div>
                  </div>
                </div>
                <div className="p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-800">Recipient *</label>
                      <input
                        type="text"
                        value={emailData.recipient}
                        onChange={(e) => handleInputChange('recipient', e.target.value)}
                        className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md"
                        placeholder="john@company.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-800">Subject</label>
                      <input
                        type="text"
                        value={emailData.subject}
                        onChange={(e) => handleInputChange('subject', e.target.value)}
                        className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md"
                        placeholder="Meeting Request"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-800">Purpose *</label>
                    <textarea
                      value={emailData.purpose}
                      onChange={(e) => handleInputChange('purpose', e.target.value)}
                      className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md resize-none"
                      rows={3}
                      placeholder="What is the main purpose of this email?"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-800">Tone</label>
                      <select
                        value={emailData.tone}
                        onChange={(e) => handleInputChange('tone', e.target.value)}
                        className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md"
                      >
                        {EMAIL_TONES.map(tone => (
                          <option key={tone} value={tone}>{tone}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-800">Length</label>
                      <select
                        value={emailData.length}
                        onChange={(e) => handleInputChange('length', e.target.value)}
                        className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md"
                      >
                        {EMAIL_LENGTHS.map(length => (
                          <option key={length} value={length}>{length}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-800">Key Points to Include</label>
                    <textarea
                      value={emailData.keyPoints}
                      onChange={(e) => handleInputChange('keyPoints', e.target.value)}
                      className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md resize-none"
                      rows={3}
                      placeholder="List the key points you want to include in the email..."
                    />
                  </div>

                  <div className="pt-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl blur-sm opacity-75"></div>
                      <button
                        onClick={generateEmail}
                        disabled={isGenerating}
                        className="relative w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                      >
                        <span className="flex items-center justify-center gap-2">
                          {isGenerating ? (
                            <>
                              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              Generating Email...
                            </>
                          ) : (
                            <>
                              <span>Generate Email</span>
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

          {/* Generated Email */}
          <div className="space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-600 rounded-3xl blur-lg opacity-20"></div>
              <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                        <span className="text-2xl">✨</span>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white">Generated Email</h2>
                        <p className="text-purple-100">Your professional email is ready</p>
                      </div>
                    </div>
                    {generatedEmail && (
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
                  {generatedEmail ? (
                    <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-6 shadow-inner">
                      <div className="prose prose-sm max-w-none">
                        <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans leading-relaxed">
                          {generatedEmail}
                        </pre>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <span className="text-4xl">📧</span>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">Your Email Awaits</h3>
                      <p className="text-gray-600">Fill in your details and generate a professional email</p>
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