import { useState, useEffect } from 'react';
import Button from './Button';
import { Card, CardBody, CardHeader } from './Card';
import axios from 'axios';

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
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading battles...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 min-h-screen overflow-y-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Community Arena</h1>
        <p className="text-gray-600">Watch AI models battle it out on various topics</p>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800">{success}</p>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        {[
          { key: 'all', label: 'All Battles' },
          { key: 'active', label: 'Active' },
          { key: 'closed', label: 'Closed' }
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setBattleFilter(key as 'all' | 'active' | 'closed')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              battleFilter === key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Create Battle Button */}
      <div className="mb-6">
        <Button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
        >
          {showCreateForm ? 'Cancel' : 'Create New Battle'}
        </Button>
      </div>

      {/* Create Battle Form */}
      {showCreateForm && (
        <Card className="mb-8">
          <CardHeader>
            <h3 className="text-lg font-semibold">Create New Battle</h3>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Battle Question
                </label>
                <textarea
                  value={newBattle.question}
                  onChange={(e) => setNewBattle({ ...newBattle, question: e.target.value })}
                  placeholder="Enter the question for the AI models to answer..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Model 1
                  </label>
                  <select
                    value={newBattle.model1}
                    onChange={(e) => setNewBattle({ ...newBattle, model1: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {ARENA_MODELS.map(model => (
                      <option key={model.id} value={model.id}>
                        {model.icon} {model.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Model 2
                  </label>
                  <select
                    value={newBattle.model2}
                    onChange={(e) => setNewBattle({ ...newBattle, model2: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Battle Duration (minutes)
                </label>
                <select
                  value={newBattle.duration}
                  onChange={(e) => setNewBattle({ ...newBattle, duration: parseInt(e.target.value) })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={5}>5 minutes</option>
                  <option value={10}>10 minutes</option>
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={1440}>24 hours</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </Button>
                <Button
                  onClick={createBattle}
                  disabled={isCreating}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg disabled:opacity-50"
                >
                  {isCreating ? 'Creating...' : 'Create Battle'}
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Battles List */}
      <div className="space-y-6">
        {paginatedBattles.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🤖</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No battles found</h3>
            <p className="text-gray-600">
              {battleFilter === 'all' 
                ? 'No battles have been created yet.' 
                : `No ${battleFilter} battles found.`
              }
            </p>
          </div>
        ) : (
          paginatedBattles.map((battle) => {
            const model1Info = getModelInfo(battle.model1);
            const model2Info = getModelInfo(battle.model2);
            
            return (
              <Card key={battle.id} className="overflow-hidden">
                <CardHeader className="bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{battle.question}</h3>
                      <p className="text-sm text-gray-600">
                        Created by {battle.creator} • {formatDate(battle.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        battle.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {battle.isActive ? 'Active' : 'Closed'}
                      </span>
                      {battle.isActive && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {getTimeRemaining(battle.endTime)}
                        </span>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardBody>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Model 1 */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900">
                          {model1Info.icon} {model1Info.label}
                        </h4>
                        {!battle.isActive && (
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            getBattleResult(battle, 'model1') === 'Win' ? 'bg-green-100 text-green-800' :
                            getBattleResult(battle, 'model1') === 'Lose' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {getBattleResult(battle, 'model1')}
                          </span>
                        )}
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-gray-700 whitespace-pre-wrap">{battle.model1Response}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          {battle.model1Votes} votes
                        </span>
                        {battle.isActive && (
                          <Button
                            onClick={() => voteForModel(battle.id, 'model1')}
                            disabled={battle.hasVoted}
                            className={`px-4 py-2 rounded-lg text-sm ${
                              battle.userVote === 'model1' 
                                ? 'bg-green-600 text-white cursor-not-allowed' 
                                : battle.hasVoted 
                                  ? 'bg-gray-400 text-white cursor-not-allowed' 
                                  : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                          >
                            {battle.userVote === 'model1' ? '✓ Voted' : battle.hasVoted ? 'Already Voted' : 'Vote'}
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Model 2 */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900">
                          {model2Info.icon} {model2Info.label}
                        </h4>
                        {!battle.isActive && (
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            getBattleResult(battle, 'model2') === 'Win' ? 'bg-green-100 text-green-800' :
                            getBattleResult(battle, 'model2') === 'Lose' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {getBattleResult(battle, 'model2')}
                          </span>
                        )}
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-gray-700 whitespace-pre-wrap">{battle.model2Response}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          {battle.model2Votes} votes
                        </span>
                        {battle.isActive && (
                          <Button
                            onClick={() => voteForModel(battle.id, 'model2')}
                            disabled={battle.hasVoted}
                            className={`px-4 py-2 rounded-lg text-sm ${
                              battle.userVote === 'model2' 
                                ? 'bg-green-600 text-white cursor-not-allowed' 
                                : battle.hasVoted 
                                  ? 'bg-gray-400 text-white cursor-not-allowed' 
                                  : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                          >
                            {battle.userVote === 'model2' ? '✓ Voted' : battle.hasVoted ? 'Already Voted' : 'Vote'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Battle Stats */}
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                      <span>Total Votes: {battle.totalVotes}</span>
                      <span>Participants: {battle.participants.length}</span>
                    </div>
                    {/* Winner Result */}
                    <div className="text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        (() => {
                          const now = new Date();
                          const endTime = new Date(battle.endTime);
                          const isExpired = now > endTime;
                          
                          if (battle.isActive && !isExpired) {
                            return 'bg-blue-100 text-blue-800'; // Battle in progress
                          }
                          if (battle.totalVotes === 0) {
                            return 'bg-gray-100 text-gray-600'; // No votes
                          }
                          if (battle.model1Votes > battle.model2Votes) {
                            return 'bg-green-100 text-green-800'; // Model 1 wins
                          }
                          if (battle.model2Votes > battle.model1Votes) {
                            return 'bg-blue-100 text-blue-800'; // Model 2 wins
                          }
                          return 'bg-yellow-100 text-yellow-800'; // Draw
                        })()
                      }`}>
                        {getBattleWinner(battle)}
                      </span>
                    </div>
                  </div>
                </CardBody>
              </Card>
            );
          })
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col items-center space-y-4 mt-8">
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              First
            </Button>
            
            <Button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </Button>
            
            <span className="text-gray-600 font-medium">
              Page {currentPage} of {totalPages}
            </span>
            
            <Button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </Button>
            
            <Button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Last
            </Button>
          </div>
          
          <div className="text-sm text-gray-500">
            Showing {startIndex + 1}-{Math.min(endIndex, filteredBattles.length)} of {filteredBattles.length} battles
          </div>
        </div>
      )}
    </div>
  );
}