// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Spin } from 'antd';
import './BotServiceStatus.css';
import BotServiceStatusCard from './BotServiceStatusCard';
import * as BotServiceActions from '../../stores/service/actions';
import { selectRequesting } from '../../stores/requesting/selectors';
import IAppState from '../../services/store/IAppState';
import { getBotServiceAsync, startBotServiceAsync, stopBotServiceAsync } from '../../stores/service/asyncActions';
import useInterval from '../../hooks/useInterval';

const ServicePage: React.FC = () => {
  const dispatch = useDispatch();
  const { botServices } = useSelector((state: IAppState) => state.botServiceStatus);
  const [isPollingEnabled, setIsPollingEnabled] = useState(false)
  const isRequesting: boolean = useSelector((state: IAppState) =>
    selectRequesting(state, [BotServiceActions.REQUEST_BOT_SERVICE])
  );
 
  useInterval(useCallback(() => dispatch(getBotServiceAsync()), [dispatch, getBotServiceAsync]), isPollingEnabled ? 3000 : null);

  useEffect(()=>{
    setIsPollingEnabled(true)
  },[])

  const hasBotServices = botServices.length > 0;
  return (
    <div>
      <h2>Bot Services</h2>
      {!hasBotServices && (
        <>
          {isRequesting && (
            <div>
              <Spin />
            </div>
          )}
          {isRequesting && (
            <>
              <h3>There are no Bot Services.</h3>
            </>
          )}
        </>
      )}
      {hasBotServices && (
        <>
          {botServices.map((botService, i) => (
            <BotServiceStatusCard
              key={i}
              name={botService.name}
              botService={botService}
              onStart={() => dispatch(startBotServiceAsync())}
              onStop={() => dispatch(stopBotServiceAsync())}
            />
          ))}
        </>
      )}
    </div>
  );
};

export default ServicePage;
