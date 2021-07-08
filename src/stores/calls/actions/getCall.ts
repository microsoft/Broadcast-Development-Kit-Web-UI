// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { Call } from '../../../models/calls/types';
import { ApiError } from '../../../models/error/types';
import { RequestResponse } from '../../../services/api';
import BaseAction, { RequestFinishedActionParameters } from '../../base/BaseAction';

export enum RequestCallType {
  NewCall = 'NewCall',
  ExistingCall = 'ExistingCall',
}

export const REQUEST_CALL = 'REQUEST_CALL';
export const REQUEST_CALL_FINISHED = 'REQUEST_CALL_FINISHED';

export interface RequestCall extends BaseAction<undefined> {}
export interface RequestCallFinished extends BaseAction<RequestResponse<Call>> {}

export const requestCall = (): BaseAction<undefined> => ({
  type: REQUEST_CALL,
});

export const requestCallFinished = ({
  payload,
  meta,
}: RequestFinishedActionParameters<Call>): BaseAction<RequestResponse<Call>> => ({
  type: REQUEST_CALL_FINISHED,
  payload: payload,
  error: payload instanceof ApiError,
});

export const REQUEST_POLLING_CALL = 'REQUEST_POLLING_CALL';
export const REQUEST_POLLING_CALL_FINISHED = 'REQUEST_POLLING_CALL_FINISHED';

export interface RequestPollingCall extends BaseAction<undefined> {}
export interface RequestPollingCallFinished extends BaseAction<RequestResponse<Call>> {}

export const requestPollingCall = (): BaseAction<undefined> => ({
  type: REQUEST_POLLING_CALL,
});

export const requestPollingCallFinished = ({
  payload,
  meta,
}: RequestFinishedActionParameters<Call>): BaseAction<RequestResponse<Call>> => ({
  type: REQUEST_POLLING_CALL_FINISHED,
  payload: payload,
  meta: meta,
  error: payload instanceof ApiError,
});
