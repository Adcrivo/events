import { Request, Response } from 'express';
import { AdEventService } from '../services/adEvent.service';
import { AdEventProducer } from '../services/adEvent.producer';
import { logError } from '../utils/logger';

export class AdEventController {
    private adEventService: AdEventService;

    constructor() {
        this.adEventService = new AdEventService();
    }

    public async handleAdsEvent(req: Request, res: Response): Promise<void> {
        try {
            const { adId, userId, eventType, eventData } = req.body;

            if (!adId || !userId || !eventType) {
                res.status(400).json({
                    message: 'Missing required fields: adId, userId, and eventType are required'
                });
                return;
            }

            // Queue to SQS for background processing
            const producer = new AdEventProducer();
            await producer.sendEvent({
                adId,
                userId,
                eventType,
                eventData
            });

            res.status(202).json({
                message: 'Event accepted for processing'
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            logError(`Error handling ad event: ${errorMessage}`);
            res.status(500).json({
                message: 'Error processing event',
                error: errorMessage
            });
        }
    }

    public async getEventsByAdId(req: Request, res: Response): Promise<void> {
        try {
            const { adId } = req.params;

            if (!adId) {
                res.status(400).json({ message: 'Ad ID is required' });
                return;
            }

            const events = await this.adEventService.getEventsByAdId(adId);
            res.status(200).json(events);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            logError(`Error fetching events by ad ID: ${errorMessage}`);
            res.status(500).json({
                message: 'Error fetching events',
                error: errorMessage
            });
        }
    }

    public async getEventsByAdIdAndTimeRange(req: Request, res: Response): Promise<void> {
        try {
            const { adId } = req.params;
            const { startDate, endDate } = req.query;

            if (!adId) {
                res.status(400).json({ message: 'Ad ID is required' });
                return;
            }

            const start = startDate ? new Date(startDate as string) : new Date(0);
            const end = endDate ? new Date(endDate as string) : new Date();

            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                res.status(400).json({ message: 'Invalid date format' });
                return;
            }

            const events = await this.adEventService.getEventsByAdIdAndTimeRange(adId, start, end);
            res.status(200).json(events);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            logError(`Error fetching events by ad ID and time range: ${errorMessage}`);
            res.status(500).json({
                message: 'Error fetching events',
                error: errorMessage
            });
        }
    }
}
