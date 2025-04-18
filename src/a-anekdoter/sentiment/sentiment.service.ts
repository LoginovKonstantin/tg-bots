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
    const token = this.config.get('TELEGRAM_TOKEN');
    this.bot = new Telegraf(token);

    this.bot.on('text', (ctx) => {
      if (ctx.chat.type === 'group' || ctx.chat.type === 'supergroup') {
        this.sendEmotionalAnswer(ctx);
        return;
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
        ctx.reply('Мне жаль, что ты так думаешь 😢');
      } else {
        ctx.reply('Я понял, что ты обо мне говоришь, но не уверен в смысле 🤔');
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
