import { useOrderBook } from './useOrderBook';

const { subscribeToSnapshot, stopListeningToOrderBook } =
  useOrderBook('BTCUSDT');

const unsubscribe = subscribeToSnapshot((orderBook) => {
  console.log(orderBook);
});
