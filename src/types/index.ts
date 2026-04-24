import { AdEvent } from '@adcrivo/db';

export interface AdEventData {
  adId: string;
  userId: string;
  eventType: string;
  eventData?: Record<string, any>;
}

export type { AdEvent };
