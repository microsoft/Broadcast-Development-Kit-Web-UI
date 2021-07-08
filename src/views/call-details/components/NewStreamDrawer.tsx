// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import React, { ReactText, useReducer } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Drawer, Button, Input, Radio, InputNumber, Alert, Switch, Select } from 'antd';
import IAppState from '../../../services/store/IAppState';
import './NewStreamDrawer.css';
import { selectNewStreamDrawerProps } from '../../../stores/calls/selectors';
import { useParams } from 'react-router-dom';
import { StartStreamRequest, StreamConfiguration, StreamMode, StreamProtocol, StreamSrtConfiguration, StreamType } from '../../../models/calls/types';
import { closeNewStreamDrawer } from '../../../stores/calls/actions';
import { startStreamAsync } from '../../../stores/calls/asyncActions';

enum ViewMode {
  Simple,
  Advanced,
}

interface DrawerState {
  protocol?: StreamProtocol;
  flow?: StreamType;
  url?: string;
  mode?: StreamMode;
  port?: string;
  passphrase?: string;
  latency?: number;
  followSpeakerAudio?: boolean;
  showAdvanced?: boolean;
  viewMode?: ViewMode;
  unmixedAudio?: boolean;
  audioFormat?: number;
  timeOverlay?: boolean;
}

const NewStreamDrawer: React.FC = () => {
  const dispatch = useDispatch();
  const { id: callId } = useParams<{ id: string }>();
  const drawerProps = useSelector((state: IAppState) => selectNewStreamDrawerProps(state, callId));

  const visible = !!drawerProps.newStream;

  //Warning! It wasn't tested with nested objects
  const [state, setState] = useReducer(
    (state: DrawerState, newState: Partial<DrawerState>) => ({ ...state, ...newState }),
    { viewMode: ViewMode.Simple,}
  );

  const loadDefaultSettings = () => {
    const protocol = drawerProps.call?.defaultProtocol || StreamProtocol.SRT;
    const passphrase = protocol === StreamProtocol.SRT ? drawerProps.newStream?.advancedSettings.key : '';
    const latency = drawerProps.newStream?.advancedSettings.latency;
    const url = '';
    const mode = StreamMode.Listener;
    const unmixedAudio = drawerProps.newStream?.advancedSettings.unmixedAudio;
    const audioFormat = 0;
    const timeOverlay = true;
    
    setState({ protocol, passphrase, latency, url, mode, unmixedAudio, audioFormat, timeOverlay });
  };
  
  const handleChange = (e: any) => {
    setState({ [e.target.name]: e.target.value });
  };

  const handleLatencyChange = (value?: ReactText) => {
    const latency = parseInt(value?.toString() ?? '0', 10);
    setState({ latency: latency });
  };

  const handleSwitch = (checked: boolean) => {
    setState({ followSpeakerAudio: checked });
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

  const handleUnmixedAudioChange = (e: any) => {
    setState({ unmixedAudio: e.target.value });
  };

  const handleAudioFormatChange = (value: any) => {
    setState({ audioFormat: value });
  };

  const handleTimeOverlayChange = (checked: boolean) => {
    setState({ timeOverlay: checked });
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
        } as StreamSrtConfiguration;
      case StreamProtocol.RTMP:
        return {
          unmixedAudio: state.unmixedAudio,
          streamKey: state.passphrase,
          streamUrl: state.url,
          audioFormat: state.audioFormat,
          timeOverlay: state.timeOverlay,
        } as StreamConfiguration;
      default:
        return {};
    }
  };

  const renderCommonSettings = () => {
    const demuxedWarning = (
      <span>
        Forces to capture this participant&apos;s audio stream.
        <br />
        <strong>If the audio is not available at any moment, no audio will be streamed.</strong>
      </span>
    );

    return (
      <>
        <div className="NewStreamSettingBox">
          <span className="NewStreamSettingText">Audio settings</span>
          <div className="NewStreamSettingControl">
            <span className="NewStreamSettingTopLabel">Audio capture mode</span>
            <Radio.Group value={state.unmixedAudio} onChange={handleUnmixedAudioChange}>
              <Radio.Button value={false}>Mixed audio</Radio.Button>
              <Radio.Button value={true}>Only Participant&apos;s audio</Radio.Button>
            </Radio.Group>
            {state.unmixedAudio ? (
              <Alert style={{ marginTop: '5%' }} message={demuxedWarning} type="warning" showIcon />
            ) : null}
          </div>
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

  return(
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
            <span className="NewStreamSettingText">Stream Url</span>
            <div>
              <Input className="NewStreamInput" name="url" value={state.url} onChange={handleChange} />
            </div>
          </div>

          <div className="NewStreamSettingBox">
            <span className="NewStreamSettingText">Stream Key</span>
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

          {renderCommonSettings()}
        </>
      )}
    </div>
  </Drawer>
  )
}

export default NewStreamDrawer;
