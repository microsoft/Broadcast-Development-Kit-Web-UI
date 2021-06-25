import baseReducer from "../base/BaseReducer";
import { AppConfig } from "./types";
import * as ConfigActions from "./actions";
export interface ConfigState {
  initialized: boolean;
  app: AppConfig | null;
}

export const INITIAL_STATE: ConfigState = {
  initialized: false,
  app: null,
}

export const configReducer = baseReducer(INITIAL_STATE, {
  [ConfigActions.LOAD_CONFIG](state: ConfigState, action: ConfigActions.LoadConfig): ConfigState{
    return {
      initialized: true,
      app: action.payload!
    }
  }
})
