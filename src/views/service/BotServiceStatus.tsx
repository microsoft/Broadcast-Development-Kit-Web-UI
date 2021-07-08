// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Spin } from 'antd';
import './BotServiceStatus.css';
import BotServiceStatusCard from './BotServiceStatusCard';
import * as BotServiceActions from '../../stores/service/actions';
import { selectRequesting } from '../../stores/requesting/selectors';
import IAppState from '../../services/store/IAppState';
import { getBotServiceAsync, startBotServiceAsync, stopBotServiceAsync } from '../../stores/service/asyncActions';

const ServicePage: React.FC = () => {
  const dispatch = useDispatch();
  const { botServices } = useSelector((state: IAppState) => state.botServiceStatus);
  const isRequesting: boolean = useSelector((state: IAppState) =>
    selectRequesting(state, [BotServiceActions.REQUEST_BOT_SERVICE])
  );

  React.useEffect(() => {
    // Array of one virtual machine will be fetched
    dispatch(getBotServiceAsync());
  }, []);
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
              loading={isRequesting}
              name={botService.name}
              botService={botService}
              onStart={() => dispatch(startBotServiceAsync())}
              onStop={() => dispatch(stopBotServiceAsync())}
              onRefresh={() => dispatch(getBotServiceAsync())}
            />
          ))}
        </>
      )}
    </div>
  );
};

export default ServicePage;
