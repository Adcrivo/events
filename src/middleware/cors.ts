import { Request, Response, NextFunction } from 'express';
import cors from 'cors';

export const corsMiddleware = cors({
    origin: process.env.CORS_ORIGIN || '*'
});
