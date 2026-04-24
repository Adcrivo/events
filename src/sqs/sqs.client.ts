import { SQSClient, SendMessageCommand, ReceiveMessageCommand, DeleteMessageCommand, CreateQueueCommand, Message } from '@aws-sdk/client-sqs';
import { logInfo, logError } from '../utils/logger';


class SQSClientWrapper {
    private _sqsClient: SQSClient | null = null;
    private queueUrl: string = '';

    private getSqsClient(): SQSClient {
        if (!this._sqsClient) {
            const clientConfig: any = {
                region: process.env.AWS_REGION || 'ap-south-1'
            };

            if (process.env.SQS_ENDPOINT) {
                clientConfig.endpoint = process.env.SQS_ENDPOINT;
            }

            // Ensure credentials are provided for local development if not in environment
            if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
                clientConfig.credentials = {
                    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'test',
                    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'test'
                };
            }

            this._sqsClient = new SQSClient(clientConfig);
            this.queueUrl = process.env.SQS_QUEUE_URL || '';

            logInfo(`SQS Client initialized with Region: ${process.env.AWS_REGION || 'ap-south-1'}`);
            if (this.queueUrl) {
                logInfo(`SQS Queue URL: ${this.queueUrl}`);
            } else {
                logError('SQS_QUEUE_URL environment variable is not set');
            }
        }
        return this._sqsClient;
    }

    async ensureQueueExists(queueName: string): Promise<void> {
        try {
            const command = new CreateQueueCommand({
                QueueName: queueName
            });
            const result = await this.getSqsClient().send(command);
            if (result.QueueUrl) {
                this.queueUrl = result.QueueUrl;
                logInfo(`Queue ensured/created: ${this.queueUrl}`);
            }
        } catch (error) {
            logError(`Failed to ensure queue exists: ${error}`);
            // Don't throw, as the queue might already exist or URL might be sufficient
        }
    }

    async sendMessage(body: any): Promise<void> {
        try {
            const command = new SendMessageCommand({
                QueueUrl: this.queueUrl,
                MessageBody: JSON.stringify(body)
            });
            await this.getSqsClient().send(command);
            logInfo(`Message sent to SQS: ${JSON.stringify(body)}`);
        } catch (error) {
            logError(`Failed to send message to SQS: ${error}`);
            throw error;
        }
    }

    async receiveMessages(maxNumberOfMessages: number = 10, waitTimeSeconds: number = 20): Promise<Message[]> {
        try {
            const command = new ReceiveMessageCommand({
                QueueUrl: this.queueUrl,
                MaxNumberOfMessages: maxNumberOfMessages,
                WaitTimeSeconds: waitTimeSeconds,
                AttributeNames: ['All']
            });
            const response = await this.getSqsClient().send(command);
            return response.Messages || [];
        } catch (error) {
            logError(`Failed to receive messages from SQS: ${error}`);
            return [];
        }
    }

    async deleteMessage(receiptHandle: string): Promise<void> {
        try {
            const command = new DeleteMessageCommand({
                QueueUrl: this.queueUrl,
                ReceiptHandle: receiptHandle
            });
            await this.getSqsClient().send(command);
            logInfo('Message deleted from SQS');
        } catch (error) {
            logError(`Failed to delete message from SQS: ${error}`);
            throw error;
        }
    }
}

export default new SQSClientWrapper();
