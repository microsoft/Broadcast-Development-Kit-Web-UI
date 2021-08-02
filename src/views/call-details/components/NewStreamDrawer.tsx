// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import React, { ReactText, useReducer } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Drawer, Button, Input, Radio, InputNumber, Alert, Switch, Select, Tooltip } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import IAppState from '../../../services/store/IAppState';
import './NewStreamDrawer.css';
import { selectNewStreamDrawerProps } from '../../../stores/calls/selectors';
import { useParams } from 'react-router-dom';
import {
  StartStreamRequest,
  StreamConfiguration,
  StreamMode,
  StreamProtocol,
  StreamSrtConfiguration,
  StreamType,
  KeyLength,
  RtmpMode,
} from '../../../models/calls/types';
import { closeNewStreamDrawer } from '../../../stores/calls/actions';
import { refreshStreamKeyAsync, startStreamAsync } from '../../../stores/calls/asyncActions';

enum ViewMode {
  Simple,
  Advanced,
}

interface DrawerState {
  protocol?: StreamProtocol;
  flow?: StreamType;
  url?: string;
  mode?: StreamMode | RtmpMode;
  port?: string;
  passphrase?: string;
  latency?: number;
  followSpeakerAudio?: boolean;
  showAdvanced?: boolean;
  viewMode?: ViewMode;
  unmixedAudio?: boolean;
  audioFormat?: number;
  timeOverlay?: boolean;
  keyLength?: KeyLength;
  enableSsl?: boolean;
}

const NewStreamDrawer: React.FC = () => {
  const dispatch = useDispatch();
  const { id: callId } = useParams<{ id: string }>();
  const drawerProps = useSelector((state: IAppState) => selectNewStreamDrawerProps(state, callId));

  const visible = !!drawerProps.newStream;

  const rtmpPushStreamKey = drawerProps.call?.privateContext?.streamKey ?? '';

  //Warning! It wasn't tested with nested objects
  const [state, setState] = useReducer(
    (state: DrawerState, newState: Partial<DrawerState>) => ({ ...state, ...newState }),
    { viewMode: ViewMode.Simple }
  );

  const loadDefaultSettings = () => {
    const protocol = drawerProps.call?.defaultProtocol || StreamProtocol.SRT;
    const passphrase = protocol === StreamProtocol.SRT ? drawerProps.newStream?.advancedSettings.key : '';
    const latency = drawerProps.newStream?.advancedSettings.latency;
    const url = '';
    const mode = protocol === StreamProtocol.RTMP ? RtmpMode.Pull : StreamMode.Listener;
    const unmixedAudio = drawerProps.newStream?.advancedSettings.unmixedAudio;
    const audioFormat = 0;
    const timeOverlay = true;
    const keyLength = drawerProps.newStream?.advancedSettings.keyLength || KeyLength.None;
    const enableSsl = drawerProps.newStream?.advancedSettings.enableSsl;

    setState({
      protocol,
      passphrase,
      latency,
      url,
      mode,
      unmixedAudio,
      audioFormat,
      timeOverlay,
      keyLength,
      enableSsl,
    });
  };

  const handleChange = (e: any) => {
    setState({ [e.target.name]: e.target.value });
  };

  const handleLatencyChange = (value?: ReactText) => {
    const latency = parseInt(value?.toString() ?? '0', 10);
    setState({ latency: latency });
  };

  const handleSwitchSsl = (checked: boolean) => {
    setState({ enableSsl: checked });
  };

  const handleClose = () => {
    dispatch(closeNewStreamDrawer());
  };

  const handleSave = () => {
    if (!drawerProps.newStream) {
      return;
    }

    const config = getStreamConfiguration(state) as StreamConfiguration;

    const newStream: StartStreamRequest = {
      callId: drawerProps.newStream.callId,
      type: drawerProps.newStream.streamType,
      participantId: drawerProps.newStream.participantId,
      protocol: state.protocol || StreamProtocol.SRT,
      config,
    };

    dispatch(startStreamAsync(newStream));
  };

  const handleAudioFormatChange = (value: any) => {
    setState({ audioFormat: value });
  };

  const handleTimeOverlayChange = (checked: boolean) => {
    setState({ timeOverlay: checked });
  };

  const handleKeyLengthSelect = (keyLength: number) => {
    setState({ keyLength });
  };

  const handleRefreshStreamKey = () => {
    dispatch(refreshStreamKeyAsync(callId));
  };

  const getKeyLengthValues = () => {
    return Object.keys(KeyLength).filter((k) => typeof KeyLength[k as any] !== 'number');
  };

  const getStreamConfiguration = (state: DrawerState) => {
    switch (state.protocol) {
      case StreamProtocol.SRT:
        return {
          mode: state.mode,
          latency: state.latency,
          streamKey: state.passphrase,
          streamUrl: state.url,
          unmixedAudio: state.unmixedAudio,
          audioFormat: state.audioFormat,
          timeOverlay: state.timeOverlay,
          keyLength: state.passphrase ? state.keyLength : KeyLength.None,
        } as StreamSrtConfiguration;
      case StreamProtocol.RTMP:
        return {
          mode: state.mode,
          unmixedAudio: state.unmixedAudio,
          streamUrl: state.mode === RtmpMode.Push ? state.url : null,
          streamKey: state.mode === RtmpMode.Push ? state.passphrase : null,
          audioFormat: state.audioFormat,
          timeOverlay: state.timeOverlay,
          enableSsl: state.enableSsl,
        } as StreamConfiguration;
      default:
        return {};
    }
  };

  const renderCommonSettings = () => {
    return (
      <>
        <div className="NewStreamSettingBox">
          <div className="NewStreamSettingControl">
            <span className="NewStreamSettingTopLabel">Audio format</span>
            <Select value={state.audioFormat} onChange={handleAudioFormatChange}>
              <Select.Option value={0}>AAC 44100Hz</Select.Option>
              <Select.Option value={1}>AAC 48000Hz</Select.Option>
            </Select>
          </div>
        </div>
        <div className="NewStreamSettingBox">
          <span className="NewStreamSettingText">Video settings</span>
          <div className="NewStreamSettingControl">
            <span className="NewStreamSettingInlineLabel">Add time overlay in the video:</span>
            <Switch onChange={handleTimeOverlayChange} checked={state.timeOverlay} />
          </div>
        </div>
      </>
    );
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
        <div id="NewStreamDrawerFooter">
          <div id="NewStreamDrawerFooterInner">
            <Button onClick={handleSave} className="DrawerButton" type="primary">
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
        <div>
          <span className="selectedFlowText">Selected flow:</span>
          <p>{`Following ${drawerProps.newStream?.participantName}`}</p>
        </div>

        {state.protocol === StreamProtocol.SRT && (
          <>
            <div className="NewStreamSettingBox">
              <div>
                <Radio.Group name="viewMode" value={state.viewMode} onChange={handleChange}>
                  <Radio.Button value={ViewMode.Simple}>Default settings</Radio.Button>
                  <Radio.Button value={ViewMode.Advanced}>Advanced settings</Radio.Button>
                </Radio.Group>
              </div>
            </div>

            {state.viewMode === ViewMode.Advanced ? (
              <div>
                <div className="NewStreamSettingBox">
                  <span className="NewStreamSettingText">Mode</span>
                  <div>
                    <Radio.Group name="mode" value={state.mode} onChange={handleChange}>
                      <Radio.Button value={StreamMode.Listener}>Listener</Radio.Button>
                      <Radio.Button value={StreamMode.Caller}>Caller</Radio.Button>
                    </Radio.Group>
                  </div>
                </div>

                {state.mode === StreamMode.Caller ? (
                  <div className="NewStreamSettingBox">
                    <span className="NewStreamSettingText">Insert your SRT URL</span>
                    <div>
                      <Input
                        className="NewStreamInput"
                        placeholder="Stream url"
                        name="url"
                        value={state.url}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                ) : null}

                <div className="NewStreamSettingBox">
                  <span className="NewStreamSettingText">Latency</span>
                  <div>
                    <InputNumber
                      className="NewStreamInput"
                      min={0}
                      defaultValue={0}
                      name="latency"
                      value={state.latency}
                      onChange={handleLatencyChange}
                    />
                  </div>
                </div>

                <div className="NewStreamSettingBox">
                  <span className="NewStreamSettingText">Passphrase</span>
                  <div>
                    <Input.Password
                      className="NewStreamInput"
                      min={0}
                      defaultValue={0}
                      name="passphrase"
                      value={state.passphrase}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="NewStreamSettingBox">
                  <span className="NewStreamSettingText">Key Length</span>
                  <Select
                    className="NewStreamInput"
                    value={state.keyLength || KeyLength.None}
                    onChange={handleKeyLengthSelect}
                    disabled={!state.passphrase}
                  >
                    {getKeyLengthValues().map((value) => (
                      <Select.Option key={value} value={parseInt(value)}>
                        {parseInt(value) ? `${value} bytes` : 'no-key'}
                      </Select.Option>
                    ))}
                  </Select>
                </div>

                {renderCommonSettings()}
              </div>
            ) : (
              <div>
                <div className="NewStreamSettingBox settingsText">
                  <span className="NewStreamSettingText">
                    By pressing &quot;Start&quot; a new stream will be created with the default settings set for this
                    call. To edit them, switch to advanced.
                  </span>
                </div>
              </div>
            )}
          </>
        )}

        {state.protocol === StreamProtocol.RTMP && (
          <>
            <div className="NewStreamSettingBox">
              <span className="NewStreamSettingText">Mode</span>
              <div>
                <Radio.Group name="mode" value={state.mode} onChange={handleChange}>
                  <Radio.Button value={RtmpMode.Pull}>Pull</Radio.Button>
                  <Radio.Button value={RtmpMode.Push}>Push</Radio.Button>
                </Radio.Group>
              </div>
            </div>
            {state.mode === RtmpMode.Push && (
              <div className="NewStreamSettingBox">
                <span className="NewStreamSettingText">Stream Url</span>
                <div>
                  <Input className="NewStreamInput" name="url" value={state.url} onChange={handleChange} />
                </div>
              </div>
            )}
            {state.mode === RtmpMode.Pull && (
              <div className="NewStreamSettingBox">
                <span className="NewStreamSettingText">Enable Ssl</span>
                <Switch onChange={handleSwitchSsl} />
              </div>
            )}
            <div className="NewStreamSettingBox">
              <span className="NewStreamSettingText">Stream Key</span>
              <div>
                <Input.Password
                  className="NewStreamInput"
                  name="passphrase"
                  value={state.mode === RtmpMode.Pull ? rtmpPushStreamKey : state.passphrase}
                  onChange={handleChange}
                  contentEditable={state.mode === RtmpMode.Push}
                />
                {state.mode === RtmpMode.Pull && (
                  <Tooltip title="Refresh Stream Key">
                    <Button
                      type="primary"
                      shape="circle"
                      icon={<ReloadOutlined />}
                      style={{ marginLeft: 10 }}
                      onClick={handleRefreshStreamKey}
                    ></Button>
                  </Tooltip>
                )}
              </div>
            </div>

            {renderCommonSettings()}
          </>
        )}
      </div>
    </Drawer>
  );
};

export default NewStreamDrawer;
