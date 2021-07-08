// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { Call } from '../../../models/calls/types';
import { ApiError } from '../../../models/error/types';
import { RequestResponse } from '../../../services/api';
import BaseAction, { RequestFinishedActionParameters } from '../../base/BaseAction';

export const REQUEST_ACTIVE_CALLS = 'REQUEST_ACTIVE_CALLS';
export const REQUEST_ACTIVE_CALLS_FINISHED = 'REQUEST_ACTIVE_CALLS_FINISHED';

export interface RequestActiveCalls extends BaseAction<undefined> {}
export interface RequestActiveCallsFinished extends BaseAction<RequestResponse<Call[]>> {}

export const requestActiveCalls = (): RequestActiveCalls => ({
  type: REQUEST_ACTIVE_CALLS,
});

export const requestActiveCallsFinished = ({
  payload,
  meta,
}: RequestFinishedActionParameters<Call[]>): RequestActiveCallsFinished => ({
  type: REQUEST_ACTIVE_CALLS_FINISHED,
  payload: payload,
  error: payload instanceof ApiError,
});
