// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { IconButton } from '@material-ui/core';
import { Mic, MicOff } from '@material-ui/icons';
import { Avatar, Button, Col, Row, Typography } from 'antd';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { InjectionStream, StreamMode, StreamProtocol, StreamState } from '../../../models/calls/types';
import { openNewInjectionStreamDrawer } from '../../../stores/calls/actions';
import { muteBotAsync, stopInjectionAsync, unmuteBotAsync } from '../../../stores/calls/asyncActions';
import { CallStreamsProps } from '../types';
import './InjectionCard.css';

interface InjectionCardProps {
  callStreams: CallStreamsProps;
}

const avatarSize = 112;
const OBFUSCATION_PATTERN = '********';

const InjectionCard: React.FC<InjectionCardProps> = (props) => {
  const dispatch = useDispatch();
  const { callStreams } = props;
  const callId = callStreams.callId;
  const stream = callStreams.injectionStream;
  const streamId = stream?.id;
  const hasStream = callStreams.injectionStream && stream?.state !== StreamState.Disconnected;

  const startInjection = () => {
    if (callId) {
      dispatch(
        openNewInjectionStreamDrawer({
          callId,
        })
      );
    }
  };

  const stopInjection = () => {
    if (callId && streamId) {
      dispatch(stopInjectionAsync(callId, streamId));
    }
  };
  const [audioMuted, setAudioMuted] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const toggleExpand = () => setExpanded(!expanded);

  // collapse disabled streams
  if (expanded && !stream) {
    setExpanded(false);
  }

  const classes = ['injectionCard', getConnectionClass(stream), expanded ? 'expanded' : ''];
  const status = getConnectionStatus(stream);
  const injectionUrl = stream ? getInjectionUrl(stream) : '';

  const protocolText = () => {
    switch (stream?.protocol) {
      case StreamProtocol.RTMP:
        return 'RTMP';
      case StreamProtocol.SRT:
        return 'SRT';
      default:
        return '';
    }
  };

  const streamModeText = () => {
    switch (stream?.streamMode) {
      case StreamMode.Caller:
        return stream?.protocol === StreamProtocol.RTMP ? 'Pull' : 'Caller';
      case StreamMode.Listener:
        return stream?.protocol === StreamProtocol.RTMP ? 'Push' : 'Listener';
      default:
        return '';
    }
  };

  const toggleBotAudio = () => {
    if (callId) {
      if (!audioMuted) {
        dispatch(muteBotAsync(callId));
        setAudioMuted(true);
      } else {
        dispatch(unmuteBotAsync(callId));
        setAudioMuted(false);
      }
    }
  };

  return (
    <div className={classes.join(' ')}>
      <div className="injectionCardContent">
        <Row>
          <Col>
            <Avatar size={avatarSize} icon="IS"></Avatar>
          </Col>
          <Col className="injectionMain">
            <h4>Injection Stream</h4>
            <span className="InjectionState">{status}</span>
            <Row justify="space-between" align="bottom" gutter={0} className="injectionActions">
              <Col span={12}>
                <IconButton onClick={toggleBotAudio}>{audioMuted ? <MicOff /> : <Mic />}</IconButton>
              </Col>
              <Col span={12} className="injectionOptions">
                <Button
                  type="primary"
                  shape="round"
                  onClick={stream == null ? startInjection : stopInjection}
                  disabled={!callStreams.callEnabled || stream?.state == StreamState.Starting}
                >
                  {stream == null ? 'START' : 'STOP'}
                </Button>
              </Col>
            </Row>
          </Col>
        </Row>
        <Row>
          <Col className="streamDetails">
            {stream && (
              <>
                <div>
                  Injection URL:
                  <strong>
                    <Typography.Text copyable={{ text: stream?.injectionUrl }}>{'' + injectionUrl}</Typography.Text>
                  </strong>
                </div>
                {stream.protocol === StreamProtocol.SRT && (
                  <>
                    <div>
                      Passphrase:{' '}
                      <strong>
                        <Typography.Text copyable={stream.passphrase ? { text: stream.passphrase } : false}>
                          {stream.passphrase ?  '********' : 'None'}
                        </Typography.Text>
                      </strong>
                    </div>
                    <div>
                      Latency: <strong>{stream.latency}ms</strong>
                    </div>
                  </>
                )}
                <div>
                  Protocol: <strong>{protocolText()}</strong>
                </div>
                <div>
                  Stream Mode: <strong>{streamModeText()}</strong>
                </div>
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

const getConnectionClass = (stream: InjectionStream | null): string => {
  switch (stream?.state) {
    case StreamState.Stopping:
      return 'disconnected';
    case StreamState.Disconnected:
      return 'disconnected';
    case StreamState.Starting:
      return 'initializing';
    case StreamState.Started:
      return 'established';
    case StreamState.Error:
    case StreamState.StartingError:
    case StreamState.StoppingError:
      return 'error';
    default:
      return '';
  }
};

const getConnectionStatus = (stream: InjectionStream | null): string => {
  switch (stream?.state) {
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
      return 'Active Stream';
    default:
      return 'Available Stream';
  }
};

const getInjectionUrl = (stream: InjectionStream): string => {
  if (stream.protocol === StreamProtocol.RTMP && stream.injectionUrl) {
    const rtmpUrl = stream.injectionUrl.replace(stream.passphrase, OBFUSCATION_PATTERN);

    return rtmpUrl;
  }

  return stream.injectionUrl ?? '';
};

export default InjectionCard;
