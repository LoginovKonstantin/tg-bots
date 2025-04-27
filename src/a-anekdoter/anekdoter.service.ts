import axios from 'axios';
import { parse } from 'node-html-parser';
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { URLS } from './anekdoter.constants';
import { sendPhotoMessageToTelegram } from '../utils/send-photo-message-to-telegram';
import { sendMessageToTelegram } from '../utils/send-message-to-telegram';

@Injectable()
export class AnekdoterService {
  private readonly logger = new Logger(AnekdoterService.name);
  private links = new Set();

  constructor(private readonly config: ConfigService) {}

  @Cron('0 22 * * *', { timeZone: 'Asia/Yekaterinburg' })
  async handleCronParachute() {
    await sendMessageToTelegram({
      telegramUrl: this.config.get('TELEGRAM_URL'),
      telegramToken: this.config.get('A_TELEGRAM_TOKEN'),
      telegramChatId: this.config.get('A_TELEGRAM_CHAT_ID'),
      message: '@RubinKirill Кирилл сикуха, так и не прыгнул с парашютом!  😢',
    });
  }

  @Cron('0 13,15,17,19,21 * * *', { timeZone: 'Asia/Yekaterinburg' })
  async handleCron() {
    const page = await this.getMemDayPage();
    const mem = this.getRandomMemFromPage(page);
    console.log(mem);

    await sendPhotoMessageToTelegram({
      telegramUrl: this.config.get('TELEGRAM_URL'),
      telegramToken: this.config.get('A_TELEGRAM_TOKEN'),
      telegramChatId: this.config.get('A_TELEGRAM_CHAT_ID'),
      message: encodeURIComponent(mem),
    });

    if (this.links.size > 100) {
      this.links = new Set(Array.from(this.links).slice(10));
    }
  }

  getRandomMemFromPage(page: string): string {
    const root = parse(page);

    const images = root
      .querySelectorAll('img')
      .filter((img) => img.rawAttrs.toLowerCase().includes('мем'))
      .map((img) => img.attributes.src);

    const random = images[Math.floor(Math.random() * images.length)];

    if (this.links.has(random)) {
      return this.getRandomMemFromPage(page);
    }

    this.links.add(random);

    return random;
  }

  async getMemDayPage(): Promise<string> {
    try {
      const result = await axios.get(URLS.AnekdotRuMemDay);
      return result.data;
    } catch (e) {
      this.logger.error(e);
    }
  }
}
