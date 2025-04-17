import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Sentiment from 'sentiment';
import { Telegraf } from 'telegraf';
import { russianDictionary } from './sentiment.constants';

@Injectable()
//Так как у библиотеки Telegraf какой-то аналог веб-сокета, то нужно хукнуть(запустить бота) раньше чем прила запустится
export class SentimentService implements OnModuleInit {
  private sentiment: Sentiment;
  private bot: Telegraf;

  constructor(private readonly config: ConfigService) {}

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
      const text = ctx.message.text;
      const lower = text.toLowerCase();

      if (lower.includes('бот')) {
        //Тут внутренняя библиотека считает очки харизмы в чатике
        const result = this.sentiment.analyze(text, { language: 'ru' });
        const score = result.score;

        if (score > 1) {
          ctx.reply('Спасибо за добрые слова 😊');
        } else if (score < -1) {
          ctx.reply('Мне жаль, что ты так думаешь 😢');
        } else {
          ctx.reply(
            'Я понял, что ты обо мне говоришь, но не уверен в смысле 🤔',
          );
        }
      }
    });
  }

  private launchBot() {
    this.bot.launch();
    console.log('Бот запущен');
  }
}
