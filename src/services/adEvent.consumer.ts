import sqsClient from '../sqs/sqs.client';
import { AdEventRepository } from '../repositories/adEvent.repository';
import { logInfo, logError } from '../utils/logger';

export class AdEventConsumer {
    private adEventRepository: AdEventRepository;
    private isPolling: boolean = false;

    constructor() {
        this.adEventRepository = new AdEventRepository();
    }

    async startPolling(): Promise<void> {
        this.isPolling = true;
        logInfo('Starting SQS polling...');

        while (this.isPolling) {
            try {
                const messages = await sqsClient.receiveMessages();

                for (const message of messages) {
                    if (message.Body && message.ReceiptHandle) {
                        try {
                            const eventData = JSON.parse(message.Body);
                            await this.adEventRepository.createEvent(eventData);
                            await sqsClient.deleteMessage(message.ReceiptHandle);
                            logInfo(`Processed and deleted message: ${message.MessageId}`);
                        } catch (error) {
                            logError(`Error processing message ${message.MessageId}: ${error}`);
                            // Don't delete message so it can be retried (visibility timeout will expire)
                        }
                    }
                }
            } catch (error) {
                logError(`Error in polling loop: ${error}`);
                // Wait a bit before retrying to avoid tight loop in case of persistent errors
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }
    }

    stopPolling(): void {
        this.isPolling = false;
        logInfo('Stopping SQS polling...');
    }
}
