import React, { useEffect, useState, createRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router';
import moment from 'moment';
import { Radio, Button, Badge, Typography, Form, Input, InputNumber, Popconfirm } from 'antd';
import { Rule, FormInstance } from 'antd/lib/form';
import EditIcon from '@material-ui/icons/Edit';
import SaveIcon from '@material-ui/icons/Save';
import CloseIcon from '@material-ui/icons/Close';

import IAppState from '../../../services/store/IAppState';

import CallSelector from './CallSelector';

import './CallInfo.css';
import { selectCallInfoProps } from '../../../stores/calls/selectors';
import { disconnectCallAsync } from '../../../stores/calls/asyncActions';
import {
  CallDefaults,
  CallState,
  CallType,
  StreamProtocol,
  StreamState,
  StreamType,
} from '../../../models/calls/types';
import { updateCallDefaults } from '../../../stores/calls/actions';
import { CallInfoProps } from '../types';

const { Text } = Typography;
const { Item } = Form;

const CallInfo: React.FC = () => {
  const dispatch = useDispatch();
  const { id: callId } = useParams<{ id: string }>();
  const callInfoProps: CallInfoProps = useSelector((state: IAppState) => selectCallInfoProps(state, callId));
  // disconnect
  const disconnect = () => {
    console.log('disconnect');
    dispatch(disconnectCallAsync(callId));
  };

  // update settings
  const onDefaultsUpdated = (newDefaults: unknown) => {
    // invoke an asyncAction that will update on API
    console.log('newDefaults', newDefaults);

    dispatch(
      updateCallDefaults({
        callId,
        defaults: newDefaults as CallDefaults,
      })
    );

    toggleEditMode();
  };

  // edit state
  const [editingDefaults, setEditingDefaults] = useState(false);
  const [editingProtocol, setEditingProtocol] = useState(callInfoProps.call?.defaultProtocol ?? StreamProtocol.SRT);
  const toggleEditMode = () => setEditingDefaults(!editingDefaults);

  const formRef = createRef<FormInstance>();
  useEffect(() => {
    if (callInfoProps.call)
      formRef.current?.setFieldsValue({
        protocol: callInfoProps.call.defaultProtocol,
        latency: callInfoProps.call.defaultLatency,
        passphrase: callInfoProps.call.defaultPassphrase,
      });
  }, [callInfoProps.call?.id, editingDefaults]);

  // no call, nothing to see
  if (!callInfoProps.call) {
    return null;
  }

  // time formating
  const creationDate = moment(callInfoProps.call.createdAt);
  const datePart = creationDate.format('L'); // 07/03/2020
  const timePart = creationDate.format('LTS'); // 5:29:19 PM
  const formattedCreationDate = datePart + ' ' + timePart;

  const connected = callInfoProps.call.state === CallState.Established;
  const participantsLength = callInfoProps.call.streams.filter(
    (stream) => stream.type === StreamType.Participant
  ).length;
  const activeStreams = callInfoProps.call.streams.filter((stream) =>
    [StreamState.Stopping, StreamState.Starting, StreamState.Started].includes(stream.state)
  ).length;

  const protocols = Object.keys(StreamProtocol).filter((i) => !isNaN(parseInt(i)));

  const baseRules = {
    protocol: [{ type: 'string', required: true } as Rule],
    latency: [],
    passphrase: [],
  };

  const rules =
    editingProtocol === StreamProtocol.RTMP
      ? baseRules
      : {
          ...baseRules,
          latency: [{ type: 'integer', required: true } as Rule],
          passphrase: [{ type: 'string' } as Rule],
        };

  const hasActiveStreams = callInfoProps.streams.find(
    (o) => o.state === StreamState.Started || o.state === StreamState.Stopping || o.state === StreamState.Starting
  )
    ? true
    : false;

  return (
    <Form onFinish={onDefaultsUpdated} ref={formRef}>
      <div id="CallInfo" className="PageBody">
        <div id="CallInfoSettings">
          <CallSelector />
          <Popconfirm
            placement="right"
            title="Proceed to disconnect the bot from this call?"
            onConfirm={disconnect}
            disabled={!connected}
          >
            <Button className="CallSetting" type="primary" danger={true} disabled={!connected}>
              Disconnect Call
            </Button>
          </Popconfirm>
        </div>

        <div id="CallInfoProperties">
          <span className="CallInfoProperty">
            Status:
            <strong>
              {renderStatusBadge(callInfoProps.call.state)}
              {CallState[callInfoProps.call.state]}
            </strong>
          </span>
          {connected && (
            <>
              <span className="CallInfoProperty">
                <strong>
                  {activeStreams} active stream{activeStreams > 1 ? 's' : null}
                </strong>
              </span>

              <span className="CallInfoProperty">
                <br />
              </span>
              <span className="CallInfoProperty">
                <Text copyable={{ text: callInfoProps.call.joinUrl }}>Invite Link</Text>
              </span>
              <span className="CallInfoProperty">
                Call type:&nbsp;
                <strong>
                  {CallType[callInfoProps.call.meetingType]} - ({participantsLength} participant
                  {participantsLength !== 1 ? 's' : null})
                </strong>
              </span>
              <span className="CallInfoProperty">
                Created:&nbsp;<strong>{formattedCreationDate}</strong>
              </span>

              {/* Defaults - READ Mode */}
              {connected && !editingDefaults && (
                <div id="CallInfoForm">
                  <span className="CallInfoProperty">
                    Default protocol:&nbsp;
                    <strong>
                      <Text>{StreamProtocol[callInfoProps.call.defaultProtocol]}</Text>
                    </strong>
                  </span>

                  {/* TODO: Switch options based on protocol */}
                  {callInfoProps.call.defaultProtocol === StreamProtocol.SRT && (
                    <>
                      <span className="CallInfoProperty">
                        Default latency:&nbsp;
                        <strong>
                          <Text>{callInfoProps.call.defaultLatency}ms</Text>
                        </strong>
                      </span>
                      {callInfoProps.call.defaultPassphrase && (
                        <span className="CallInfoProperty">
                          <Text copyable={{ text: callInfoProps.call.defaultPassphrase }}>Default passphrase</Text>
                        </span>
                      )}
                    </>
                  )}
                  {callInfoProps.call.botFqdn && (
                    <span className="CallInfoProperty">
                      Bot FQDN:&nbsp;
                      <strong>
                        <Text copyable>{callInfoProps.call.botFqdn}</Text>
                      </strong>
                    </span>
                  )}
                  {callInfoProps.call.botIp && (
                    <span className="CallInfoProperty">
                      Bot IP:&nbsp;
                      <strong>
                        <Text copyable>{callInfoProps.call.botIp}</Text>
                      </strong>
                    </span>
                  )}
                </div>
              )}

              {/* Defaults - EDIT Mode */}
              {connected && editingDefaults && (
                <div id="CallInfoForm">
                  <strong>Defaults</strong>

                  <Item label="Protocol:" name="protocol" labelAlign="left" hasFeedback>
                    <Radio.Group value={editingProtocol} onChange={(e) => setEditingProtocol(e.target.value)}>
                      {protocols.map((p, index) => (
                        <Radio.Button key={p} value={parseInt(p)}>
                          {StreamProtocol[index]}
                        </Radio.Button>
                      ))}
                    </Radio.Group>
                  </Item>

                  {/* Based on selected Protocol */}
                  {
                    {
                      [StreamProtocol.SRT]: (
                        <>
                          <Item label="Latency:" name="latency" rules={rules.latency} labelAlign="left" hasFeedback>
                            <InputNumber min={1} max={2000} placeholder="(ms)" />
                          </Item>
                          <Item
                            label="Passphrase:"
                            name="passphrase"
                            rules={rules.passphrase}
                            labelAlign="left"
                            hasFeedback
                          >
                            <Input.Password />
                          </Item>
                        </>
                      ),
                      [StreamProtocol.RTMP]: <div className="rtmpProtocol"></div>,
                    }[editingProtocol]
                  }
                </div>
              )}
            </>
          )}
        </div>

        <div id="CallInfoOptions">
          {connected && !editingDefaults && (
            <Button
              type="primary"
              shape="circle"
              icon={<EditIcon />}
              size="large"
              onClick={toggleEditMode}
              disabled={hasActiveStreams}
            />
          )}
          {connected && editingDefaults && (
            <>
              <Button type="primary" shape="circle" icon={<SaveIcon />} size="large" htmlType="submit" />
              <br />
              <Button type="default" shape="circle" icon={<CloseIcon />} size="large" onClick={toggleEditMode} />
            </>
          )}
        </div>
      </div>
    </Form>
  );
};

export enum CallStateBadge {
  yellow = CallState.Establishing,
  green = CallState.Established,
  orange = CallState.Terminating,
  gray = CallState.Terminated,
}

const renderStatusBadge = (status: CallState): React.ReactElement => (
  <Badge className="CallInfoStatusBadge" status="default" color={CallStateBadge[status]} />
);

export default CallInfo;
