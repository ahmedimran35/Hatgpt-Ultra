"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const auth_1 = __importDefault(require("./routes/auth"));
const generation_1 = __importDefault(require("./routes/generation"));
const communityBattles_1 = __importDefault(require("./routes/communityBattles"));
const requireAuth_1 = require("./middleware/requireAuth");
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true
}));
app.use(express_1.default.json());
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hatgpt_ultra';
mongoose_1.default
    .connect(mongoUri)
    .then(() => {
    console.log('Connected to MongoDB');
})
    .catch((err) => {
    console.error('Mongo connection error', err);
    process.exit(1);
});
app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
});
app.use('/api/auth', auth_1.default);
app.use('/api/generation', generation_1.default);
app.use('/api/community-battles', communityBattles_1.default);
app.get('/api/protected', requireAuth_1.requireAuth, (_req, res) => {
    res.json({ secret: 'authorized' });
});
// Error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
});
const port = Number(process.env.PORT || 3001);
app.listen(port, () => {
    console.log(`Server listening on :${port}`);
});
//# sourceMappingURL=index.js.map