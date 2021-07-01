// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { UserProfile } from '../../models/auth/types';
import { DefaultError } from '../../models/error/types';
import { AuthStatus } from '../../models/auth/types';
import BaseAction from '../base/BaseAction';

export type AuthActions =
  | AuthStateInitialized
  | UserAuthenticating
  | UserAuthenticated
  | UserUnauthorized
  | UserAuthenticationError;

export const AUTH_STATE_INITIALIZED = 'AUTH_STATE_INITIALIZED';
export interface AuthStateInitialized extends BaseAction<{ initialized: boolean }> {}

export const authStateInitialized = (): AuthStateInitialized => ({
  type: AUTH_STATE_INITIALIZED,
  payload: {
    initialized: true,
  },
});

export const USER_AUTHENTICATING = 'USER_AUTHENTICATING';
export interface UserAuthenticating extends BaseAction<{ authStatus: AuthStatus }> {}

export const userAuthenticating = (): UserAuthenticating => ({
  type: USER_AUTHENTICATING,
  payload: {
    authStatus: AuthStatus.Authenticating,
  },
});

export const USER_AUTHENTICATED = 'USER_AUTHENTICATED';
export interface UserAuthenticated extends BaseAction<{ userProfile: UserProfile; authStatus: AuthStatus }> {}

export const userAuthenticated = (userProfile: UserProfile): UserAuthenticated => ({
  type: USER_AUTHENTICATED,
  payload: {
    userProfile,
    authStatus: AuthStatus.Authenticated,
  },
});

export const USER_UNAUTHENTICATED = 'USER_UNAUTHENTICATED';
export interface UserUnauthenticated extends BaseAction<{ authStatus: AuthStatus }> {}

export const userUnauthenticated = (): UserUnauthenticated => ({
  type: USER_UNAUTHENTICATED,
  payload: {
    authStatus: AuthStatus.Unauthenticated,
  },
});

export const USER_UNAUTHORIZED = 'USER_UNAUTHORIZED';
export interface UserUnauthorized extends BaseAction<{ userProfile: UserProfile; authStatus: AuthStatus }> {}

export const userUnauthorized = (userProfile: UserProfile): UserUnauthorized => ({
  type: USER_UNAUTHORIZED,
  payload: {
    userProfile,
    authStatus: AuthStatus.Unauthorized,
  },
});

export const USER_AUTHENTICATION_ERROR = 'USER_AUTHENTICATION_ERROR';
export interface UserAuthenticationError extends BaseAction<DefaultError> {}

export const userAuthenticationError = (message: string, rawError: any): UserAuthenticationError => ({
  type: USER_AUTHENTICATION_ERROR,
  payload: new DefaultError(message, rawError),
  error: true,
});

export const SET_AUTHENTICATION_DISABLED = "SET_AUTHENTICATION_DISABLED";
export interface SetAuthenticationDisabled extends BaseAction<undefined> {};

export const setAuthenticationDisabled = (): SetAuthenticationDisabled => ({
  type: SET_AUTHENTICATION_DISABLED,
})