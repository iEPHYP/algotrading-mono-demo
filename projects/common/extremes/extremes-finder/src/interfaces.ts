import { Interval } from '@algotrading/common-interfaces';

export interface PriceLevel {
  timestamp: number;
  price: number;
  interval: Interval;
  type: 'support' | 'resistance';
}

export interface Extremums {
  highs: PriceLevel[];
  lows: PriceLevel[];
}
