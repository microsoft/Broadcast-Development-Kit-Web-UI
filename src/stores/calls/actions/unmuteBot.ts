// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { InjectionStream } from "../../../models/calls/types";
import { ApiError } from "../../../models/error/types";
import { RequestResponse } from "../../../services/api";
import BaseAction, { RequestFinishedActionParameters } from "../../base/BaseAction";

export const REQUEST_UNMUTE_BOT = 'REQUEST_UNMUTE_BOT';
export const REQUEST_UNMUTE_BOT_FINISHED = 'REQUEST_UNMUTE_BOT_FINISHED';

export interface RequestUnmuteBot extends BaseAction<undefined> {}
export interface RequestUnmuteBotFinished extends BaseAction<RequestResponse<InjectionStream>> {}

export const requestUnmuteBot = (): RequestUnmuteBot => ({
  type: REQUEST_UNMUTE_BOT,
});

export const requestUnmuteBotFinished = ({
  payload,
  meta,
}: RequestFinishedActionParameters<InjectionStream>): RequestUnmuteBotFinished => ({
  type: REQUEST_UNMUTE_BOT_FINISHED,
  payload: payload,
  error: payload instanceof ApiError,
});