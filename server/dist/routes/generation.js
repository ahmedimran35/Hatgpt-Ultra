"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const requireAuth_1 = require("../middleware/requireAuth");
const axios_1 = __importDefault(require("axios"));
const router = (0, express_1.Router)();
// Image generation schema
const imageGenerationSchema = zod_1.z.object({
    prompt: zod_1.z.string().min(1).max(500),
    model: zod_1.z.string().optional().default('flux'),
    width: zod_1.z.number().min(256).max(2048).optional().default(1024),
    height: zod_1.z.number().min(256).max(2048).optional().default(1024),
});
// Audio generation schema
const audioGenerationSchema = zod_1.z.object({
    text: zod_1.z.string().min(1).max(1000),
    voice: zod_1.z.string().optional().default('alloy'),
});
// Text generation schema for Pollinations models
const textGenerationSchema = zod_1.z.object({
    prompt: zod_1.z.string().min(1).max(20000),
    model: zod_1.z.string(),
});
// Image generation endpoint
router.post('/image', requireAuth_1.requireAuth, async (req, res) => {
    try {
        const parsed = imageGenerationSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                error: 'Invalid input',
                details: parsed.error.errors
            });
        }
        const { prompt, model, width, height } = parsed.data;
        // Encode prompt for URL
        const encodedPrompt = encodeURIComponent(prompt);
        // Add timestamp to prevent caching and ensure unique images
        const timestamp = Date.now();
        // Construct Pollinations API URL with explicit model + cache-busting parameter
        const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?model=${encodeURIComponent(model)}&width=${width}&height=${height}&nologo=true&enhance=true&t=${timestamp}`;
        res.json({
            success: true,
            imageUrl,
            prompt,
            model,
            width,
            height
        });
    }
    catch (error) {
        console.error('Image generation error:', error);
        res.status(500).json({ error: 'Failed to generate image' });
    }
});
// Audio generation endpoint
router.post('/audio', requireAuth_1.requireAuth, async (req, res) => {
    try {
        const parsed = audioGenerationSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                error: 'Invalid input',
                details: parsed.error.errors
            });
        }
        const { text, voice } = parsed.data;
        // Encode text for URL
        const encodedText = encodeURIComponent(text);
        // Add timestamp to prevent caching and ensure unique audio
        const timestamp = Date.now();
        // Construct Pollinations API URL with cache-busting parameter
        const audioUrl = `https://text.pollinations.ai/${encodedText}?model=openai-audio&voice=${voice}&t=${timestamp}`;
        res.json({
            success: true,
            audioUrl,
            text,
            voice
        });
    }
    catch (error) {
        console.error('Audio generation error:', error);
        res.status(500).json({ error: 'Failed to generate audio' });
    }
});
// Text generation endpoint for Pollinations models
router.post('/text', requireAuth_1.requireAuth, async (req, res) => {
    try {
        const parsed = textGenerationSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                error: 'Invalid input',
                details: parsed.error.errors
            });
        }
        const { prompt, model } = parsed.data;
        // List of Pollinations models that need direct API calls
        // Only include models that work correctly and identify themselves properly
        const pollinationsModels = [
            'mistral'
        ];
        if (pollinationsModels.includes(model)) {
            // Use Pollinations API for these models
            try {
                // Use the correct Pollinations API endpoint with token authentication
                const apiKey = process.env.POLLINATIONS_API_KEY;
                const response = await axios_1.default.get(`https://text.pollinations.ai/${encodeURIComponent(prompt)}?model=${model}&token=${apiKey}`, {
                    timeout: 30000 // 30 second timeout
                });
                // Pollinations API returns plain text, not JSON
                const responseText = typeof response.data === 'string' ? response.data : response.data.toString();
                res.json({
                    success: true,
                    text: responseText,
                    model: model,
                    source: 'pollinations'
                });
            }
            catch (apiError) {
                console.error('Pollinations API error:', apiError);
                // Handle specific error cases
                if (apiError?.response?.status === 402) {
                    res.status(402).json({
                        error: 'Model requires higher tier access. Please try a different model.',
                        details: 'This model requires a paid tier. Try using models like deepseek, gemini, or mistral instead.'
                    });
                }
                else if (apiError?.response?.status === 400) {
                    res.status(400).json({
                        error: 'Invalid request to Pollinations API',
                        details: 'The request format was incorrect. Please try again.'
                    });
                }
                else {
                    res.status(500).json({
                        error: 'Failed to generate text with Pollinations API',
                        details: apiError?.response?.data?.error || apiError?.message || 'Unknown error'
                    });
                }
            }
        }
        else {
            // For non-Pollinations models, return error
            res.status(400).json({
                error: 'Model not supported for direct text generation',
                model: model
            });
        }
    }
    catch (error) {
        console.error('Text generation error:', error);
        res.status(500).json({ error: 'Failed to generate text' });
    }
});
exports.default = router;
//# sourceMappingURL=generation.js.map