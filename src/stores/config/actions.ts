// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { ApiError } from '../../models/error/types';
import BaseAction from '../base/BaseAction';
import { AppConfig } from './types';

export const LOAD_CONFIG = 'LOAD_CONFIG';
export const LOAD_CONFIG_ERROR = 'LOAD_CONFIG_ERROR';

export interface LoadConfig extends BaseAction<AppConfig> {}
export interface LoadConfigError extends BaseAction<ApiError> {}

export const loadConfig = (payload: AppConfig): LoadConfig => ({
  type: LOAD_CONFIG,
  payload: payload,
});

export const loadConfigError = (error: ApiError): LoadConfigError => ({
  type: LOAD_CONFIG_ERROR,
  payload: error,
  error: true,
});
