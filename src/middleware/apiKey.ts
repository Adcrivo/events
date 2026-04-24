import { Request, Response, NextFunction } from 'express';

export const apiKeyMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const apiKey = req.headers['x-api-key'];
    const validApiKey = process.env.API_KEY || 'test-api-key';

    if (!apiKey || apiKey !== validApiKey) {
        res.status(401).json({ message: 'Unauthorized: Invalid API key' });
        return;
    }

    next();
};
