import axios from 'axios';

export const last1000DaysTime = Date.now() - 1000 * 24 * 60 * 60 * 1000;

export const oneDay = 24 * 60 * 60 * 1000;

export interface HistoricalDataEntry {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface KlinesRequestParams {
  symbol: string;
  interval:
    | '1m'
    | '3m'
    | '5m'
    | '15m'
    | '30m'
    | '1h'
    | '2h'
    | '4h'
    | '6h'
    | '8h'
    | '12h'
    | '1d'
    | '3d'
    | '1w'
    | '1M';
  startTime?: number; // Starting time in milliseconds
  endTime?: number; // Ending time in milliseconds
  limit?: number; // Maximum number of candles
  fromId?: number; // Identifier of the starting candle
  quoteAsset?: string; // Trading currency
  spot?: boolean; // Flag for trading on the spot market
  intervalNum?: number; // Number of intervals
  contractType?: string; // Type of contract
  includeInvalid?: boolean; // Include invalid data
  limitDownMarket?: boolean; // Limit down market
  limitUpMarket?: boolean; // Limit up market
  futuresType?: string; // Type of futures
  contractVersion?: string; // Version of the contract
  includeUnsettled?: boolean; // Include unsettled data
  includeClose?: boolean; // Include closing data
  closeOnTrigger?: boolean; // Close on trigger
  recvWindow?: number; // Reception window
}

export type ResponseKLineData = [
  number, // Open time
  string, // Open price
  string, // High price
  string, // Low price
  string, // Close price
  string, // Volume
  number, // Close time
  string, // Quote asset volume
  number, // Number of trades
  string, // Taker buy base asset volume
  string, // Taker buy quote asset volume
  string // Ignore
];

export const getHistoricalCandleData = async (
  params: KlinesRequestParams
): Promise<HistoricalDataEntry[]> => {
  const response = await axios.get<ResponseKLineData[]>(
    'https://api.binance.com/api/v3/klines',
    {
      params,
    }
  );

  const historicalData: HistoricalDataEntry[] = response.data.map((entry) => ({
    timestamp: entry[0],
    open: parseFloat(entry[1]),
    high: parseFloat(entry[2]),
    low: parseFloat(entry[3]),
    close: parseFloat(entry[4]),
  }));

  return historicalData;
};

export const getAllHistoricalCandleData = async (
  params: KlinesRequestParams
): Promise<HistoricalDataEntry[]> => {
  const pageSize = 1000;

  async function fetchData(
    endTime?: number,
    accumulatedData: HistoricalDataEntry[] = []
  ): Promise<HistoricalDataEntry[]> {
    const requestParams: KlinesRequestParams = {
      ...params,
      limit: pageSize,
      endTime,
    };

    const responseData = await getHistoricalCandleData(requestParams);
    const newData = [...accumulatedData, ...responseData];

    if (responseData.length < pageSize) {
      return newData;
    }

    const nextEndTime = responseData[0].timestamp - 1;

    return fetchData(nextEndTime, newData);
  }

  const historicalData = await fetchData();

  return historicalData.sort((a, b) => a.timestamp - b.timestamp);
};
