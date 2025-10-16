"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const User_1 = __importDefault(require("../models/User"));
const requireAuth_1 = require("../middleware/requireAuth");
const router = (0, express_1.Router)();
// Enhanced Community Battle Schema with strict validation
const createBattleSchema = zod_1.z.object({
    question: zod_1.z.string().min(1, 'Question is required').max(1000, 'Question too long'),
    model1: zod_1.z.string().min(1, 'Model 1 is required'),
    model2: zod_1.z.string().min(1, 'Model 2 is required'),
    model1Response: zod_1.z.string().default(''),
    model2Response: zod_1.z.string().default(''),
    duration: zod_1.z.number().min(1).max(1440).default(5), // 1 minute to 24 hours
});
const updateBattleSchema = zod_1.z.object({
    model1Votes: zod_1.z.number().min(0).optional(),
    model2Votes: zod_1.z.number().min(0).optional(),
    totalVotes: zod_1.z.number().min(0).optional(),
    participants: zod_1.z.array(zod_1.z.string()).optional(),
    isActive: zod_1.z.boolean().optional(),
    model1Response: zod_1.z.string().optional(),
    model2Response: zod_1.z.string().optional(),
});
// Create a new community battle
router.post('/', requireAuth_1.requireAuth, async (req, res) => {
    try {
        console.log('Creating battle with data:', req.body);
        // Validate input data
        const parsed = createBattleSchema.safeParse(req.body);
        if (!parsed.success) {
            console.error('Battle validation failed:', parsed.error.issues);
            return res.status(400).json({
                error: 'Invalid battle data',
                details: parsed.error.issues
            });
        }
        const battleData = parsed.data;
        // Find user
        const user = await User_1.default.findById(req.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        // Initialize battles array if it doesn't exist
        if (!user.communityBattles) {
            user.communityBattles = [];
        }
        // Generate unique battle ID
        const battleId = `battle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        // Calculate end time
        const endTime = new Date();
        endTime.setMinutes(endTime.getMinutes() + battleData.duration);
        // Create battle object with all required fields
        const newBattle = {
            id: battleId,
            question: battleData.question,
            model1: battleData.model1,
            model2: battleData.model2,
            model1Response: battleData.model1Response,
            model2Response: battleData.model2Response,
            model1Votes: 0,
            model2Votes: 0,
            totalVotes: 0,
            creator: user.username || user.email,
            createdAt: new Date().toISOString(),
            endTime: endTime.toISOString(),
            isActive: true,
            participants: []
        };
        console.log('Saving battle to database:', newBattle);
        // Add battle to user's battles
        user.communityBattles.push(newBattle);
        try {
            await user.save();
            console.log('Battle saved successfully');
            return res.json({
                success: true,
                battle: newBattle
            });
        }
        catch (saveError) {
            console.error('Failed to save battle:', saveError);
            return res.status(500).json({
                error: 'Failed to save battle to database',
                details: saveError.message
            });
        }
    }
    catch (error) {
        console.error('Create battle error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
// Get all community battles
router.get('/', requireAuth_1.requireAuth, async (req, res) => {
    try {
        console.log('Fetching all community battles...');
        // Get all users with battles
        const users = await User_1.default.find({
            communityBattles: { $exists: true, $not: { $size: 0 } }
        });
        console.log(`Found ${users.length} users with battles`);
        // Get current user to check their votes
        const currentUser = await User_1.default.findById(req.userId);
        const currentUserId = currentUser?._id ? String(currentUser._id) : undefined;
        // Collect all battles from all users
        const allBattles = users.flatMap(user => {
            const userBattles = user.communityBattles || [];
            console.log(`User ${user.username || user.email} has ${userBattles.length} battles`);
            return userBattles.map(battle => {
                // Check if current user has voted on this battle
                const hasVoted = currentUserId ? (battle.participants?.includes(currentUserId) || false) : false;
                const userVote = hasVoted && currentUserId
                    ? (battle.participants?.indexOf(currentUserId) === 0 ? 'model1' : 'model2')
                    : null;
                return {
                    id: battle.id,
                    question: battle.question,
                    model1: battle.model1,
                    model2: battle.model2,
                    model1Response: battle.model1Response,
                    model2Response: battle.model2Response,
                    model1Votes: battle.model1Votes || 0,
                    model2Votes: battle.model2Votes || 0,
                    totalVotes: battle.totalVotes || 0,
                    creator: user.username || user.email,
                    createdAt: battle.createdAt,
                    endTime: battle.endTime,
                    isActive: battle.isActive !== undefined ? battle.isActive : true,
                    participants: battle.participants || [],
                    hasVoted: hasVoted,
                    userVote: userVote
                };
            });
        });
        // Sort by creation date (newest first)
        allBattles.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        console.log(`Returning ${allBattles.length} battles`);
        return res.json(allBattles);
    }
    catch (error) {
        console.error('Get battles error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
// Get a specific battle by ID
router.get('/:battleId', requireAuth_1.requireAuth, async (req, res) => {
    try {
        const { battleId } = req.params;
        const user = await User_1.default.findOne({
            'communityBattles.id': battleId
        });
        if (!user) {
            return res.status(404).json({ error: 'Battle not found' });
        }
        const battle = user.communityBattles.find(b => b.id === battleId);
        if (!battle) {
            return res.status(404).json({ error: 'Battle not found' });
        }
        return res.json({
            id: battle.id,
            question: battle.question,
            model1: battle.model1,
            model2: battle.model2,
            model1Response: battle.model1Response,
            model2Response: battle.model2Response,
            model1Votes: battle.model1Votes || 0,
            model2Votes: battle.model2Votes || 0,
            totalVotes: battle.totalVotes || 0,
            creator: user.username || user.email,
            createdAt: battle.createdAt,
            endTime: battle.endTime,
            isActive: battle.isActive !== undefined ? battle.isActive : true,
            participants: battle.participants || []
        });
    }
    catch (error) {
        console.error('Get battle error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
// Update a community battle (voting, responses, etc.)
router.put('/:battleId', requireAuth_1.requireAuth, async (req, res) => {
    try {
        const { battleId } = req.params;
        const updates = req.body;
        console.log('Updating battle:', battleId, 'with updates:', updates);
        // Validate update data
        const parsed = updateBattleSchema.safeParse(updates);
        if (!parsed.success) {
            return res.status(400).json({
                error: 'Invalid update data',
                details: parsed.error.issues
            });
        }
        // Find the user who owns this battle
        const user = await User_1.default.findOne({
            'communityBattles.id': battleId
        });
        if (!user) {
            return res.status(404).json({ error: 'Battle not found' });
        }
        // Find the battle index
        const battleIndex = user.communityBattles.findIndex(battle => battle.id === battleId);
        if (battleIndex === -1) {
            return res.status(404).json({ error: 'Battle not found' });
        }
        // Update the battle
        const currentBattle = user.communityBattles[battleIndex];
        const updatedBattle = {
            ...currentBattle,
            ...parsed.data
        };
        user.communityBattles[battleIndex] = updatedBattle;
        try {
            await user.save();
            console.log('Battle updated successfully');
            return res.json({
                success: true,
                battle: updatedBattle
            });
        }
        catch (saveError) {
            console.error('Failed to save battle update:', saveError);
            return res.status(500).json({
                error: 'Failed to update battle',
                details: saveError.message
            });
        }
    }
    catch (error) {
        console.error('Update battle error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
// Vote for a model in a battle
router.post('/:battleId/vote', requireAuth_1.requireAuth, async (req, res) => {
    try {
        const { battleId } = req.params;
        const { model } = req.body; // 'model1' or 'model2'
        if (!model || !['model1', 'model2'].includes(model)) {
            return res.status(400).json({ error: 'Invalid model selection' });
        }
        // Find the user who owns this battle
        const user = await User_1.default.findOne({
            'communityBattles.id': battleId
        });
        if (!user) {
            return res.status(404).json({ error: 'Battle not found' });
        }
        const battleIndex = user.communityBattles.findIndex(battle => battle.id === battleId);
        if (battleIndex === -1) {
            return res.status(404).json({ error: 'Battle not found' });
        }
        const battle = user.communityBattles[battleIndex];
        // Check if battle is still active
        if (!battle.isActive) {
            return res.status(400).json({ error: 'Battle is no longer active' });
        }
        // Check if user already voted (using userId from token)
        const userId = req.userId || '';
        if (userId && battle.participants.includes(userId)) {
            return res.status(400).json({ error: 'You have already voted in this battle' });
        }
        // Update vote counts
        if (model === 'model1') {
            battle.model1Votes = (battle.model1Votes || 0) + 1;
        }
        else {
            battle.model2Votes = (battle.model2Votes || 0) + 1;
        }
        battle.totalVotes = (battle.totalVotes || 0) + 1;
        if (userId) {
            battle.participants.push(userId);
        }
        user.communityBattles[battleIndex] = battle;
        try {
            await user.save();
            console.log('Vote recorded successfully');
            return res.json({
                success: true,
                battle: battle,
                message: 'Vote recorded successfully'
            });
        }
        catch (saveError) {
            console.error('Failed to save vote:', saveError);
            return res.status(500).json({
                error: 'Failed to record vote',
                details: saveError.message
            });
        }
    }
    catch (error) {
        console.error('Vote error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
// Delete a community battle
router.delete('/:battleId', requireAuth_1.requireAuth, async (req, res) => {
    try {
        const { battleId } = req.params;
        // Find the user who owns this battle
        const user = await User_1.default.findOne({
            'communityBattles.id': battleId
        });
        if (!user) {
            return res.status(404).json({ error: 'Battle not found' });
        }
        // Check if user owns this battle
        const battle = user.communityBattles.find(b => b.id === battleId);
        if (!battle) {
            return res.status(404).json({ error: 'Battle not found' });
        }
        // Only allow creator to delete their own battles
        if (battle.creator !== (user.username || user.email)) {
            return res.status(403).json({ error: 'You can only delete your own battles' });
        }
        // Remove the battle
        user.communityBattles = user.communityBattles.filter(battle => battle.id !== battleId);
        await user.save();
        return res.json({ success: true, message: 'Battle deleted successfully' });
    }
    catch (error) {
        console.error('Delete battle error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
// Clean up expired battles
router.post('/cleanup-expired', requireAuth_1.requireAuth, async (req, res) => {
    try {
        console.log('Cleaning up expired battles...');
        const users = await User_1.default.find({ communityBattles: { $exists: true } });
        let totalCleaned = 0;
        const now = new Date();
        for (const user of users) {
            if (!user.communityBattles || user.communityBattles.length === 0)
                continue;
            const originalCount = user.communityBattles.length;
            // Mark expired battles as inactive
            user.communityBattles = user.communityBattles.map(battle => {
                const endTime = new Date(battle.endTime);
                if (now > endTime && battle.isActive) {
                    battle.isActive = false;
                    totalCleaned++;
                }
                return battle;
            });
            if (totalCleaned > 0) {
                await user.save();
            }
        }
        console.log(`Cleaned up ${totalCleaned} expired battles`);
        return res.json({
            success: true,
            message: `Cleaned up ${totalCleaned} expired battles`,
            cleanedCount: totalCleaned
        });
    }
    catch (error) {
        console.error('Cleanup error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=communityBattles.js.map