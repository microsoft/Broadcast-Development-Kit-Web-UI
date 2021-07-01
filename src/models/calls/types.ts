// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
export interface Call {
  id: string;
  joinUrl: string;
  displayName: string; // Call/Room name
  state: CallState; // Initializing, Established, Terminating, Terminated
  errorMessage: string | null; // Error message (if any)
  createdAt: Date;
  meetingType: CallType; // Unknown, Normal, Event
  botFqdn: string | null;
  botIp: string | null;
  connectionPool: ConnectionPool;
  defaultProtocol: StreamProtocol;
  defaultPassphrase: string;
  defaultLatency: number;
  streams: Stream[];
  injectionStream: InjectionStream | null;
  privateContext: PrivateContext | null;
}

export enum StreamProtocol {
  SRT = 0,
  RTMP = 1,
}

export enum CallState {
  Establishing,
  Established,
  Terminating,
  Terminated,
}

export enum CallType {
  Default,
  Event,
}

export interface ConnectionPool {
  used: number;
  available: number;
}

export interface Stream {
  id: string; //internal id
  callId: string;
  participantGraphId: string; //id form teams meeting
  displayName: string; // User name or Stream name
  photoUrl: string | null;
  type: StreamType; // VbSS, DominantSpeaker, Participant
  state: StreamState; // Disconnected, Initializing, Established, Disconnecting, Error
  isHealthy: boolean;
  healthMessage: string;
  isSharingScreen: boolean;
  isSharingVideo: boolean;
  isSharingAudio: boolean;
  audioMuted: boolean;
  details: StreamDetails | null;
}

export interface StartStreamRequest {
  participantId?: string;
  participantGraphId?: string;
  type: StreamType;
  callId: string;
  protocol: StreamProtocol;
  config: StreamConfiguration;
}

export interface StopStreamRequest {
  callId: string;
  type: StreamType;
  participantId?: string;
  participantGraphId?: string;
  participantName?: string;
}

export interface NewInjectionStream {
  callId: string;
  streamUrl?: string;
  streamKey?: string;
  protocol?: StreamProtocol;
  mode?: StreamMode;
  latency?: number;
  enableSsl?: boolean;
}

export interface StopInjectionRequest {
  callId: string;
  streamId: string;
}

export type StreamConfiguration = {
  streamUrl: string;
  streamKey: string;
  unmixedAudio: boolean;
  audioFormat: number;
  timeOverlay: boolean;
};

export interface StreamSrtConfiguration extends StreamConfiguration {
  mode: StreamMode;
  latency: number;
}

export interface NewCall {
  callUrl: string;
  status: CallState;
  errorMessage?: string;
}

export interface CallDefaults {
  protocol: StreamProtocol;
  latency: number;
  passphrase: string;
}

export enum StreamState {
  Disconnected,
  Starting,
  Started,
  Stopping,
  StartingError,
  StoppingError,
  Error,
}

export const ActiveStatuses = [StreamState.Started, StreamState.Stopping];

export const InactiveStatuses = [StreamState.Disconnected, StreamState.Starting];

export enum StreamType {
  VbSS,
  PrimarySpeaker,
  Participant,
}

export const SpecialStreamTypes = [StreamType.VbSS, StreamType.PrimarySpeaker];

export enum StreamMode {
  Caller = 1,
  Listener = 2,
}

export interface NewStream {
  callId: string;
  participantId?: string;
  participantName?: string;
  streamType: StreamType;
  mode?: StreamMode;
  advancedSettings: {
    url?: string;
    latency?: number;
    key?: string;
    unmixedAudio: boolean;
  };
}

export interface StreamDetails {
  streamUrl: string;
  passphrase: string;
  latency: number;
  previewUrl: string;
  audioDemuxed: boolean;
}

export interface InjectionStream {
  id: string;
  callId: string;
  injectionUrl?: string;
  protocol: StreamProtocol;
  streamMode: StreamMode;
  state?: StreamState;
  startingAt: string;
  startedAt: string;
  endingAt: string;
  endedAt: string;
  latency: number;
  passphrase: string;
  audioMuted: boolean;
}

export interface NewStreamDrawerOpenParameters {
  callId: string;
  streamType: StreamType;
  participantId?: string;
  participantName?: string;
}

export interface NewInjectionStreamDrawerOpenParameters {
  callId: string;
}

export interface PrivateContext {
  streamKey: string;
}

export interface CallStreamKey {
  callId: string;
  streamKey: string;
}
