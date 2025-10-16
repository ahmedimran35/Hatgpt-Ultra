import { Document, Model } from 'mongoose';
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
declare const User: Model<UserDocument>;
export default User;
//# sourceMappingURL=User.d.ts.map