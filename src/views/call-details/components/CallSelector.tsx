import React, { useState } from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter, Redirect } from 'react-router';
import { Select } from 'antd'

import IAppState from '../../../services/store/IAppState';

const { Option } = Select;

interface ICallSelectorDataProps extends RouteComponentProps<{ id: string }> {
  selectedCallId?: string;
  isNew: boolean;
  calls: {
    id: string,
    name: string
  }[]
}

type ICallSelectorProps = ICallSelectorDataProps;

const PLACEHOLDER_ID = '_';
const NEW_PLACEHOLDER_ID = '*';
const JOIN_CALL_ROUTE = '/call/join';

const CallSelector: React.FC<ICallSelectorProps> = (props) => {
  // Handle redirect using <Redirect />
  const [redirectId, setRedirectId] = useState<string>('');
  if (redirectId && redirectId !== props.selectedCallId) {
    if (redirectId === NEW_PLACEHOLDER_ID) {
      return <Redirect to={JOIN_CALL_ROUTE} push={true} />
    } else {
      return <Redirect to={`/call/details/${redirectId}`} />
    }
  }

  // When changing the <Select> value, trigger the redirect
  const handleCallSelect = (callId: string) => {
    if (callId === PLACEHOLDER_ID) {
      return;
    }

    setRedirectId(callId);
  }

  const selectedId = props.isNew ? NEW_PLACEHOLDER_ID : (props.selectedCallId || PLACEHOLDER_ID);

  return (
    <Select defaultValue={selectedId} className="CallSetting" onChange={handleCallSelect}>
      <Option value={PLACEHOLDER_ID}><i>(Select a call)</i></Option>
      {props.calls.map(m => (<Option key={m.id} value={m.id}>{m.name || 'Teams TX Demo'}</Option>))}
      <Option value={NEW_PLACEHOLDER_ID}><strong>(Join a new Call)</strong></Option>
    </Select>
  )
}

const mapStateToPros = (appState: IAppState, ownProps: RouteComponentProps<{ id: string }>): ICallSelectorDataProps => ({
  ...ownProps,
  calls: appState.calls.activeCalls.map(o => ({
    id: o.id,
    name: o.displayName
  })),
  selectedCallId: ownProps.match.params.id,
  isNew: ownProps.match.path === JOIN_CALL_ROUTE
})

export default withRouter(connect(mapStateToPros)(CallSelector));
