import { Call, InjectionStream, NewInjectionStream, NewStream, Stream, StreamProtocol } from "../../models/calls/types";

export interface NewInjectionStreamDrawerProps {
  call: Call | null;
  newInjectionStream: NewInjectionStream | null;
}

export interface NewStreamDrawerProps {
  call: Call | null;
  newStream: NewStream | null;
}

export interface CallInfoProps {
  call: Call | null;
  streams: Stream[];
}

export interface CallStreamsProps {
  callId: string;
  callEnabled: boolean;
  mainStreams: Stream[];
  participantStreams: Stream[];
  activeStreams: Stream[];
  injectionStream: InjectionStream | null;
  primarySpeakerEnabled: boolean;
  stageEnabled: boolean;
  callProtocol: StreamProtocol;
}