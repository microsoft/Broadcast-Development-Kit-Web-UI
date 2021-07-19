// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import {push} from 'connected-react-router';
import {AnyAction} from 'redux';
import {ThunkAction} from 'redux-thunk';
import {
  Call,
  CallState,
  CallStreamKey,
  InjectionStream,
  NewInjectionStream,
  StartStreamRequest,
  StopStreamRequest,
  Stream,
  StreamSrtConfiguration
} from '../../models/calls/types';
import { ApiError } from '../../models/error/types';
import {ApiClient, Resource} from '../../services/api';
import IAppState from '../../services/store/IAppState';
import {
  closeNewInjectionStreamDrawer,
  closeNewStreamDrawer,
  requestActiveCalls,
  requestActiveCallsFinished,
  requestCall,
  requestCallFinished,
  RequestCallType,
  requestDisconnectCall,
  requestDisconnectCallFinished,
  requestJoinCall,
  requestJoinCallFinished,
  requestMuteBot,
  requestMuteBotFinished,
  requestPollingCall,
  requestPollingCallFinished,
  requestRefreshStreamKey,
  requestRefreshStreamKeyFinished,
  requestStartInjectionStream,
  requestStartInjectionStreamFinished,
  requestStartStream,
  requestStartStreamFinished,
  requestStopStream,
  requestStopStreamFinished,
  requestUnmuteBot,
  requestUnmuteBotFinished
} from './actions';

const POLL_INTERVAL = 1000;
const CALL_DETAILS_PATH = '/call/details/';

export const joinCallAsync = (callUrl : string) : ThunkAction < void,
  IAppState,
  undefined,
  AnyAction > => async (dispatch, getState) => {
    dispatch(requestJoinCall(callUrl));

    const joinCallResponse = await ApiClient.post<Call>({
      url: '/call/initialize-call',
      payload: {
        MeetingUrl: callUrl
      },
      isSecured: true
    });

    /*
      NOTE: Before this change, we didn't update the call state until it was 
      with Established State. Now we dispatch the action to update the status of the API call
      in the application state, and also add the call to the state.
    */

    dispatch(requestJoinCallFinished({payload: joinCallResponse}));

    const isError: boolean = joinCallResponse instanceof ApiError;


    if (! isError) {
      const call = joinCallResponse as Call;
      dispatch(push(`/call/details/${
        call.id
      }`));
    }
  };

export const oldjoinCallAsync = (callUrl : string) : ThunkAction < void,
  IAppState,
  undefined,
  AnyAction > => async (dispatch, getState) => {
    dispatch(requestJoinCall(callUrl));

    const joinCallResponse = await ApiClient.post<Call>({
      url: '/call/initialize-call',
      payload: {
        MeetingUrl: callUrl
      },
      isSecured: true
    });

    /*
      NOTE: Before this change, we didn't update the call state until it was 
      with Established State. Now we dispatch the action to update the status of the API call
      in the application state, and also add the call to the state.
    */

    dispatch(requestJoinCallFinished({payload: joinCallResponse}));

    const joinCallReponseIsError: boolean = joinCallResponse instanceof ApiError;

    const callId = joinCallReponseIsError ? undefined : (joinCallResponse as Call).id;
    /*
      TODO: Suggestion:
      Analyze where we should do the polling.
      Try to remove it from the async action.
    */
    const pollCall = async () => {
      dispatch(requestCall());
      const callResponse = await ApiClient.get<Call>({url: `/call/${callId}`, isSecured: true});

      dispatch(requestCallFinished({payload: callResponse}));

      const isError: boolean = callResponse instanceof ApiError;

      if (isError) { /*
        TODO: Question:
              if we have an error when the app starts polling, 
              should we keep polling or just return?
        */

        return;
      }

      const call = callResponse as Call;

      /* 
        NOTE: Now we update the state of the call after getting the response
        independently of its state
      */
      switch (call.state) {
        case CallState.Establishing:
          // keep polling
          return setTimeout(pollCall, POLL_INTERVAL);

        case CallState.Established:
          dispatch(push(`/call/details/${
            call.id
          }`));
          return;
        case CallState.Terminated:
          /* 
            TODO: Question
            Before, we were dispatching a error we weren't using.
            Should we do something? Might we add a toast?
          */
          return;
        default:
          return;
      }
    };

    if (! joinCallReponseIsError) {
      await pollCall();
    }
  };

export const disconnectCallAsync = (callId : string) : ThunkAction < void,
  IAppState,
  undefined,
  AnyAction > => async (dispatch, getState) => {
    const call = getState().calls.activeCalls.find((call) => call.id === callId);

    if (call) {
      dispatch(requestDisconnectCall());

      const disonnectCallResponse = await ApiClient.delete<Resource<Call>>({url: `/call/${callId}`, isSecured: true});

      /* 
        TODO: Review
        At the moment, when we disconnect a call, we just update the call in the state.
        Should we remove it from the state?
      */
      dispatch(requestDisconnectCallFinished({payload: disonnectCallResponse}));
    }
  };

/*
  TODO: Suggestion/Review:

  We should change the way we poll for the current call and do
  something similar to what we do in the Meeting Extension.
*/
export const pollCurrentCallAsync = () : ThunkAction < void,
  IAppState,
  undefined,
  AnyAction > => async (dispatch, getState) => {
    const poll = async () => {

      const path = getState().router.location.pathname;

      if (! path.startsWith(CALL_DETAILS_PATH)) {
        return setTimeout(poll, POLL_INTERVAL);
      }

      // User is on the CallDetails view
      // Check if the call is already in state, if not, push a 'Loading' call placeholder for this one
      const callId = path.split(CALL_DETAILS_PATH).pop();
      if (! callId) {
        return setTimeout(poll, POLL_INTERVAL);
      }

      // poll data
      const existingCall = getState().calls.activeCalls.find((call) => call.id === callId);
      // Do not refresh if call already terminated
      if (! existingCall || existingCall.state !== CallState.Terminated) {
        dispatch(requestPollingCall());

        const requestCallResponse = await ApiClient.get<Call>({url: `/call/${callId}`, isSecured: true});

        dispatch(requestPollingCallFinished({
          payload: requestCallResponse,
          meta: existingCall ? RequestCallType.ExistingCall : RequestCallType.NewCall
        }));


        const isError: boolean = requestCallResponse instanceof ApiError;
        if (isError) {
          /*
        TODO: Question:
              if we have an error when the app starts polling, 
              should we keep polling or just return?
        */

          // Simulate room disconnection and redirect home
          dispatch(push('/'));

          // Enqueue
          return setTimeout(poll, POLL_INTERVAL);
        }
      }

      return setTimeout(poll, POLL_INTERVAL);
    };

    // trigger polling
    return setTimeout(poll, POLL_INTERVAL);
  };

export const startStreamAsync = ({callId, participantId, protocol, config} : StartStreamRequest) : ThunkAction < void,
  IAppState,
  undefined,
  AnyAction > => async (dispatch, getState) => {
    const state = getState();

    const call = state.calls.activeCalls.find((call) => call.id == callId);
    if (! call) {
      return;
    }

    const stream = call.streams.find((stream) => stream.id === participantId);
    if (! stream) {
      return;
    }

    dispatch(requestStartStream());

    const startStreamResponse = await ApiClient.post<Resource<Stream>>({
        url: `/call/${
        call.id
      }/stream/start-extraction`,
      payload: {
        callId: call.id,
        resourceType: stream.type,
        participantId: stream.id,
        participantGraphId: stream.participantGraphId,
        protocol: protocol,
        latency: (config as StreamSrtConfiguration).latency,
        mode: (config as StreamSrtConfiguration).mode,
        streamUrl: config.streamUrl || null,
        streamKey: config.streamKey || null,
        timeOverlay: config.timeOverlay,
        audioFormat: config.audioFormat,
        keyLength: (config as StreamSrtConfiguration).keyLength
      },
      isSecured: true
    });

    dispatch(requestStartStreamFinished({payload: startStreamResponse}));

    /*
      TODO: Review
      We should analyze how to handle UI state in the application state, to improve the semantic
      of the code, and make it more readable or understandable.
    */
    dispatch(closeNewStreamDrawer());
  };

export const stopStreamAsync = ({callId, type, participantId, participantName} : StopStreamRequest) : ThunkAction < void,
  IAppState,
  undefined,
  AnyAction > => async (dispatch, getState) => {
    const state = getState();
    const call = state.calls.activeCalls.find((o) => o.id === callId);
    if (! call) {
      return;
    }

    const stream = call.streams.find((o) => o.id === participantId);
    if (! stream) {
      return;
    }

    dispatch(requestStopStream());

    // call api
    const stopStreamResponse = await ApiClient.post<Resource<Stream>>({
        url: `/call/${
        call.id
      }/stream/stop-extraction`,
      isSecured: true,
      payload: {
        callId: call.id,
        resourceType: stream.type,
        participantId: stream.id,
        participantGraphId: stream.participantGraphId
      }
    });

    dispatch(requestStopStreamFinished({payload: stopStreamResponse}));
  };

export const getActiveCallsAsync = () : ThunkAction < void,
  IAppState,
  undefined,
  AnyAction > => async (dispatch, getState) => {
    dispatch(requestActiveCalls());

    const activeCallsResponse = await ApiClient.get<Call[]>({url: '/call/active', isSecured: true});

    dispatch(requestActiveCallsFinished({payload: activeCallsResponse}));
  };

export const refreshStreamKeyAsync = (callId: string) : ThunkAction<
  void,
  IAppState,
  undefined,
  AnyAction> => async (dispatch, getState) => {
    dispatch(requestRefreshStreamKey());

    const refreshStreamKeyResponse = await ApiClient.post<CallStreamKey>({
      url: `/call/${callId}/generate-stream-key`,
      isSecured: true,
    });

    dispatch(requestRefreshStreamKeyFinished({payload: refreshStreamKeyResponse}));
};

export const startInjectionAsync = ({
    callId,
    streamUrl,
    streamKey,
    protocol,
    mode,
    latency,
    enableSsl,
    keyLength
  } : NewInjectionStream) : ThunkAction < void,
  IAppState,
  undefined,
  AnyAction > => async (dispatch, getState) => { // TODO: Review this action dispatch(injectionRequestCancelled());

    dispatch(requestStartInjectionStream());
    // Call API
    const startInjectionResponse = await ApiClient.post<InjectionStream>({
      url: `/call/${callId}/stream/start-injection`,
      isSecured: true,
      payload: {
        callId,
        streamUrl,
        streamKey,
        protocol,
        mode,
        latency,
        enableSsl,
        keyLength
      }
    });

    dispatch(requestStartInjectionStreamFinished({payload: startInjectionResponse}));

    dispatch(closeNewInjectionStreamDrawer());
  };

export const stopInjectionAsync = (callId : string, streamId : string) : ThunkAction < void,
  IAppState,
  undefined,
  AnyAction > => async (dispatch, getState) => {
    dispatch(requestStartInjectionStream());

    const startInjectionResponse = await ApiClient.post<InjectionStream>({url: `/call/${callId}/stream/${streamId}/stop-injection`, isSecured: true});

    dispatch(requestStartInjectionStreamFinished({payload: startInjectionResponse}));
  };

export const muteBotAsync = (callId : string) : ThunkAction < void,
  IAppState,
  undefined,
  AnyAction > => async (dispatch, getState) => {
    dispatch(requestMuteBot());

    const muteBotResponse = await ApiClient.post<InjectionStream>({url: `/call/${callId}/mute`, isSecured: true});

    dispatch(requestMuteBotFinished({payload: muteBotResponse}));
  };

export const unmuteBotAsync = (callId : string) : ThunkAction < void,
  IAppState,
  undefined,
  AnyAction > => async (dispatch, getState) => {
    dispatch(requestUnmuteBot());

    const muteBotResponse = await ApiClient.post<InjectionStream>({url: `/call/${callId}/unmute`, isSecured: true});

    dispatch(requestUnmuteBotFinished({payload: muteBotResponse}));
  };
