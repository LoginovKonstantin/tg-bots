import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError } from 'axios';
@Injectable()
export class MistralService {
  constructor(private readonly config: ConfigService) {
    this.logicAnswer('Привет');
  }
  public async logicAnswer(questionExamption: string): Promise<string> {
    const apiKey = this.config.get('MISTRAL_API_KEY');

    try {
      const response = await axios.post(
        'https://api.mistral.ai/v1/chat/completions',
        {
          model: 'mistral-large-latest',
          messages: [
            {
              role: 'user',
              content: questionExamption,
            },
          ],
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          timeout: 15000,
        },
      );

      console.log('Ответ:', response.data.choices['0'].message.content);
      return JSON.stringify(response.data.choices['0'].message.content);
    } catch (error) {
      if (error instanceof AxiosError) {
        // Теперь TypeScript знает, что error — это AxiosError
        return error.response ? error.response.data : error.message;
      } else {
        // Обработка других ошибок
        return String(error);
      }
    }
  }
}
