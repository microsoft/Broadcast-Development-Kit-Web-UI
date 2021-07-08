// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { createSelector} from 'reselect';
import { ActiveStatuses, Call, CallState, CallType, InactiveStatuses, SpecialStreamTypes, StreamProtocol, StreamType } from '../../models/calls/types';
import IAppState from '../../services/store/IAppState';
import { CallInfoProps, CallStreamsProps, NewInjectionStreamDrawerProps, NewStreamDrawerProps } from '../../views/call-details/types';
import { ICallsState } from './reducer';

export const selectNewCall = createSelector(
  (state: IAppState) => state.calls,
  (state: ICallsState) => state.newCall
);

export const selectActiveCalls = createSelector(
  (state: IAppState) => state.calls,
  (state: ICallsState) => state.activeCalls
);

export const selectCallStreams = createSelector(
  (state: IAppState) => state.calls,
  (state: IAppState, callId: string) => callId,
  _selectCallStreams
)

export const selectNewInjectionStreamDrawerProps = createSelector(
  (state: IAppState) => state.calls,
  (state: IAppState, callId: string) => callId,
  _selectNewInjectionStreamDrawerProps
)

export const selectNewStreamDrawerProps = createSelector(
  (state: IAppState) => state.calls,
  (state: IAppState, callId: string) => callId,
  _selectNewStreamDrawerProps
)

export const selectCallInfoProps = createSelector(
  (state: IAppState) => state.calls,
  (state: IAppState, callId: string) => callId,
  _selectCallInfoProps
)


function _selectCallStreams(callState: ICallsState, callId: string): CallStreamsProps {
  const call = callState.activeCalls.find(call => call.id === callId);

  if(!call){
    return {
      callId, 
      callEnabled: false,
      mainStreams: [],
      participantStreams: [],
      activeStreams: [],
      primarySpeakerEnabled: false,
      stageEnabled: false,
      injectionStream: null,
      callProtocol: 0,
    }
  }

  return {
    callId,
    callEnabled: call.state === CallState.Established,
    mainStreams: call.streams.filter((o) => SpecialStreamTypes.includes(o.type) && InactiveStatuses.includes(o.state)),
    participantStreams: call.streams.filter(
      (o) => o.type === StreamType.Participant && InactiveStatuses.includes(o.state)
    ),
    activeStreams: call.streams.filter((o) => ActiveStatuses.includes(o.state)),
    primarySpeakerEnabled:
      call.streams.filter(
        (o) => o.type === StreamType.Participant && o.isSharingVideo && o.isSharingAudio && !o.audioMuted
      ).length > 0,
    stageEnabled: call.streams.filter((o) => o.type === StreamType.Participant && o.isSharingScreen).length > 0,
    injectionStream: call.injectionStream,
    callProtocol: call.defaultProtocol,
  }
}

function _selectNewInjectionStreamDrawerProps(callState: ICallsState, callId: string): NewInjectionStreamDrawerProps {
  const call = callState.activeCalls.find((o) => o.id === callId);
  const newInjectionStream = callState.newInjectionStream;
  if (!call) {
    return {
      call: null,
      newInjectionStream,
    };
  }

  return {
    call,
    newInjectionStream,
  };
}

function _selectNewStreamDrawerProps(callState: ICallsState, callId: string): NewStreamDrawerProps {
  const call = callState.activeCalls.find((o) => o.id === callId);
  const newStream = callState.newStream;
  if (!call) {
    return {
      call: null,
      newStream,
    };
  }

  return {
    call,
    newStream,
  };
}

function _selectCallInfoProps(callState: ICallsState, callId: string): CallInfoProps {
  const call = callState.activeCalls.find((o) => o.id === callId);
  console.log('streams:', call?.streams.length);
  if (!call) {
    return {
      call: {
        ...CALL_INITIALIZING_PLACEHOLDER,
      },
      streams: [],
    };
  }

  return {
    call,
    streams: call.streams,
  };
}

const CALL_INITIALIZING_PLACEHOLDER: Call = {
  id: '0',
  displayName: 'Loading Call',
  botFqdn: '',
  botIp: '',
  connectionPool: {
    available: 0,
    used: 0,
  },
  createdAt: new Date(),
  defaultProtocol: StreamProtocol.SRT,
  defaultLatency: 0,
  defaultPassphrase: '',
  errorMessage: null,
  joinUrl: '',
  state: CallState.Establishing,
  meetingType: CallType.Default,
  streams: [],
  injectionStream: null,
  privateContext: null,
};
