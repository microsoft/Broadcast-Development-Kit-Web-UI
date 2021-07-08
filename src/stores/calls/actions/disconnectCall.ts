// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { Call } from "../../../models/calls/types";
import { ApiError } from "../../../models/error/types";
import { RequestResponse, Resource } from "../../../services/api";
import BaseAction, { RequestFinishedActionParameters } from "../../base/BaseAction";

export const REQUEST_DISCONNECT_CALL = 'REQUEST_DISCONNECT_CALL';
export const REQUEST_DISCONNECT_CALL_FINISHED = 'REQUEST_DISCONNECT_CALL_FINISHED';

export interface RequestDisconnectCall extends BaseAction<undefined> {}
export interface RequestDisconnectCallFinished extends BaseAction<RequestResponse<Resource<Call>>> {}

export const requestDisconnectCall = (): RequestDisconnectCall => ({
  type: REQUEST_DISCONNECT_CALL,
});

export const requestDisconnectCallFinished = ({
  payload,
  meta,
}: RequestFinishedActionParameters<Resource<Call>>): RequestDisconnectCallFinished => ({
  type: REQUEST_DISCONNECT_CALL_FINISHED,
  payload: payload,
  error: payload instanceof ApiError,
});