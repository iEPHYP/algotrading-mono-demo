import { configureStore, createSlice } from '@reduxjs/toolkit';

export const useState = <
  TState = any
>(
  initialState?: TState
) => {
  const { reducer, actions } = createSlice({
    name: 'state',
    initialState,
    reducers: {
      setState: (state, action) => {
        return action.payload;
      },
    },
  });

  const store = configureStore({ reducer });
  const { getState, dispatch, subscribe: reduxSubscribe } = store;
  const subscribe = (listener: (newState: TState) => void) =>
    reduxSubscribe(() => listener(getState()));

  const setState = (
    newStateOrMethod: TState | ((previousState: TState) => TState)
  ) => {
    if (typeof newStateOrMethod === 'function') {
      const caller = newStateOrMethod as (previousState: TState) => TState;
      dispatch(actions.setState(caller(getState())));
    } else {
      dispatch(actions.setState(newStateOrMethod));
    }
  };

  return [getState, setState, subscribe] as [
    typeof getState,
    typeof setState,
    typeof subscribe
  ];
};
