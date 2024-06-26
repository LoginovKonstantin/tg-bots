import axios from 'axios';
import { parse } from 'node-html-parser';
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { URLS } from './anekdoter.constants';

@Injectable()
export class AnekdoterService {
  private readonly logger = new Logger(AnekdoterService.name);
  private links = new Set();

  constructor(private readonly config: ConfigService) {
    this.handleCron();
  }

  @Cron('0 13,15,17,19,21 * * *', { timeZone: 'Asia/Yekaterinburg' })
  async handleCron() {
    const page = await this.getMemDayPage();
    const mem = this.getRandomMemFromPage(page);
    console.log(mem);
    await this.sendMessageToTelegram(encodeURIComponent(mem));

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
    const url = URLS.AnekdotRuMemDay;
    try {
      const result = await axios.get(url);
      return result.data;
    } catch (e) {
      this.logger.error(e);
    }
  }

  private async sendMessageToTelegram(message: string): Promise<void> {
    const baseUrl = this.config.get('TELEGRAM_URL');
    const token = this.config.get('A_TELEGRAM_TOKEN');
    const chatId = this.config.get('A_TELEGRAM_CHAT_ID');

    const url = `${baseUrl}/bot${token}/sendMessage?parse_mode=html&chat_id=${chatId}&text=${message}`;

    await axios.get(url).catch((e) => {
      this.logger.error(e);
    });
  }
}
