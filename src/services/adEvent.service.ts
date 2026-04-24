import { AdEventRepository } from '../repositories/adEvent.repository';
import { AdEvent, AdEventData } from '../types/index';
import { logError, logInfo } from '../utils/logger';

export class AdEventService {
    private adEventRepository: AdEventRepository;

    constructor() {
        this.adEventRepository = new AdEventRepository();
    }

    async processEvent(eventData: AdEventData): Promise<AdEvent> {
        try {
            logInfo(`Processing ad event: ${JSON.stringify(eventData)}`);
            const event = await this.adEventRepository.createEvent(eventData);
            return event;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            logError(`Error processing ad event: ${errorMessage}`);
            throw error;
        }
    }

    async getEventsByTimeRange(startDate: Date, endDate: Date): Promise<AdEvent[]> {
        return await this.adEventRepository.getEventsByTimeRange(startDate, endDate);
    }

    async getEventsByAdId(adId: string): Promise<AdEvent[]> {
        return await this.adEventRepository.getEventsByAdId(adId);
    }

    async getEventsByAdIdAndTimeRange(adId: string, startDate: Date, endDate: Date): Promise<AdEvent[]> {
        return await this.adEventRepository.getEventsByAdIdAndTimeRange(adId, startDate, endDate);
    }
}
