// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { ApiError } from "../../models/error/types";
import { BotService } from "../../models/service/types";
import { RequestResponse, Resource } from "../../services/api";
import BaseAction, { RequestFinishedActionParameters } from "../base/BaseAction";

export const REQUEST_START_SERVICE = "REQUEST_START_SERVICE";
export const REQUEST_START_SERVICE_FINISHED = "REQUEST_START_SERVICE_FINISHED";

export interface RequestStartService extends BaseAction<undefined> {}
export interface RequestStartServiceFinished extends BaseAction<RequestResponse<Resource<BotService>>> {}

export const requestStartService = (): RequestStartService => ({
  type: REQUEST_START_SERVICE,
});

export const requestStartServiceFinished = ({
  payload,
  meta,
}: RequestFinishedActionParameters<Resource<BotService>>): RequestStartServiceFinished => ({
  type: REQUEST_START_SERVICE_FINISHED,
  payload: payload,
  error: payload instanceof ApiError,
});

export const REQUEST_STOP_SERVICE = "REQUEST_STOP_SERVICE";
export const REQUEST_STOP_SERVICE_FINISHED = "REQUEST_STOP_SERVICE_FINISHED";

export interface RequestStopService extends BaseAction<undefined> {}
export interface RequestStopServiceFinished extends BaseAction<RequestResponse<Resource<BotService>>> {}

export const requestStopService = (): RequestStopService => ({
  type: REQUEST_STOP_SERVICE,
});

export const requestStopServiceFinished = ({
  payload,
  meta,
}: RequestFinishedActionParameters<Resource<BotService>>): RequestStopServiceFinished => ({
  type: REQUEST_STOP_SERVICE_FINISHED,
  payload: payload,
  error: payload instanceof ApiError,
});

export const REQUEST_BOT_SERVICE = "REQUEST_BOT_SERVICE";
export const REQUEST_BOT_SERVICE_FINISHED = "REQUEST_BOT_SERVICE_FINISHED";

export interface RequestBotService extends BaseAction<undefined> {}
export interface RequestBotServiceFinished extends BaseAction<RequestResponse<Resource<BotService>>> {}

export const requestBotService = (): RequestBotService => ({
  type: REQUEST_BOT_SERVICE,
});

export const requestBotServiceFinished = ({
  payload,
  meta,
}: RequestFinishedActionParameters<Resource<BotService>>): RequestBotServiceFinished => ({
  type: REQUEST_BOT_SERVICE_FINISHED,
  payload: payload,
  error: payload instanceof ApiError,
});

