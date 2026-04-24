import { Router } from 'express';
import { AdEventController } from '../controllers/adEvent.controller';
import { rateLimiter } from '../middleware/rateLimiter';

const router = Router();
const adEventController = new AdEventController();

// Apply rate limiting to event endpoint
router.post('/', (req, res) => adEventController.handleAdsEvent(req, res));
router.get('/:adId', (req, res) => adEventController.getEventsByAdId(req, res));
router.get('/:adId/time-range', (req, res) => adEventController.getEventsByAdIdAndTimeRange(req, res));

export default router;
