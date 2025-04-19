import axios from 'axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { URLS } from './anekdoter.constants';
import { sendPhotoMessageToTelegram } from '../utils/send-photo-message-to-telegram';

@Injectable()
export class BoobsService {
  private readonly logger = new Logger(BoobsService.name);

  constructor(private readonly config: ConfigService) {}

  async sendBoobs(): Promise<void> {
    const url = await this.getBoobsImageUrl();
    await sendPhotoMessageToTelegram({
      telegramUrl: this.config.get('TELEGRAM_URL'),
      telegramToken: this.config.get('A_TELEGRAM_TOKEN'),
      telegramChatId: this.config.get('A_TELEGRAM_CHAT_ID'),
      message: encodeURIComponent(url),
    });
  }

  async getBoobsImageUrl(): Promise<string> {
    const url = URLS.Boobs(this.config.get('UNSPLASH_CLIENT_ID'));
    try {
      const result = await axios.get(url);
      return result.data.urls.regular;
    } catch (e) {
      this.logger.error(e);
    }
  }
}
