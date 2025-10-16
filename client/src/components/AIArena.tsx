import { useState, useRef } from 'react';
import Button from './Button';
import { Card, CardBody, CardHeader } from './Card';

interface DebateMessage {
  id: string;
  model: string;
  content: string;
  timestamp: Date;
  votes: number;
}

interface DebateResult {
  question: string;
  model1: string;
  model2: string;
  model1Votes: number;
  model2Votes: number;
  totalVotes: number;
  winner: string;
  createdAt: Date;
}

export default function AIArena() {
  const [question, setQuestion] = useState('');
  const [isDebating, setIsDebating] = useState(false);
  const [debateMessages, setDebateMessages] = useState<DebateMessage[]>([]);
  const [selectedModels, setSelectedModels] = useState<{model1: string, model2: string}>({
    model1: 'gpt-5-nano',
    model2: 'claude-sonnet-4'
  });
  const [debateResults, setDebateResults] = useState<DebateResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [userVotes, setUserVotes] = useState<Record<string, string>>({});
  const [streamingModels, setStreamingModels] = useState<Set<string>>(new Set());
  const debateListRef = useRef<HTMLDivElement>(null);

  // Available models for arena
  const ARENA_MODELS = [
    { id: 'gpt-5-nano', label: 'GPT-5 nano', icon: '🧠' },
    { id: 'claude-sonnet-4', label: 'Claude Sonnet 4', icon: '🦋' },
    { id: 'deepseek-chat', label: 'DeepSeek Chat', icon: '🔎' },
    { id: 'deepseek-reasoner', label: 'DeepSeek Reasoner', icon: '🧩' },
    { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash', icon: '✨' },
    { id: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash', icon: '🌟' },
    { id: 'grok-beta', label: 'Grok Beta', icon: '🛰️' },
    { id: 'mistral', label: 'Mistral Small 3.1 24B', icon: '🌪️' },
  ];

  const startDebate = async () => {
    if (!question.trim()) return;

    setIsDebating(true);
    setDebateMessages([]);
    setShowResults(false);
    setUserVotes({});

    // Create debate prompt that encourages opposing views - SHORT responses
    const debatePrompt = `You are in a debate. Take a strong position on this topic: "${question}". 
    Give a SHORT, punchy argument (max 2-3 sentences). Be persuasive and direct. 
    Make your point quickly and powerfully.`;

    try {
      // Send to both models simultaneously
      const [model1Response, model2Response] = await Promise.all([
        sendToModel(selectedModels.model1, debatePrompt),
        sendToModel(selectedModels.model2, debatePrompt)
      ]);

      // Add both responses to debate
      const message1: DebateMessage = {
        id: `msg-${Date.now()}-1`,
        model: selectedModels.model1,
        content: model1Response,
        timestamp: new Date(),
        votes: 0
      };

      const message2: DebateMessage = {
        id: `msg-${Date.now()}-2`,
        model: selectedModels.model2,
        content: model2Response,
        timestamp: new Date(),
        votes: 0
      };

      setDebateMessages([message1, message2]);
      setIsDebating(false);
    } catch (error) {
      console.error('Debate error:', error);
      setIsDebating(false);
    }
  };

  const sendToModel = async (modelId: string, prompt: string): Promise<string> => {
    setStreamingModels(prev => new Set(prev).add(modelId));
    
    try {
      // Use Puter SDK like the main app
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const puterAny = (globalThis as any).puter;
      if (!puterAny?.ai?.chat) {
        setStreamingModels(prev => {
          const newSet = new Set(prev);
          newSet.delete(modelId);
          return newSet;
        });
        throw new Error('Puter SDK not loaded');
      }

      // Use Puter SDK for AI generation - same as main app
      const stream = await puterAny.ai.chat(prompt, { model: modelId, stream: true });
      let response = '';
      
      // The puter stream is async iterable
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      for await (const part of stream as any) {
        const chunk = part?.text ?? '';
        response += chunk;
      }

      setStreamingModels(prev => {
        const newSet = new Set(prev);
        newSet.delete(modelId);
        return newSet;
      });

      return response || 'No response generated';
    } catch (error) {
      setStreamingModels(prev => {
        const newSet = new Set(prev);
        newSet.delete(modelId);
        return newSet;
      });
      throw error;
    }
  };

  const voteForModel = (messageId: string, modelId: string) => {
    setUserVotes(prev => ({
      ...prev,
      [messageId]: modelId
    }));

    setDebateMessages(prev => 
      prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, votes: msg.votes + 1 }
          : msg
      )
    );
  };

  const finishDebate = () => {
    if (debateMessages.length < 2) return;

    const model1Votes = debateMessages.find(m => m.model === selectedModels.model1)?.votes || 0;
    const model2Votes = debateMessages.find(m => m.model === selectedModels.model2)?.votes || 0;
    const totalVotes = model1Votes + model2Votes;
    const winner = model1Votes > model2Votes ? selectedModels.model1 : selectedModels.model2;

    const result: DebateResult = {
      question,
      model1: selectedModels.model1,
      model2: selectedModels.model2,
      model1Votes,
      model2Votes,
      totalVotes,
      winner,
      createdAt: new Date()
    };

    setDebateResults(prev => [result, ...prev]);
    setShowResults(true);
  };

  const getModelInfo = (modelId: string) => {
    return ARENA_MODELS.find(m => m.id === modelId) || { label: modelId, icon: '🤖' };
  };

  const getModelIcon = (modelId: string) => {
    return getModelInfo(modelId).icon;
  };

  const getModelLabel = (modelId: string) => {
    return getModelInfo(modelId).label;
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6 overflow-y-auto h-full">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🥊 AI Arena</h1>
        <p className="text-gray-600">Watch AI models debate and vote for the winner!</p>
      </div>

      {/* Arena Setup */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">⚔️ Setup Your Battle</h2>
        </CardHeader>
        <CardBody className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Debate Question
            </label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Enter a controversial question for the AI models to debate..."
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fighter 1
              </label>
              <select
                value={selectedModels.model1}
                onChange={(e) => setSelectedModels(prev => ({ ...prev, model1: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500"
              >
                {ARENA_MODELS.map(model => (
                  <option 
                    key={model.id} 
                    value={model.id}
                    disabled={model.id === selectedModels.model2}
                  >
                    {model.icon} {model.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fighter 2
              </label>
              <select
                value={selectedModels.model2}
                onChange={(e) => setSelectedModels(prev => ({ ...prev, model2: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500"
              >
                {ARENA_MODELS.map(model => (
                  <option 
                    key={model.id} 
                    value={model.id}
                    disabled={model.id === selectedModels.model1}
                  >
                    {model.icon} {model.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Button
            onClick={startDebate}
            disabled={!question.trim() || isDebating}
            className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
          >
            {isDebating ? '🥊 Fighting...' : '🥊 Start Battle!'}
          </Button>
        </CardBody>
      </Card>

      {/* Debate Arena */}
      {debateMessages.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">🥊 Battle Arena</h2>
            <p className="text-gray-600">Question: "{question}"</p>
          </CardHeader>
          <CardBody>
            <div ref={debateListRef} className="space-y-4">
              {debateMessages.map((message) => (
                <div
                  key={message.id}
                  className={`p-4 rounded-lg border-2 ${
                    message.model === selectedModels.model1
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-red-500 bg-red-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getModelIcon(message.model)}</span>
                      <span className="font-semibold">{getModelLabel(message.model)}</span>
                      <span className="text-sm text-gray-500">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">
                        {message.votes} votes
                      </span>
                      <Button
                        size="sm"
                        onClick={() => voteForModel(message.id, message.model)}
                        disabled={userVotes[message.id] !== undefined}
                        className="bg-green-500 hover:bg-green-600"
                      >
                        {userVotes[message.id] ? '✅ Voted' : '👍 Vote'}
                      </Button>
                    </div>
                  </div>
                  <div className="text-gray-800 whitespace-pre-wrap">
                    {message.content}
                  </div>
                </div>
              ))}
            </div>

            {debateMessages.length === 2 && (
              <div className="mt-4 flex justify-center">
                <Button
                  onClick={finishDebate}
                  className="bg-purple-500 hover:bg-purple-600"
                >
                  🏆 End Battle & See Results
                </Button>
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {/* Results */}
      {showResults && debateResults.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">🏆 Battle Results</h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {debateResults.slice(0, 5).map((result, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{result.question}</h3>
                    <span className="text-sm text-gray-500">
                      {result.createdAt.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div className={`p-3 rounded-lg ${
                      result.winner === result.model1 ? 'bg-green-100 border-2 border-green-500' : 'bg-gray-100'
                    }`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">{getModelIcon(result.model1)}</span>
                        <span className="font-medium">{getModelLabel(result.model1)}</span>
                        {result.winner === result.model1 && <span className="text-green-600">👑</span>}
                      </div>
                      <div className="text-2xl font-bold text-blue-600">{result.model1Votes}</div>
                      <div className="text-sm text-gray-600">votes</div>
                    </div>

                    <div className={`p-3 rounded-lg ${
                      result.winner === result.model2 ? 'bg-green-100 border-2 border-green-500' : 'bg-gray-100'
                    }`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">{getModelIcon(result.model2)}</span>
                        <span className="font-medium">{getModelLabel(result.model2)}</span>
                        {result.winner === result.model2 && <span className="text-green-600">👑</span>}
                      </div>
                      <div className="text-2xl font-bold text-red-600">{result.model2Votes}</div>
                      <div className="text-sm text-gray-600">votes</div>
                    </div>
                  </div>

                  <div className="text-center">
                    <span className="text-lg font-semibold text-gray-700">
                      Winner: {getModelIcon(result.winner)} {getModelLabel(result.winner)}
                    </span>
                    <div className="text-sm text-gray-500">
                      Total votes: {result.totalVotes}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Loading States */}
      {streamingModels.size > 0 && (
        <div className="text-center">
          <div className="inline-flex items-center gap-2 text-gray-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-500"></div>
            <span>AI models are thinking...</span>
          </div>
        </div>
      )}
    </div>
  );
}
