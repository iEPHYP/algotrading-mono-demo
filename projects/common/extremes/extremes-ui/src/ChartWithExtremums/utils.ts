import { CandlestickData } from 'lightweight-charts';
import { HistoricalDataEntry } from '@algotrading/api';

export const convertCandlestickData = (
  data: HistoricalDataEntry[]
): CandlestickData[] => {
  // @ts-expect-error Library internal type issues
  return data.map(({ timestamp, ...others }) => ({
    time: timestamp / 1000,
    ...others,
  }));
};
