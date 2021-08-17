// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { AnyAction } from 'redux';
import { ThunkAction } from 'redux-thunk';
import { BotService } from '../../models/service/types';
import { ApiClient, Resource } from '../../services/api';
import IAppState from '../../services/store/IAppState';
import {
  requestBotService,
  requestBotServiceFinished,
  requestStartService,
  requestStartServiceFinished,
  requestStopService,
  requestStopServiceFinished,
} from './actions';

/*
  TODO: Warning
  The default service id is temporary
*/

const DEFAULT_SERVICE_ID = '00000000-0000-0000-0000-000000000000';

export const startBotServiceAsync = (): ThunkAction<void, IAppState, undefined, AnyAction> => async (dispatch) => {
  dispatch(requestStartService());

  const startServiceResponse = await ApiClient.post<Resource<BotService>>({
    url: `/service/${DEFAULT_SERVICE_ID}/start`,
    isSecured: true,
  });

  dispatch(requestStartServiceFinished({ payload: startServiceResponse }));
};

export const stopBotServiceAsync = (): ThunkAction<void, IAppState, undefined, AnyAction> => async (dispatch) => {
  dispatch(requestStopService());

  const stopBotServiceResponse = await ApiClient.post<Resource<BotService>>({
    url: `/service/${DEFAULT_SERVICE_ID}/stop`,
    isSecured: true,
  });

  dispatch(requestStopServiceFinished({ payload: stopBotServiceResponse }));
};

export const getBotServiceAsync = (): ThunkAction<void, IAppState, undefined, AnyAction> => async (dispatch) => {
  dispatch(requestBotService());

  const getBotServiceResponse = await ApiClient.get<Resource<BotService>>({
    url: `/service/${DEFAULT_SERVICE_ID}/state`,
    isSecured: true,
  });

  dispatch(requestBotServiceFinished({ payload: getBotServiceResponse }));
};
