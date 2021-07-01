// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { RouterState } from 'connected-react-router'
import { AuthState } from '../../stores/auth/reducer';
import { ICallsState } from '../../stores/calls/reducer';
import { ConfigState } from '../../stores/config/reducer';
import { ErrorState } from '../../stores/error/reducer';
import { RequestingState } from '../../stores/requesting/reducer';
import { BotServiceAppState } from '../../stores/service/reducer';
import { IToastState } from '../../stores/toast/reducer';

export default interface IAppState {
  router: RouterState,
  config: ConfigState,
  auth: AuthState;
  calls: ICallsState;
  errors: ErrorState;
  requesting: RequestingState;
  toast: IToastState;
  botServiceStatus: BotServiceAppState;
}
