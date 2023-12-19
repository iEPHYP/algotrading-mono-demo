import { useState, useEffect, useRef, FC } from 'react';
import { createChart, IChartApi } from 'lightweight-charts';
import { convertCandlestickData } from './utils';
import { PriceLevel } from '@algotrading/extremes-finder';
import {
  getAllHistoricalCandleData,
  getHistoricalCandleData,
} from '@algotrading/api';
import { CandlestickInfo } from './CandlestickInfo';
import { Button } from '@material-ui/core';
import { useChartTheming } from './useChartTheming';

export interface IChartWithExtremumsProps {
  symbol?: string;
  priceLevels: PriceLevel[];
}

const width = 1200;
const height = 400;

export const ChartWithExtremums: FC<IChartWithExtremumsProps> = ({
  symbol = 'BTCUSDT',
  priceLevels,
}) => {
  const [chart, setChart] = useState<IChartApi | undefined>();
  const { blue } = useChartTheming(chart);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [interval, setInterval] = useState<'1d' | '1h'>('1d');

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const newChart = createChart(chartContainerRef.current, {
      width,
      height,
    });
    setChart(newChart);

    return () => {
      chart?.remove();
    };
  }, []);

  useEffect(() => {
    if (!chart) return;

    const candlestickSeries = chart.addCandlestickSeries();

    const fetchCandlestickData = async () => {
      const response = await (interval === '1d'
        ? getAllHistoricalCandleData
        : getHistoricalCandleData)({ symbol, interval });

      const candlestickData = convertCandlestickData(response);

      candlestickSeries.setData(candlestickData);

      setTimeout(() => {
        chart?.timeScale().scrollToPosition(-1, false);
      }, 1000);
    };

    fetchCandlestickData();

    return () => {
      candlestickSeries && chart.removeSeries(candlestickSeries);
    };
  }, [chart, symbol, interval]);

  useEffect(() => {
    if (!chart) return;

    const lineOptions: Parameters<typeof chart.addLineSeries>[0] = {
      priceLineVisible: false,
      lastValueVisible: false,
    };

    const currentTime = Date.now();

    const levelsLineSeries = priceLevels.map(
      ({ timestamp, price, interval, type }) => {
        const levelLineSeries = chart.addLineSeries({
          ...lineOptions,
          color: type === 'resistance' ? 'red' : 'green',
          lineWidth: interval === '1d' ? 3 : 1,
        });

        levelLineSeries.setData([
          // @ts-expect-error Library internal type issues
          { time: timestamp / 1000, value: price },
          // @ts-expect-error Library internal type issues
          { time: currentTime / 1000, value: price },
        ]);

        return levelLineSeries;
      }
    );

    return () => {
      levelsLineSeries.forEach((levelLineSeries) => {
        levelLineSeries && chart.removeSeries(levelLineSeries);
      });
    };
  }, [chart, priceLevels, interval]);

  const handleIntervalChange = () => {
    setInterval((prevInterval) => (prevInterval === '1d' ? '1h' : '1d'));
  };

  return (
    <>
      <div
        ref={chartContainerRef}
        style={{ width: `${width}px`, height: `${height}px` }}
      />
      <CandlestickInfo {...{ chart }} />
      <Button variant="contained" onClick={handleIntervalChange}>
        Switch interval: {interval === '1d' ? '1d -> 1h' : '1h -> 1d'}
      </Button>
    </>
  );
};
