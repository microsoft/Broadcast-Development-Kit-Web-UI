import React from 'react';
import {useSelector } from 'react-redux';
import IAppState from '../../../services/store/IAppState';
import StreamCard from './StreamCard';
import './CallStreams.css';
import NewStreamPopUpDrawer from './NewStreamDrawer';
import InjectionCard from './InjectionCard';
import { useParams } from 'react-router-dom';
import { selectCallStreams } from '../../../stores/calls/selectors';
import { Stream } from '../../../models/calls/types';
import { CallStreamsProps } from '../types';


const CallStreams: React.FC = () => {
  const { id: callId } = useParams<{id: string}>();
  const callStreams = useSelector((state: IAppState) => selectCallStreams(state, callId));

  if (!callStreams.mainStreams.length && !callStreams.participantStreams.length && !callStreams.activeStreams.length) {
    // Empty Call?
    return null;
  }

  const hasMainStreams = callStreams.mainStreams.length > 0;
  const hasParticipants = callStreams.participantStreams.length > 0;
  const hasActiveStreams = callStreams.activeStreams.length > 0;

  return (
    <div id="CallStreams">
      <NewStreamPopUpDrawer />

      <h3>Injection Stream</h3>
      <InjectionCard callStreams={callStreams}></InjectionCard>
      <h3>Active Streams</h3>
      {(hasActiveStreams && renderStreams(callStreams.activeStreams, callStreams)) || (
        <p>
          <em>Start a stream from below</em>
        </p>
      )}

      {hasMainStreams && (
        <>
          <h3>Main Streams</h3>
          {renderStreams(callStreams.mainStreams, callStreams)}
        </>
      )}

      {hasParticipants && (
        <>
          <h3>Participants</h3>
          {renderStreams(callStreams.participantStreams, callStreams)}
        </>
      )}

      <br className="break" />
    </div>
  );
};

const renderStreams = (streams: Stream[], callStreams: CallStreamsProps): React.ReactElement[] =>
  streams.map((stream) => (
    <StreamCard stream={stream} key={stream.id} callStreams={callStreams} callProtocol={callStreams.callProtocol} />
  ));

export default CallStreams;
