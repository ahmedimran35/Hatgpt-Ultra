import { useState, useEffect } from 'react';
import Button from './Button';
import axios from '../config/axios';

interface CommunityBattle {
  id: string;
  question: string;
  model1: string;
  model2: string;
  model1Response: string;
  model2Response: string;
  model1Votes: number;
  model2Votes: number;
  totalVotes: number;
  creator: string;
  createdAt: string | Date;
  endTime: string | Date;
  isActive: boolean;
  participants: string[];
  hasVoted?: boolean;
  userVote?: string | null;
}

interface CreateBattleData {
  question: string;
  model1: string;
  model2: string;
  model1Response: string;
  model2Response: string;
  duration: number;
}

export default function CommunityArena() {
  const [battles, setBattles] = useState<CommunityBattle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [battlesPerPage] = useState(5);
  
  const [newBattle, setNewBattle] = useState<CreateBattleData>({
    question: '',
    model1: 'gpt-5-nano',
    model2: 'claude-sonnet-4',
    model1Response: '',
    model2Response: '',
    duration: 5
  });
  
  const [battleFilter, setBattleFilter] = useState<'all' | 'active' | 'closed'>('all');

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

  // Load battles from database
  const loadBattlesFromDatabase = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get('/api/community-battles', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Loaded battles from database:', response.data);
      setBattles(response.data || []);
    } catch (error: any) {
      console.error('Failed to load battles:', error);
      setError('Failed to load battles. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };


  // Load battles on component mount
  useEffect(() => {
    loadBattlesFromDatabase();
  }, []);


  // Auto-close expired battles
  useEffect(() => {
    const checkExpiredBattles = async () => {
      const now = new Date();
      const expiredBattles = battles.filter(battle => {
        if (!battle.isActive) return false;
        const endTime = new Date(battle.endTime);
        return now > endTime;
      });

      if (expiredBattles.length > 0) {
        console.log(`Found ${expiredBattles.length} expired battles, closing them...`);
        
        // Close expired battles by updating their status
        for (const battle of expiredBattles) {
          try {
            const token = localStorage.getItem('token');
            if (token) {
              await axios.put(`/api/community-battles/${battle.id}`, {
                isActive: false
              }, {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              });
            }
          } catch (error) {
            console.error('Failed to close expired battle:', error);
          }
        }
        
        // Reload battles to get updated status
        await loadBattlesFromDatabase();
      }
    };

    // Check every minute
    const interval = setInterval(checkExpiredBattles, 60000);
    checkExpiredBattles(); // Check immediately

    return () => clearInterval(interval);
  }, []); // Remove battles from dependency array to prevent infinite loop

  // Filter battles based on current filter and check for expired battles
  const filteredBattles = battles.filter(battle => {
    const now = new Date();
    const endTime = new Date(battle.endTime);
    const isExpired = now > endTime;
    
    // Mark expired battles as inactive
    if (isExpired && battle.isActive) {
      battle.isActive = false;
    }
    
    // Debug logging
    console.log(`Battle ${battle.id}: isActive=${battle.isActive}, isExpired=${isExpired}, filter=${battleFilter}`);
    
    if (battleFilter === 'active') {
      // Show only active battles that are not expired
      return battle.isActive && !isExpired;
    }
    if (battleFilter === 'closed') {
      // Show inactive battles or expired battles
      return !battle.isActive || isExpired;
    }
    return true; // 'all' - show all battles
  });

  // Pagination logic for all sections
  const totalPages = Math.ceil(filteredBattles.length / battlesPerPage);
  const startIndex = (currentPage - 1) * battlesPerPage;
  const endIndex = startIndex + battlesPerPage;
  const paginatedBattles = filteredBattles.slice(startIndex, endIndex);

  // Reset to first page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [battleFilter]);

  // Reset to first page when battles change
  useEffect(() => {
    setCurrentPage(1);
  }, [battles.length]);

  // Generate response for a model using Puter SDK (same as AI Arena)
  const generateResponse = async (question: string, model: string): Promise<string> => {
    try {
      // Use Puter SDK like the AI Arena
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const puterAny = (globalThis as any).puter;
      if (!puterAny?.ai?.chat) {
        throw new Error('Puter SDK not loaded');
      }

      // Add instruction for very short responses (3 lines max)
      const prompt = `Answer this in maximum 3 lines: "${question}". Be concise and direct.`;

      // Use Puter SDK for AI generation - same as AI Arena
      const stream = await puterAny.ai.chat(prompt, { model: model, stream: true });
      let response = '';
      
      // The puter stream is async iterable
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      for await (const part of stream as any) {
        const chunk = part?.text ?? '';
        response += chunk;
      }

      return response || 'No response generated';
    } catch (error) {
      console.error(`Failed to generate response for ${model}:`, error);
      return `Error generating response for ${model}`;
    }
  };

  // Create new battle
  const createBattle = async () => {
    if (!newBattle.question.trim()) {
      setError('Please enter a question for the battle');
      return;
    }

    if (newBattle.model1 === newBattle.model2) {
      setError('Please select different models for the battle');
      return;
    }

    setIsCreating(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Please log in to create battles');
      }

      // Generate responses for both models
      console.log('Generating responses for both models...');
      const [model1Response, model2Response] = await Promise.all([
        generateResponse(newBattle.question, newBattle.model1),
        generateResponse(newBattle.question, newBattle.model2)
      ]);

      // Calculate end time based on duration
      const endTime = new Date();
      endTime.setMinutes(endTime.getMinutes() + newBattle.duration);

      const battleData = {
        question: newBattle.question,
        model1: newBattle.model1,
        model2: newBattle.model2,
        model1Response: model1Response,
        model2Response: model2Response,
        duration: newBattle.duration,
        endTime: endTime.toISOString()
      };

      console.log('Creating battle with data:', battleData);

      const response = await axios.post('/api/community-battles', battleData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Battle created successfully:', response.data);
      setSuccess('Battle created successfully!');

      // Reset form and reload battles
      setNewBattle({
        question: '',
        model1: 'gpt-5-nano',
        model2: 'claude-sonnet-4',
        model1Response: '',
        model2Response: '',
        duration: 5
      });
      setShowCreateForm(false);
      
      // Switch to Active tab to show the new battle
      setBattleFilter('active');
      
      await loadBattlesFromDatabase();

    } catch (error: any) {
      console.error('Failed to create battle:', error);
      setError(error.response?.data?.error || error.message || 'Failed to create battle. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  // Vote for a model
  const voteForModel = async (battleId: string, model: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to vote');
        return;
      }

      // Find the battle to check if it's expired
      const battle = battles.find(b => b.id === battleId);
      if (battle) {
        const now = new Date();
        const endTime = new Date(battle.endTime);
        if (now > endTime) {
          setError('This battle has expired. You cannot vote on expired battles.');
          return;
        }
      }

      setError(null);

      const response = await axios.post(`/api/community-battles/${battleId}/vote`, {
        model: model
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Vote recorded successfully:', response.data);

      setSuccess('Vote recorded successfully!');
      
      // Reload battles to get updated vote counts and vote status
      await loadBattlesFromDatabase();

    } catch (error: any) {
      console.error('Failed to vote:', error);
      setError(error.response?.data?.error || 'Failed to vote. Please try again.');
    }
  };

  // Get battle result text
  const getBattleResult = (battle: CommunityBattle, model: 'model1' | 'model2') => {
    if (battle.totalVotes === 0) return 'No Votes';
    
    const votes = model === 'model1' ? battle.model1Votes : battle.model2Votes;
    const otherVotes = model === 'model1' ? battle.model2Votes : battle.model1Votes;
    
    if (votes > otherVotes) return 'Win';
    if (votes < otherVotes) return 'Lose';
    return 'Draw';
  };

  // Get overall battle winner (only for closed/expired battles)
  const getBattleWinner = (battle: CommunityBattle) => {
    const now = new Date();
    const endTime = new Date(battle.endTime);
    const isExpired = now > endTime;
    
    // Only show winner if battle is closed or expired
    if (battle.isActive && !isExpired) {
      return '⏳ Battle in Progress...';
    }
    
    if (battle.totalVotes === 0) return 'No Votes';
    
    if (battle.model1Votes > battle.model2Votes) {
      const model1Info = getModelInfo(battle.model1);
      return `${model1Info.icon} ${model1Info.label} Wins!`;
    } else if (battle.model2Votes > battle.model1Votes) {
      const model2Info = getModelInfo(battle.model2);
      return `${model2Info.icon} ${model2Info.label} Wins!`;
    } else {
      return '🤝 Draw!';
    }
  };

  // Format date
  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleString();
  };

  // Get time remaining for active battles
  const getTimeRemaining = (endTime: string | Date) => {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h remaining`;
    if (hours > 0) return `${hours}h ${minutes % 60}m remaining`;
    return `${minutes}m remaining`;
  };

  // Get model info
  const getModelInfo = (modelId: string) => {
    return ARENA_MODELS.find(m => m.id === modelId) || { id: modelId, label: modelId, icon: '🤖' };
  };

  // Clear messages after 3 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  if (isLoading) {
    return (
      <div className="h-full overflow-y-auto bg-gradient-to-br from-slate-50 via-purple-50 to-pink-100">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                  <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-600 rounded-3xl blur-lg opacity-30"></div>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Loading Arena...</h3>
              <p className="text-gray-600">Preparing epic AI battles for you</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-slate-50 via-purple-50 to-pink-100">
      <div className="max-w-7xl mx-auto p-6">
        {/* Hero Header */}
        <div className="relative overflow-hidden mb-12">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-pink-600/10 to-blue-600/10"></div>
          <div className="relative text-center py-16">
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg mb-6">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse"></div>
              <span className="text-sm font-semibold text-gray-700">AI Battle Arena</span>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-pink-900 bg-clip-text text-transparent mb-6">
              Community Arena
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Watch AI models battle it out on various topics. Vote for your favorites and see who comes out on top!
            </p>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-8 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl blur-sm opacity-20"></div>
            <div className="relative bg-white/90 backdrop-blur-xl border border-red-200 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                  <span className="text-red-600 text-xl">⚠️</span>
                </div>
                <p className="text-red-800 font-medium">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {success && (
          <div className="mb-8 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl blur-sm opacity-20"></div>
            <div className="relative bg-white/90 backdrop-blur-xl border border-green-200 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <span className="text-green-600 text-xl">✅</span>
                </div>
                <p className="text-green-800 font-medium">{success}</p>
              </div>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl blur-sm opacity-20"></div>
            <div className="relative bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl p-2 shadow-xl">
              <div className="flex space-x-2">
                {[
                  { key: 'all', label: 'All Battles', icon: '🏆' },
                  { key: 'active', label: 'Active', icon: '⚡' },
                  { key: 'closed', label: 'Closed', icon: '🏁' }
                ].map(({ key, label, icon }) => (
                  <button
                    key={key}
                    onClick={() => setBattleFilter(key as 'all' | 'active' | 'closed')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                      battleFilter === key
                        ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg transform scale-105'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                    }`}
                  >
                    <span>{icon}</span>
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Create Battle Button */}
        <div className="mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur-sm opacity-75"></div>
            <Button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="relative bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 rounded-2xl font-semibold shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <span className="flex items-center gap-3">
                <span className="text-xl">{showCreateForm ? '❌' : '⚔️'}</span>
                <span>{showCreateForm ? 'Cancel Battle' : 'Create New Battle'}</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </Button>
          </div>
        </div>

        {/* Create Battle Form */}
        {showCreateForm && (
          <div className="mb-8 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl blur-lg opacity-20"></div>
            <div className="relative bg-white/90 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                    <span className="text-2xl">⚔️</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Create New Battle</h3>
                    <p className="text-blue-100">Set up an epic AI showdown</p>
                  </div>
                </div>
              </div>
              <div className="p-8 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    Battle Question
                  </label>
                  <textarea
                    value={newBattle.question}
                    onChange={(e) => setNewBattle({ ...newBattle, question: e.target.value })}
                    placeholder="Enter the question for the AI models to answer..."
                    className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md resize-none"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                      Model 1
                    </label>
                    <select
                      value={newBattle.model1}
                      onChange={(e) => setNewBattle({ ...newBattle, model1: e.target.value })}
                      className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md"
                    >
                      {ARENA_MODELS.map(model => (
                        <option key={model.id} value={model.id}>
                          {model.icon} {model.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                      Model 2
                    </label>
                    <select
                      value={newBattle.model2}
                      onChange={(e) => setNewBattle({ ...newBattle, model2: e.target.value })}
                      className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md"
                    >
                      {ARENA_MODELS.map(model => (
                        <option key={model.id} value={model.id}>
                          {model.icon} {model.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    Battle Duration
                  </label>
                  <select
                    value={newBattle.duration}
                    onChange={(e) => setNewBattle({ ...newBattle, duration: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    <option value={5}>5 minutes</option>
                    <option value={10}>10 minutes</option>
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={60}>1 hour</option>
                    <option value={1440}>24 hours</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <Button
                    onClick={() => setShowCreateForm(false)}
                    className="px-6 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all duration-300"
                  >
                    Cancel
                  </Button>
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur-sm opacity-75"></div>
                    <Button
                      onClick={createBattle}
                      disabled={isCreating}
                      className="relative bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-8 py-3 rounded-xl font-semibold shadow-lg transform hover:scale-105 transition-all duration-300 disabled:transform-none"
                    >
                      <span className="flex items-center gap-2">
                        {isCreating ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Creating...
                          </>
                        ) : (
                          <>
                            <span>Create Battle</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                          </>
                        )}
                      </span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Battles List */}
        <div className="space-y-8">
          {paginatedBattles.length === 0 ? (
            <div className="text-center py-20">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-r from-purple-100 to-pink-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                  <span className="text-4xl">🤖</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-600 rounded-3xl blur-lg opacity-20"></div>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">No Battles Found</h3>
              <p className="text-gray-600 text-lg">
                {battleFilter === 'all' 
                  ? 'No battles have been created yet.' 
                  : `No ${battleFilter} battles found.`
                }
              </p>
            </div>
          ) : (
            paginatedBattles.map((battle, index) => {
              const model1Info = getModelInfo(battle.model1);
              const model2Info = getModelInfo(battle.model2);
              
              return (
                <div key={battle.id} className="relative group" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-600 rounded-3xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
                  <div className="relative bg-white/90 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden group-hover:shadow-3xl transition-all duration-500 group-hover:scale-[1.02]">
                    {/* Battle Header */}
                    <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-8">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-white mb-3">{battle.question}</h3>
                          <div className="flex items-center gap-4 text-blue-100">
                            <span className="flex items-center gap-2">
                              <span className="text-lg">👤</span>
                              <span>Created by {battle.creator}</span>
                            </span>
                            <span className="flex items-center gap-2">
                              <span className="text-lg">🕒</span>
                              <span>{formatDate(battle.createdAt)}</span>
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-4 py-2 rounded-xl text-sm font-semibold ${
                            battle.isActive 
                              ? 'bg-green-500/20 text-green-100 border border-green-300/30' 
                              : 'bg-gray-500/20 text-gray-100 border border-gray-300/30'
                          }`}>
                            {battle.isActive ? '⚡ Active' : '🏁 Closed'}
                          </span>
                          {battle.isActive && (
                            <span className="px-4 py-2 rounded-xl text-sm font-semibold bg-blue-500/20 text-blue-100 border border-blue-300/30">
                              ⏰ {getTimeRemaining(battle.endTime)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Battle Content */}
                    <div className="p-8">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Model 1 */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg">
                                {model1Info.icon}
                              </div>
                              <div>
                                <h4 className="text-lg font-bold text-gray-900">{model1Info.label}</h4>
                                <p className="text-sm text-gray-600">AI Model</p>
                              </div>
                            </div>
                            {!battle.isActive && (
                              <span className={`px-3 py-1 rounded-xl text-sm font-semibold ${
                                getBattleResult(battle, 'model1') === 'Win' ? 'bg-green-100 text-green-800 border border-green-200' :
                                getBattleResult(battle, 'model1') === 'Lose' ? 'bg-red-100 text-red-800 border border-red-200' :
                                'bg-gray-100 text-gray-800 border border-gray-200'
                              }`}>
                                {getBattleResult(battle, 'model1')}
                              </span>
                            )}
                          </div>
                          <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-6 shadow-inner">
                            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{battle.model1Response}</p>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">🗳️</span>
                              <span className="text-sm font-semibold text-gray-600">
                                {battle.model1Votes} votes
                              </span>
                            </div>
                            {battle.isActive && (
                              <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur-sm opacity-75"></div>
                                <Button
                                  onClick={() => voteForModel(battle.id, 'model1')}
                                  disabled={battle.hasVoted}
                                  className={`relative px-6 py-3 rounded-xl text-sm font-semibold shadow-lg transform hover:scale-105 transition-all duration-300 ${
                                    battle.userVote === 'model1' 
                                      ? 'bg-green-600 text-white cursor-not-allowed' 
                                      : battle.hasVoted 
                                        ? 'bg-gray-400 text-white cursor-not-allowed' 
                                        : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white'
                                  }`}
                                >
                                  {battle.userVote === 'model1' ? '✓ Voted' : battle.hasVoted ? 'Already Voted' : 'Vote'}
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Model 2 */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-red-600 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg">
                                {model2Info.icon}
                              </div>
                              <div>
                                <h4 className="text-lg font-bold text-gray-900">{model2Info.label}</h4>
                                <p className="text-sm text-gray-600">AI Model</p>
                              </div>
                            </div>
                            {!battle.isActive && (
                              <span className={`px-3 py-1 rounded-xl text-sm font-semibold ${
                                getBattleResult(battle, 'model2') === 'Win' ? 'bg-green-100 text-green-800 border border-green-200' :
                                getBattleResult(battle, 'model2') === 'Lose' ? 'bg-red-100 text-red-800 border border-red-200' :
                                'bg-gray-100 text-gray-800 border border-gray-200'
                              }`}>
                                {getBattleResult(battle, 'model2')}
                              </span>
                            )}
                          </div>
                          <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-6 shadow-inner">
                            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{battle.model2Response}</p>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">🗳️</span>
                              <span className="text-sm font-semibold text-gray-600">
                                {battle.model2Votes} votes
                              </span>
                            </div>
                            {battle.isActive && (
                              <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-red-600 rounded-xl blur-sm opacity-75"></div>
                                <Button
                                  onClick={() => voteForModel(battle.id, 'model2')}
                                  disabled={battle.hasVoted}
                                  className={`relative px-6 py-3 rounded-xl text-sm font-semibold shadow-lg transform hover:scale-105 transition-all duration-300 ${
                                    battle.userVote === 'model2' 
                                      ? 'bg-green-600 text-white cursor-not-allowed' 
                                      : battle.hasVoted 
                                        ? 'bg-gray-400 text-white cursor-not-allowed' 
                                        : 'bg-gradient-to-r from-pink-500 to-red-600 hover:from-pink-600 hover:to-red-700 text-white'
                                  }`}
                                >
                                  {battle.userVote === 'model2' ? '✓ Voted' : battle.hasVoted ? 'Already Voted' : 'Vote'}
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Battle Stats */}
                      <div className="mt-8 pt-6 border-t border-gray-200">
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">🗳️</span>
                            <span className="font-semibold">Total Votes: {battle.totalVotes}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-lg">👥</span>
                            <span className="font-semibold">Participants: {battle.participants.length}</span>
                          </div>
                        </div>
                        {/* Winner Result */}
                        <div className="text-center">
                          <div className="relative inline-block">
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl blur-sm opacity-30"></div>
                            <span className={`relative inline-block px-6 py-3 rounded-2xl text-lg font-bold ${
                              (() => {
                                const now = new Date();
                                const endTime = new Date(battle.endTime);
                                const isExpired = now > endTime;
                                
                                if (battle.isActive && !isExpired) {
                                  return 'bg-blue-100 text-blue-800 border border-blue-200'; // Battle in progress
                                }
                                if (battle.totalVotes === 0) {
                                  return 'bg-gray-100 text-gray-600 border border-gray-200'; // No votes
                                }
                                if (battle.model1Votes > battle.model2Votes) {
                                  return 'bg-green-100 text-green-800 border border-green-200'; // Model 1 wins
                                }
                                if (battle.model2Votes > battle.model1Votes) {
                                  return 'bg-blue-100 text-blue-800 border border-blue-200'; // Model 2 wins
                                }
                                return 'bg-yellow-100 text-yellow-800 border border-yellow-200'; // Draw
                              })()
                            }`}>
                              {getBattleWinner(battle)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="mt-12">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-600 rounded-3xl blur-lg opacity-20"></div>
              <div className="relative bg-white/80 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-xl">
                <div className="flex flex-col items-center space-y-6">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur-sm opacity-75"></div>
                      <Button
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        className="relative px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl font-semibold shadow-lg transform hover:scale-105 transition-all duration-300 disabled:transform-none disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        First
                      </Button>
                    </div>
                    
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl blur-sm opacity-75"></div>
                      <Button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="relative px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl font-semibold shadow-lg transform hover:scale-105 transition-all duration-300 disabled:transform-none disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                          Previous
                        </span>
                      </Button>
                    </div>
                    
                    <div className="px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl border border-gray-300">
                      <span className="text-gray-700 font-bold text-lg">
                        Page {currentPage} of {totalPages}
                      </span>
                    </div>
                    
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-red-600 rounded-xl blur-sm opacity-75"></div>
                      <Button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="relative px-6 py-3 bg-gradient-to-r from-pink-500 to-red-600 hover:from-pink-600 hover:to-red-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl font-semibold shadow-lg transform hover:scale-105 transition-all duration-300 disabled:transform-none disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="flex items-center gap-2">
                          Next
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </span>
                      </Button>
                    </div>
                    
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-600 rounded-xl blur-sm opacity-75"></div>
                      <Button
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                        className="relative px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl font-semibold shadow-lg transform hover:scale-105 transition-all duration-300 disabled:transform-none disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Last
                      </Button>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200">
                      <span className="text-lg">📊</span>
                      <span className="text-sm font-semibold text-gray-700">
                        Showing {startIndex + 1}-{Math.min(endIndex, filteredBattles.length)} of {filteredBattles.length} battles
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}