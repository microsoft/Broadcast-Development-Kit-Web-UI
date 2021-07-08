// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { AppConfig } from './types';
import Axios from 'axios';
import { DefaultError } from '../../models/error/types';
const configUrl = '/config.json';

const loader = new Promise<AppConfig>((resolve, reject) => {
  Axios.get(configUrl)
    .then((o) => resolve(o.data as AppConfig))
    .catch((err) => {
      console.log('Error loading config:', err);
      const errorResponse = new DefaultError('Error loading config', err);

      reject(errorResponse);
    });
});

export const getConfig = (): Promise<AppConfig> => loader;
