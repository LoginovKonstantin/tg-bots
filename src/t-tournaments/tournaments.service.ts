import axios from 'axios';
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';

import { TournamentsMapper } from './tournaments.mapper';
import { URLS, CONFIG } from './tournaments.constants';
import {
  AccountResponse,
  PortfolioResponse,
  OperationResponse,
} from './tournaments.types';
import {
  GetOperationsOptions,
  Participant,
  ParticipantIncomeResult,
  Portfolio,
} from './tournaments.interfaces';

@Injectable()
export class TournamentsService {
  private readonly logger = new Logger(TournamentsService.name);

  constructor(private readonly config: ConfigService) {
   // this.handleCron2();
  }

 // @Cron('0 7,9,11,13,15,17 1-29 6 *')
  async handleCron() {
    const PARTICIPANTS = JSON.parse(this.config.get('PARTICIPANTS'));

    const message = (
      await Promise.all(PARTICIPANTS.map((p) => this.getParticipantIncome(p)))
    )
      .sort((a, b) => b.percent - a.percent)
      .reduce((acc, curr, i) => {
        const { name, percent, error } = curr;
        console.log(curr, i);
        acc += `${i + 1}) ${name} <code>${percent}%</code> ${i === 0 ? '👑' : ''} ${error ? `Доп. инфо: ${error}\n` : '\n'}`;
        return acc;
      }, CONFIG.name);

    await this.sendMessageToTelegram(encodeURIComponent(message));
  }

 // @Cron('0 21 30 6 *')
  async handleCron2() {
    const PARTICIPANTS = JSON.parse(this.config.get('PARTICIPANTS'));

    const all = await Promise.all(PARTICIPANTS.map((p) => this.getParticipantIncome(p)));
    const winner = all.sort((a, b) => b.percent - a.percent)[0];
    const message = `${CONFIG.name} Winner ${winner.name} <code>${winner.percent}%</code> 👑`;

    await this.sendMessageToTelegram(encodeURIComponent(message));
  }

  async getParticipantIncome(p: Participant): Promise<ParticipantIncomeResult> {
    const { name, token, accountName } = p;
    const accounts = await this.getAccounts(token);

    const account = accounts.find((a) => a.name === accountName);

    if (!account) {
      return {
        name,
        accountName,
        percent: 0,
        error: 'Турнирный аккаунт не найден',
      };
    }

    const portfolio = await this.getPortfolio(account.id, token);

    if (!portfolio) {
      return {
        name,
        accountName,
        percent: 0,
        error: 'Не удалось получить портфель по турнирному аккаунту',
      };
    }

    const operations = await this.getOperations({
      participant: p,
      from: CONFIG.from,
      to: CONFIG.to,
      accountId: account.id,
      operationTypes: [
        'OPERATION_TYPE_INPUT',
        'OPERATION_TYPE_INP_MULTI',
        'OPERATION_TYPE_OUTPUT',
      ],
    });

    if (!operations || operations.length === 0) {
      return {
        name,
        accountName,
        percent: 0,
      };
    }

    const inputOutputAmount = operations.reduce((acc, curr) => {
      acc += TournamentsMapper.unitsAndNanoToNumber(curr.payment);
      return acc;
    }, 0);

    const usdInRub = this.getUsdPositionInRub(portfolio);

    const portfolioAmountNow =
      TournamentsMapper.unitsAndNanoToNumber(portfolio.totalAmountPortfolio) -
      usdInRub;

    const percent = TournamentsMapper.getPercents(
      inputOutputAmount,
      portfolioAmountNow,
    );

    this.logger.log(
      `${name}: ${JSON.stringify({ inputOutputAmount, portfolioAmountNow, percent })}`,
    );

    return {
      name,
      accountName,
      percent,
    };
  }

  async getOperations(
    options: GetOperationsOptions,
  ): Promise<OperationResponse> {
    const { accountId, from, to, operationTypes, participant } = options;

    const url = URLS.GetOperations;
    const headers = this.headers().GetOperations(participant.token);
    try {
      const result = await axios.post(
        url,
        {
          accountId,
          from,
          to,
          operationTypes,
          state: 'OPERATION_STATE_EXECUTED',
        },
        { headers },
      );
      return result?.data?.items;
    } catch (e) {
      this.logger.error(e);
    }
  }

  async getAccounts(token: string): Promise<AccountResponse> {
    const url = URLS.GetAccounts;
    const headers = this.headers().GetAccounts(token);
    try {
      const result = await axios.post(url, {}, { headers });
      return result?.data?.accounts;
    } catch (e) {
      this.logger.error(e);
    }
  }

  async getPortfolio(
    accountId: string,
    token: string,
  ): Promise<PortfolioResponse> {
    const url = URLS.GetPortfolio;
    const headers = this.headers().GetPortfolio(token);
    try {
      const result = await axios.post(
        url,
        { accountId, currency: 'RUB' },
        { headers },
      );
      return result.data;
    } catch (e) {
      this.logger.error(e);
    }
  }

  private async sendMessageToTelegram(message: string): Promise<void> {
    const baseUrl = this.config.get('TELEGRAM_URL');
    const token = this.config.get('T_TELEGRAM_TOKEN');
    const chatId = this.config.get('T_TELEGRAM_CHAT_ID');

    const url = `${baseUrl}/bot${token}/sendMessage?parse_mode=html&chat_id=${chatId}&text=${message}`;

    await axios.get(url).catch((e) => {
      this.logger.error(e);
    });
  }

  private headers() {
    const defaultHeader = (token: string) => ({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });
    return {
      GetAccounts: (token: string) => defaultHeader(token),
      GetPortfolio: (token: string) => defaultHeader(token),
      GetOperations: (token: string) => defaultHeader(token),
    };
  }

  private getUsdPositionInRub(portfolio: Portfolio) {
    const hasUsdCurrency = portfolio.positions.find(
      (p) => p.figi === 'BBG0013HGFT4' && p.instrumentType === 'currency',
    );

    if (!hasUsdCurrency) {
      return 0;
    }

    const price = TournamentsMapper.unitsAndNanoToNumber(
      hasUsdCurrency.currentPrice,
    );
    const quantity = TournamentsMapper.unitsAndNanoToNumber(
      hasUsdCurrency.quantity,
    );

    return price * quantity;
  }
}
