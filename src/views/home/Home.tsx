import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Button, Spin } from 'antd';

import './Home.css';
import ActiveCallCard from './components/ActiveCallCard';
import { getActiveCallsAsync } from '../../stores/calls/asyncActions';
import * as CallsActions from '../../stores/calls/actions';
import { selectRequesting } from '../../stores/requesting/selectors';
import IAppState from '../../services/store/IAppState';
import { selectActiveCalls } from '../../stores/calls/selectors';

const Home: React.FC = () => {

  const dispatch = useDispatch();
  const isRequesting = useSelector((state: IAppState) => selectRequesting(state, [CallsActions.REQUEST_ACTIVE_CALLS]));
  const activeCalls = useSelector((state: IAppState) => selectActiveCalls(state));

  useEffect(() => {
    dispatch(getActiveCallsAsync());
  }, []);

  const hasCalls = activeCalls.length > 0;
  return (
    <div>
      <h2>Active Calls</h2>

      {!hasCalls && (
        <>
          {isRequesting && (
            <div><Spin /></div>
          )}
          {!isRequesting && (
            <>
              <h3>There are no active calls.</h3>
              <p>
                Please <Link to="/call/join"><strong>join the bot</strong></Link> to an active call to start.
              </p>
            </>
          )}
        </>
      )}

      {hasCalls && (
        <>
          {activeCalls.map(o => <ActiveCallCard key={o.id} call={o} />)}
          <div className="joinNew">
            <Button type="primary" size="large">
              <Link to="/call/join">Join a new Call</Link>
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

export default Home;
