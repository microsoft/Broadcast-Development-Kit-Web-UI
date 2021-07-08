// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import React, { ReactText, useReducer } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router';
import { Drawer, Button, Input, Radio, InputNumber, Tooltip, Typography } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import IAppState from '../../../services/store/IAppState';
import './NewInjectionStreamDrawer.css';
import Form from 'antd/lib/form';
import { Switch } from 'antd';
import { Call, NewInjectionStream, StreamMode, StreamProtocol } from '../../../models/calls/types';
import { selectNewInjectionStreamDrawerProps } from '../../../stores/calls/selectors';
import { closeNewInjectionStreamDrawer } from '../../../stores/calls/actions';
import { startInjectionAsync, refreshStreamKeyAsync } from '../../../stores/calls/asyncActions';

interface DrawerState {
  protocol?: StreamProtocol;
  injectionUrl?: string;
  streamMode?: StreamMode;
  latency?: number;
  passphrase?: string;
  enableSsl?: boolean;
}

const DEFAULT_LATENCY = 750;
const OBFUSCATION_PATTERN = '********';

const NewInjectionStreamDrawer: React.FC = () => {
  const dispatch = useDispatch();
  const { id: callId } = useParams<{ id: string }>();
  const drawerProps = useSelector((state: IAppState) => selectNewInjectionStreamDrawerProps(state, callId));

  const visible = !!drawerProps.newInjectionStream;

  //Drawer's state 
  const initialState: DrawerState = {
    protocol: drawerProps.newInjectionStream?.protocol || StreamProtocol.SRT,
    streamMode: drawerProps.newInjectionStream?.mode || StreamMode.Caller,
    injectionUrl: drawerProps.newInjectionStream?.streamUrl,
    latency: drawerProps.newInjectionStream?.latency || DEFAULT_LATENCY,
    passphrase: drawerProps.newInjectionStream?.streamKey,
    enableSsl: drawerProps.newInjectionStream?.enableSsl,
  };

  //Warning! It wasn't tested with nested objects
  const [state, setState] = useReducer(
    (state: DrawerState, newState: Partial<DrawerState>) => ({ ...state, ...newState }),
    {}
  );

  const loadDefaultSettings = () => {
    const protocol = drawerProps.newInjectionStream?.protocol || StreamProtocol.SRT;
    const streamMode = drawerProps.newInjectionStream?.mode || StreamMode.Caller;
    const injectionUrl = drawerProps.newInjectionStream?.streamUrl;
    const latency = drawerProps.newInjectionStream?.latency || DEFAULT_LATENCY;
    const passphrase = drawerProps.newInjectionStream?.streamKey;
    const enableSsl = drawerProps.newInjectionStream?.enableSsl;

    setState({ protocol, streamMode, injectionUrl, latency, passphrase, enableSsl });
  };

  const rtmpPushStreamKey = drawerProps.call?.privateContext?.streamKey ?? '';
  const rtmpPushStreamUrl = getRtmpPushStreamUrl(drawerProps.call!, !!state.enableSsl);

  const handleChange = (e: any) => {
    setState({ [e.target.name]: e.target.value });
  };

  const handleSwitchChange = (checked: boolean) => {
    setState({ enableSsl: checked });
  };

  const handleLatencyChange = (value?: ReactText) => {
    const latency = parseInt(value?.toString() ?? '0', 10);
    setState({ latency });
  };

  const handleRefreshStremKey = () => {
    dispatch(refreshStreamKeyAsync(callId));
  };

  const handleClose = () => {
    dispatch(closeNewInjectionStreamDrawer());
  };

  const handleSave = () => {
    if (!drawerProps.newInjectionStream) {
      return;
    }

    const newInjectionStream: NewInjectionStream = {
      callId: drawerProps.newInjectionStream.callId,
      protocol: state.protocol || StreamProtocol.SRT,
      mode: state.streamMode || StreamMode.Caller,
      streamUrl: state.injectionUrl,
      latency: state.latency,
      streamKey: state.passphrase,
      enableSsl: state.enableSsl,
    };
    console.log("New injection stream request", newInjectionStream);

    dispatch(startInjectionAsync(newInjectionStream));
  };

  return (
    <Drawer
      destroyOnClose={true}
      title="Add a new stream"
      visible={visible}
      afterVisibleChange={loadDefaultSettings}
      width={'30%'}
      bodyStyle={{ height: 400 }}
      onClose={handleClose}
      footer={
        <div id="NewInjectionStreamDrawerFooter">
          <div id="NewInjectionStreamDrawerFooterInner">
            <Button className="DrawerButton" type="primary" form="injectionForm" htmlType="submit">
              Start
            </Button>
            <Button onClick={handleClose} className="DrawerButton" type="default">
              Cancel
            </Button>
          </div>
        </div>
      }
    >
      <div id="NewStreamDrawerBody">
        <Form name="injectionForm" onFinish={handleSave} layout="vertical" initialValues={initialState}>
          <div className="NewStreamSettingBox">
            <span className="selectedFlowText">Start injection</span>
          </div>

          <Form.Item label="Protocol" name="protocol">
            <Radio.Group name="protocol" value={state.protocol} onChange={handleChange}>
              <Radio.Button value={StreamProtocol.SRT}>SRT</Radio.Button>
              <Radio.Button value={StreamProtocol.RTMP}>RTMP</Radio.Button>
            </Radio.Group>
          </Form.Item>

          <Form.Item label="Mode" name="streamMode">
            <Radio.Group name="streamMode" value={state.streamMode} onChange={handleChange}>
              <Radio.Button value={StreamMode.Caller}>
                {state.protocol === StreamProtocol.SRT ? 'Caller' : 'Pull'}
              </Radio.Button>
              <Radio.Button value={StreamMode.Listener}>
                {state.protocol === StreamProtocol.SRT ? 'Listener' : 'Push'}
              </Radio.Button>
            </Radio.Group>
          </Form.Item>

          {state.streamMode === StreamMode.Caller && (
            <Form.Item
              label="Injection URL"
              name="injectionUrl"
              rules={[
                {
                  required: true,
                  whitespace: false,
                  message: 'Please add Injection URL',
                },
              ]}
            >
              <Input
                className="NewStreamInput"
                name="injectionUrl"
                value={state.injectionUrl}
                onChange={handleChange}
              />
            </Form.Item>
          )}

          {state.protocol === StreamProtocol.SRT && (
            <>
              <Form.Item label="Latency" name="latency">
                <InputNumber
                  className="NewStreamInput"
                  min={0}
                  name="latency"
                  value={state.latency}
                  onChange={handleLatencyChange}
                />
              </Form.Item>

              <Form.Item label="Passphrase" name="passphrase">
                <Input.Password
                  className="NewStreamInput"
                  name="passphrase"
                  value={state.passphrase}
                  onChange={handleChange}
                />
              </Form.Item>
            </>
          )}

          {state.protocol === StreamProtocol.RTMP && state.streamMode === StreamMode.Listener && (
            <>
              <Form.Item label="Enable Ssl">
                <Switch onChange={handleSwitchChange} />
              </Form.Item>

              <Form.Item label="Stream key">
                <Input.Password className="NewStreamInput" value={rtmpPushStreamKey} contentEditable={false} />
                <Tooltip title="Refresh Stream Key">
                  <Button
                    type="primary"
                    shape="circle"
                    icon={<ReloadOutlined />}
                    style={{ marginLeft: 10 }}
                    onClick={handleRefreshStremKey}
                  ></Button>
                </Tooltip>
              </Form.Item>

              <Form.Item label="Stream URL">
                <Typography.Text copyable={{ text: rtmpPushStreamUrl.replace(OBFUSCATION_PATTERN, rtmpPushStreamKey) }}>
                  <strong>{'' + rtmpPushStreamUrl}</strong>
                </Typography.Text>
              </Form.Item>
            </>
          )}
        </Form>
      </div>
    </Drawer>
  );
};

const getRtmpPushStreamUrl = (call: Call, enableSsl: boolean): string => {
  let protocol = 'rtmp';
  let port = 1936;

  if (enableSsl) {
    protocol = 'rtmps';
    port = 2936;
  }

  if (call) {
    const domain = call.botFqdn?.split(':')[0];
    return `${protocol}://${domain}:${port}/${OBFUSCATION_PATTERN}?callId=${call?.id}`;
  }

  return "";
};

export default NewInjectionStreamDrawer;
