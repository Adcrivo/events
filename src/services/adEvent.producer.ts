import sqsClient from '../sqs/sqs.client';
import { AdEventData } from '../types/index';
import { logError } from '../utils/logger';

export class AdEventProducer {
    async sendEvent(eventData: AdEventData): Promise<void> {
        try {
            await sqsClient.sendMessage(eventData);
        } catch (error) {
            logError(`Error sending event to SQS: ${error}`);
            throw error;
        }
    }
}
