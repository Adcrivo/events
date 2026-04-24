import getPrisma from '../config/db.config';
import { AdEvent, AdEventData } from '../types/index';

export class AdEventRepository {
  private get prisma() {
    return getPrisma();
  }

  async createEvent(eventData: AdEventData): Promise<AdEvent> {
    return await this.prisma.adEvent.create({
      data: {
        adId: eventData.adId,
        userId: eventData.userId,
        eventType: eventData.eventType,
        eventData: eventData.eventData,
        timestamp: new Date(),
      },
    });
  }

  async getEventById(eventId: number): Promise<AdEvent | null> {
    return await this.prisma.adEvent.findUnique({
      where: { id: eventId },
    });
  }

  async getEventsByTimeRange(startDate: Date, endDate: Date): Promise<AdEvent[]> {
    return await this.prisma.adEvent.findMany({
      where: {
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { timestamp: 'desc' },
    });
  }

  async getEventsByAdId(adId: string): Promise<AdEvent[]> {
    return await this.prisma.adEvent.findMany({
      where: { adId },
      orderBy: { timestamp: 'desc' },
    });
  }

  async getEventsByAdIdAndTimeRange(adId: string, startDate: Date, endDate: Date): Promise<AdEvent[]> {
    return await this.prisma.adEvent.findMany({
      where: {
        adId,
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { timestamp: 'desc' },
    });
  }
}
