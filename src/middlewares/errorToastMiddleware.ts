// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { Middleware } from 'redux';
import IAppState from '../services/store/IAppState';
import { notification } from 'antd';

const errorToastMiddleware: Middleware<{}, IAppState> = (store) => (next) => (action) => {
  if (action.error) {
    const errorAction = action;

    errorAction.payload.status === 401
      ? notification.error({ description: 'Unauthorized: Please, Sing in again.', message: `Error` })
      : notification.error({ description: errorAction.payload.message, message: `Error` });
  }

  next(action);
};

export default errorToastMiddleware;
