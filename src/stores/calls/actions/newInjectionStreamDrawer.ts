import { NewInjectionStreamDrawerOpenParameters } from "../../../models/calls/types";
import BaseAction from "../../base/BaseAction";

export const OPEN_NEW_INJECTION_STREAM_DRAWER = 'OPEN_NEW_INJECTION_STREAM_DRAWER';
export const CLOSE_NEW_INJECTION_STREAM_DRAWER = 'CLOSE_NEW_INJECTION_STREAM_DRAWER';

export interface OpenNewInjectionStreamDrawer extends BaseAction<NewInjectionStreamDrawerOpenParameters> {}
export interface CloseNewInjectionStreamDrawer extends BaseAction<undefined> {}

export const openNewInjectionStreamDrawer = ({
  callId,
}: NewInjectionStreamDrawerOpenParameters): OpenNewInjectionStreamDrawer => ({
  type: OPEN_NEW_INJECTION_STREAM_DRAWER,
  payload: {
    callId,
  },
});

export const closeNewInjectionStreamDrawer = (): CloseNewInjectionStreamDrawer =>({
  type: CLOSE_NEW_INJECTION_STREAM_DRAWER,
})