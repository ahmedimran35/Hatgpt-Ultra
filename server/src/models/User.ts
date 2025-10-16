import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  model?: string;
  type?: 'text' | 'image' | 'audio';
  imageUrl?: string;
  audioUrl?: string;
}

export interface SavedChat {
  id: string;
  title: string;
  messages: ChatMessage[];
  mode: 'single' | 'compare' | 'smart';
  generationType: 'text' | 'image' | 'audio';
  models?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CommunityBattle {
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
  createdAt: string;
  endTime: string;
  isActive: boolean;
  participants: string[];
}

export interface UserDocument extends Document {
  email: string;
  username: string;
  passwordHash: string;
  totalTokens: number;
  monthlyTokens: number;
  lastTokenReset: Date;
  savedChats: SavedChat[];
  communityBattles: CommunityBattle[];
  createdAt: Date;
  updatedAt: Date;
}

const chatMessageSchema = new Schema<ChatMessage>({
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  model: { type: String },
  type: { type: String, enum: ['text', 'image', 'audio'] },
  imageUrl: { type: String },
  audioUrl: { type: String },
});

const savedChatSchema = new Schema<SavedChat>({
  id: { type: String, required: true },
  title: { type: String, required: true },
  messages: [chatMessageSchema],
  mode: { type: String, enum: ['single', 'compare', 'smart'], required: true },
  generationType: { type: String, enum: ['text', 'image', 'audio'], required: true },
  models: [String],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const communityBattleSchema = new Schema<CommunityBattle>({
  id: { type: String, required: true },
  question: { type: String, required: true, maxlength: 1000 },
  model1: { type: String, required: true },
  model2: { type: String, required: true },
  model1Response: { type: String, default: '' },
  model2Response: { type: String, default: '' },
  model1Votes: { type: Number, default: 0, min: 0 },
  model2Votes: { type: Number, default: 0, min: 0 },
  totalVotes: { type: Number, default: 0, min: 0 },
  creator: { type: String, required: true },
  createdAt: { type: String, required: true },
  endTime: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  participants: { type: [String], default: [] },
}, {
  timestamps: false // We handle timestamps manually
});

const userSchema = new Schema<UserDocument>(
  {
    email: { type: String, required: true, unique: true, index: true },
    username: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    totalTokens: { type: Number, default: 0 },
    monthlyTokens: { type: Number, default: 0 },
    lastTokenReset: { type: Date, default: Date.now },
    savedChats: [savedChatSchema],
    communityBattles: [communityBattleSchema],
  },
  { timestamps: true }
);

const User: Model<UserDocument> =
  mongoose.models.User || mongoose.model<UserDocument>('User', userSchema);

export default User;


