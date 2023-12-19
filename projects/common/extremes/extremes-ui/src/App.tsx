import React, { useState } from 'react';
import { getExtremums, PriceLevel } from '@algotrading/extremes-finder';
import { ChartWithExtremums } from './ChartWithExtremums';

const symbol = 'BTCUSDT';

export const App = () => {
  const [priceLevels, setPriceLevels] = useState<PriceLevel[]>([]);

  React.useEffect(() => {
    getExtremums(symbol).then((priceLevels) => setPriceLevels(priceLevels));
  }, []);

  return <ChartWithExtremums {...{ priceLevels, symbol }} />;
};
