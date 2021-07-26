// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { Reducer } from 'redux';
import {
  Call,
  CallState,
  CallStreamKey,
  InjectionStream,
  KeyLength,
  NewCall,
  NewInjectionStream,
  NewStream,
  Stream,
  StreamProtocol,
  StreamType,
} from '../../models/calls/types';
import { Resource } from '../../services/api';
import baseReducer from '../base/BaseReducer';
import * as CallsActions from './actions';
import { RequestCallType } from './actions';

export interface ICallsState {
  activeCalls: Call[];
  newCall: null | NewCall;
  newStream: null | NewStream;
  newInjectionStream: null | NewInjectionStream;
  activeCallsLoading: boolean;
  activeCallsError: null | string;
}

export const INITIAL_STATE: ICallsState = {
  newStream: null,
  newInjectionStream: null,
  newCall: null,
  activeCalls: [],
  activeCallsLoading: false,
  activeCallsError: null,
};

/*
  NOTE: There are some REQUEST_*_FINISHED actions we don't add to the reducer
  because the call polling already updates the state of the call (with its streams)
*/

export const callsReducer: Reducer = baseReducer(INITIAL_STATE, {
  [CallsActions.REQUEST_ACTIVE_CALLS_FINISHED](
    state: ICallsState,
    action: CallsActions.RequestActiveCallsFinished
  ): ICallsState {
    const calls = action.payload! as Call[];
    return {
      ...state,
      activeCalls: calls.map((call) => fillDefaults(call, defaultCallValues)),
    };
  },
  [CallsActions.REQUEST_JOIN_CALL](state: ICallsState, action: CallsActions.RequestJoinCall): ICallsState {
    return {
      ...state,
      newCall: {
        callUrl: action.payload!.callUrl,
        status: CallState.Establishing,
      },
    };
  },
  [CallsActions.REQUEST_JOIN_CALL_FINISHED](
    state: ICallsState,
    action: CallsActions.RequestJoinCallFinished
  ): ICallsState {
    /*
      NOTE: If the action is exceuted, is because it is not flagged as error,
      so we can infer the payload type
    */
    // add new call to active calls
    const call = action.payload! as Call;

    const callWitDefaults = fillDefaults(call, defaultCallValues);

    return {
      ...state,
      newCall: null,
      activeCalls: state.activeCalls.concat(callWitDefaults),
    };
  },
  [CallsActions.REQUEST_CALL_FINISHED](state: ICallsState, action: CallsActions.RequestCallFinished): ICallsState {
    /*
      NOTE: If the action is exceuted, is because it is not flagged as error,
      so we can infer the payload type
    */
    const call = action.payload! as Call;
    // Update the call in question
    const existingCall = state.activeCalls.find((o) => o.id === call.id);
    const callWitDefaults = fillDefaults(call, existingCall ?? defaultCallValues);

    return {
      ...state,
      activeCalls: state.activeCalls.map((o) => (o.id !== callWitDefaults.id ? o : callWitDefaults)),
    };
  },
  [CallsActions.REQUEST_POLLING_CALL_FINISHED](
    state: ICallsState,
    action: CallsActions.RequestPollingCallFinished
  ): ICallsState {
    /*
      NOTE: If the action is exceuted, is because it is not flagged as error,
      so we can infer the payload type
    */
    const requestCallType = action.meta! as RequestCallType;

    const call = action.payload! as Call;
    if (requestCallType === RequestCallType.NewCall) {
      const callWitDefaults = fillDefaults(call, defaultCallValues);

      return {
        ...state,
        newCall: null,
        activeCalls: state.activeCalls.concat(callWitDefaults),
      };
    }

    if (requestCallType === RequestCallType.ExistingCall) {
      const existingCall = state.activeCalls.find((o) => o.id === call.id);
      const callWitDefaults = fillDefaults(call, existingCall ?? defaultCallValues);

      return {
        ...state,
        activeCalls: state.activeCalls.map((o) => (o.id !== callWitDefaults.id ? o : callWitDefaults)),
      };
    }

    return {
      ...state,
    };
  },
  [CallsActions.REQUEST_DISCONNECT_CALL_FINISHED](
    state: ICallsState,
    action: CallsActions.RequestDisconnectCallFinished
  ): ICallsState {
    /*
      NOTE: If the action is exceuted, is because it is not flagged as error,
      so we can infer the payload type

      TODO: Review
      We should analyze why we use the call updated action in our previous reducer/async action 
      to handle the call disconnection.
    */
    const call = action.payload! as Resource<Call>;
    // Update the call in question
    const existingCall = state.activeCalls.find((o) => o.id === call.id);
    const callWitDefaults = fillDefaults(call.resource, existingCall ?? defaultCallValues);

    return {
      ...state,
      activeCalls: state.activeCalls.map((o) => (o.id !== callWitDefaults.id ? o : callWitDefaults)),
    };
  },
  [CallsActions.REQUEST_START_STREAM_FINISHED](
    state: ICallsState,
    action: CallsActions.RequestStartStreamFinished
  ): ICallsState {
    /*
      NOTE: If the action is exceuted, is because it is not flagged as error,
      so we can infer the payload type
    */

    const resource = action.payload! as Resource<Stream>;
    const activeCall = state.activeCalls.find((call: Call) => call.id === resource.resource.callId);

    const updatedStream: Stream = {
      ...resource.resource,
      photo: activeCall?.streams.find((stream: Stream) => stream.id === resource.resource.id)?.photo,
    };

    return {
      ...state,
      activeCalls: state.activeCalls.map((call) =>
        call.id === updatedStream.callId
          ? {
              // call in question
              ...call,
              streams: call.streams.map((stream) => (stream.id === updatedStream.id ? updatedStream : stream)),
            } // other call
          : call
      ),
    };
  },
  [CallsActions.REQUEST_STOP_STREAM_FINISHED](
    state: ICallsState,
    action: CallsActions.RequestStopStreamFinished
  ): ICallsState {
    /*
      NOTE: If the action is exceuted, is because it is not flagged as error,
      so we can infer the payload type
    */

    const resource = action.payload! as Resource<Stream>;
    const activeCall = state.activeCalls.find((call: Call) => call.id === resource.resource.callId);

    const updatedStream: Stream = {
      ...resource.resource,
      photo: activeCall?.streams.find((stream: Stream) => stream.id === resource.resource.id)?.photo,
    };

    return {
      ...state,
      activeCalls: state.activeCalls.map((call) =>
        call.id === updatedStream.callId
          ? {
              // call in question
              ...call,
              streams: call.streams.map((stream) => (stream.id === updatedStream.id ? updatedStream : stream)),
            } // other call
          : call
      ),
    };
  },
  [CallsActions.OPEN_NEW_STREAM_DRAWER](state: ICallsState, action: CallsActions.OpenNewStreamDrawer): ICallsState {
    const payload = action.payload!;
    const call = state.activeCalls.find((o) => o.id === payload.callId);
    if (!call) {
      return state;
    }

    return {
      ...state,
      newStream: {
        callId: payload.callId,
        participantId: payload.participantId,
        streamType: payload.streamType,
        participantName: payload.participantName,
        advancedSettings: {
          latency: call.defaultLatency,
          key: call.defaultPassphrase,
          unmixedAudio: false,
          keyLength: call.defaultKeyLength,
        },
      },
    };
  },
  [CallsActions.CLOSE_NEW_STREAM_DRAWER](state: ICallsState, action: CallsActions.CloseNewStreamDrawer): ICallsState {
    return {
      ...state,
      newStream: null,
    };
  },
  [CallsActions.OPEN_NEW_INJECTION_STREAM_DRAWER](
    state: ICallsState,
    action: CallsActions.OpenNewInjectionStreamDrawer
  ): ICallsState {
    const payload = action.payload!;
    const call = state.activeCalls.find((o) => o.id === payload.callId);
    if (!call) {
      return state;
    }

    return {
      ...state,
      newInjectionStream: {
        callId: call.id,
      },
    };
  },
  [CallsActions.CLOSE_NEW_INJECTION_STREAM_DRAWER](
    state: ICallsState,
    action: CallsActions.CloseNewInjectionStreamDrawer
  ): ICallsState {
    return {
      ...state,
      newInjectionStream: null,
    };
  },
  [CallsActions.REQUEST_START_INJECTION_STREAM_FINISHED](
    state: ICallsState,
    action: CallsActions.RequestStartInjectionStreamFinished
  ): ICallsState {
    const stream = action.payload! as InjectionStream;

    const callId = stream.callId;
    const call = state.activeCalls.find((c) => c.id === callId);

    if (!call) {
      return state;
    }

    return {
      ...state,
      activeCalls: state.activeCalls.map((call) =>
        call.id === stream.callId
          ? {
              ...call,
              injectionStream: stream,
            }
          : call
      ),
    };
  },
  [CallsActions.UPDATE_CALL_DEFAULTS](state: ICallsState, action: CallsActions.UpdateCallDefaults): ICallsState {
    const payload = action.payload!;
    const defaults = payload.defaults;
    const call = state.activeCalls.find((o) => o.id === payload.callId);
    if (!call) {
      return state;
    }

    const updated: Call = {
      ...call,
      defaultProtocol: defaults.protocol,
      defaultLatency: defaults.latency ?? call.defaultLatency,
      defaultPassphrase: defaults.passphrase ?? call.defaultPassphrase,
      defaultKeyLength: defaults.keyLength ?? call.defaultKeyLength,
    };

    return {
      ...state,
      activeCalls: state.activeCalls.map((o) => (o.id !== call.id ? o : updated)),
    };
  },
  [CallsActions.REQUEST_REFRESH_STREAM_KEY_FINISHED](
    state: ICallsState,
    action: CallsActions.RequestRefreshStreamKeyFinished
  ): ICallsState {
    /*
      NOTE: If the action is executed, is because it is not flagged as error,
      so we can infer the payload type
    */
    const payload = action.payload! as CallStreamKey;
    const call = state.activeCalls.find((o) => o.id === payload.callId);

    if (!call) {
      return state;
    }

    const updated: Call = {
      ...call,
      privateContext: {
        streamKey: payload.streamKey,
      },
    };

    return {
      ...state,
      activeCalls: state.activeCalls.map((o) => (o.id !== call.id ? o : updated)),
    };
  },
  [CallsActions.UPDATE_STREAM_PHOTO](state: ICallsState, action: CallsActions.UpdateStreamPhoto): ICallsState {
    const streamId = action.payload!.streamId;
    const callId = action.payload!.callId;
    const photo = action.payload!.photo;

    const call = state.activeCalls.find((o) => o.id === callId);

    if (!call) {
      return state;
    }

    const updatedStream = {
      ...call.streams.find((stream: Stream) => stream.id === streamId),
      photo: photo,
    } as Stream;

    const updatedCall: Call = {
      ...call,
      streams: [...call.streams.filter((stream: Stream) => stream.id !== streamId), ...[updatedStream]],
    };

    return {
      ...state,
      activeCalls: state.activeCalls.map((o) => (o.id !== call.id ? o : updatedCall)),
    };
  },
});

const defaultCallValues = {
  defaultLatency: 750,
  defaultPassphrase: '',
  defaultKeyLength: KeyLength.None,
};

const fillDefaults = (call: Call, defaults: Partial<Call>): Call => ({
  ...call,
  defaultLatency: defaults.defaultLatency ?? defaultCallValues.defaultLatency,
  defaultPassphrase: defaults.defaultPassphrase ?? defaultCallValues.defaultPassphrase,
  defaultKeyLength: defaults.defaultKeyLength ?? defaultCallValues.defaultKeyLength,
  defaultProtocol: defaults.defaultProtocol ?? StreamProtocol.SRT,
  streams: call.streams
    ? call.streams.map((o) => ({
        ...o,
        audioSharing: o.type !== StreamType.VbSS,
        photo: defaults.streams?.find((stream: Stream) => stream.id === o.id)?.photo,
      }))
    : [],
});
