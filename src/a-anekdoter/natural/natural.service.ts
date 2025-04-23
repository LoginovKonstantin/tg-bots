import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class NaturalService {
  constructor(private readonly config: ConfigService) {}

  async encodeText(text: string): Promise<number> {
    const apiUrl = this.config.get('API_URL');
    const apiToken = this.config.get('API_KEY');
    const payload = {
      inputs: text,
      options: { wait_for_model: true },
    };
    const response = await axios
      .post(apiUrl, payload, {
        headers: {
          Authorization: `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
      })
      .catch();
    return parseInt(response.data[0]['0'].label);
  }
}
