export interface GetOperationsOptions {
  participant: Participant;
  from: string;
  to: string;
  accountId: string;
  operationTypes: string[];
}

export interface Operation {
  cursor: string;
  brokerAccountId: string;
  id: string;
  parentOperationId: string;
  name: string;
  date: string;
  type: string;
  description: string;
  state: string;
  instrumentUid: string;
  figi: string;
  instrumentType: string;
  instrumentKind: string;
  positionUid: string;
  payment: {
    currency: string;
    units: string;
    nano: number;
  };
  price: {
    currency: string;
    units: string;
    nano: number;
  };
  commission: {
    currency: string;
    units: string;
    nano: number;
  };
  yield: {
    currency: string;
    units: string;
    nano: number;
  };
  yieldRelative: {
    units: string;
    nano: number;
  };
  accruedInt: {
    currency: string;
    units: string;
    nano: number;
  };
  quantity: string;
  quantityRest: string;
  quantityDone: string;
  cancelReason: string;
  assetUid: string;
}

export interface ParticipantIncomeResult {
  name: string;
  accountName: string;
  percent: number;
  error?: string;
}

export interface Participant {
  name: string;
  token: string;
  accountName: string;
}

export interface Account {
  id: string;
  type: string;
  name: string;
  status: string;
  openedDate: string;
  closedDate: string;
  accessLevel: string;
}

export interface Portfolio {
  totalAmountShares: {
    currency: string;
    units: string;
    nano: number;
  };
  totalAmountBonds: {
    currency: string;
    units: string;
    nano: number;
  };
  totalAmountEtf: {
    currency: string;
    units: string;
    nano: number;
  };
  totalAmountCurrencies: {
    currency: string;
    units: string;
    nano: number;
  };
  totalAmountFutures: {
    currency: string;
    units: string;
    nano: number;
  };
  expectedYield: {
    units: string;
    nano: number;
  };
  positions: [
    {
      figi: string;
      instrumentType: string;
      quantity: {
        units: string;
        nano: number;
      };
      averagePositionPrice: {
        currency: string;
        units: string;
        nano: number;
      };
      expectedYield: {
        units: string;
        nano: number;
      };
      averagePositionPricePt: {
        units: string;
        nano: number;
      };
      currentPrice: {
        currency: string;
        units: string;
        nano: number;
      };
      averagePositionPriceFifo: {
        currency: string;
        units: string;
        nano: number;
      };
      quantityLots: {
        units: string;
        nano: number;
      };
      blocked: boolean;
      blockedLots: {
        units: string;
        nano: number;
      };
      positionUid: string;
      instrumentUid: string;
      varMargin: {
        currency: string;
        units: string;
        nano: number;
      };
      expectedYieldFifo: {
        units: string;
        nano: number;
      };
    },
  ];
  accountId: string;
  totalAmountOptions: {
    currency: string;
    units: string;
    nano: number;
  };
  totalAmountSp: {
    currency: string;
    units: string;
    nano: number;
  };
  totalAmountPortfolio: {
    currency: string;
    units: string;
    nano: number;
  };
  virtualPositions: [];
}
