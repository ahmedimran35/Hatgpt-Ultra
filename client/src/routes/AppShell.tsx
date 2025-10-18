import { useEffect, useMemo, useRef, useState } from 'react';
import Button from '../components/Button';
import axios from '../config/axios';
import SmartAnswer from '../components/SmartAnswer';
import AIArena from '../components/AIArena';
import CommunityArena from '../components/CommunityArena';
import ToolsPage from '../components/ToolsPage';

// Types for chat history
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  model?: string;
  type?: 'text' | 'image' | 'audio';
  imageUrl?: string;
  audioUrl?: string;
}

interface SavedChat {
  id: string;
  title: string;
  messages: ChatMessage[];
  mode: 'single' | 'compare' | 'smart';
  generationType: 'text' | 'image' | 'audio';
  models?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Available models per user's request
const ALL_MODELS = [
  { id: 'gpt-5-nano', label: 'GPT-5 nano' },
  { id: 'o3-mini', label: 'OpenAI o3-mini' },
  { id: 'claude-sonnet-4', label: 'Claude Sonnet 4' },
  { id: 'deepseek-chat', label: 'DeepSeek Chat' },
  { id: 'deepseek-reasoner', label: 'DeepSeek Reasoner' },
  { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
  { id: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
  { id: 'grok-beta', label: 'Grok Beta' },
  // ---------- Pollinations Models (Working Models Only) ----------
  { id: 'mistral', label: 'Mistral Small 3.1 24B' },
];


// Available image models
const IMAGE_MODELS = [
  { id: 'flux', label: 'Flux' },
  { id: 'flux-dev', label: 'Flux Dev' },
  { id: 'flux-pro', label: 'Flux Pro' },
  { id: 'sdxl', label: 'SDXL' },
  { id: 'kandinsky', label: 'Kandinsky' },
];

// Available audio voices
const AUDIO_VOICES = [
  { id: 'alloy', label: 'Alloy' },
  { id: 'echo', label: 'Echo' },
  { id: 'fable', label: 'Fable' },
  { id: 'onyx', label: 'Onyx' },
  { id: 'nova', label: 'Nova' },
  { id: 'shimmer', label: 'Shimmer' },
];

function getModelIcon(id: string): string {
  switch (id) {
    case 'gpt-5-nano':
      return '🧠';
    case 'o3-mini':
      return '⚙️';
    case 'claude-sonnet-4':
      return '🦋';
    case 'deepseek-chat':
      return '🔎';
    case 'deepseek-reasoner':
      return '🧩';
    case 'gemini-2.0-flash':
      return '✨';
    case 'gemini-1.5-flash':
      return '🌟';
    case 'grok-beta':
      return '🛰️';
    // Pollinations Models
    case 'deepseek':
      return '🔍';
    case 'deepseek-reasoning':
      return '🧠';
    case 'gemini':
      return '💎';
    case 'gemini-search':
      return '🔍';
    case 'mistral':
      return '🌪️';
    case 'nova-fast':
      return '⭐';
    case 'openai-fast':
      return '⚡';
    case 'openai-large':
      return '🚀';
    case 'openai-reasoning':
      return '🧮';
    case 'qwen-coder':
      return '💻';
    case 'roblox-rp':
      return '🎮';
    case 'bidara':
      return '🚀';
    case 'chickytutor':
      return '🐥';
    case 'evil':
      return '😈';
    case 'midijourney':
      return '🎵';
    case 'rtist':
      return '🎨';
    case 'unity':
      return '🎯';
    default:
      return '🤖';
  }
}

type Message = { role: 'user' | 'assistant'; text: string; model?: string; isStreaming?: boolean; tokens?: number; type?: 'text' | 'image' | 'audio'; content?: string };

type User = {
  email: string;
  username: string;
  totalTokens: number;
  monthlyTokens: number;
  lastTokenReset: string;
  createdAt: string;
};

export default function AppShell() {
  const [mode, setMode] = useState<'single' | 'compare' | 'smart' | 'arena' | 'tools' | 'community'>('single');
  const [selectedModels, setSelectedModels] = useState<string[]>(['gpt-5-nano']);
  const [prompt, setPrompt] = useState('');
  const [generationType, setGenerationType] = useState<'text' | 'image' | 'audio'>('text');
  const [selectedImageModel, setSelectedImageModel] = useState('flux');
  const [selectedAudioVoice, setSelectedAudioVoice] = useState('alloy');
  const [singleChatConversation, setSingleChatConversation] = useState<Message[]>([]);
  const [smartChatConversation, setSmartChatConversation] = useState<Message[]>([]);
  const [compareConversations, setCompareConversations] = useState<Record<string, Message[]>>({});
  const [isSending, setIsSending] = useState(false);
  const [streamingModels, setStreamingModels] = useState<Set<string>>(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [savedChats, setSavedChats] = useState<SavedChat[]>([]);
  const [showChatHistory, setShowChatHistory] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const compareListRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const transcriptBufferRef = useRef<string>('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [, setIsAnalyzing] = useState(false);
  const [, setAnalysis] = useState<string>('');
  const [, setSelectedModel] = useState<string>('');

  // Helper: only show messages that match current generation type
  function isVisibleMessage(msg: Message): boolean {
    if (generationType === 'text') return !msg.type || msg.type === 'text';
    return msg.type === generationType;
  }

  // Visible messages for single chat based on generation type
  const singleVisibleMessages = useMemo(
    () => singleChatConversation.filter(isVisibleMessage),
    [singleChatConversation, generationType]
  );

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
    // Auto-scroll each compare panel independently
    Object.entries(compareConversations).forEach(([modelId, _msgs]) => {
      const el = compareListRefs.current[modelId];
      if (el) el.scrollTo({ top: el.scrollHeight });
    });
  }, [singleChatConversation, compareConversations]);

  // Auto-play removed per request

  // Temporarily lock Image mode: if it gets selected, revert to text
  useEffect(() => {
    if (generationType === 'image') {
      setGenerationType('text');
    }
  }, [generationType]);

  // Reset generation type to 'text' when switching to compare mode
  useEffect(() => {
    if (mode === 'compare' && generationType !== 'text') {
      setGenerationType('text');
    }
  }, [mode, generationType]);

  // Auto-save chat when conversation changes
  useEffect(() => {
    const messages = mode === 'single' ? singleChatConversation : 
      mode === 'smart' ? smartChatConversation :
      Object.values(compareConversations).flat();
    
    console.log('Auto-save useEffect triggered:', {
      messageCount: messages.length,
      isSending,
      mode,
      currentChatId
    });
    
    // Only auto-save if there are messages
    if (messages.length > 0) {
      console.log('Setting auto-save timeout for 3 seconds');
      const timeoutId = setTimeout(() => {
        console.log('Auto-save timeout triggered, isSending:', isSending);
        // Check if we're still not sending before auto-saving
        if (!isSending) {
          console.log('Calling autoSaveChat from useEffect');
          autoSaveChat();
        } else {
          console.log('Still sending, skipping auto-save');
        }
      }, 3000); // Auto-save 3 seconds after last change

      return () => {
        console.log('Clearing auto-save timeout');
        clearTimeout(timeoutId);
      };
    }
  }, [singleChatConversation, smartChatConversation, compareConversations, mode]);

  // Load user profile on component mount
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('No token found, user not logged in');
          return;
        }

        console.log('Loading user profile...');
        const response = await axios.get('/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('User profile loaded:', response.data);
        setUser(response.data);
      } catch (error) {
        console.error('Failed to load user profile:', error);
        // Set a default user to prevent app from breaking
        setUser({
          email: 'user@example.com',
          username: 'User',
          totalTokens: 0,
          monthlyTokens: 0,
          lastTokenReset: new Date().toISOString(),
          createdAt: new Date().toISOString()
        });
      }
    };

    loadUserProfile();
    loadSavedChats();
  }, []);

  // Function to update tokens in database
  const updateTokensInDatabase = async (tokens: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      console.log('Updating tokens in database:', tokens);
      const response = await axios.post('/api/auth/update-tokens', 
        { tokens }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log('Tokens updated, new user data:', response.data);
      setUser(prev => prev ? { ...prev, ...response.data } : null);
    } catch (error) {
      console.error('Failed to update tokens:', error);
    }
  };

  // Function to refresh user data
  const refreshUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get('/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('User data refreshed:', response.data);
      setUser(response.data);
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    }
  };

  // Load saved chats
  const loadSavedChats = async () => {
    try {
      console.log('Loading saved chats...');
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found for loading chats');
        return;
      }

      const response = await axios.get('/api/auth/chats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Loaded saved chats:', response.data.chats);
      setSavedChats(response.data.chats);
    } catch (error) {
      console.error('Failed to load saved chats:', error);
    }
  };

  // Auto-save current chat
  const autoSaveChat = async () => {
    try {
      console.log('=== AUTO-SAVE STARTED ===');
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found for auto-save');
        return;
      }

      const messages = mode === 'single' ? singleChatConversation : 
        mode === 'smart' ? smartChatConversation :
        Object.values(compareConversations).flat();
      
      console.log('Messages to save:', messages.length, messages);
      
      if (messages.length === 0) {
        console.log('No messages to save');
        return;
      }

      // Generate title from first user message
      const firstUserMessage = messages.find(msg => msg.role === 'user');
      const title = firstUserMessage ? 
        (firstUserMessage.text?.substring(0, 50) + (firstUserMessage.text?.length > 50 ? '...' : '')) : 
        `Chat ${new Date().toLocaleDateString()}`;

      console.log('Generated title:', title);

      const chatData = {
        title,
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.text || msg.content || '',
          model: msg.model,
          type: msg.type,
          imageUrl: msg.type === 'image' ? msg.content : undefined,
          audioUrl: msg.type === 'audio' ? msg.content : undefined,
        })),
        mode,
        generationType,
        models: mode === 'compare' ? selectedModels : [activeModel],
      };

      console.log('Chat data to save:', chatData);

      if (currentChatId) {
        // Update existing chat
        console.log('Updating existing chat:', currentChatId);
        await axios.put(`/api/auth/chats/${currentChatId}`, chatData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Chat updated successfully');
      } else {
        // Create new chat
        console.log('Creating new chat');
        const response = await axios.post('/api/auth/save-chat', chatData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCurrentChatId(response.data.chatId);
        console.log('Chat created successfully with ID:', response.data.chatId);
      }

      await loadSavedChats();
      console.log('=== AUTO-SAVE COMPLETED ===');
    } catch (error: any) {
      console.error('Failed to auto-save chat:', error);
      if (error.response?.data?.details) {
        console.error('Validation errors:', error.response.data.details);
      }
    }
  };


  // Load a saved chat
  const loadSavedChat = async (chatId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(`/api/auth/chats/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const chat = response.data.chat;
      
      // Set mode and generation type
      setMode(chat.mode);
      setGenerationType(chat.generationType);
      
      // Set models
      if (chat.mode === 'single') {
        setSelectedModels(chat.models ? [chat.models[0]] : ['gpt-5-nano']);
      } else {
        setSelectedModels(chat.models || ['gpt-5-nano']);
      }

      // Convert saved messages to current format
      const convertedMessages = chat.messages.map((msg: ChatMessage) => ({
        role: msg.role,
        text: msg.content,
        model: msg.model,
        type: msg.type,
        content: msg.imageUrl || msg.audioUrl || msg.content,
      }));

      if (chat.mode === 'single') {
        setSingleChatConversation(convertedMessages);
      } else {
        // Group messages by model for compare mode
        const groupedMessages: Record<string, Message[]> = {};
        convertedMessages.forEach((msg: Message) => {
          if (msg.model) {
            if (!groupedMessages[msg.model]) {
              groupedMessages[msg.model] = [];
            }
            groupedMessages[msg.model].push(msg);
          }
        });
        setCompareConversations(groupedMessages);
      }

      setCurrentChatId(chatId);
      setShowChatHistory(false);
    } catch (error) {
      console.error('Failed to load chat:', error);
      alert('Failed to load chat');
    }
  };

  // Delete a saved chat
  const deleteSavedChat = async (chatId: string) => {
    if (!confirm('Are you sure you want to delete this chat?')) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await axios.delete(`/api/auth/chats/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      loadSavedChats();
    } catch (error) {
      console.error('Failed to delete chat:', error);
      alert('Failed to delete chat');
    }
  };

  // Search chats
  const searchChats = async (query: string) => {
    if (!query.trim()) {
      loadSavedChats();
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(`/api/auth/chats/search/${encodeURIComponent(query)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSavedChats(response.data.chats);
    } catch (error) {
      console.error('Failed to search chats:', error);
    }
  };

  const activeModel = selectedModels[0];
  const visibleModels = useMemo(() => (mode === 'single' ? [activeModel] : selectedModels.slice(0, 5)), [mode, activeModel, selectedModels]);

  // Calculate tokens for text (rough estimation: 1 token ≈ 4 characters)
  function estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }


  useEffect(() => {
    // Token calculation is now handled in the database
  }, [singleChatConversation, compareConversations]);

  function toggleModel(id: string) {
    if (mode === 'single') {
      // In single mode, just set the selected model
      setSelectedModels([id]);
    } else {
      // In compare mode, toggle models
      setSelectedModels((prev) => {
        const exists = prev.includes(id);
        if (exists) return prev.filter((m) => m !== id);
        if (prev.length >= 5) return prev;
        return [...prev, id];
      });
    }
  }

  // Image generation function removed - feature is locked

  function canUseWebSpeech(): boolean {
    // Browser feature detection for Web Speech API
    return typeof window !== 'undefined' && !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  }

  function startListening() {
    if (!canUseWebSpeech() || isListening) return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SR();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = true;
    recognition.maxAlternatives = 1;
    transcriptBufferRef.current = '';
    recognition.onresult = (event: any) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          transcriptBufferRef.current += transcript;
        } else {
          interim += transcript;
        }
      }
      // Show accumulated + interim transcript in the input box
      setPrompt((transcriptBufferRef.current + interim).trim());
    };
    recognition.onerror = (_e: any) => {
      // Try to recover from transient errors while listening
      if (isListening) {
        try { recognition.start(); } catch {}
      }
    };
    recognition.onend = () => {
      // Auto-restart if user is still in listening mode (handles short pauses)
      if (isListening) {
        try { recognition.start(); } catch {}
      }
    };
    recognitionRef.current = recognition;
    setIsListening(true);
    try {
      recognition.start();
    } catch {
      setIsListening(false);
    }
  }

  function stopListening() {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
    }
    setIsListening(false);
  }

  // Live mode removed per request

  async function generateAudio(text: string, voice: string = 'alloy') {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/generation/audio', {
        text,
        voice
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      return response.data.audioUrl;
    } catch (error) {
      console.error('Audio generation failed:', error);
      throw error;
    }
  }

  const handleSmartSend = async () => {
    if (!prompt.trim() || isSending) return;
    
    const trimmed = prompt.trim();
    console.log('handleSmartSend called with:', trimmed);
    setPrompt('');
    
    // Start analysis
    setIsAnalyzing(true);
    setAnalysis('');
    setSelectedModel('');
    
    try {
      // Analyze the question
      const analysisResult = analyzeQuestion(trimmed);
      setAnalysis(analysisResult.reasoning);
      setSelectedModel(analysisResult.bestModel);
      
      // Show analysis for a moment
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Clear analysis and send to the main system
      setIsAnalyzing(false);
      setAnalysis('');
      setSelectedModel('');
      
      // Call the smart send function with the selected model
      await sendSmartPromptWithText(trimmed, analysisResult.bestModel);
      
    } catch (error) {
      console.error('Smart routing error:', error);
      setIsAnalyzing(false);
      setAnalysis('');
      setSelectedModel('');
    }
  };

  // Dynamic AI Model Selection Logic for Smart Answer
  const analyzeQuestion = (question: string): { bestModel: string; reasoning: string; confidence: number } => {
    const lowerQuestion = question.toLowerCase();
    
    // Define model capabilities and their strengths
    const modelCapabilities = {
      'gpt-5-nano': {
        strengths: ['creative', 'conversational', 'general', 'writing', 'storytelling'],
        keywords: ['write', 'story', 'creative', 'poem', 'essay', 'article', 'novel', 'script', 'blog', 'content', 'hello', 'how are you', 'chat', 'talk', 'conversation', 'help', 'advice', 'earn', 'money', 'business']
      },
      'deepseek-chat': {
        strengths: ['programming', 'coding', 'technical', 'debugging', 'algorithms'],
        keywords: ['code', 'programming', 'debug', 'algorithm', 'function', 'api', 'python', 'javascript', 'react', 'node', 'sql', 'database', 'software', 'development', 'html', 'css', 'landing', 'page']
      },
      'deepseek-reasoner': {
        strengths: ['mathematical', 'analytical', 'reasoning', 'problem-solving'],
        keywords: ['calculate', 'math', 'equation', 'statistics', 'analysis', 'data', 'solve', 'formula', 'probability', 'geometry', 'algebra', 'calculus', 'reasoning', '7x7', 'multiply', 'times']
      },
      'gemini-2.0-flash': {
        strengths: ['research', 'factual', 'knowledge', 'explanations', 'science'],
        keywords: ['what is', 'explain', 'research', 'history', 'science', 'facts', 'define', 'describe', 'information', 'knowledge', 'how does', 'why', 'when', 'where', 'seikh', 'hasina', 'bangladesh', 'prime minister']
      },
      'claude-sonnet-4': {
        strengths: ['business', 'professional', 'strategic', 'analytical'],
        keywords: ['business', 'marketing', 'strategy', 'planning', 'presentation', 'report', 'proposal', 'meeting', 'professional', 'corporate', 'management', 'earn', 'money', 'startup', 'entrepreneur']
      },
      'o3-mini': {
        strengths: ['advanced', 'complex', 'reasoning', 'multimodal'],
        keywords: ['complex', 'advanced', 'sophisticated', 'detailed', 'comprehensive', 'thorough', 'in-depth', 'explain', 'code', 'react', 'component']
      },
      'mistral': {
        strengths: ['efficient', 'fast', 'general', 'multilingual'],
        keywords: ['quick', 'fast', 'simple', 'basic', 'general', 'multilingual', 'european', 'french', 'spanish']
      }
    };

    // Score each model based on keyword matches and context
    const modelScores: Record<string, number> = {};
    
    Object.entries(modelCapabilities).forEach(([model, config]) => {
      let score = 0;
      
      // Basic keyword matching
      config.keywords.forEach(keyword => {
        if (lowerQuestion.includes(keyword)) {
          score += 1;
        }
      });
      
      // Context-aware scoring
      const questionLength = lowerQuestion.length;
      const wordCount = lowerQuestion.split(' ').length;
      
      // Adjust scores based on question complexity
      if (wordCount > 20) {
        // Complex questions might benefit from more advanced models
        if (model === 'o3-mini' || model === 'claude-sonnet-4') {
          score += 0.5;
        }
      }
      
      // Short questions might be conversational
      if (wordCount < 5) {
        if (model === 'gpt-5-nano') {
          score += 0.5;
        }
      }
      
      // Technical terms boost technical models
      const technicalTerms = ['api', 'database', 'algorithm', 'function', 'debug', 'code', 'programming', 'html', 'css', 'react', 'component', 'landing', 'page'];
      const hasTechnicalTerms = technicalTerms.some(term => lowerQuestion.includes(term));
      if (hasTechnicalTerms && (model === 'deepseek-chat' || model === 'deepseek-reasoner')) {
        score += 2;
      }
      
      // Mathematical terms boost reasoning models
      const mathTerms = ['calculate', 'solve', 'equation', 'formula', 'probability', 'statistics', '7x7', 'multiply', 'times', 'math'];
      const hasMathTerms = mathTerms.some(term => lowerQuestion.includes(term));
      if (hasMathTerms && model === 'deepseek-reasoner') {
        score += 2.5;
      }
      
      // Research terms boost knowledge models
      const researchTerms = ['what is', 'explain', 'define', 'describe', 'research', 'science', 'seikh', 'hasina', 'bangladesh', 'prime minister'];
      const hasResearchTerms = researchTerms.some(term => lowerQuestion.includes(term));
      if (hasResearchTerms && model === 'gemini-2.0-flash') {
        score += 2;
      }
      
      // Business terms boost business models
      const businessTerms = ['business', 'money', 'earn', 'startup', 'entrepreneur', 'marketing', 'strategy'];
      const hasBusinessTerms = businessTerms.some(term => lowerQuestion.includes(term));
      if (hasBusinessTerms && model === 'claude-sonnet-4') {
        score += 2;
      }
      
      // Creative terms boost creative models
      const creativeTerms = ['write', 'story', 'essay', 'creative', 'dog', 'poem', 'novel', 'script'];
      const hasCreativeTerms = creativeTerms.some(term => lowerQuestion.includes(term));
      if (hasCreativeTerms && model === 'gpt-5-nano') {
        score += 2;
      }
      
      // Complex questions boost advanced models
      if (questionLength > 100 && (model === 'o3-mini' || model === 'claude-sonnet-4')) {
        score += 1.5;
      }
      
      // Add some randomness to ensure diversity
      const randomFactor = Math.random() * 0.3;
      score += randomFactor;
      
      modelScores[model] = score;
    });

    // Find the best scoring model with diversity consideration
    const sortedModels = Object.entries(modelScores)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3); // Get top 3 models
    
    // If scores are too close, add some diversity
    const topScore = sortedModels[0][1];
    const secondScore = sortedModels[1] ? sortedModels[1][1] : 0;
    
    let bestModel;
    if (topScore - secondScore < 0.5) {
      // Scores are close, add some randomness for diversity
      const randomIndex = Math.floor(Math.random() * Math.min(3, sortedModels.length));
      bestModel = { model: sortedModels[randomIndex][0], score: sortedModels[randomIndex][1] };
    } else {
      bestModel = { model: sortedModels[0][0], score: sortedModels[0][1] };
    }

    // Generate reasoning based on detected patterns
    const detectedPatterns = [];
    if (lowerQuestion.includes('write') || lowerQuestion.includes('story') || lowerQuestion.includes('creative')) {
      detectedPatterns.push('creative writing');
    }
    if (lowerQuestion.includes('code') || lowerQuestion.includes('programming') || lowerQuestion.includes('debug')) {
      detectedPatterns.push('technical/programming');
    }
    if (lowerQuestion.includes('calculate') || lowerQuestion.includes('math') || lowerQuestion.includes('solve')) {
      detectedPatterns.push('mathematical/analytical');
    }
    if (lowerQuestion.includes('what is') || lowerQuestion.includes('explain') || lowerQuestion.includes('research')) {
      detectedPatterns.push('research/factual');
    }
    if (lowerQuestion.includes('business') || lowerQuestion.includes('strategy') || lowerQuestion.includes('professional')) {
      detectedPatterns.push('business/professional');
    }
    if (lowerQuestion.includes('hello') || lowerQuestion.includes('how are you') || lowerQuestion.includes('chat')) {
      detectedPatterns.push('conversational');
    }

    const reasoning = detectedPatterns.length > 0 
      ? `${detectedPatterns.join(', ')} task detected - ${modelCapabilities[bestModel.model as keyof typeof modelCapabilities]?.strengths.join(', ')} capabilities match best`
      : `General question - ${bestModel.model} selected as reliable default`;

    const confidence = Math.min(0.9, 0.5 + (bestModel.score * 0.1));

    // Log the selection for learning
    console.log('Smart model selection:', {
      question: question.substring(0, 50) + '...',
      selectedModel: bestModel.model,
      scores: modelScores,
      reasoning,
      confidence
    });

    return {
      bestModel: bestModel.model,
      reasoning,
      confidence
    };
  };

  // Function to track model selection success (for future learning)
  // Removed unused function to satisfy TypeScript unused variable rule

  async function sendSmartPromptWithText(text: string, selectedModel: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    
    console.log('sendSmartPromptWithText called with:', trimmed, 'using model:', selectedModel);
    console.log('Current mode:', mode);
    console.log('Current generationType:', generationType);
    console.log('isListening:', isListening);
    
    // If mic is listening, stop it automatically when sending
    if (isListening) {
      console.log('Stopping listening...');
      stopListening();
    }
    
    // Image mode is locked: block sending
    if (generationType === 'image') {
      console.log('Image mode blocked');
      alert('Image generation is coming soon.');
      return;
    }

    // Disable audio generation in compare mode
    if (generationType === 'audio' && mode === 'compare') {
      console.log('Audio in compare mode blocked');
      alert('Audio generation is only available in single chat mode');
      return;
    }
    
    console.log('Setting isSending to true...');
    setIsSending(true);
    
    if (generationType === 'audio') {
      // Handle audio generation
      try {
        const audioUrl = await generateAudio(trimmed, selectedAudioVoice);
        const audioMessage: Message = {
          role: 'assistant',
          text: `Generated audio for: "${trimmed}"`,
          type: 'audio',
          content: audioUrl
        };
        
        if (mode === 'single') {
          setSingleChatConversation(prev => [...prev, { role: 'user', text: trimmed, type: 'audio' }, audioMessage]);
        } else {
          for (const modelId of selectedModels) {
            setCompareConversations((prev) => ({
              ...prev,
              [modelId]: [...(prev[modelId] || []), { role: 'user', text: trimmed, type: 'audio' }, audioMessage],
            }));
          }
        }
        
        // Auto-save after audio generation
        setTimeout(() => {
          console.log('Auto-saving after audio generation');
          autoSaveChat();
        }, 1000);
      } catch (error) {
        console.error('Audio generation failed:', error);
        const errorMessage: Message = {
          role: 'assistant',
          text: 'Failed to generate audio. Please try again.',
          type: 'text'
        };
        
        if (mode === 'single') {
          setSingleChatConversation(prev => [...prev, { role: 'user', text: trimmed, type: 'audio' }, errorMessage]);
        } else {
          for (const modelId of selectedModels) {
            setCompareConversations((prev) => ({
              ...prev,
              [modelId]: [...(prev[modelId] || []), { role: 'user', text: trimmed, type: 'audio' }, errorMessage],
            }));
          }
        }
      }
    } else {
      // Handle text generation for smart mode
      console.log('Entering smart text generation path...');
      console.log('Adding user message to smartChatConversation:', trimmed);
      setSmartChatConversation(prev => {
        const newMessages = [...prev, { role: 'user' as const, text: trimmed, tokens: estimateTokens(trimmed), type: 'text' as const }];
        console.log('Updated smartChatConversation:', newMessages);
        return newMessages;
      });
      console.log('About to call streamSingleChatResponse for smart mode with model:', selectedModel);
      await streamSingleChatResponse(selectedModel, trimmed);
      console.log('streamSingleChatResponse completed for smart mode');
    }
    
    setIsSending(false);
  }

  // Removed unused function to satisfy TypeScript unused variable rule
  /* async function sendPromptWithText(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    
    console.log('sendPromptWithText called with:', trimmed);
    console.log('Current mode:', mode);
    console.log('Current generationType:', generationType);
    console.log('isListening:', isListening);
    
    // If mic is listening, stop it automatically when sending
    if (isListening) {
      console.log('Stopping listening...');
      stopListening();
    }
    
    // Image mode is locked: block sending
    if (generationType === 'image') {
      console.log('Image mode blocked');
      alert('Image generation is coming soon.');
      return;
    }

    // Disable audio generation in compare mode
    if (generationType === 'audio' && mode === 'compare') {
      console.log('Audio in compare mode blocked');
      alert('Audio generation is only available in single chat mode');
      return;
    }
    
    console.log('Setting isSending to true...');
    setIsSending(true);
    
    if (generationType === 'audio') {
      // Handle audio generation
      try {
        const audioUrl = await generateAudio(trimmed, selectedAudioVoice);
        const audioMessage: Message = {
          role: 'assistant',
          text: `Generated audio for: "${trimmed}"`,
          type: 'audio',
          content: audioUrl
        };
        
        if (mode === 'single') {
          setSingleChatConversation(prev => [...prev, { role: 'user', text: trimmed, type: 'audio' }, audioMessage]);
        } else {
          for (const modelId of selectedModels) {
            setCompareConversations((prev) => ({
              ...prev,
              [modelId]: [...(prev[modelId] || []), { role: 'user', text: trimmed, type: 'audio' }, audioMessage],
            }));
          }
        }
        
        // Auto-save after audio generation
        setTimeout(() => {
          console.log('Auto-saving after audio generation');
          autoSaveChat();
        }, 1000);
      } catch (error) {
        console.error('Audio generation failed:', error);
        const errorMessage: Message = {
          role: 'assistant',
          text: 'Failed to generate audio. Please try again.',
          type: 'text'
        };
        
        if (mode === 'single') {
          setSingleChatConversation(prev => [...prev, { role: 'user', text: trimmed, type: 'audio' }, errorMessage]);
        } else {
          for (const modelId of selectedModels) {
            setCompareConversations((prev) => ({
              ...prev,
              [modelId]: [...(prev[modelId] || []), { role: 'user', text: trimmed, type: 'audio' }, errorMessage],
            }));
          }
        }
      }
    } else {
      // Handle text generation (existing logic)
      console.log('Entering text generation path...');
      if (mode === 'single') {
        // Single chat mode - add to single conversation
        console.log('Adding user message to singleChatConversation:', trimmed);
        setSingleChatConversation(prev => {
          const newMessages = [...prev, { role: 'user' as const, text: trimmed, tokens: estimateTokens(trimmed), type: 'text' as const }];
          console.log('Updated singleChatConversation:', newMessages);
          return newMessages;
        });
        console.log('About to call streamSingleChatResponse...');
        await streamSingleChatResponse(activeModel, trimmed);
        console.log('streamSingleChatResponse completed');
      } else if (mode === 'smart') {
        // Smart mode - add to smart conversation
        console.log('Adding user message to smartChatConversation:', trimmed);
        setSmartChatConversation(prev => {
          const newMessages = [...prev, { role: 'user' as const, text: trimmed, tokens: estimateTokens(trimmed), type: 'text' as const }];
          console.log('Updated smartChatConversation:', newMessages);
          return newMessages;
        });
        console.log('About to call streamSingleChatResponse for smart mode...');
        await streamSingleChatResponse(activeModel, trimmed);
        console.log('streamSingleChatResponse completed for smart mode');
      } else {
        // Compare mode - add to compare conversations
        for (const modelId of visibleModels) {
          setCompareConversations((prev) => ({
            ...prev,
            [modelId]: [...(prev[modelId] || []), { role: 'user', text: trimmed, tokens: estimateTokens(trimmed), type: 'text' }],
          }));
        }
        await Promise.all(selectedModels.map((m) => streamCompareResponse(m, trimmed)));
      }
    }
    
    setIsSending(false);
  } */

  async function sendPrompt() {
    const trimmed = prompt.trim();
    if (!trimmed) return;
    // If mic is listening, stop it automatically when sending
    if (isListening) {
      stopListening();
    }
    
    // Image mode is locked: block sending
    if (generationType === 'image') {
      alert('Image generation is coming soon.');
      return;
    }

    // Disable audio generation in compare mode
    if (generationType === 'audio' && mode === 'compare') {
      alert('Audio generation is only available in single chat mode');
      return;
    }
    
    setIsSending(true);
    setPrompt('');
    
    if (generationType === 'audio') {
      // Handle audio generation
      try {
        const audioUrl = await generateAudio(trimmed, selectedAudioVoice);
        const audioMessage: Message = {
          role: 'assistant',
          text: `Generated audio for: "${trimmed}"`,
          type: 'audio',
          content: audioUrl
        };
        
        if (mode === 'single') {
          setSingleChatConversation(prev => [...prev, { role: 'user', text: trimmed, type: 'audio' }, audioMessage]);
        } else {
          for (const modelId of selectedModels) {
            setCompareConversations((prev) => ({
              ...prev,
              [modelId]: [...(prev[modelId] || []), { role: 'user', text: trimmed, type: 'audio' }, audioMessage],
            }));
          }
        }
      } catch (error) {
        const errorMessage: Message = {
          role: 'assistant',
          text: 'Failed to generate audio. Please try again.',
          type: 'text'
        };
        
        if (mode === 'single') {
          setSingleChatConversation(prev => [...prev, { role: 'user', text: trimmed, type: 'audio' }, errorMessage]);
        } else {
          for (const modelId of selectedModels) {
            setCompareConversations((prev) => ({
              ...prev,
              [modelId]: [...(prev[modelId] || []), { role: 'user', text: trimmed, type: 'audio' }, errorMessage],
            }));
          }
        }
      }
      
      // Auto-save after audio generation
      setTimeout(() => {
        console.log('Auto-saving after audio generation');
        autoSaveChat();
      }, 1000);
    } else {
      // Handle text generation (existing logic)
      if (mode === 'single') {
        // Single chat mode - add to single conversation
        setSingleChatConversation(prev => [...prev, { role: 'user', text: trimmed, tokens: estimateTokens(trimmed), type: 'text' }]);
        await streamSingleChatResponse(activeModel, trimmed);
      } else {
        // Compare mode - add to compare conversations
        for (const modelId of visibleModels) {
          setCompareConversations((prev) => ({
            ...prev,
            [modelId]: [...(prev[modelId] || []), { role: 'user', text: trimmed, tokens: estimateTokens(trimmed), type: 'text' }],
          }));
        }
        await Promise.all(visibleModels.map((m) => streamCompareResponse(m, trimmed)));
      }
    }
    
    setIsSending(false);
    setStreamingModels(new Set());
  }

  async function streamSingleChatResponse(modelId: string, userPrompt: string) {
    // Add model to streaming set
    setStreamingModels(prev => new Set(prev).add(modelId));
    
    // Check if this is a Pollinations model
    // Only include models that work correctly and identify themselves properly
    const pollinationsModels = [
      'mistral'
    ];
    
    if (pollinationsModels.includes(modelId)) {
      // Use Pollinations API directly
      try {
        const token = localStorage.getItem('token');
        const response = await axios.post('/api/generation/text', {
          prompt: userPrompt,
          model: modelId
        }, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const responseText = response.data.text;
        const tokens = estimateTokens(userPrompt + responseText);
        
        if (mode === 'smart') {
          setSmartChatConversation(prev => {
            const newConv = [...prev];
            const lastMessageIndex = newConv.length - 1;
            if (lastMessageIndex >= 0 && newConv[lastMessageIndex].isStreaming) {
              newConv[lastMessageIndex] = {
                role: 'assistant',
                text: responseText,
                model: modelId,
                isStreaming: false,
                tokens: tokens
              };
            } else {
              newConv.push({
                role: 'assistant',
                text: responseText,
                model: modelId,
                isStreaming: false,
                tokens: tokens
              });
            }
            return newConv;
          });
        } else {
          setSingleChatConversation(prev => {
            const newConv = [...prev];
            const lastMessageIndex = newConv.length - 1;
            if (lastMessageIndex >= 0 && newConv[lastMessageIndex].isStreaming) {
              newConv[lastMessageIndex] = {
                role: 'assistant',
                text: responseText,
                model: modelId,
                isStreaming: false,
                tokens: tokens
              };
            } else {
              newConv.push({
                role: 'assistant',
                text: responseText,
                model: modelId,
                isStreaming: false,
                tokens: tokens
              });
            }
            return newConv;
          });
        }
        
        // Update tokens in database
        await updateTokensInDatabase(tokens);
        
      } catch (error: any) {
        console.error('Pollinations API error:', error);
        
        // Handle specific error cases
        let errorMsg = 'Failed to get response from Pollinations API. Please try again.';
        if (error.response?.status === 402) {
          errorMsg = 'This model requires higher tier access. Please try a different model like DeepSeek, Gemini, or Mistral.';
        } else if (error.response?.status === 400) {
          errorMsg = 'Invalid request. Please try again.';
        } else if (error.response?.data?.error) {
          errorMsg = error.response.data.error;
        }
        
        if (mode === 'smart') {
          setSmartChatConversation(prev => [...prev, { 
            role: 'assistant', 
            text: errorMsg, 
            model: modelId, 
            isStreaming: false 
          }]);
        } else {
          setSingleChatConversation(prev => [...prev, { 
            role: 'assistant', 
            text: errorMsg, 
            model: modelId, 
            isStreaming: false 
          }]);
        }
      }
      
      setStreamingModels(prev => {
        const newSet = new Set(prev);
        newSet.delete(modelId);
        return newSet;
      });
      
      // Auto-save after Pollinations response
      setTimeout(() => {
        console.log('Auto-saving after Pollinations response');
        autoSaveChat();
      }, 1000);
      return;
    }
    
    // Use Puter SDK for original models
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const puterAny = (globalThis as any).puter;
    if (!puterAny?.ai?.chat) {
      if (mode === 'smart') {
        setSmartChatConversation(prev => [...prev, { role: 'assistant', text: 'Puter SDK not loaded', model: modelId, isStreaming: false }]);
      } else {
        setSingleChatConversation(prev => [...prev, { role: 'assistant', text: 'Puter SDK not loaded', model: modelId, isStreaming: false }]);
      }
      setStreamingModels(prev => {
        const newSet = new Set(prev);
        newSet.delete(modelId);
        return newSet;
      });
      return;
    }
    
    try {
      const stream = await puterAny.ai.chat(userPrompt, { model: modelId, stream: true });
      let acc = '';
      
      // The puter stream is async iterable
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      for await (const part of stream as any) {
        const chunk = part?.text ?? '';
        acc += chunk;
        if (mode === 'smart') {
          setSmartChatConversation((prev) => {
            const last = prev[prev.length - 1];
            if (last?.role === 'assistant' && last.model === modelId) {
              const updated = [...prev];
              updated[updated.length - 1] = { role: 'assistant', text: acc, model: modelId, isStreaming: true, tokens: estimateTokens(acc) };
              return updated;
            }
            return [...prev, { role: 'assistant', text: acc, model: modelId, isStreaming: true, tokens: estimateTokens(acc) }];
          });
        } else {
          setSingleChatConversation((prev) => {
            const last = prev[prev.length - 1];
            if (last?.role === 'assistant' && last.model === modelId) {
              const updated = [...prev];
              updated[updated.length - 1] = { role: 'assistant', text: acc, model: modelId, isStreaming: true, tokens: estimateTokens(acc) };
              return updated;
            }
            return [...prev, { role: 'assistant', text: acc, model: modelId, isStreaming: true, tokens: estimateTokens(acc) }];
          });
        }
      }
      
      // Mark streaming as complete
      if (mode === 'smart') {
        setSmartChatConversation((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === 'assistant' && last.model === modelId) {
            const updated = [...prev];
            updated[updated.length - 1] = { ...last, isStreaming: false };
            return updated;
          }
          return prev;
        });
      } else {
        setSingleChatConversation((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === 'assistant' && last.model === modelId) {
            const updated = [...prev];
            updated[updated.length - 1] = { ...last, isStreaming: false };
            return updated;
          }
          return prev;
        });
      }

      // Update tokens after full assistant message is known (prompt + response)
      const totalUsed = estimateTokens(userPrompt) + estimateTokens(acc);
      if (totalUsed > 0) {
        updateTokensInDatabase(totalUsed);
      }
    } catch (error) {
      if (mode === 'smart') {
        setSmartChatConversation(prev => [...prev, { role: 'assistant', text: 'Error: Failed to get response', model: modelId, isStreaming: false }]);
      } else {
        setSingleChatConversation(prev => [...prev, { role: 'assistant', text: 'Error: Failed to get response', model: modelId, isStreaming: false }]);
      }
    } finally {
      // Remove model from streaming set
      setStreamingModels(prev => {
        const newSet = new Set(prev);
        newSet.delete(modelId);
        return newSet;
      });
      
      // Auto-save after streaming completes
      setTimeout(() => {
        console.log('Auto-saving after single chat streaming completed');
        autoSaveChat();
      }, 1000);
    }
  }

  async function streamCompareResponse(modelId: string, userPrompt: string) {
    // Add model to streaming set
    setStreamingModels(prev => new Set(prev).add(modelId));
    
    // Check if this is a Pollinations model
    // Only include models that work correctly and identify themselves properly
    const pollinationsModels = [
      'mistral'
    ];
    
    if (pollinationsModels.includes(modelId)) {
      // Use Pollinations API directly
      try {
        const token = localStorage.getItem('token');
        const response = await axios.post('/api/generation/text', {
          prompt: userPrompt,
          model: modelId
        }, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const responseText = response.data.text;
        const tokens = estimateTokens(userPrompt + responseText);
        
        setCompareConversations((prev) => ({
          ...prev,
          [modelId]: [...(prev[modelId] || []), {
            role: 'assistant',
            text: responseText,
            model: modelId,
            isStreaming: false,
            tokens: tokens
          }],
        }));
        
        // Update tokens in database
        await updateTokensInDatabase(tokens);
        
      } catch (error: any) {
        console.error('Pollinations API error:', error);
        
        // Handle specific error cases
        let errorMsg = 'Failed to get response from Pollinations API. Please try again.';
        if (error.response?.status === 402) {
          errorMsg = 'This model requires higher tier access. Please try a different model like DeepSeek, Gemini, or Mistral.';
        } else if (error.response?.status === 400) {
          errorMsg = 'Invalid request. Please try again.';
        } else if (error.response?.data?.error) {
          errorMsg = error.response.data.error;
        }
        
        setCompareConversations((prev) => ({
          ...prev,
          [modelId]: [...(prev[modelId] || []), { 
            role: 'assistant', 
            text: errorMsg, 
            model: modelId, 
            isStreaming: false 
          }],
        }));
      }
      
      setStreamingModels(prev => {
        const newSet = new Set(prev);
        newSet.delete(modelId);
        return newSet;
      });
      return;
    }
    
    // Use Puter SDK for original models
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const puterAny = (globalThis as any).puter;
    if (!puterAny?.ai?.chat) {
      setCompareConversations((prev) => ({
        ...prev,
        [modelId]: [...(prev[modelId] || []), { role: 'assistant', text: 'Puter SDK not loaded', model: modelId, isStreaming: false }],
      }));
      setStreamingModels(prev => {
        const newSet = new Set(prev);
        newSet.delete(modelId);
        return newSet;
      });
      return;
    }
    
    try {
      const stream = await puterAny.ai.chat(userPrompt, { model: modelId, stream: true });
      let acc = '';
      
      // The puter stream is async iterable
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      for await (const part of stream as any) {
        const chunk = part?.text ?? '';
        acc += chunk;
        setCompareConversations((prev) => {
          const msgs = prev[modelId] || [];
          const last = msgs[msgs.length - 1];
          if (last?.role === 'assistant' && last.model === modelId) {
            const updated = [...msgs];
            updated[updated.length - 1] = { role: 'assistant', text: acc, model: modelId, isStreaming: true, tokens: estimateTokens(acc) };
            return { ...prev, [modelId]: updated };
          }
          return { ...prev, [modelId]: [...msgs, { role: 'assistant', text: acc, model: modelId, isStreaming: true, tokens: estimateTokens(acc) }] };
        });
      }
      
      // Mark streaming as complete
      setCompareConversations((prev) => {
        const msgs = prev[modelId] || [];
        const last = msgs[msgs.length - 1];
        if (last?.role === 'assistant' && last.model === modelId) {
          const updated = [...msgs];
          updated[updated.length - 1] = { ...last, isStreaming: false };
          return { ...prev, [modelId]: updated };
        }
        return prev;
      });

      // Update tokens after full assistant message per model (prompt + response)
      const totalUsed = estimateTokens(userPrompt) + estimateTokens(acc);
      if (totalUsed > 0) {
        updateTokensInDatabase(totalUsed);
      }
    } catch (error) {
      setCompareConversations((prev) => ({
        ...prev,
        [modelId]: [...(prev[modelId] || []), { role: 'assistant', text: 'Error: Failed to get response', model: modelId, isStreaming: false }],
      }));
    } finally {
      // Remove model from streaming set
      setStreamingModels(prev => {
        const newSet = new Set(prev);
        newSet.delete(modelId);
        return newSet;
      });
      
      // Auto-save after streaming completes
      setTimeout(() => {
        console.log('Auto-saving after compare chat streaming completed');
        autoSaveChat();
      }, 1000);
    }
  }

  function clearChat(modelId?: string) {
    if (mode === 'single') {
      setSingleChatConversation([]);
    } else if (mode === 'smart') {
      setSmartChatConversation([]);
    } else {
      if (!modelId) {
        setCompareConversations({});
        setCurrentChatId(null);
        return;
      }
      setCompareConversations((prev) => ({ ...prev, [modelId]: [] }));
    }
    setCurrentChatId(null);
  }

  return (
    <div className="h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-xl border-b border-white/20 flex-shrink-0 shadow-lg sticky top-0 z-[200]">
        <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4 lg:gap-6 min-w-0 flex-1">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="relative flex-shrink-0">
                  <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold shadow-xl">
                    H
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl blur-sm opacity-30"></div>
                </div>
                <span className="font-bold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent truncate">HatGPT Ultra</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowChatHistory(true)}
                  className="ml-1 hidden lg:inline-flex rounded-full px-3 py-1.5 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 transition-all duration-300 font-medium"
                >
                  <span className="mr-1 text-sm">📚</span>
                  <span className="text-xs font-semibold">History</span>
                  <span className="ml-1 text-xs text-emerald-600 font-medium">(Auto)</span>
                </Button>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar min-w-0 flex-1">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100/80 backdrop-blur-sm px-2 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200/50 flex-shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="hidden sm:inline">Mode</span>
                </span>
                <div className="hidden lg:inline-flex items-center gap-1.5 p-1 bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg min-w-max">
                  <Button 
                    variant={mode === 'single' ? 'primary' : 'ghost'} 
                    size="sm" 
                    onClick={() => setMode('single')}
                    className={`${mode === 'single' ? 'rounded-xl shadow-lg bg-gradient-to-r from-emerald-500 to-teal-600 text-white' : 'rounded-xl text-gray-600 hover:text-emerald-600 hover:bg-emerald-50'} px-3 py-1.5 transition-all duration-300 font-semibold`}
                  >
                    <span className="mr-1 text-sm">💬</span>
                    <span className="text-xs font-semibold">Single</span>
                  </Button>
                  <Button 
                    variant={mode === 'compare' ? 'primary' : 'ghost'} 
                    size="sm" 
                    onClick={() => setMode('compare')}
                    className={`${mode === 'compare' ? 'rounded-xl shadow-lg bg-gradient-to-r from-emerald-500 to-teal-600 text-white' : 'rounded-xl text-gray-600 hover:text-emerald-600 hover:bg-emerald-50'} px-3 py-1.5 transition-all duration-300 font-semibold`}
                  >
                    <span className="mr-1 text-sm">⚖️</span>
                    <span className="text-xs font-semibold">Compare</span>
                  </Button>
                  <Button 
                    variant={mode === 'smart' ? 'primary' : 'ghost'} 
                    size="sm" 
                    onClick={() => setMode('smart')}
                    className={`${mode === 'smart' ? 'rounded-xl shadow-lg bg-gradient-to-r from-emerald-500 to-teal-600 text-white' : 'rounded-xl text-gray-600 hover:text-emerald-600 hover:bg-emerald-50'} px-3 py-1.5 transition-all duration-300 font-semibold`}
                  >
                    <span className="mr-1 text-sm">🧠</span>
                    <span className="text-xs font-semibold">Smart</span>
                  </Button>
                  <Button 
                    variant={mode === 'arena' ? 'primary' : 'ghost'} 
                    size="sm" 
                    onClick={() => setMode('arena')}
                    className={`${mode === 'arena' ? 'rounded-xl shadow-lg bg-gradient-to-r from-red-500 to-pink-600 text-white' : 'rounded-xl text-gray-600 hover:text-red-600 hover:bg-red-50'} px-3 py-1.5 transition-all duration-300 font-semibold`}
                  >
                    <span className="mr-1 text-sm">🥊</span>
                    <span className="text-xs font-semibold">Arena</span>
                  </Button>
                  <Button 
                    variant={mode === 'tools' ? 'primary' : 'ghost'} 
                    size="sm" 
                    onClick={() => setMode('tools')}
                    className={`${mode === 'tools' ? 'rounded-xl shadow-lg bg-gradient-to-r from-purple-500 to-indigo-600 text-white' : 'rounded-xl text-gray-600 hover:text-purple-600 hover:bg-purple-50'} px-3 py-1.5 transition-all duration-300 font-semibold`}
                  >
                    <span className="mr-1 text-sm">🛠️</span>
                    <span className="text-xs font-semibold">Tools</span>
                  </Button>
                  <Button 
                    variant={mode === 'community' ? 'primary' : 'ghost'} 
                    size="sm" 
                    onClick={() => setMode('community')}
                    className={`${mode === 'community' ? 'rounded-xl shadow-lg bg-gradient-to-r from-purple-500 to-indigo-600 text-white' : 'rounded-xl text-gray-600 hover:text-purple-600 hover:bg-purple-50'} px-3 py-1.5 transition-all duration-300 font-semibold`}
                  >
                    <span className="mr-1 text-sm">🌍</span>
                    <span className="text-xs font-semibold">Community</span>
                  </Button>
                </div>
                <div className="hidden" />
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              {user ? (
                <div className="flex items-center gap-2">
                  {/* Token Counter - Compact Mobile Design */}
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl blur-sm opacity-75"></div>
                    <div className="relative flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/80 backdrop-blur-xl px-2.5 py-1.5 shadow-lg">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                      <span className="text-xs font-bold text-gray-800">{(user?.monthlyTokens ?? 0).toLocaleString()}</span>
                      <button 
                        onClick={refreshUserData}
                        className="text-gray-400 hover:text-emerald-600 transition-colors text-xs hover:scale-110 transform duration-200"
                        title="Refresh"
                      >
                        🔄
                      </button>
                    </div>
                  </div>
                  
                  {/* User Avatar - Compact Design */}
                  <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="relative group"
                    title="Profile & Settings"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl blur-sm opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative flex items-center gap-2 rounded-xl border border-white/20 bg-white/80 backdrop-blur-xl px-2.5 py-1.5 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                      <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-xs shadow-lg">
                        {(user?.username?.charAt(0)?.toUpperCase() ?? 'U')}
                      </div>
                      <div className="hidden sm:flex flex-col items-start">
                        <span className="text-xs font-bold text-gray-900 truncate max-w-20">{user?.username ?? 'User'}</span>
                        <span className="text-xs text-gray-600 font-medium">Profile</span>
                      </div>
                    </div>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-400 to-gray-500 rounded-xl blur-sm opacity-75"></div>
                    <div className="relative flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/80 backdrop-blur-xl px-2.5 py-1.5 shadow-lg">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                      <span className="text-xs font-bold text-gray-800">0</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="relative group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl blur-sm opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative flex items-center gap-2 rounded-xl border border-white/20 bg-white/80 backdrop-blur-xl px-2.5 py-1.5 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                      <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-xs shadow-lg">
                        ?
                      </div>
                      <div className="hidden sm:flex flex-col items-start">
                        <span className="text-xs font-bold text-gray-900">Guest</span>
                        <span className="text-xs text-gray-600 font-medium">Anonymous</span>
                      </div>
                    </div>
                  </button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="relative group"
                    onClick={() => {
                      localStorage.removeItem('token');
                      window.location.href = '/login';
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-600 rounded-xl blur-sm opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative px-2.5 py-1.5 text-red-600 hover:text-white rounded-xl font-semibold transition-all duration-300 group-hover:scale-105 text-xs">
                      🚪
                    </div>
                  </Button>
                </div>
              )}

              {/* Mobile user menu (hamburger) */}
              {user && (
                <div className="relative lg:hidden">
                  <button
                    onClick={() => setUserMenuOpen(v => !v)}
                    aria-label="Open user menu"
                    className="relative group p-1.5 rounded-lg border border-white/20 bg-white/70 backdrop-blur-xl text-gray-700 hover:bg-white/90 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg blur-sm opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    </div>
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-xl border border-white/20 bg-white/90 backdrop-blur-xl shadow-2xl py-3 z-[260]">
                      <div className="px-3 pb-2 text-xs font-bold text-emerald-700 uppercase tracking-wide">Switch Mode</div>
                      <button onClick={() => { setMode('single'); setUserMenuOpen(false); }} className={`block w-full text-left px-3 py-2 text-sm font-semibold hover:bg-emerald-50 transition-colors duration-300 ${mode==='single'?'text-emerald-600 bg-emerald-50':''}`}>
                        <span className="mr-2 text-sm">💬</span>Single Chat
                      </button>
                      <button onClick={() => { setMode('compare'); setUserMenuOpen(false); }} className={`block w-full text-left px-3 py-2 text-sm font-semibold hover:bg-emerald-50 transition-colors duration-300 ${mode==='compare'?'text-emerald-600 bg-emerald-50':''}`}>
                        <span className="mr-2 text-sm">⚖️</span>Compare
                      </button>
                      <button onClick={() => { setMode('smart'); setUserMenuOpen(false); }} className={`block w-full text-left px-3 py-2 text-sm font-semibold hover:bg-emerald-50 transition-colors duration-300 ${mode==='smart'?'text-emerald-600 bg-emerald-50':''}`}>
                        <span className="mr-2 text-sm">🧠</span>Smart
                      </button>
                      <button onClick={() => { setMode('arena'); setUserMenuOpen(false); }} className={`block w-full text-left px-3 py-2 text-sm font-semibold hover:bg-red-50 transition-colors duration-300 ${mode==='arena'?'text-red-600 bg-red-50':''}`}>
                        <span className="mr-2 text-sm">🥊</span>Arena
                      </button>
                      <button onClick={() => { setMode('tools'); setUserMenuOpen(false); }} className={`block w-full text-left px-3 py-2 text-sm font-semibold hover:bg-purple-50 transition-colors duration-300 ${mode==='tools'?'text-purple-600 bg-purple-50':''}`}>
                        <span className="mr-2 text-sm">🛠️</span>Tools
                      </button>
                      <button onClick={() => { setMode('community'); setUserMenuOpen(false); }} className={`block w-full text-left px-3 py-2 text-sm font-semibold hover:bg-purple-50 transition-colors duration-300 ${mode==='community'?'text-purple-600 bg-purple-50':''}`}>
                        <span className="mr-2 text-sm">🌍</span>Community
                      </button>
                      <div className="my-2 border-t border-gray-200"></div>
                      <button onClick={() => { setShowChatHistory(true); setUserMenuOpen(false); }} className="block w-full text-left px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-emerald-50 transition-colors duration-300">
                        <span className="mr-2 text-sm">📚</span>History
                      </button>
                      <button onClick={() => { setSidebarOpen(true); setUserMenuOpen(false); }} className="block w-full text-left px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-emerald-50 transition-colors duration-300">
                        <span className="mr-2 text-sm">👤</span>Profile
                      </button>
                      <div className="px-3 py-2 text-xs font-semibold text-gray-600 bg-gray-50 rounded-lg mx-2">
                        <span className="mr-1">🔋</span>Tokens: {(user?.monthlyTokens ?? 0).toLocaleString()}
                      </div>
                      <div className="my-2 border-t border-gray-200"></div>
                      <button onClick={() => { localStorage.removeItem('token'); window.location.href = '/login'; }} className="block w-full text-left px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors duration-300">
                        <span className="mr-2 text-sm">🚪</span>Logout
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Model Selection - Compact */}
      {mode !== 'smart' && mode !== 'arena' && mode !== 'tools' && mode !== 'community' && (
      <div className="bg-white/60 backdrop-blur-sm border-b border-gray-200/30 flex-shrink-0">
        <div className="mx-auto max-w-7xl px-6 py-3">
          {mode === 'single' ? (
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200">
                {generationType === 'image' ? 'Image Model' : generationType === 'audio' ? 'Voice' : 'AI Model'}
              </span>
              <div className="relative">
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">⌄</span>
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600" aria-hidden>
                  {generationType === 'image' ? '🎨' : generationType === 'audio' ? '🎵' : getModelIcon(activeModel)}
                </span>
                {generationType === 'image' ? (
                  <select
                    value={selectedImageModel}
                    onChange={(e) => setSelectedImageModel(e.target.value)}
                    className="appearance-none rounded-full border border-gray-200 bg-white/90 pl-9 pr-8 py-2 text-sm text-slate-900 shadow-sm hover:bg-white focus:border-emerald-500 focus:ring-emerald-500 transition-all duration-200"
                  >
                    {IMAGE_MODELS.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                ) : generationType === 'audio' ? (
                  <select
                    value={selectedAudioVoice}
                    onChange={(e) => setSelectedAudioVoice(e.target.value)}
                    className="appearance-none rounded-full border border-gray-200 bg-white/90 pl-9 pr-8 py-2 text-sm text-slate-900 shadow-sm hover:bg-white focus:border-emerald-500 focus:ring-emerald-500 transition-all duration-200"
                  >
                    {AUDIO_VOICES.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <select
                    value={activeModel}
                    onChange={(e) => setSelectedModels([e.target.value])}
                    className="appearance-none rounded-full border border-gray-200 bg-white/90 pl-9 pr-8 py-2 text-sm text-slate-900 shadow-sm hover:bg-white focus:border-emerald-500 focus:ring-emerald-500 transition-all duration-200"
                  >
                    {ALL_MODELS.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Mobile: Full width layout */}
              <div className="w-full sm:hidden">
              <div className="mb-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-mint-50 px-2.5 py-1 text-xs font-medium text-mint-700 ring-1 ring-inset ring-mint-200">
                  Models
                </span>
              </div>
              <div className="flex flex-wrap gap-1 w-full">
                {ALL_MODELS.map((m) => (
                  <label 
                    key={m.id} 
                    className={`inline-flex items-center gap-1.5 px-2 py-1.5 cursor-pointer transition-all duration-200 text-xs rounded border flex-shrink-0 ${
                      selectedModels.includes(m.id) 
                        ? 'bg-mint-50 text-mint-700 border-mint-300' 
                        : 'bg-white hover:bg-mint-50/50 text-slate-600 border-gray-200'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedModels.includes(m.id)}
                      onChange={() => toggleModel(m.id)}
                      className="h-3 w-3 text-mint-600 focus:ring-emerald-500 border-slate-300 rounded"
                    />
                    <span className="font-medium text-xs whitespace-nowrap">{m.label}</span>
                  </label>
                ))}
              </div>
            </div>
            
            {/* Desktop: Original layout */}
            <div className="hidden sm:flex items-center gap-4 w-full">
              <span className="inline-flex items-center gap-1 rounded-full bg-mint-50 px-2.5 py-1 text-xs font-medium text-mint-700 ring-1 ring-inset ring-mint-200">
                Models
              </span>
              <div className="flex-1 w-full">
                
                {/* Desktop: Wrap layout */}
                <div className="hidden sm:flex flex-wrap gap-2 p-1">
                  {ALL_MODELS.map((m) => (
                    <label 
                      key={m.id} 
                      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 cursor-pointer transition-all duration-200 text-sm ring-1 ${
                        selectedModels.includes(m.id) 
                          ? 'ring-mint-300 bg-gradient-to-r from-mint-50 to-white text-mint-700 shadow-sm' 
                          : 'ring-slate-200 hover:ring-mint-300 hover:bg-mint-50/50 text-slate-600'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedModels.includes(m.id)}
                        onChange={() => toggleModel(m.id)}
                        className="h-3 w-3 text-mint-600 focus:ring-emerald-500 border-slate-300 rounded"
                      />
                      <span aria-hidden>{getModelIcon(m.id)}</span>
                      <span className="font-medium">{m.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-2.5 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-200">
                {selectedModels.length}/5 selected
              </span>
              <div className="ml-auto">
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={() => clearChat()}
                  className="rounded-full px-3 py-1.5 whitespace-nowrap"
                >
                  Clear All
                </Button>
              </div>
            </div>
            </>
          )}
        </div>
      </div>
      )}

      {/* Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-y-0 left-0 z-50 w-80 bg-white/95 backdrop-blur-xl border-r border-gray-200/60 shadow-2xl">
          <div className="h-full flex flex-col overflow-hidden">
            {/* Sidebar Header */}
            <div className="p-6 border-b border-gray-200/60 bg-gradient-to-br from-emerald-50 via-white to-teal-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-400 flex items-center justify-center text-white font-bold shadow">H</div>
                  <h2 className="text-lg font-bold text-gray-900">Profile & Stats</h2>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  <span className="block h-5 w-5 text-gray-600">×</span>
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
              {/* Profile Section */}
              <div className="p-6 border-b border-white/20">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
                  <h3 className="text-lg font-bold text-gray-800">Profile</h3>
                </div>
                
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl blur-lg opacity-20"></div>
                  <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl border border-white/20 p-6 shadow-2xl">
                    <div className="flex items-center gap-6">
                      <div className="relative">
                        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-2xl shadow-xl">
                          {user ? (user.username || user.email).charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <h4 className="text-xl font-bold text-gray-900">
                              {user ? (user.username || user.email.split('@')[0]) : 'User'}
                            </h4>
                            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
                              Free User
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 font-medium">
                            {user ? user.email : 'user@example.com'}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            <span>Active</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl blur-sm opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="relative w-full rounded-2xl bg-white/90 backdrop-blur-xl border border-white/20 text-gray-700 hover:text-emerald-700 hover:bg-emerald-50 transition-all duration-300 py-4 px-6 shadow-lg group-hover:shadow-xl"
                      onClick={() => setShowChangePassword(true)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center text-white text-lg shadow-lg">
                          🔒
                        </div>
                        <div className="text-left">
                          <div className="font-semibold text-sm">Change Password</div>
                          <div className="text-xs text-gray-500">Update your security</div>
                        </div>
                      </div>
                    </Button>
                  </div>
                  
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur-sm opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="relative w-full rounded-2xl bg-white/90 backdrop-blur-xl border border-white/20 text-gray-700 hover:text-blue-700 hover:bg-blue-50 transition-all duration-300 py-4 px-6 shadow-lg group-hover:shadow-xl"
                      onClick={() => setShowEditProfile(true)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg shadow-lg">
                          ✏️
                        </div>
                        <div className="text-left">
                          <div className="font-semibold text-sm">Edit Profile</div>
                          <div className="text-xs text-gray-500">Update your details</div>
                        </div>
                      </div>
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Modals */}
            {showChangePassword && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <div className="relative w-full max-w-md mx-4">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl blur-lg opacity-75"></div>
                  <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center text-white text-lg shadow-lg">
                        🔒
                      </div>
                      <h4 className="text-xl font-bold text-gray-900">Change Password</h4>
                    </div>
                    <ChangePasswordForm onClose={() => setShowChangePassword(false)} />
                  </div>
                </div>
              </div>
            )}
            {showEditProfile && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <div className="relative w-full max-w-md mx-4">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl blur-lg opacity-75"></div>
                  <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg shadow-lg">
                        ✏️
                      </div>
                      <h4 className="text-xl font-bold text-gray-900">Edit Profile</h4>
                    </div>
                    <EditProfileForm user={user} onUpdated={setUser} onClose={() => setShowEditProfile(false)} />
                  </div>
                </div>
              </div>
            )}



            {/* Token Statistics */}
            <div className="p-6 border-b border-white/20">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></div>
                  <h3 className="text-lg font-bold text-gray-800">Token Usage</h3>
                </div>
                
                {user && (
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl blur-lg opacity-20"></div>
                    <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl border border-white/20 p-6 shadow-2xl">
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div className="space-y-2">
                            <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                              {user.monthlyTokens.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-600 font-medium">Tokens used this month</div>
                          </div>
                          <div className="relative">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl shadow-xl">
                              🔋
                            </div>
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-gray-50 to-white border border-gray-200/50">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                              <span className="text-sm font-medium text-gray-700">Reset Date</span>
                            </div>
                            <span className="text-sm font-semibold text-gray-900">
                              {new Date(user.lastTokenReset).toLocaleDateString()}
                            </span>
                          </div>
                          
                          <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/50">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                              <span className="text-xs text-emerald-700 font-semibold">* Estimated based on text length</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Chat Statistics */}
            <div className="p-6 flex-1">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-purple-500 animate-pulse"></div>
                  <h3 className="text-lg font-bold text-gray-800">Chat Statistics</h3>
                </div>
                
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-600 rounded-3xl blur-lg opacity-20"></div>
                  <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl border border-white/20 p-6 shadow-2xl">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <div className="text-center group">
                        <div className="relative mb-4">
                          <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center text-white text-2xl shadow-xl mx-auto group-hover:scale-110 transition-transform duration-300">
                            💬
                          </div>
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        </div>
                        <div className="text-3xl font-bold text-emerald-600 mb-1">{singleChatConversation.length}</div>
                        <div className="text-sm text-gray-600 font-medium">Single Chat</div>
                        <div className="text-xs text-gray-500 mt-1">Direct conversations</div>
                      </div>
                      
                      <div className="text-center group">
                        <div className="relative mb-4">
                          <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-600 flex items-center justify-center text-white text-2xl shadow-xl mx-auto group-hover:scale-110 transition-transform duration-300">
                            ⚖️
                          </div>
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center shadow-lg">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        </div>
                        <div className="text-3xl font-bold text-teal-600 mb-1">
                          {Object.values(compareConversations).reduce((total, conv) => total + conv.length, 0)}
                        </div>
                        <div className="text-sm text-gray-600 font-medium">Compare Chat</div>
                        <div className="text-xs text-gray-500 mt-1">Model comparisons</div>
                      </div>
                      
                      <div className="text-center group">
                        <div className="relative mb-4">
                          <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center text-white text-2xl shadow-xl mx-auto group-hover:scale-110 transition-transform duration-300">
                            🤖
                          </div>
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center shadow-lg">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        </div>
                        <div className="text-3xl font-bold text-purple-600 mb-1">{visibleModels.length}</div>
                        <div className="text-sm text-gray-600 font-medium">Active Models</div>
                        <div className="text-xs text-gray-500 mt-1">Available AI models</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Chat History Modal */}
      <ChatHistoryModal
        isOpen={showChatHistory}
        onClose={() => setShowChatHistory(false)}
        savedChats={savedChats}
        onLoadChat={loadSavedChat}
        onDeleteChat={deleteSavedChat}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearch={searchChats}
      />

      {/* Main Content - Chat Area */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="h-full p-4 min-h-0">
        {/* Chat Interface */}
        {mode === 'single' ? (
          <div className="h-full overflow-y-auto bg-gradient-to-br from-slate-50 via-purple-50 to-pink-100">
            <div className="max-w-6xl mx-auto p-4">
              {/* Hero Header */}
              <div className="relative overflow-hidden mb-4">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-pink-600/10 to-rose-600/10"></div>
                <div className="relative text-center py-6">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg mb-3">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse"></div>
                    <span className="text-xs font-semibold text-gray-700">AI Chat Assistant</span>
                  </div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-pink-900 bg-clip-text text-transparent mb-2">
                    Single Chat
                  </h1>
                  <p className="text-sm text-gray-600 max-w-xl mx-auto">
                    Chat with your AI assistant one-on-one. Get personalized responses tailored to your needs!
                  </p>
                </div>
              </div>

              {/* Main Chat Container */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-600 rounded-3xl blur-lg opacity-20"></div>
                <div className="relative bg-white/90 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden">
                  {/* Chat Header */}
                  <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                          <span className="text-2xl">💬</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <h2 className="text-xl font-bold text-white">
                              {generationType === 'image' 
                                ? IMAGE_MODELS.find(x => x.id === selectedImageModel)?.label || selectedImageModel
                                : generationType === 'audio'
                                ? AUDIO_VOICES.find(x => x.id === selectedAudioVoice)?.label || selectedAudioVoice
                                : ALL_MODELS.find(x => x.id === activeModel)?.label || activeModel
                              }
                            </h2>
                            {((generationType === 'text' && streamingModels.has(activeModel)) || 
                              (generationType === 'image' && isSending) || 
                              (generationType === 'audio' && isSending)) && (
                              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 border border-white/30">
                                <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
                                <span className="text-xs text-white font-medium">
                                  {generationType === 'image' ? 'Generating...' : generationType === 'audio' ? 'Generating...' : 'Typing...'}
                                </span>
                              </div>
                            )}
                          </div>
                          <p className="text-purple-100 text-sm">AI Assistant</p>
                        </div>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-gray-500 to-gray-600 rounded-xl blur-sm opacity-75"></div>
                        <Button 
                          onClick={() => clearChat()}
                          className="relative bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-lg transform hover:scale-105 transition-all duration-300"
                        >
                          🗑️ Clear
                        </Button>
                      </div>
                    </div>
                  </div>
                  {/* Chat Content */}
                  <div className="p-6 min-h-[400px]">
                    <div 
                      ref={listRef} 
                      className="space-y-6 overflow-y-auto h-full overscroll-contain touch-pan-y scrollbar-thin scrollbar-thumb-purple-200 scrollbar-track-transparent"
                    >
                      {singleVisibleMessages.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-center py-12">
                          <div className="space-y-6">
                            <div className="relative">
                              <div className="w-20 h-20 bg-gradient-to-r from-purple-100 to-pink-100 rounded-3xl flex items-center justify-center mx-auto shadow-xl">
                                <span className="text-3xl">💬</span>
                              </div>
                              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-600 rounded-3xl blur-lg opacity-20"></div>
                            </div>
                            <div className="space-y-3">
                              <h3 className="text-2xl font-bold text-gray-800">Start a conversation</h3>
                              <p className="text-gray-600 max-w-lg mx-auto">
                                Type your message below to begin chatting with your AI assistant. Ask questions, get help, or explore ideas!
                              </p>
                            </div>
                            <div className="flex items-center justify-center gap-3">
                              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                              <div className="w-3 h-3 rounded-full bg-pink-500"></div>
                              <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          {singleVisibleMessages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[85%] relative ${
                                msg.role === 'user' 
                                  ? 'bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-xl rounded-3xl px-6 py-4' 
                                  : 'bg-gradient-to-br from-gray-50 to-white border border-gray-200 text-gray-900 shadow-lg rounded-3xl px-6 py-4'
                              }`}>
                                <div className="text-sm leading-relaxed whitespace-pre-wrap">
                                  {msg.text}
                                  {msg.isStreaming && (
                                    <span className="inline-block w-2 h-4 bg-purple-500 ml-1 animate-pulse" />
                                  )}
                                  {msg.text.includes('Error: Failed to get response') && (
                                    <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                                      <div className="flex items-center gap-2 text-red-600">
                                        <span className="text-sm">⚠️</span>
                                        <span className="text-sm font-medium">Connection issue - please try again</span>
                                      </div>
                                    </div>
                                  )}
                                  {msg.type === 'image' && msg.content && (
                                    <div className="mt-3">
                                      <img 
                                        src={msg.content} 
                                        alt="Generated image" 
                                        className="max-w-full h-auto rounded-lg shadow-sm border border-slate-200"
                                        onError={(e) => {
                                          console.error('Image failed to load:', msg.content);
                                          e.currentTarget.style.display = 'none';
                                          // Show fallback message
                                          const fallback = document.createElement('div');
                                          fallback.className = 'p-4 bg-slate-100 rounded-lg border border-slate-200 text-sm text-slate-600';
                                          fallback.innerHTML = `
                                            <p>Image failed to load. Try opening the link directly:</p>
                                            <a href="${msg.content}" target="_blank" rel="noopener noreferrer" class="text-mint-600 hover:text-mint-700 underline">
                                              ${msg.content}
                                            </a>
                                          `;
                                          e.currentTarget.parentNode?.appendChild(fallback);
                                        }}
                                        onLoad={() => {
                                          console.log('Image loaded successfully:', msg.content);
                                        }}
                                      />
                                      <div className="mt-2 text-xs text-slate-500">
                                        <a href={msg.content} target="_blank" rel="noopener noreferrer" className="text-mint-600 hover:text-mint-700">
                                          Open in new tab
                                        </a>
                                      </div>
                                    </div>
                                  )}
                                  {msg.type === 'audio' && msg.content && (
                                    <div className="mt-3">
                                      <audio 
                                        controls 
                                        className="w-full max-w-md"
                                        src={msg.content}
                                      >
                                        Your browser does not support the audio element.
                                      </audio>
                                    </div>
                                  )}
                                </div>
                                {msg.role === 'assistant' && (
                                  <div className="flex items-center justify-between mt-3">
                                    <div className="flex items-center gap-2">
                                      <div className="text-xs text-slate-500 opacity-70">
                                        {msg.model}
                                      </div>
                                      {msg.tokens && (
                                        <div className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">
                                          {msg.tokens} tokens
                                        </div>
                                      )}
                                    </div>
                                    {msg.isStreaming && (
                                      <div className="flex items-center gap-1">
                                        <div className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-pulse" />
                                        <span className="text-xs text-purple-600 font-medium">Streaming</span>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                          {streamingModels.has(activeModel) && singleChatConversation.length > 0 && generationType === 'text' && (
                            <div className="flex justify-start">
                              <div className="max-w-[85%] rounded-3xl px-6 py-4 bg-gradient-to-br from-gray-50 to-white border border-gray-200 text-gray-900 shadow-lg">
                                <div className="flex items-center gap-3">
                                  <div className="flex space-x-1">
                                    <div className="h-2 w-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <div className="h-2 w-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <div className="h-2 w-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                                  </div>
                                  <span className="text-sm text-gray-600 font-medium">AI is thinking...</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : mode === 'smart' ? (
          <SmartAnswer
            onSendPrompt={sendPrompt}
            isSending={isSending}
            prompt={prompt}
            setPrompt={setPrompt}
            messages={smartChatConversation}
            onSmartSend={handleSmartSend}
            onClearChat={() => clearChat()}
          />
        ) : mode === 'arena' ? (
          <AIArena />
        ) : mode === 'tools' ? (
          <ToolsPage />
        ) : mode === 'community' ? (
          <CommunityArena />
        ) : (
          <div className="h-full overflow-y-auto bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            <div className="max-w-7xl mx-auto p-4">
              {/* Hero Header */}
              <div className="relative overflow-hidden mb-4">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10"></div>
                <div className="relative text-center py-6">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg mb-3">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 animate-pulse"></div>
                    <span className="text-xs font-semibold text-gray-700">AI Model Comparison</span>
                  </div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-2">
                    Compare AI Models
                  </h1>
                  <p className="text-sm text-gray-600 max-w-xl mx-auto">
                    Compare responses from multiple AI models side-by-side to find the best answer for your needs!
                  </p>
                </div>
              </div>

              {/* Models Grid */}
              <div className={`grid gap-6 ${
                visibleModels.length === 1 ? 'grid-cols-1' :
                visibleModels.length === 2 ? 'grid-cols-1 lg:grid-cols-2' :
                visibleModels.length === 3 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' :
                visibleModels.length === 4 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4' :
                'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5'
              }`}>
                {visibleModels.map((m, index) => (
                  <div key={m} className="relative group" style={{ animationDelay: `${index * 100}ms` }}>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
                    <div className="relative bg-white/90 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden group-hover:shadow-3xl transition-all duration-500 group-hover:scale-[1.02]">
                      {/* Model Header */}
                      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                              <span className="text-2xl">🤖</span>
                            </div>
                            <div>
                              <div className="flex items-center gap-3">
                                <h3 className="text-xl font-bold text-white">
                                  {ALL_MODELS.find(x => x.id === m)?.label || m}
                                </h3>
                                {streamingModels.has(m) && (
                                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 border border-white/30">
                                    <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
                                    <span className="text-xs text-white font-medium">Typing...</span>
                                  </div>
                                )}
                              </div>
                              <p className="text-blue-100 text-sm">AI Assistant</p>
                            </div>
                          </div>
                          <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-gray-500 to-gray-600 rounded-xl blur-sm opacity-75"></div>
                            <Button 
                              onClick={() => clearChat(m)}
                              className="relative bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-lg transform hover:scale-105 transition-all duration-300"
                            >
                              🗑️ Clear
                            </Button>
                          </div>
                        </div>
                      </div>
                      {/* Chat Content */}
                      <div className="p-4 min-h-[350px]">
                        <div 
                          ref={(el) => { compareListRefs.current[m] = el; }}
                          className="space-y-4 overflow-y-auto h-full overscroll-contain touch-pan-y scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-transparent"
                        >
                          {(compareConversations[m] || []).length === 0 ? (
                            <div className="flex items-center justify-center h-full text-center py-10">
                              <div className="space-y-4">
                                <div className="relative">
                                  <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-3xl flex items-center justify-center mx-auto shadow-xl">
                                    <span className="text-2xl">🤖</span>
                                  </div>
                                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl blur-lg opacity-20"></div>
                                </div>
                                <div className="space-y-2">
                                  <h3 className="text-xl font-bold text-gray-800">Start a conversation</h3>
                                  <p className="text-gray-600 max-w-sm mx-auto text-sm">
                                    Type your message below to begin chatting with this AI model. Compare responses across different models!
                                  </p>
                                </div>
                                <div className="flex items-center justify-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                  <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <>
                              {(compareConversations[m] || []).map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                  <div className={`max-w-[85%] relative ${
                                    msg.role === 'user' 
                                      ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-xl rounded-3xl px-6 py-4' 
                                      : 'bg-gradient-to-br from-gray-50 to-white border border-gray-200 text-gray-900 shadow-lg rounded-3xl px-6 py-4'
                                  }`}>
                                    <div className="text-sm leading-relaxed whitespace-pre-wrap">
                                      {msg.text}
                                      {msg.isStreaming && (
                                        <span className="inline-block w-2 h-4 bg-blue-500 ml-1 animate-pulse" />
                                      )}
                                      {msg.text.includes('Error: Failed to get response') && (
                                        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                                          <div className="flex items-center gap-2 text-red-600">
                                            <span className="text-sm">⚠️</span>
                                            <span className="text-sm font-medium">Connection issue - please try again</span>
                                          </div>
                                        </div>
                                      )}
                                      {msg.type === 'image' && msg.content && (
                                        <div className="mt-3">
                                          <img 
                                            src={msg.content} 
                                            alt="Generated image" 
                                            className="max-w-full h-auto rounded-lg shadow-sm border border-slate-200"
                                            onError={(e) => {
                                              console.error('Image failed to load:', msg.content);
                                              e.currentTarget.style.display = 'none';
                                              // Show fallback message
                                              const fallback = document.createElement('div');
                                              fallback.className = 'p-4 bg-slate-100 rounded-lg border border-slate-200 text-sm text-slate-600';
                                              fallback.innerHTML = `
                                                <p>Image failed to load. Try opening the link directly:</p>
                                                <a href="${msg.content}" target="_blank" rel="noopener noreferrer" class="text-mint-600 hover:text-mint-700 underline">
                                                  ${msg.content}
                                                </a>
                                              `;
                                              e.currentTarget.parentNode?.appendChild(fallback);
                                            }}
                                            onLoad={() => {
                                              console.log('Image loaded successfully:', msg.content);
                                            }}
                                          />
                                          <div className="mt-2 text-xs text-slate-500">
                                            <a href={msg.content} target="_blank" rel="noopener noreferrer" className="text-mint-600 hover:text-mint-700">
                                              Open in new tab
                                            </a>
                                          </div>
                                        </div>
                                      )}
                                      {msg.type === 'audio' && msg.content && (
                                        <div className="mt-3">
                                          <audio 
                                            controls 
                                            className="w-full max-w-md"
                                            src={msg.content}
                                          >
                                            Your browser does not support the audio element.
                                          </audio>
                                        </div>
                                      )}
                                    </div>
                                    {msg.role === 'assistant' && (
                                      <div className="flex items-center justify-between mt-3">
                                        <div className="flex items-center gap-2">
                                          <div className="text-xs text-slate-500 opacity-70">
                                            {msg.model}
                                          </div>
                                          {msg.tokens && (
                                            <div className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">
                                              {msg.tokens} tokens
                                            </div>
                                          )}
                                        </div>
                                        {msg.isStreaming && (
                                          <div className="flex items-center gap-1">
                                            <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                                            <span className="text-xs text-blue-600 font-medium">Streaming</span>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                              {streamingModels.has(m) && (compareConversations[m] || []).length > 0 && (
                                <div className="flex justify-start">
                                  <div className="max-w-[85%] rounded-3xl px-6 py-4 bg-gradient-to-br from-gray-50 to-white border border-gray-200 text-gray-900 shadow-lg">
                                    <div className="flex items-center gap-3">
                                      <div className="flex space-x-1">
                                        <div className="h-2 w-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <div className="h-2 w-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <div className="h-2 w-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                                      </div>
                                      <span className="text-sm text-gray-600 font-medium">AI is thinking...</span>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        </div>
      </div>

      {/* Chat Input */}
      {mode !== 'arena' && mode !== 'tools' && mode !== 'community' && (
      <div className="bg-white/95 backdrop-blur-sm border-t border-gray-200/50 flex-shrink-0">
        <div className="mx-auto max-w-7xl px-4 py-3">
          {/* Generation Type Selector - Only show in single mode */}
          {mode === 'single' && (
            <div className="mb-3 flex justify-center">
            <div className="flex items-center gap-1 bg-white/60 backdrop-blur-sm rounded-full p-1 border border-gray-200/50 shadow-sm">
              <button
                onClick={() => setGenerationType('text')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  generationType === 'text'
                    ? 'bg-mint-500 text-white shadow-sm'
                    : 'text-slate-600 hover:text-mint-600 hover:bg-mint-50'
                }`}
              >
                💬 Text
              </button>
              <button
                onClick={(e) => { e.preventDefault(); }}
                disabled
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  'text-slate-400 bg-slate-50 cursor-not-allowed'
                }`}
              >
                <span className="inline-flex items-center gap-1">
                  🎨 Image
                  <span className="ml-1 text-[10px] font-semibold text-mint-700 bg-mint-100 px-2 py-0.5 rounded-full">Coming</span>
                </span>
              </button>
              <button
                onClick={() => setGenerationType('audio')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  generationType === 'audio'
                    ? 'bg-mint-500 text-white shadow-sm'
                    : 'text-slate-600 hover:text-mint-600 hover:bg-mint-50'
                }`}
              >
                🎵 Audio
              </button>
              
            </div>
          </div>
          )}
          <div className="rounded-2xl border border-gray-200/70 bg-white/80 backdrop-blur-md shadow-md p-2">
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <textarea
                  className="w-full rounded-xl bg-transparent border-0 focus:ring-0 px-4 py-3 text-gray-900 placeholder-gray-400 resize-none text-sm leading-6"
                  placeholder={
                    mode === 'single' 
                      ? (generationType === 'image' 
                          ? `Describe the image you want to generate... (Single chat)`
                          : generationType === 'audio'
                          ? `Enter text to convert to speech... (Single chat)`
                          : `Type your message... (Single chat)`)
                      : mode === 'smart'
                      ? `Ask any question and I'll find the perfect AI for you... (Smart Answer)`
                      : `Type your message... (Compare mode)`
                  }
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => { 
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (mode === 'smart') {
                        handleSmartSend();
                      } else {
                        sendPrompt();
                      }
                    }
                  }}
                  rows={1}
                  style={{ minHeight: '44px', maxHeight: '120px' }}
                />
              </div>
              <div className="flex items-center gap-2">
                
                {/* Mic button (Web Speech API) */}
                {generationType === 'audio' && canUseWebSpeech() && (
                  <Button
                    variant={isListening ? 'secondary' : 'ghost'}
                    onClick={() => {
                      if (isListening) stopListening(); else startListening();
                    }}
                    size="sm"
                    className={`rounded-full px-3 py-2 ${isListening ? 'border border-red-300 text-red-600' : ''}`}
                  >
                    {isListening ? 'Stop' : '🎙️ Speak'}
                  </Button>
                )}
                <Button 
                  disabled={isSending || !prompt.trim()} 
                  onClick={mode === 'smart' ? handleSmartSend : sendPrompt}
                  size="sm"
                  className="rounded-full px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow hover:shadow-md hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSending ? (
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      <span className="text-xs">Sending...</span>
                    </div>
                  ) : (
                    <span className="text-sm font-semibold">Send</span>
                  )}
                </Button>
                <Button 
                  variant="secondary" 
                  onClick={() => clearChat()}
                  size="sm"
                  className="rounded-full px-4 py-2 border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 shadow-sm transition-all duration-200"
                >
                  <span className="text-sm font-medium">Clear</span>
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between mt-2 px-2">
              <p className="text-xs text-slate-500">
                Enter to send • Shift+Enter for new line
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <div className="flex items-center gap-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-mint-500" />
                  Streaming enabled
                </div>
                {/* STT status */}
                {canUseWebSpeech() && (
                  <div className="flex items-center gap-1">
                    <div className={`h-1.5 w-1.5 rounded-full ${isListening ? 'bg-red-500 animate-pulse' : 'bg-slate-300'}`} />
                    {isListening ? 'Listening…' : 'Mic ready'}
                  </div>
                )}
                
                {streamingModels.size > 0 && (
                  <div className="flex items-center gap-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-mint-500 animate-pulse" />
                    {streamingModels.size} responding
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}

function ChangePasswordForm({ onClose }: { onClose: () => void }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/auth/change-password', { currentPassword, newPassword }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Password changed successfully');
      setTimeout(onClose, 800);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-xs font-medium text-slate-700">Current password</label>
        <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-emerald-500" required />
      </div>
      <div className="space-y-2">
        <label className="text-xs font-medium text-slate-700">New password</label>
        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-emerald-500" required minLength={6} />
      </div>
      {error && <div className="text-xs text-red-600">{error}</div>}
      {success && <div className="text-xs text-mint-700">{success}</div>}
      <div className="flex items-center justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={onClose} type="button">Cancel</Button>
        <Button size="sm" disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
      </div>
    </form>
  );
}

function EditProfileForm({ user, onUpdated, onClose }: { user: User | null, onUpdated: (u: User | null) => void, onClose: () => void }) {
  const [email, setEmail] = useState(user?.email || '');
  const [username, setUsername] = useState(user?.username || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('/api/auth/update-profile', { email, username }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onUpdated(res.data);
      setSuccess('Profile updated');
      setTimeout(onClose, 800);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-xs font-medium text-slate-700">Username</label>
        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-emerald-500" minLength={3} maxLength={20} required />
      </div>
      <div className="space-y-2">
        <label className="text-xs font-medium text-slate-700">Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-emerald-500" required />
      </div>
      {error && <div className="text-xs text-red-600">{error}</div>}
      {success && <div className="text-xs text-mint-700">{success}</div>}
      <div className="flex items-center justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={onClose} type="button">Cancel</Button>
        <Button size="sm" disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
      </div>
    </form>
  );
}



// Chat History Modal Component
function ChatHistoryModal({ isOpen, onClose, savedChats, onLoadChat, onDeleteChat, searchQuery, setSearchQuery, onSearch }: {
  isOpen: boolean;
  onClose: () => void;
  savedChats: SavedChat[];
  onLoadChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSearch: (query: string) => void;
}) {
  if (!isOpen) return null;

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl max-h-[85vh] mx-4">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl blur-lg opacity-75"></div>
        <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-8 border-b border-white/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center text-white text-2xl shadow-xl">
                📚
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Chat History</h2>
                <p className="text-sm text-gray-600">Your saved conversations</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-3 rounded-2xl bg-gray-100 hover:bg-gray-200 transition-colors duration-300 group"
            >
              <svg className="w-6 h-6 text-gray-600 group-hover:text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Search */}
          <div className="p-8 border-b border-white/20">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl blur-sm opacity-75"></div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search your conversations..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-white/20 bg-white/80 backdrop-blur-sm text-gray-900 placeholder-gray-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300 shadow-lg"
                />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-8 min-h-0">
            {savedChats.length === 0 ? (
              <div className="text-center py-16">
                <div className="relative mb-8">
                  <div className="w-24 h-24 rounded-3xl bg-gradient-to-r from-emerald-100 to-teal-100 flex items-center justify-center mx-auto shadow-xl">
                    <span className="text-4xl">📚</span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl blur-lg opacity-20"></div>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">No saved chats yet</h3>
                <p className="text-gray-600 text-lg max-w-md mx-auto">
                  Start a conversation and it will be automatically saved for you to revisit later.
                </p>
              </div>
            ) : (
              <div className="grid gap-6">
                {savedChats.map((chat, index) => (
                  <div
                    key={chat.id}
                    className="group relative"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
                    <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl border border-white/20 p-6 shadow-xl hover:shadow-2xl transition-all duration-500 group-hover:scale-[1.02] cursor-pointer"
                         onClick={() => onLoadChat(chat.id)}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center text-white text-lg shadow-lg">
                              {chat.mode === 'single' ? '💬' : chat.mode === 'smart' ? '🧠' : '⚖️'}
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-gray-900 truncate">
                                {chat.title}
                              </h3>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
                                  {chat.mode === 'single' ? 'Single Chat' : chat.mode === 'smart' ? 'Smart Chat' : 'Compare Chat'}
                                </span>
                                <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                                  {chat.generationType}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                              <span>{new Date(chat.updatedAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                              <span>{chat.messages.length} messages</span>
                            </div>
                          </div>
                        </div>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteChat(chat.id);
                          }}
                          className="p-3 rounded-2xl bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-700 transition-all duration-300 group-hover:scale-110"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
