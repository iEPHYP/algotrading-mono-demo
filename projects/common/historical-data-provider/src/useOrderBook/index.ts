import { Bid as LimitOrder, Depth } from 'binance-api-node';
import { OrderBook } from 'binance-api-node';
import produce from 'immer';
import { default as Binance } from 'binance-api-node';
import { useState } from '@algotrading/utils';
import { isEmpty } from 'lodash';

const client = Binance();

interface Options {
  snapshotLimit?: number; // max 5000
  frequency?: '100ms' | '1000ms';
}

export const useOrderBook = (
  symbol = 'BTCUSDT',
  { snapshotLimit: limit = 5000, frequency = '100ms' }: Options = {}
) => {
  const [getSnapshot, setSnapshot, subscribeToSnapshot] =
    useState<OrderBook | null>(null);
  const [getBufferedDepthUpdates, setBufferedDepthUpdates] = useState<Depth[]>(
    []
  );

  const stopListeningWebsocket = client.ws.depth(
    `${symbol}@${frequency}`,
    (newDepthUpdates) => {
      setBufferedDepthUpdates([...getBufferedDepthUpdates(), newDepthUpdates]);

      const snapshot = getSnapshot();
      if (!snapshot) {
        client
          .book({
            symbol,
            limit,
          })
          .then((initialSnapshot) => {
            const bufferedDepthUpdates = getBufferedDepthUpdates();

            if (!isEmpty(bufferedDepthUpdates)) {
              const mergedSnapshot = mergeBufferedDepthUpdatesToSnapshot(
                initialSnapshot,
                bufferedDepthUpdates
              );

              setBufferedDepthUpdates([]);
              setSnapshot(mergedSnapshot);
            } else {
              setSnapshot(initialSnapshot);
            }
          });
      } else {
        setSnapshot(applyNewDepthUpdates(snapshot, newDepthUpdates));
      }
    }
  );

  return {
    subscribeToSnapshot,
    stopListeningToOrderBook: () => {
      stopListeningWebsocket();
    },
  };
};

const applyNewDepthUpdates = (
  previousSnapshot: OrderBook,
  newDepthUpdates: Depth
): OrderBook => {
  return produce(previousSnapshot, (draftSnapshot) => {
    const updateSnapshotWithDepth = (
      currentLimitOrders: LimitOrder[],
      depthUpdate: LimitOrder
    ) => {
      const existingIndex = currentLimitOrders.findIndex(
        (order) => order.price === depthUpdate.price
      );
      if (existingIndex !== -1) {
        if (Number(depthUpdate.quantity) === 0) {
          // Careful Mutation is used for performance reasons
          currentLimitOrders.splice(existingIndex, 1);
        } else {
          currentLimitOrders[existingIndex].quantity = depthUpdate.quantity;
        }
      } else {
        currentLimitOrders.push(depthUpdate);
      }
    };

    newDepthUpdates.bidDepth.forEach((bidDepthUpdate) => {
      updateSnapshotWithDepth(draftSnapshot.bids, bidDepthUpdate);
    });

    newDepthUpdates.askDepth.forEach((askDepthUpdate) => {
      updateSnapshotWithDepth(draftSnapshot.asks, askDepthUpdate);
    });
  });
};

const mergeBufferedDepthUpdatesToSnapshot = (
  snapshot: OrderBook,
  bufferedDepthUpdates: Depth[]
): OrderBook => {
  return produce(snapshot, (draftSnapshot) => {
    bufferedDepthUpdates.forEach((depthUpdates) => {
      applyNewDepthUpdates(draftSnapshot, depthUpdates);
    });
  });
};
