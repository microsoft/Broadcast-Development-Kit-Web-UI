import { Stream } from '../../../models/calls/types';
import { ApiError } from '../../../models/error/types';
import { RequestResponse, Resource } from '../../../services/api';
import BaseAction, { RequestFinishedActionParameters } from '../../base/BaseAction';

export const REQUEST_STOP_STREAM = 'REQUEST_STOP_STREAM';
export const REQUEST_STOP_STREAM_FINISHED = 'REQUEST_STOP_STREAM_FINISHED';

export interface RequestStopStream extends BaseAction<undefined> {}
export interface RequestStopStreamFinished extends BaseAction<RequestResponse<Resource<Stream>>> {}

export const requestStopStream = (): RequestStopStream => ({
  type: REQUEST_STOP_STREAM,
});

export const requestStopStreamFinished = ({
  payload,
  meta,
}: RequestFinishedActionParameters<Resource<Stream>>): RequestStopStreamFinished => ({
  type: REQUEST_STOP_STREAM_FINISHED,
  payload: payload,
  error: payload instanceof ApiError,
});
