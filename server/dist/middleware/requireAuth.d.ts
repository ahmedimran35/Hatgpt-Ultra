import { Request, Response, NextFunction } from 'express';
export interface AuthPayload {
    userId: string;
}
declare global {
    namespace Express {
        interface Request {
            auth?: AuthPayload;
            userId?: string;
        }
    }
}
export declare function requireAuth(req: Request, res: Response, next: NextFunction): void | Response<any, Record<string, any>>;
//# sourceMappingURL=requireAuth.d.ts.map