// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Avatar, Row, Col, Button, Typography } from 'antd';
import Videocam from '@material-ui/icons/Videocam';
import VideocamOff from '@material-ui/icons/VideocamOff';
import Mic from '@material-ui/icons/Mic';
import MicOff from '@material-ui/icons/MicOff';
import ScreenShare from '@material-ui/icons/ScreenShare';
import StopScreenShare from '@material-ui/icons/StopScreenShare';
import './StreamCard.css';
import { Stream, StreamProtocol, StreamState, StreamType } from '../../../models/calls/types';
import { openNewStreamDrawer } from '../../../stores/calls/actions';
import { stopStreamAsync } from '../../../stores/calls/asyncActions';
import { CallStreamsProps } from '../types';
import { ApiClient } from '../../../services/api';
import { ApiError } from '../../../models/error/types';

interface StreamCardProps {
  callProtocol: StreamProtocol;
  stream: Stream;
  callStreams: CallStreamsProps;
}

const StreamCard: React.FC<StreamCardProps> = (props) => {
  const dispatch = useDispatch();

  const { callProtocol: protocol, stream, callStreams } = props;
  const [expanded, setExpanded] = useState(false);
  const toggleExpand = () => setExpanded(!expanded);
  const [avatartImage, setAvatartImage] = useState('');

  useEffect(() => {
    if (stream.photoUrl) {
      ApiClient.get<any>({
        url: stream.photoUrl,
        isSecured: true,
        shouldOverrideBaseUrl: true,
        config: {
          responseType: 'blob',
        },
      }).then((response) => {
        const isError = response instanceof ApiError;
        if (isError) {
          const error = response as ApiError;
          console.error(error.raw);
          return;
        }

        const urlCreator = window.URL || window.webkitURL;
        const imageUrl = urlCreator.createObjectURL(response);
        setAvatartImage(imageUrl);
      });
    }
  }, []);

  // collapse disabled streams
  if (expanded && !callStreams.callEnabled) {
    setExpanded(false);
  }

  const isStreamDisconnected = stream.state === StreamState.Disconnected;
  const toggleStreamOperation = () => {
    if (!isStreamDisconnected && expanded) {
      // active & expanded, collapse
      setExpanded(false);
    }

    if (isStreamDisconnected) {
      dispatch(
        openNewStreamDrawer({
          callId: callStreams.callId,
          streamType: stream.type,
          participantId: stream.id,
          participantName: stream.displayName,
        })
      );
    }

    if (!isStreamDisconnected) {
      dispatch(
        stopStreamAsync({
          callId: callStreams.callId,
          type: stream.type,
          participantId: stream.id,
          participantName: stream.displayName,
        })
      );
    }
  };

  const initials = stream.displayName
    .split(' ')
    .map((s) => s[0].toUpperCase())
    .join('');
  const hasStream = callStreams.callEnabled && stream.state !== StreamState.Disconnected;
  const status = getConnectionStatus(stream);

  const operationEnabled =
    callStreams.callEnabled &&
    (stream.state === StreamState.Started ||
      (stream.state === StreamState.Disconnected &&
        ((stream.type === StreamType.VbSS && callStreams.stageEnabled) ||
          (stream.type === StreamType.PrimarySpeaker && callStreams.primarySpeakerEnabled) ||
          ([StreamType.Participant, 
            StreamType.LargeGallery, 
            StreamType.LiveEvent, 
            StreamType.TogetherMode].includes(stream.type) && stream.isSharingVideo))));

  const classes = ['streamCard', getConnectionClass(stream), expanded ? 'expanded' : ''];
  const avatarSize = 112;
  const avatarIcon = avatartImage ? (
    <img src={avatartImage} style={{ width: avatarSize, height: avatarSize }} onError={() => setAvatartImage('')} />
  ) : (
    <>{initials}</>
  );

  const isRtmp = protocol === StreamProtocol.RTMP;

  return (
    <div className={classes.join(' ')}>
      <div className="streamCardContent">
        <Row>
          <Col>
            <Avatar icon={avatarIcon} size={avatarSize}></Avatar>
          </Col>
          <Col className="streamMain">
            <h4>{props.stream.displayName}</h4>
            <span className="StreamState">{status}</span>
            <Row justify="space-between" align="bottom" gutter={0} className="streamActions">
              {(stream.type === StreamType.Participant && (
                <Col span={12}>
                  {stream.isSharingVideo && <Videocam />}
                  {!stream.isSharingVideo && <VideocamOff />}
                  {stream.isSharingAudio && !stream.audioMuted && <Mic />}
                  {stream.isSharingAudio && stream.audioMuted && <MicOff />}
                  {stream.isSharingScreen && <ScreenShare />}
                  {!stream.isSharingScreen && <StopScreenShare />}
                </Col>
              )) || <Col span={12}></Col>}
              <Col span={12} className="streamOptions">
                <Button type="primary" shape="round" onClick={toggleStreamOperation} disabled={!operationEnabled}>
                  {stream.state === StreamState.Disconnected ? 'START' : 'STOP'}
                </Button>
              </Col>
            </Row>
          </Col>
        </Row>
        <Row>
          <Col className="streamDetails">
            {stream.details && (
              <>
                <div>
                  Stream URL:{' '}
                  <strong>
                    <Typography.Text copyable>{stream.details.streamUrl}</Typography.Text>
                  </strong>
                </div>

                <div>
                  {isRtmp ? 'StreamKey: ' : 'Passphrase: '}
                  <strong>
                    <Typography.Text copyable={stream.details.passphrase ? { text: stream.details.passphrase } : false}>
                      {stream.details.passphrase ? '********' : 'None'}
                    </Typography.Text>
                  </strong>
                </div>

                {!isRtmp && (
                  <div>
                    Latency: <strong>{stream.details.latency}ms</strong>
                  </div>
                )}
              </>
            )}
          </Col>
        </Row>
      </div>
      {hasStream && (
        <div className="toggler" onClick={toggleExpand}>
          <span>{expanded ? '- less info' : '+ more info'}</span>
        </div>
      )}
    </div>
  );
};

const getConnectionClass = (stream: Stream): string => {
  switch (stream.state) {
    case StreamState.Stopping:
      return 'disconnected';
    case StreamState.Disconnected:
      return 'disconnected';
    case StreamState.Starting:
      return 'initializing';
    case StreamState.Started:
      return stream.isHealthy ? 'established' : 'error';
    case StreamState.Error:
    case StreamState.StartingError:
    case StreamState.StoppingError:
      return 'error';
  }
};

const getConnectionStatus = (stream: Stream): string => {
  switch (stream.state) {
    case StreamState.Disconnected:
      return 'Available Stream';
    case StreamState.Stopping:
      return 'Stopping';
    case StreamState.Starting:
      return 'Starting';
    case StreamState.Error:
    case StreamState.StartingError:
    case StreamState.StoppingError:
      return 'Unhealthy Stream';
    case StreamState.Started:
      return stream.isHealthy ? 'Active Stream' : 'Unhealthy Stream';
  }
};

export default StreamCard;
