"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const chatMessageSchema = new mongoose_1.Schema({
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    model: { type: String },
    type: { type: String, enum: ['text', 'image', 'audio'] },
    imageUrl: { type: String },
    audioUrl: { type: String },
});
const savedChatSchema = new mongoose_1.Schema({
    id: { type: String, required: true },
    title: { type: String, required: true },
    messages: [chatMessageSchema],
    mode: { type: String, enum: ['single', 'compare', 'smart'], required: true },
    generationType: { type: String, enum: ['text', 'image', 'audio'], required: true },
    models: [String],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});
const communityBattleSchema = new mongoose_1.Schema({
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
const userSchema = new mongoose_1.Schema({
    email: { type: String, required: true, unique: true, index: true },
    username: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    totalTokens: { type: Number, default: 0 },
    monthlyTokens: { type: Number, default: 0 },
    lastTokenReset: { type: Date, default: Date.now },
    savedChats: [savedChatSchema],
    communityBattles: [communityBattleSchema],
}, { timestamps: true });
const User = mongoose_1.default.models.User || mongoose_1.default.model('User', userSchema);
exports.default = User;
//# sourceMappingURL=User.js.map