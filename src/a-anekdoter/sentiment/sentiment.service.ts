import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Sentiment from 'sentiment';
import { Telegraf } from 'telegraf';
import { russianDictionary } from './sentiment.constants';
import { AnekdoterService } from '../anekdoter.service';
import { BoobsService } from '../boobs.service';

@Injectable()
//Так как у библиотеки Telegraf какой-то аналог веб-сокета, то нужно хукнуть(запустить бота) раньше чем прила запустится
export class SentimentService implements OnModuleInit {
  private sentiment: Sentiment;
  private bot: Telegraf;

  constructor(
    private readonly config: ConfigService,
    private readonly anekdoterService: AnekdoterService,
    private readonly boobsService: BoobsService,
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

      const sendFunction = {
        ['бот мем']: this.anekdoterService.handleCron,
        ['бот сиськи']: this.boobsService.sendBoobs,
      }[message];

      if (sendFunction) {
        return sendFunction();
      }

      this.sendEmotionalAnswer(ctx);
    });
  }
  private sendEmotionalAnswer(ctx: any) {
    //Тестировал слово по регулярному выражению
    const word = 'бот';
    const regex = new RegExp(`(^|\\s)${word}($|\\s)`); // Создаём регулярное выражение для поиска слова

    const cleanedText = ctx.message.text
      .replace(/[^\w\sа-яА-ЯёЁ]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (regex.test(cleanedText)) {
      // Тут внутренняя библиотека считает очки харизмы в чатике
      const result = this.sentiment.analyze(cleanedText, { language: 'ru' });
      const score = result.score;

      if (score > 1) {
        ctx.reply('Спасибо за добрые слова 😊');
      } else if (score < -1) {
        ctx.reply('Я понял, тебя гнида, Крек защити меня! @RubinKirill  😢');
      } else {
        ctx.reply('Такой команды нет, тупой кожаный мешок');
      }
    } else {
      console.log('Слово "бот" не найдено в очищенном тексте.');
    }
  }
  private launchBot() {
    this.bot.launch();
    console.log('Бот запущен');
  }
}
