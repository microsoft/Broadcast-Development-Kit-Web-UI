// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { Call } from '../../../models/calls/types';
import { ApiError } from '../../../models/error/types';
import { RequestResponse } from '../../../services/api';
import BaseAction, { RequestFinishedActionParameters } from '../../base/BaseAction';

export const REQUEST_JOIN_CALL = 'REQUEST_JOIN_CALL';
export const REQUEST_JOIN_CALL_FINISHED = 'REQUEST_JOIN_CALL_FINISHED';

export interface RequestJoinCall extends BaseAction<{ callUrl: string }> {}
export interface RequestJoinCallFinished extends BaseAction<RequestResponse<Call>> {}

export const requestJoinCall = (callUrl: string): BaseAction<{ callUrl: string }> => ({
  type: REQUEST_JOIN_CALL,
  payload: {
    callUrl,
  },
});

export const requestJoinCallFinished = ({
  payload,
  meta,
}: RequestFinishedActionParameters<Call>): BaseAction<RequestResponse<Call>> => ({
  type: REQUEST_JOIN_CALL_FINISHED,
  payload: payload,
  error: payload instanceof ApiError,
});
