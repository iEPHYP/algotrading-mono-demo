import { useEffect } from 'react';
import { IChartApi } from 'lightweight-charts';
import { useThemeMode } from '../ThemeProvider';

export const useChartTheming = (chart: IChartApi | undefined) => {
  const { darkMode } = useThemeMode();
  const blue = darkMode ? 'lightblue' : 'blue';

  useEffect(() => {
    chart?.applyOptions(
      darkMode
        ? {
            layout: {
              background: { color: '#111111' },
              textColor: '#ffffff',
            },
            grid: {
              vertLines: {
                color: '#404040',
              },
              horzLines: {
                color: '#404040',
              },
            },
          }
        : {
            layout: {
              background: { color: '#ffffff' },
              textColor: '#191919',
            },
            grid: {
              vertLines: {
                color: '#D6DCDE',
              },
              horzLines: {
                color: '#D6DCDE',
              },
            },
          }
    );
  }, [chart, darkMode]);

  return { blue };
};
