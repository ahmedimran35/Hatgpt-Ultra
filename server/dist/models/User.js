import mongoose, { Schema, Document, Model } from 'mongoose';
const chatMessageSchema = new Schema({
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    model: { type: String },
    type: { type: String, enum: ['text', 'image', 'audio'] },
    imageUrl: { type: String },
    audioUrl: { type: String },
});
const savedChatSchema = new Schema({
    id: { type: String, required: true },
    title: { type: String, required: true },
    messages: [chatMessageSchema],
    mode: { type: String, enum: ['single', 'compare', 'smart'], required: true },
    generationType: { type: String, enum: ['text', 'image', 'audio'], required: true },
    models: [String],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});
const communityBattleSchema = new Schema({
    id: { type: String, required: true, unique: true },
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
const userSchema = new Schema({
    email: { type: String, required: true, unique: true, index: true },
    username: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    totalTokens: { type: Number, default: 0 },
    monthlyTokens: { type: Number, default: 0 },
    lastTokenReset: { type: Date, default: Date.now },
    savedChats: [savedChatSchema],
    communityBattles: [communityBattleSchema],
}, { timestamps: true });
const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
//# sourceMappingURL=User.js.map