// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { AnyAction } from 'redux';
import { ThunkAction } from 'redux-thunk';
import IAppState from '../../services/store/IAppState';
import { getConfig } from './loader';
import { loadConfig as loadConfigAction, loadConfigError } from './actions';

export const loadConfig = (): ThunkAction<void, IAppState, undefined, AnyAction> => async (dispatch, getState) => {
  try {
    const config = await getConfig();
    dispatch(loadConfigAction(config));
  } catch (error) {
    dispatch(loadConfigError(error));
  }
};
