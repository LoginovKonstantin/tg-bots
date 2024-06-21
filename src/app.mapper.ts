import Big from 'big.js';
import { Portfolio } from './app.interfaces';

export class AppMapper {
  static portfolioGetStaticYieldInPercents(portfolio: Portfolio): number {
    const START_VALUE =
      portfolio.accountId === '2164476715' ? Number(6192.33) : 5000;

    const { units, nano } = portfolio.totalAmountPortfolio;

    if (Number(units) === 0 && Number(nano) === 0) {
      return 0;
    }

    const current = new Big(units)
      .plus(new Big(nano).div(1_000_000_000))
      .toPrecision(5);

    return new Big((current * 100) / START_VALUE - 100).toPrecision(2);
  }

  static getPercents(inputOutput: number, amountNow: number): number {
    return Number(
      new Big((amountNow * 100) / inputOutput - 100).toPrecision(2),
    );
  }

  static unitsAndNanoToNumber(params: {
    units: string | number;
    nano: string | number;
  }): number {
    return Number(
      new Big(params.units)
        .plus(new Big(params.nano).div(1_000_000_000))
        .toPrecision(5),
    );
  }
}
