import { Interval } from '@algotrading/common-interfaces';
import { HistoricalDataEntry } from '@algotrading/api';
import { Extremums, PriceLevel } from '../interfaces';

/**
The algorithm for finding unbroken extremums in historical price data, as illustrated in your code, works as follows:

1. Iterating Through Historical Data: The algorithm iterates through the data array, which contains historical price entries (HistoricalDataEntry), excluding the first and last elements to ensure previous and next data points are available for comparison.

2. Identifying Extremums:

- High Levels (Resistance): For each entry, the algorithm checks if the high value of the current element is greater than the high values of both the previous and next elements. If so, a PriceLevel object is created as a potential resistance level.
- Low Levels (Support): Similarly, for the low value of the current entry, the algorithm checks if it is lower than the low values of both the preceding and following entries. If this condition is met, a PriceLevel object is created as a potential support level.
3. Checking for Unbroken Levels: Each potential resistance or support level is then passed to the levelIsBroken function. This function determines whether the level has been "broken" by subsequent data (i.e., for a resistance level, if there was any low below and any high above the price level, and vice versa for a support level).

4. Collecting Results: Levels that are not broken are added to their respective arrays (highs for resistance levels and lows for support levels) within the Extremums object, which is then returned by the function at the end of the process.
*/

export function findUnbrokenExtremums(
  data: HistoricalDataEntry[],
  interval: Interval
): Extremums {
  const foundExtremums = data.slice(1, -1).reduce(
    (
      extremumsAccumulator: Extremums,
      currentEntry: HistoricalDataEntry,
      index: number
    ) => {
      const previousEntry = data[index];
      const nextEntry = data[index + 2];

      if (
        currentEntry.high > previousEntry.high &&
        currentEntry.high > nextEntry.high
      ) {
        const resistanceLevel: PriceLevel = {
          timestamp: currentEntry.timestamp,
          price: currentEntry.high,
          interval,
          type: 'resistance',
        };
        if (!levelIsBroken(resistanceLevel, data.slice(index + 2))) {
          extremumsAccumulator.highs.push(resistanceLevel);
        }
      }

      if (
        currentEntry.low < previousEntry.low &&
        currentEntry.low < nextEntry.low
      ) {
        const supportLevel: PriceLevel = {
          timestamp: currentEntry.timestamp,
          price: currentEntry.low,
          interval,
          type: 'support',
        };
        if (!levelIsBroken(supportLevel, data.slice(index + 2))) {
          extremumsAccumulator.lows.push(supportLevel);
        }
      }

      return extremumsAccumulator;
    },
    { highs: [], lows: [] }
  );

  return foundExtremums;
}

export function levelIsBroken(
  level: PriceLevel,
  data: HistoricalDataEntry[]
): boolean {
  return data.some(
    (entry) => entry.high > level.price && entry.low < level.price
  );
}

export function mergeUnbrokenExtremums(
  extremums1: Extremums,
  extremums2: Extremums
): PriceLevel[] {
  return [
    ...extremums1.highs,
    ...extremums2.highs,
    ...extremums1.lows,
    ...extremums2.lows,
  ].sort((a, b) => a.timestamp - b.timestamp);
}
