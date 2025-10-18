import React, { useEffect } from 'react';
import Button from './Button';

interface SmartAnswerProps {
  onSendPrompt: (prompt: string) => Promise<void>;
  isSending: boolean;
  prompt: string;
  setPrompt: (prompt: string) => void;
  messages: any[];
  onSmartSend: () => void;
  onClearChat: () => void;
  onStopGeneration?: () => void;
}

const SmartAnswer: React.FC<SmartAnswerProps> = ({
  // onSendPrompt not directly used within this component (actions come from parent)
  onSendPrompt: _onSendPrompt,
  isSending,
  // prompt and setPrompt not directly used here (display-only for now)
  prompt: _prompt,
  setPrompt: _setPrompt,
  messages,
  // onSmartSend not directly used here; actions wired in parent toolbar
  onSmartSend: _onSmartSend,
  onClearChat,
  onStopGeneration
}) => {
  // Debug: Log when messages change
  useEffect(() => {
    console.log('SmartAnswer messages updated:', messages);
  }, [messages]);


  const clearSmartChat = () => {
    onClearChat();
  };

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-100">
      <div className="max-w-6xl mx-auto p-6">
        {/* Hero Header */}
        <div className="relative overflow-hidden mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/10 via-teal-600/10 to-cyan-600/10"></div>
          <div className="relative text-center py-12">
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg mb-6">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 animate-pulse"></div>
              <span className="text-sm font-semibold text-gray-700">Smart AI Assistant</span>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-emerald-900 to-teal-900 bg-clip-text text-transparent mb-4">
              Smart Answer
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Ask any question and I'll automatically analyze it to select the best AI model for the perfect answer!
            </p>
          </div>
        </div>

        {/* Main Chat Container */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl blur-lg opacity-20"></div>
          <div className="relative bg-white/90 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden">
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                    <span className="text-2xl">🧠</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-bold text-white">Smart AI Assistant</h2>
                      {isSending && (
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 border border-white/30">
                          <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
                          <span className="text-xs text-white font-medium">
                            Processing...
                          </span>
                        </div>
                      )}
                    </div>
                    <p className="text-emerald-100 text-sm">AI-Powered Question Routing</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {isSending && onStopGeneration && (
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-600 rounded-xl blur-sm opacity-75"></div>
                      <Button 
                        onClick={onStopGeneration}
                        className="relative bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-lg transform hover:scale-105 transition-all duration-300"
                      >
                        ⏹️ Stop
                      </Button>
                    </div>
                  )}
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-500 to-gray-600 rounded-xl blur-sm opacity-75"></div>
                    <Button 
                      onClick={clearSmartChat}
                      className="relative bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-lg transform hover:scale-105 transition-all duration-300"
                    >
                      🗑️ Clear
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            {/* Chat Content */}
            <div className="p-8 min-h-[500px]">
              {isSending && messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-center py-20">
                  <div className="space-y-8">
                    <div className="relative">
                      <div className="w-24 h-24 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl">
                        <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl blur-lg opacity-30"></div>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-3xl font-bold text-gray-800">🤖 AI is responding...</h3>
                      <p className="text-gray-600 text-lg max-w-md mx-auto">
                        Getting the perfect answer from the selected AI model
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
                      <div className="w-3 h-3 rounded-full bg-teal-500 animate-pulse"></div>
                      <div className="w-3 h-3 rounded-full bg-cyan-500 animate-pulse"></div>
                    </div>
                  </div>
                </div>
              ) : messages.length > 0 ? (
                <div className="space-y-6">
                  {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] relative ${
                        msg.role === 'user' 
                          ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xl rounded-3xl px-6 py-4' 
                          : 'bg-gradient-to-br from-gray-50 to-white border border-gray-200 text-gray-900 shadow-lg rounded-3xl px-6 py-4'
                      }`}>
                        <div className="text-sm leading-relaxed whitespace-pre-wrap">
                          {msg.text}
                          {msg.isStreaming && (
                            <span className="inline-block w-2 h-4 bg-emerald-500 ml-1 animate-pulse" />
                          )}
                        </div>
                        {msg.model && (
                          <div className="mt-3 flex items-center gap-2 text-xs">
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                              <span className={msg.role === 'user' ? 'text-emerald-100' : 'text-gray-500'}>
                                Smart AI selected:
                              </span>
                            </div>
                            <span className={`font-semibold ${msg.role === 'user' ? 'text-emerald-100' : 'text-emerald-600'}`}>
                              {msg.model}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-center py-20">
                  <div className="space-y-8">
                    <div className="relative">
                      <div className="w-24 h-24 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-3xl flex items-center justify-center mx-auto shadow-xl">
                        <span className="text-4xl">🧠</span>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl blur-lg opacity-20"></div>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-3xl font-bold text-gray-800">Smart Answer</h3>
                      <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                        Ask any question and I'll automatically analyze it to select the best AI model for the perfect answer!
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl blur-sm opacity-20"></div>
                        <div className="relative p-6 bg-gradient-to-br from-emerald-50 to-white border border-emerald-200 rounded-2xl shadow-lg">
                          <div className="text-emerald-600 font-bold text-lg mb-3 flex items-center gap-2">
                            <span className="text-2xl">🧠</span>
                            Smart Analysis
                          </div>
                          <div className="text-sm text-gray-600">Automatically analyzes your question to understand context and requirements</div>
                        </div>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-2xl blur-sm opacity-20"></div>
                        <div className="relative p-6 bg-gradient-to-br from-teal-50 to-white border border-teal-200 rounded-2xl shadow-lg">
                          <div className="text-teal-600 font-bold text-lg mb-3 flex items-center gap-2">
                            <span className="text-2xl">🎯</span>
                            Perfect Match
                          </div>
                          <div className="text-sm text-gray-600">Routes to the best AI model for optimal results</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                      <div className="w-3 h-3 rounded-full bg-teal-500"></div>
                      <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartAnswer;
