// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import Axios, { Method, AxiosRequestConfig } from 'axios';

import { v4 as uuidv4 } from 'uuid';
import { fillApiErrorWithDefaults } from '../../models/error/helpers';
import { ApiError } from '../../models/error/types';
import AuthService from '../../services/auth';
import { FEATUREFLAG_DISABLE_AUTHENTICATION } from '../../stores/config/constants';
import { getConfig } from '../../stores/config/loader';

export enum RequestMethod {
  Get = 'GET',
  Post = 'POST',
  Put = 'PUT',
  Delete = 'DELETE',
  Options = 'OPTIONS',
  Head = 'HEAD',
  Patch = 'PATCH',
}

export interface RequestParameters {
  url: string;
  isSecured: boolean;
  shouldOverrideBaseUrl?: boolean;
  payload?: unknown;
  method?: RequestMethod;
  config?: AxiosRequestConfig;
}

export class ApiClient {
  public static async post<T>({
    url,
    isSecured,
    shouldOverrideBaseUrl: shouldOverrideUrl,
    payload,
    config,
  }: RequestParameters): Promise<RequestResponse<T>> {
    return baseRequest<T>({ url, isSecured, shouldOverrideBaseUrl: shouldOverrideUrl, payload, method: RequestMethod.Post, config });
  }

  public static async put<T>({
    url,
    isSecured,
    shouldOverrideBaseUrl: shouldOverrideUrl,
    payload,
    config,
  }: RequestParameters): Promise<RequestResponse<T>> {
    return baseRequest<T>({ url, isSecured, shouldOverrideBaseUrl: shouldOverrideUrl, payload, method: RequestMethod.Put, config });
  }

  public static async get<T>({
    url,
    isSecured,
    shouldOverrideBaseUrl: shouldOverrideUrl,
    payload,
    config,
  }: RequestParameters): Promise<RequestResponse<T>> {
    return baseRequest<T>({ url, isSecured, shouldOverrideBaseUrl: shouldOverrideUrl, payload, method: RequestMethod.Get, config });
  }

  public static async delete<T>({
    url,
    isSecured,
    shouldOverrideBaseUrl: shouldOverrideUrl,
    payload,
    config,
  }: RequestParameters): Promise<RequestResponse<T>> {
    return baseRequest<T>({ url, isSecured, shouldOverrideBaseUrl: shouldOverrideUrl, payload, method: RequestMethod.Delete, config });
  }
}

const baseRequest = async <T>({
  url,
  isSecured,
  shouldOverrideBaseUrl: shouldOverrideUrl,
  payload,
  method,
  config,
}: RequestParameters): Promise<RequestResponse<T>> => {
  try {
    const {
      apiBaseUrl,
      msalConfig: { apiClientId },
      featureFlags,
    } = await getConfig();

    const disableAuthFlag = featureFlags && featureFlags[FEATUREFLAG_DISABLE_AUTHENTICATION];

    let headers: any;
    if (isSecured && !disableAuthFlag?.isActive) {
      const token = await refreshAccessToken(apiClientId);
      headers = {
        Authorization: `Bearer ${token}`,
      };
    }

    const requestConfig: AxiosRequestConfig = {
      url: shouldOverrideUrl ? url : `${apiBaseUrl}${url}`,
      method: method as Method,
      data: payload,
      headers: {
        'x-client': 'Management Portal',
        ...headers,
      },
      ...config,
    };

    const [response] = await Promise.all([Axios(requestConfig), delay()]);

    const { status, data, request } = response;

    if (data.success === false) {
      const errorResponse = fillApiErrorWithDefaults(
        {
          status,
          message: data.errors.join(' - '),
          errors: data.errors,
          url: request ? request.responseURL : url,
          raw: response,
        },
        url
      );

      return errorResponse;
    }

    return data as T;
  } catch (error) {
    //The request was made and the server responded with an status code different of 2xx
    console.log({
      error: JSON.stringify(error),
    });
    if (error.response) {
      const { value } = error.response.data;

      //TODO: Modify how we parse de error. Acording to our exception responses, we should look the property value

      const errors: string[] =
        value && Object.prototype.hasOwnProperty.call(value, 'errors')
          ? [value?.title, value?.detail, concatErrorMessages(value?.errors)]
          : [value?.title, value?.detail];

      const serverError = fillApiErrorWithDefaults(
        {
          status: error.response.status,
          message: errors.filter(Boolean).join(' - '),
          errors,
          url: error.request.responseURL,
          raw: error.response,
        },
        url
      );

      return serverError;
    }

    //The request was made but no response was received
    if (error.request) {
      const { status, statusText, responseURL } = error.request;

      const unknownError = fillApiErrorWithDefaults(
        {
          status,
          message: `${error.message} ${statusText}`,
          errors: [statusText],
          url: responseURL,
          raw: error.request,
        },
        url
      );

      return unknownError;
    }

    //Something happened during the setup
    const defaultError = fillApiErrorWithDefaults(
      {
        status: 0,
        message: error.message,
        errors: [error.message],
        url: url,
        raw: error,
      },
      url
    );

    return defaultError;
  }
};

export const refreshAccessToken = async (apiClientId: string): Promise<string | undefined> => {
  const accounts = AuthService.getAccounts();

  if (accounts && accounts.length > 0) {
    try {
      const authResult = await AuthService.requestSilentToken(accounts[0], apiClientId);

      return authResult.accessToken;
    } catch (error) {
      console.error(error);
    }
  }
};

const concatErrorMessages = (errors: Record<string, unknown>): string[] => {
  const errorsArray: string[] = [];

  Object.values(errors).forEach((element) => {
    Array.isArray(element) ? errorsArray.push(element.join(' - ')) : errorsArray.push(JSON.stringify(element));
  });

  return errorsArray;
};

const delay = (duration: number = 250): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, duration));
};

export type RequestResponse<T> = T | ApiError;

export interface Resource<T> {
  id: string;
  resource: T;
}

//TODO: Remove after migrating async actions
export const api = async <T>(url: string, method: Method, json?: unknown): Promise<T> => {
  try {
    const {
      apiBaseUrl,
      msalConfig: { apiClientId },
      featureFlags,
    } = await getConfig();

    const disableAuthFlag = featureFlags && featureFlags[FEATUREFLAG_DISABLE_AUTHENTICATION];
    const token = !disableAuthFlag?.isActive ? await refreshAccessToken(apiClientId) : '';
    const headersConfig = !disableAuthFlag?.isActive ? { Authorization: `Bearer ${token}` } : {};

    // Request Auth
    const request: AxiosRequestConfig = {
      url: `${apiBaseUrl}${url}`,
      method: method,
      data: json,
      headers: {
        ...headersConfig,
        'X-Client': 'Management Portal',
      },
    };

    // TODO: Handle proper return codes

    const response = await Axios(request);
    return response.data as T;
  } catch (err) {
    // Handle HTTP errors
    const errorMessage = !err.response?.data?.error_description ? err.toString() : err.response.data.error_description;

    throw new Error(errorMessage);
  }
};
