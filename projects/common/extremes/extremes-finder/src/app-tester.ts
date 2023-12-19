import { createExtremesObserver } from './ExtremesObserver';

const observer = createExtremesObserver({
  symbol: 'BTCUSDT',
  onLevelIsClose: (level) => {
    console.log('level is close: ', level);
  },
  onLevelIsBroken: (level) => {
    console.log('level is broken: ', level);
  },
});
