import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
export function requireAuth(req, res, next) {
    try {
        const header = req.headers.authorization;
        if (!header?.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const token = header.substring('Bearer '.length);
        const secret = process.env.JWT_SECRET || 'dev_secret_change_me';
        const payload = jwt.verify(token, secret);
        req.auth = payload;
        req.userId = payload.userId;
        return next();
    }
    catch {
        return res.status(401).json({ error: 'Unauthorized' });
    }
}
//# sourceMappingURL=requireAuth.js.map