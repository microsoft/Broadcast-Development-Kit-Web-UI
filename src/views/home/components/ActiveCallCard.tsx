// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import React from 'react';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import { Link } from 'react-router-dom';
import moment from 'moment'
import './ActiveCallCard.css';
import { Call, CallState, CallType } from '../../../models/calls/types';

interface ICallCardDataProps {
  call: Call;
}

type ICallCardProps = ICallCardDataProps;

const ActiveCallCard: React.FC<ICallCardProps> = ({ call }) => {

  const status = getConnectionStatus(call);
  const classes = ['activeCallCard', getConnectionClass(call)];

  // creation formatting
  const creationDate = moment(call.createdAt);
  const datePart = creationDate.format('L');   // 07/03/2020
  const timePart = creationDate.format('LTS'); // 5:29:19 PM
  // const minutesPassed = creationDate.startOf('hour').fromNow(); // 14 minutes ago
  const formattedCreation = datePart + " " + timePart; // + " (" + minutesPassed + ")";


  return (
    <div className={classes.join(' ')}>
      <div className="content">
        <h3>{call.displayName}</h3>
        <p>Status: <span className="status">{status}</span></p>
        <p><strong>{CallTypeStrings[call.meetingType]}</strong> | Created : <strong>{formattedCreation}</strong></p>
        <Link to={`/call/details/${call.id}`} title="Open details" className="action">
          <ChevronRightIcon fontSize="large" />
        </Link>
      </div>
    </div>
  );
}

export default ActiveCallCard;

const getConnectionStatus = (call: Call): string => {
  switch (call.state) {
    case CallState.Establishing: return 'Connecting';
    case CallState.Established: return 'Connected';
    case CallState.Terminating: return 'Disconnecting';
    case CallState.Terminated: return 'Disconnected';
  }
}

const getConnectionClass = (call: Call): string => {
  switch (call.state) {
    case CallState.Establishing: return 'initializing';
    case CallState.Established: return 'healthy';
    case CallState.Terminating: return 'disconnecting';
    case CallState.Terminated: return 'disconnected';
  }
}

const CallTypeStrings = {
  [CallType.Default]: 'Normal call',
  [CallType.Event]: 'Event call'
};
