import { NewStreamDrawerOpenParameters } from "../../../models/calls/types";
import BaseAction from "../../base/BaseAction";

export const OPEN_NEW_STREAM_DRAWER = 'OPEN_NEW_STREAM_DRAWER';
export const CLOSE_NEW_STREAM_DRAWER = 'CLOSE_NEW_STREAM_DRAWER';

export interface OpenNewStreamDrawer extends BaseAction<NewStreamDrawerOpenParameters> {}
export interface CloseNewStreamDrawer extends BaseAction<undefined> {}

export const openNewStreamDrawer = ({
  callId,
  streamType,
  participantId,
  participantName,
}: NewStreamDrawerOpenParameters): OpenNewStreamDrawer => ({
  type: OPEN_NEW_STREAM_DRAWER,
  payload: {
    callId,
    streamType,
    participantId,
    participantName,
  },
});

export const closeNewStreamDrawer = (): CloseNewStreamDrawer =>({
  type: CLOSE_NEW_STREAM_DRAWER,
})