import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User, { type SavedChat, type ChatMessage } from '../models/User';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();

// Minimal disposable/temporary email provider blocklist
const DISPOSABLE_DOMAINS = new Set<string>([
  '10minutemail.com',
  'guerrillamail.com',
  'mailinator.com',
  'tempmail.com',
  'tempmailo.com',
  'trashmail.com',
  'yopmail.com',
  'fakeinbox.com',
  'getnada.com',
  'sharklasers.com',
  'dispostable.com',
]);

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const signupSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(20),
  password: z.string().min(6),
  confirmPassword: z.string().min(6),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const updateProfileSchema = z.object({
  email: z.string().email().optional(),
  username: z.string().min(3).max(20).optional(),
});

const saveChatSchema = z.object({
  title: z.string().min(1).max(100),
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
    model: z.string().optional(),
    type: z.enum(['text', 'image', 'audio']).optional(),
    imageUrl: z.string().optional(),
    audioUrl: z.string().optional(),
  })),
  mode: z.enum(['single', 'compare', 'smart']),
  generationType: z.enum(['text', 'image', 'audio']),
  models: z.array(z.string()).optional(),
});

router.post('/signup', async (req: Request, res: Response) => {
  try {
    const parsed = signupSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ 
        error: 'Invalid input', 
        details: parsed.error.issues 
      });
    }
    
    const { email, username, password } = parsed.data;

    // Block disposable/temporary email domains
    const domain = email.split('@')[1]?.toLowerCase() || '';
    if (!domain || DISPOSABLE_DOMAINS.has(domain)) {
      return res.status(400).json({ error: 'Disposable or temporary email addresses are not allowed' });
    }
    
    // Check if email or username already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(409).json({ error: 'Email already exists' });
    }
    
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(409).json({ error: 'Username already exists' });
    }
    
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ email, username, passwordHash });
    
    const token = jwt.sign(
      { userId: user._id.toString() }, 
      process.env.JWT_SECRET || 'dev_secret_change_me', 
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    
    return res.json({ 
      token, 
      user: { 
        email: user.email, 
        username: user.username,
        totalTokens: user.totalTokens, 
        monthlyTokens: user.monthlyTokens 
      } 
    });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const parsed = credentialsSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid input' });
    }
    
    const { email, password } = parsed.data;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { userId: user._id.toString() }, 
      process.env.JWT_SECRET || 'dev_secret_change_me', 
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    
    return res.json({ 
      token, 
      user: { 
        email: user.email, 
        username: user.username,
        totalTokens: user.totalTokens, 
        monthlyTokens: user.monthlyTokens 
      } 
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user profile
router.get('/profile', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    // Auto-reset monthly tokens if month has changed
    const now = new Date();
    const lastReset = new Date(user.lastTokenReset);
    const shouldReset = now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear();
    if (shouldReset) {
      user.monthlyTokens = 0;
      user.lastTokenReset = now;
      await user.save();
    }
    return res.json({ 
      email: user.email, 
      username: user.username,
      totalTokens: user.totalTokens, 
      monthlyTokens: user.monthlyTokens,
      lastTokenReset: user.lastTokenReset,
      createdAt: user.createdAt 
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Update tokens (called when user sends messages)
router.post('/update-tokens', requireAuth, async (req: Request, res: Response) => {
  try {
    const { tokens } = req.body;
    if (typeof tokens !== 'number' || tokens < 0) {
      return res.status(400).json({ error: 'Invalid token count' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if we need to reset monthly tokens
    const now = new Date();
    const lastReset = new Date(user.lastTokenReset);
    const shouldReset = now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear();

    if (shouldReset) {
      user.monthlyTokens = 0;
      user.lastTokenReset = now;
    }

    user.totalTokens += tokens;
    user.monthlyTokens += tokens;
    await user.save();

    return res.json({ 
      totalTokens: user.totalTokens, 
      monthlyTokens: user.monthlyTokens,
      lastTokenReset: user.lastTokenReset 
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Change password
router.post('/change-password', requireAuth, async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 12);
    user.passwordHash = newPasswordHash;
    await user.save();

    return res.json({ message: 'Password changed successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Update profile (username/email)
router.post('/update-profile', requireAuth, async (req: Request, res: Response) => {
  try {
    const parsed = updateProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid input', details: parsed.error.issues });
    }

    const { email, username } = parsed.data;
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (email && email !== user.email) {
      const emailTaken = await User.findOne({ email });
      if (emailTaken) {
        return res.status(409).json({ error: 'Email already exists' });
      }
      user.email = email;
    }

    if (username && username !== user.username) {
      const usernameTaken = await User.findOne({ username });
      if (usernameTaken) {
        return res.status(409).json({ error: 'Username already exists' });
      }
      user.username = username;
    }

    await user.save();

    return res.json({
      email: user.email,
      username: user.username,
      totalTokens: user.totalTokens,
      monthlyTokens: user.monthlyTokens,
      lastTokenReset: user.lastTokenReset,
      createdAt: user.createdAt,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Save chat history
router.post('/save-chat', requireAuth, async (req: Request, res: Response) => {
  try {
    const parsed = saveChatSchema.safeParse(req.body);
    if (!parsed.success) {
      console.error('Save chat validation error:', parsed.error.issues);
      return res.status(400).json({ error: 'Invalid input', details: parsed.error.issues });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const chatId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newChat: SavedChat = {
      id: chatId,
      title: parsed.data.title,
      messages: parsed.data.messages.map(msg => ({
        ...msg,
        timestamp: new Date(),
      })),
      mode: parsed.data.mode,
      generationType: parsed.data.generationType,
      models: parsed.data.models,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    user.savedChats.push(newChat);
    await user.save();

    return res.json({ chatId, message: 'Chat saved successfully' });
  } catch (error) {
    console.error('Save chat error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all saved chats
router.get('/chats', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Sort by updatedAt descending (most recent first)
    const sortedChats = user.savedChats.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    return res.json({ chats: sortedChats });
  } catch (error) {
    console.error('Get chats error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get specific chat by ID
router.get('/chats/:chatId', requireAuth, async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params;
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const chat = user.savedChats.find(c => c.id === chatId);
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    return res.json({ chat });
  } catch (error) {
    console.error('Get chat error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Update chat (rename, add messages)
router.put('/chats/:chatId', requireAuth, async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params;
    const { title, messages } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const chatIndex = user.savedChats.findIndex(c => c.id === chatId);
    if (chatIndex === -1) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    if (title) {
      user.savedChats[chatIndex].title = title;
    }
    if (messages) {
      user.savedChats[chatIndex].messages = messages.map(msg => ({
        ...msg,
        timestamp: new Date(),
      }));
    }
    user.savedChats[chatIndex].updatedAt = new Date();

    await user.save();

    return res.json({ message: 'Chat updated successfully' });
  } catch (error) {
    console.error('Update chat error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete chat
router.delete('/chats/:chatId', requireAuth, async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params;
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const chatIndex = user.savedChats.findIndex(c => c.id === chatId);
    if (chatIndex === -1) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    user.savedChats.splice(chatIndex, 1);
    await user.save();

    return res.json({ message: 'Chat deleted successfully' });
  } catch (error) {
    console.error('Delete chat error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Search chats
router.get('/chats/search/:query', requireAuth, async (req: Request, res: Response) => {
  try {
    const { query } = req.params;
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const searchQuery = query.toLowerCase();
    const filteredChats = user.savedChats.filter(chat => 
      chat.title.toLowerCase().includes(searchQuery) ||
      chat.messages.some(msg => 
        msg.content.toLowerCase().includes(searchQuery)
      )
    );

    // Sort by updatedAt descending
    const sortedChats = filteredChats.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    return res.json({ chats: sortedChats });
  } catch (error) {
    console.error('Search chats error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;


