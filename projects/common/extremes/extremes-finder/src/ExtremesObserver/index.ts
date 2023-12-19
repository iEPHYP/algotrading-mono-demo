import { getExtremums } from '../findExtremes';
import { default as Binance } from 'binance-api-node';
import { PriceLevel } from '../interfaces';

interface IExtremesObserverProps {
  symbol: string;
  levelCameClose?: (
    level: PriceLevel,
    currentPrice: { ask: number; bid: number }
  ) => boolean;
  onLevelIsClose?: (level: PriceLevel) => void;
  onLevelIsBroken?: (level: PriceLevel) => void;
}

const defaultAlarmDistancePercentage = 0.2;

export const createExtremesObserver = async ({
  symbol,
  levelCameClose = (level, currentPrice) => {
    if (level.type === 'resistance') {
      return (
        ((level.price - currentPrice.ask) / level.price) * 100 <
        defaultAlarmDistancePercentage
      );
    } else {
      return (
        ((currentPrice.bid - level.price) / level.price) * 100 <
        defaultAlarmDistancePercentage
      );
    }
  },
  onLevelIsClose,
  onLevelIsBroken,
}: IExtremesObserverProps) => {
  const extremes = await getExtremums(symbol);

  const client = Binance();

  const {
    setLevelIsApporached,
    isLevelApproached,
    setLevelIsBroken,
    isLevelBroken,
  } = useLevelsStateManagement();

  const clean = client.ws.partialDepth(
    { symbol: `${symbol}@100ms`, level: 5 },
    ({ asks, bids }) => {
      const ask = parseFloat(asks[0].price);
      const bid = parseFloat(bids[0].price);

      const currentPrice: Parameters<
        Required<IExtremesObserverProps>['levelCameClose']
      >[1] = {
        ask,
        bid,
      };

      extremes.forEach((level) => {
        if (
          !isLevelApproached(level) &&
          levelCameClose?.(level, currentPrice)
        ) {
          onLevelIsClose?.(level);
          setLevelIsApporached(level);
        }

        if (!isLevelBroken(level)) {
          if (level.type === 'resistance' && currentPrice.ask > level.price) {
            onLevelIsBroken?.(level);
            setLevelIsBroken(level);
          }
          if (level.type === 'support' && currentPrice.bid < level.price) {
            onLevelIsBroken?.(level);
            setLevelIsBroken(level);
          }
        }
      });
    }
  );

  return {
    stopListeningStream: () => {
      clean();
    },
  };
};

const useLevelsStateManagement = () => {
  const approachedLevelsMap: { [key: number]: boolean } = {};
  const isLevelApproached = (level: PriceLevel) =>
    approachedLevelsMap[level.price];
  const setLevelIsApporached = (level: PriceLevel) =>
    (approachedLevelsMap[level.price] = true);

  const brokenLevelsMap: { [key: number]: boolean } = {};
  const isLevelBroken = (level: PriceLevel) => brokenLevelsMap[level.price];
  const setLevelIsBroken = (level: PriceLevel) =>
    (brokenLevelsMap[level.price] = true);

  return {
    isLevelApproached,
    setLevelIsApporached,
    isLevelBroken,
    setLevelIsBroken,
  };
};
