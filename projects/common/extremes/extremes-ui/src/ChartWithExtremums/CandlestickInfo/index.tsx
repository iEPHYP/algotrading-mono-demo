import { useState, useEffect, FC } from 'react';
import { BarData, IChartApi } from 'lightweight-charts';
import { Typography } from '@material-ui/core';
import { useStyles } from './styles';

interface CandlestickInfoProps {
  chart: IChartApi | undefined;
}

export const CandlestickInfo: FC<CandlestickInfoProps> = ({ chart }) => {
  const [candlestickInfo, setCandlestickInfo] = useState<{
    open?: number;
    high?: number;
    low?: number;
    close?: number;
  }>({});

  useEffect(() => {
    if (!chart) {
      return;
    }

    const handler: Parameters<typeof chart.subscribeCrosshairMove>[0] = (
      param
    ) => {
      if (param.time && param.seriesData) {
        const candleData =
          (Array.from(param.seriesData.values())[0] as BarData) || {};
        setCandlestickInfo(candleData);
      }
    };

    chart.subscribeCrosshairMove(handler);

    return () => {
      chart.unsubscribeCrosshairMove(handler);
    };
  }, [chart]);

  const { flexContainer } = useStyles();

  return (
    <div className={flexContainer}>
      <Typography variant="body1" gutterBottom>
        Open: {candlestickInfo.open?.toFixed(2) || '-'}
      </Typography>
      <Typography variant="body1" gutterBottom>
        High: {candlestickInfo.high?.toFixed(2) || '-'}
      </Typography>
      <Typography variant="body1" gutterBottom>
        Low: {candlestickInfo.low?.toFixed(2) || '-'}
      </Typography>
      <Typography variant="body1" gutterBottom>
        Close: {candlestickInfo.close?.toFixed(2) || '-'}
      </Typography>
    </div>
  );
};
