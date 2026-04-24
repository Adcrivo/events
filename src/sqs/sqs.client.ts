import { SQSClient, SendMessageCommand, ReceiveMessageCommand, DeleteMessageCommand, CreateQueueCommand, Message } from '@aws-sdk/client-sqs';
import { logInfo, logError } from '../utils/logger';

class SQSClientWrapper {
    private _sqsClient: SQSClient | null = null;
    private _queueUrl: string = '';

    private initialize() {
        if (!this._sqsClient) {
            const clientConfig: any = {
                region: process.env.AWS_REGION || 'ap-south-1'
            };

            if (process.env.SQS_ENDPOINT) {
                clientConfig.endpoint = process.env.SQS_ENDPOINT;
            }

            if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
                clientConfig.credentials = {
                    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'test',
                    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'test'
                };
            }

            this._sqsClient = new SQSClient(clientConfig);
            this._queueUrl = process.env.SQS_QUEUE_URL || '';

            logInfo(`SQS Client initialized with Region: ${clientConfig.region}`);
            if (this._queueUrl) {
                logInfo(`SQS Queue URL: ${this._queueUrl}`);
            } else {
                logError('SQS_QUEUE_URL environment variable is not set');
            }
        }
    }

    private get sqsClient(): SQSClient {
        this.initialize();
        return this._sqsClient!;
    }

    private get queueUrl(): string {
        this.initialize();
        return this._queueUrl;
    }

    async ensureQueueExists(queueName: string): Promise<void> {
        try {
            const command = new CreateQueueCommand({
                QueueName: queueName
            });
            const result = await this.sqsClient.send(command);
            if (result.QueueUrl) {
                this._queueUrl = result.QueueUrl;
                logInfo(`Queue ensured/created: ${this._queueUrl}`);
            }
        } catch (error) {
            logError(`Failed to ensure queue exists: ${error}`);
        }
    }

    async sendMessage(body: any): Promise<void> {
        try {
            const url = this.queueUrl;
            if (!url) throw new Error('SQS_QUEUE_URL is not defined');

            const command = new SendMessageCommand({
                QueueUrl: url,
                MessageBody: JSON.stringify(body)
            });
            await this.sqsClient.send(command);
            logInfo(`Message sent to SQS: ${JSON.stringify(body)}`);
        } catch (error) {
            logError(`Failed to send message to SQS: ${error}`);
            throw error;
        }
    }

    async receiveMessages(maxNumberOfMessages: number = 10, waitTimeSeconds: number = 20): Promise<Message[]> {
        try {
            const url = this.queueUrl;
            if (!url) {
                logError('Cannot receive messages: SQS_QUEUE_URL is not defined');
                return [];
            }

            const command = new ReceiveMessageCommand({
                QueueUrl: url,
                MaxNumberOfMessages: maxNumberOfMessages,
                WaitTimeSeconds: waitTimeSeconds,
                AttributeNames: ['All']
            });
            const response = await this.sqsClient.send(command);
            return response.Messages || [];
        } catch (error) {
            logError(`Failed to receive messages from SQS: ${error}`);
            return [];
        }
    }

    async deleteMessage(receiptHandle: string): Promise<void> {
        try {
            const url = this.queueUrl;
            const command = new DeleteMessageCommand({
                QueueUrl: url,
                ReceiptHandle: receiptHandle
            });
            await this.sqsClient.send(command);
            logInfo('Message deleted from SQS');
        } catch (error) {
            logError(`Failed to delete message from SQS: ${error}`);
            throw error;
        }
    }
}

export default new SQSClientWrapper();
