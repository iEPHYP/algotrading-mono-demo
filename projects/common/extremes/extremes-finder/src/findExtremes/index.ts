import {
  getAllHistoricalCandleData,
  getHistoricalCandleData,
} from '@algotrading/api';
import { findUnbrokenExtremums, mergeUnbrokenExtremums } from './utils';
import { maxBy, minBy } from 'lodash';

export const getExtremums = async (symbol: string) => {
  const endTime = Date.now();

  const d1HistoricalData = await getAllHistoricalCandleData({
    symbol,
    interval: '1d',
  });

  const d1Extremums = findUnbrokenExtremums(d1HistoricalData, '1d');

  const nearestD1High = minBy(d1Extremums.highs, 'price');
  const nearestD1Low = maxBy(d1Extremums.lows, 'price');
  const oldestLevel = Math.min(
    nearestD1High!.timestamp,
    nearestD1Low!.timestamp
  );

  const h1HistoricalData = await getHistoricalCandleData({
    symbol,
    interval: '1h',
    startTime: oldestLevel,
    endTime,
  });

  const h1Extremums = findUnbrokenExtremums(h1HistoricalData, '1h');

  return mergeUnbrokenExtremums(d1Extremums, {
    highs: h1Extremums.highs.filter((h) => h.price < nearestD1High!.price),
    lows: h1Extremums.lows.filter((l) => l.price > nearestD1Low!.price),
  });
};
