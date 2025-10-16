import React, { useState, useEffect } from 'react';
import Button from './Button';
import { Card, CardBody, CardHeader } from './Card';

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
  onSendPrompt,
  isSending,
  prompt,
  setPrompt,
  messages,
  onSmartSend,
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
    <div className="h-full max-w-5xl mx-auto min-h-0">
      <Card className="flex flex-col h-full min-h-0 border-0 shadow-2xl bg-white/95 backdrop-blur-sm rounded-3xl overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between p-6 border-b border-gray-200/50 flex-shrink-0 bg-gradient-to-r from-white/95 to-emerald-50/30 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-400 flex items-center justify-center shadow-lg">
              <div className="h-4 w-4 rounded bg-white/90" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-gray-900 text-lg">Smart Answer</span>
                {isSending && (
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-200">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs text-emerald-700 font-medium">
                      Processing...
                    </span>
                  </div>
                )}
              </div>
              <div className="text-sm text-gray-500 mt-1">AI-Powered Question Routing</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isSending && onStopGeneration && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onStopGeneration}
                className="text-red-500 hover:text-red-700 hover:bg-red-100 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200"
              >
                ⏹️ Stop
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearSmartChat}
              className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200"
            >
              🗑️ Clear
            </Button>
          </div>
        </CardHeader>
        <CardBody className="flex-1 p-0 overflow-hidden min-h-0">
          <div className="space-y-4 overflow-y-auto h-full p-6 overscroll-contain touch-pan-y scrollbar-thin scrollbar-thumb-emerald-200 scrollbar-track-transparent">
            {console.log('SmartAnswer render state:', { isSending, messagesLength: messages.length })}
            {isSending && messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-center">
                <div className="space-y-6">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 mx-auto flex items-center justify-center shadow-lg">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-400 animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-gray-900">🤖 AI is responding...</h3>
                    <p className="text-gray-600 max-w-md mx-auto">
                      Getting the perfect answer from the selected AI model
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                    <div className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse"></div>
                    <div className="h-1 w-1 rounded-full bg-teal-400 animate-pulse"></div>
                    <div className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse"></div>
                  </div>
                </div>
              </div>
            ) : messages.length > 0 ? (
              <>
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-5 py-4 shadow-sm ${
                      msg.role === 'user' 
                        ? 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg' 
                        : 'bg-gradient-to-br from-gray-50 to-white border border-gray-200 text-gray-900 shadow-sm'
                    }`}>
                      <div className="text-sm leading-relaxed whitespace-pre-wrap">
                        {msg.text}
                        {msg.isStreaming && (
                          <span className="inline-block w-2 h-4 bg-emerald-500 ml-1 animate-pulse" />
                        )}
                      </div>
                      {msg.model && (
                        <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
                            <span>Smart AI selected:</span>
                          </div>
                          <span className="font-medium text-emerald-600">{msg.model}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-center">
                <div className="space-y-6">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 mx-auto flex items-center justify-center shadow-lg">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-400" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-gray-900">Smart Answer</h3>
                    <p className="text-gray-600 max-w-md mx-auto">
                      Ask any question and I'll automatically analyze it to select the best AI model for the perfect answer!
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
                    <div className="p-4 bg-gradient-to-br from-emerald-50 to-white border border-emerald-200 rounded-xl">
                      <div className="text-emerald-600 font-bold text-sm mb-2">🧠 Smart Analysis</div>
                      <div className="text-xs text-gray-600">Automatically analyzes your question</div>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-teal-50 to-white border border-teal-200 rounded-xl">
                      <div className="text-teal-600 font-bold text-sm mb-2">🎯 Perfect Match</div>
                      <div className="text-xs text-gray-600">Routes to the best AI model</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                    <div className="h-1 w-1 rounded-full bg-emerald-400"></div>
                    <div className="h-1 w-1 rounded-full bg-teal-400"></div>
                    <div className="h-1 w-1 rounded-full bg-emerald-400"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default SmartAnswer;
