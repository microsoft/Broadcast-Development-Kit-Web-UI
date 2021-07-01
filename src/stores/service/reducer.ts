// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { BotService } from "../../models/service/types";
import { Resource } from "../../services/api";
import baseReducer from "../base/BaseReducer";
import * as BotServiceActions from "./actions";

export interface BotServiceAppState {
  botServices: BotService[];
  loading: boolean;
}

export const INITIAL_STATE: BotServiceAppState = {
  botServices: [],
  loading: true,
};

export const serviceReducer = baseReducer(INITIAL_STATE, {
  [BotServiceActions.REQUEST_BOT_SERVICE_FINISHED](state: BotServiceAppState, action: BotServiceActions.RequestBotServiceFinished){
    const botService = action.payload! as Resource<BotService>;
    return {
      ...state,
      botServices: [botService.resource],
    };
  },
  [BotServiceActions.REQUEST_POLLING_BOT_SERVICE_FINISHED](state: BotServiceAppState, action: BotServiceActions.RequestPollingBotServiceFinished){
    const botService = action.payload! as Resource<BotService>;
    return {
      ...state,
      botServices: [botService.resource],
    };
  },
  [BotServiceActions.REQUEST_START_SERVICE_FINISHED](state: BotServiceAppState, action: BotServiceActions.RequestStartService){
    const botService = action.payload! as Resource<BotService>;
    return {
      ...state,
      botServices: [botService.resource],
    };
  },
  [BotServiceActions.REQUEST_STOP_SERVICE_FINISHED](state: BotServiceAppState, action: BotServiceActions.RequestStopServiceFinished){
    const botService = action.payload! as Resource<BotService>;
    return {
      ...state,
      botServices: [botService.resource],
    };
  }
})