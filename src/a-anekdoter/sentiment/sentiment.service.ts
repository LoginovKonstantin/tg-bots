import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Sentiment from 'sentiment';
import { Telegraf } from 'telegraf';
import { russianDictionary } from './sentiment.constants';
import { AnekdoterService } from '../anekdoter.service';
import { BoobsService } from '../boobs.service';
import { NaturalService } from '../natural/natural.service';
import { MistralService } from '../llm/mistral/mistral.service';

@Injectable()
//Так как у библиотеки Telegraf какой-то аналог веб-сокета, то нужно хукнуть(запустить бота) раньше чем прила запустится
export class SentimentService implements OnModuleInit {
  private sentiment: Sentiment;
  private bot: Telegraf;

  constructor(
    private readonly config: ConfigService,
    private readonly anekdoterService: AnekdoterService,
    private readonly boobsService: BoobsService,
    private readonly naturalService: NaturalService,
    private readonly mistraService: MistralService,
  ) {}

  async onModuleInit() {
    this.initializeSentiment();
    this.initializeBot();
    this.launchBot();
  }

  private initializeSentiment() {
    this.sentiment = new Sentiment();
    //Создал свою библиотеку так как стандарт работает хорошо только с с английскими good, bad, fuck и т.д.
    this.sentiment.registerLanguage('ru', {
      labels: russianDictionary,
    });
  }

  private initializeBot() {
    const token = this.config.get('A_TELEGRAM_TOKEN');
    this.bot = new Telegraf(token);

    this.bot.on('text', (ctx) => {
      const message = String(ctx.message.text).toLowerCase();

      if (message === 'бот мем') {
        return this.anekdoterService.handleCron();
      }

      if (message === 'бот сиськи') {
        return this.boobsService.sendBoobs();
      }

      this.sendEmotionalAnswer(ctx);
    });
  }
  private async sendEmotionalAnswer(ctx: any) {
    //Тестировал слово по регулярному выражению
    const word = 'бот';
    const regex = new RegExp(`(^|\\s)${word}($|\\s)`); // Создаём регулярное выражение для поиска слова

    const cleanedText = ctx.message.text
      .toLowerCase()
      .replace(/[^\w\sа-яА-ЯёЁ]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (regex.test(cleanedText)) {
      ctx.reply(await this.mistraService.logicAnswer(cleanedText));
    }
  }
  private launchBot() {
    this.bot.launch();
    console.log('Бот запущен');
  }
}
