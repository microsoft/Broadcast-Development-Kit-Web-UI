// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import React, { Fragment } from 'react';
import CallInfo from './components/CallInfo';
import CallStreams from './components/CallStreams';
import NewInjectionStreamDrawer from './components/NewInjectionStreamDrawer';
import NewStreamDrawer from './components/NewStreamDrawer';

const CallDetails: React.FC<{}> = () => {
  return (
    <Fragment>
      <NewStreamDrawer />
      <NewInjectionStreamDrawer />
      <div id="call">
        <CallInfo />
        <CallStreams />
      </div>
    </Fragment>
  );
};

export default CallDetails;
