// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { Stream } from '../../../models/calls/types';
import { ApiError } from '../../../models/error/types';
import { RequestResponse, Resource } from '../../../services/api';
import BaseAction, { RequestFinishedActionParameters } from '../../base/BaseAction';

export const REQUEST_START_STREAM = 'REQUEST_START_STREAM';
export const REQUEST_START_STREAM_FINISHED = 'REQUEST_START_STREAM_FINISHED';

export interface RequestStartStream extends BaseAction<undefined> {}
export interface RequestStartStreamFinished extends BaseAction<RequestResponse<Resource<Stream>>> {}

export const requestStartStream = (): RequestStartStream => ({
  type: REQUEST_START_STREAM,
});

export const requestStartStreamFinished = ({
  payload,
  meta,
}: RequestFinishedActionParameters<Resource<Stream>>): RequestStartStreamFinished => ({
  type: REQUEST_START_STREAM_FINISHED,
  payload: payload,
  error: payload instanceof ApiError,
});
