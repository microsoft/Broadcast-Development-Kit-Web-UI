// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import React, { createRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Input, Button, Form, Row, Col } from "antd";
import { Store } from "antd/lib/form/interface";
import { Rule, FormInstance } from "antd/lib/form";
import HourglassEmpty from "@material-ui/icons/HourglassEmpty";

import "./JoinCall.css";
import { selectNewCall } from "../../stores/calls/selectors";
import IAppState from "../../services/store/IAppState";
import { selectRequesting } from "../../stores/requesting/selectors";
import { extractLinks } from "../../services/helpers";
import * as CallsActions from '../../stores/calls/actions';
import { joinCallAsync } from "../../stores/calls/asyncActions";
import { CallState } from "../../models/calls/types";

const { Item } = Form;

const MEETING_URL_PATTERN = /https:\/\/teams\.microsoft\.com\/l\/meetup-join\/(.*)/;

const JoinCall: React.FC = (props) => {

  const dispatch = useDispatch();
  const connectingCall = useSelector((state: IAppState) => selectNewCall(state));
  const isRequesting: boolean = useSelector((state: IAppState) => selectRequesting(state, [CallsActions.REQUEST_JOIN_CALL]));


  const formRef = createRef<FormInstance>();
  const handlePaste = (data: DataTransfer) => {
    const html = data.getData("text/html");
    if (html && html.indexOf('href="https://teams.microsoft.com/l/meetup-join"') > -1) {
      // extract links
      const links = extractLinks(html);
      const meetingLink = links.find((o) => MEETING_URL_PATTERN.test(o));
      if (meetingLink) {
        console.log(meetingLink);
        setTimeout(() => formRef.current?.setFieldsValue({ callUrl: meetingLink }), 1);
      }
    }
  };

  // When form is completed correctly
  const onFinish = (form: Store) => {
    console.log("form", form);

    // Trigger JoinCall AsyncAction
    dispatch(joinCallAsync(form.callUrl));
  };

  // Validation
  const callUrlRules: Rule[] = [
    {
      required: true,
      whitespace: false,
      message: "Please add your Teams Invite URL.",
      pattern: MEETING_URL_PATTERN,
    },
  ];

  // ui parameters
  const connecting = connectingCall?.status === CallState.Establishing;

  return (
    <>
      <Form ref={formRef} onFinish={onFinish}>
        <div id="JoinCall" className="PageBody">
          <div id="CallsInfo">
            <h2>Connect to a new call</h2>
            <div id="CallsInfoActions">
              <Item label="Invite URL:" name="callUrl" rules={callUrlRules}>
                <Input
                  placeholder="https://..."
                  disabled={isRequesting}
                  onPasteCapture={(e) => handlePaste(e.clipboardData)}
                />
              </Item>
            </div>
          </div>
        </div>

        <Button type="primary" size="large" htmlType="submit" disabled={isRequesting}>
          Join Call
        </Button>

        <br />
        <br />

        {isRequesting && (
          <Row>
            <Col className="StatusIcon">
              <HourglassEmpty style={{ fontSize: "62px" }} />
            </Col>
            <Col>
              <p className="CallUrl">
                <strong>Joining {connectingCall?.callUrl}</strong>
              </p>
              <p>Please wait while the bot joins...</p>
            </Col>
          </Row>
        )}
      </Form>
    </>
  );
};

export default JoinCall
