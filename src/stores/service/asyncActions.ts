// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { AnyAction } from 'redux';
import { ThunkAction, ThunkDispatch } from 'redux-thunk';
import { ApiError } from '../../models/error/types';
import { BotService, ProvisioningStateValues } from '../../models/service/types';
import { ApiClient, Resource } from '../../services/api';
import IAppState from '../../services/store/IAppState';
import {
  pollingBotTransitionError,
  requestBotService,
  requestBotServiceFinished,
  requestPollingBotService,
  requestPollingBotServiceFinished,
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

  const isError: boolean = startServiceResponse instanceof ApiError;

  if (isError) {
    return;
  }

  //TODO: Start polling state;
  await pollFromOneStatusToAnother(ProvisioningStateValues.Provisioning, ProvisioningStateValues.Provisioned, dispatch);
};

export const stopBotServiceAsync = (): ThunkAction<void, IAppState, undefined, AnyAction> => async (dispatch) => {
  dispatch(requestStopService());

  const stopBotServiceResponse = await ApiClient.post<Resource<BotService>>({
    url: `/service/${DEFAULT_SERVICE_ID}/stop`,
    isSecured: true,
  });

  dispatch(requestStopServiceFinished({ payload: stopBotServiceResponse }));

  const isError: boolean = stopBotServiceResponse instanceof ApiError;

  if (isError) {
    return;
  }

  //TODO: Start polling state;
  await pollFromOneStatusToAnother(ProvisioningStateValues.Deprovisioning, ProvisioningStateValues.Deprovisioned, dispatch);
};

export const getBotServiceAsync = (): ThunkAction<void, IAppState, undefined, AnyAction> => async (dispatch) => {
  dispatch(requestBotService());

  const getBotServiceResponse = await ApiClient.get<Resource<BotService>>({
    url: `/service/${DEFAULT_SERVICE_ID}/state`,
    isSecured: true,
  });

  dispatch(requestBotServiceFinished({ payload: getBotServiceResponse }));
};

const getBotServicePromise = () => {
  return ApiClient.get<Resource<BotService>>({
    url: `/service/${DEFAULT_SERVICE_ID}/state`,
    isSecured: true,
  });
};

const pollFromOneStatusToAnother = async (
  from: ProvisioningStateValues,
  to: ProvisioningStateValues,
  dispatch: ThunkDispatch<IAppState, undefined, AnyAction>
) => {
  const POLL_INTERVAL = 3000;
  const _pollServiceState = async () => {
    dispatch(requestPollingBotService());
    const response = await getBotServicePromise();
    dispatch(requestPollingBotServiceFinished({ payload: response }));

    const isError: boolean = response instanceof ApiError;
    if (isError) {
      /*
        TODO: Question:
              if we have an error when the app starts polling, 
              should we keep polling or just return?
        */
      return setTimeout(_pollServiceState, POLL_INTERVAL);
    }

    const botServiceResponse = response as Resource<BotService>;
    const botService = botServiceResponse.resource;

    switch (botService.infrastructure.provisioningDetails.state.id) {
      case from:
        // keep polling
        return setTimeout(_pollServiceState, POLL_INTERVAL);

      case to:
        // done
        return;

      default:
        //TODO: Dispatch custom error;
        dispatch(
          pollingBotTransitionError(
            `The provisioning state has changed unexpectedly. Current state: ${botService.infrastructure.provisioningDetails.state.name}`
          )
        );
        return;
    }
  };
  // start polling
  await _pollServiceState();
};
