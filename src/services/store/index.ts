import { applyMiddleware, combineReducers, createStore, AnyAction, CombinedState, Store } from 'redux';
import { connectRouter, routerMiddleware } from 'connected-react-router';
import { History } from 'history';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunkMiddleware, { ThunkMiddleware, ThunkDispatch } from 'redux-thunk';
import { createBrowserHistory } from 'history';

import IAppState from './IAppState';
import { callsReducer } from '../../stores/calls/reducer';
import { configReducer } from '../../stores/config/reducer';
import { authReducer } from '../../stores/auth/reducer';
import errorReducer from '../../stores/error/reducer';
import requestingReducer from '../../stores/requesting/reducer';
import { toastReducer } from '../../stores/toast/reducer';
import errorToastMiddleware from '../../middlewares/errorToastMiddleware';
import { serviceReducer } from '../../stores/service/reducer';

const createRootReducer = (history: History) =>
  combineReducers<IAppState>({
    router: connectRouter(history),
    config: configReducer,
    auth: authReducer,
    calls: callsReducer,
    errors: errorReducer,
    toast: toastReducer,
    requesting: requestingReducer,
    botServiceStatus: serviceReducer,
  });

const configureStore = (): Store<CombinedState<IAppState>, AnyAction> =>
  createStore(
    createRootReducer(history),
    composeWithDevTools(
      applyMiddleware(
        routerMiddleware(history),
        errorToastMiddleware,
        thunkMiddleware as ThunkMiddleware<IAppState, AnyAction>
      )
    )
  );

export const history = createBrowserHistory();

export default configureStore;

export type DispatchExts = ThunkDispatch<IAppState, undefined, AnyAction>;
