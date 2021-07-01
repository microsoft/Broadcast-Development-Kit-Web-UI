// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { AuthStatus, UserProfile, UserRoles } from '../../models/auth/types';
import * as AuthActions from './actions';
import baseReducer from '../base/BaseReducer';

export interface AuthState {
  status: AuthStatus;
  userProfile: UserProfile | null;
  initialized: boolean;
}

export const INITIAL_STATE: AuthState = {
  status: AuthStatus.Unauthenticated,
  userProfile: null,
  initialized: false,
};

export const authReducer = baseReducer(INITIAL_STATE, {
  [AuthActions.USER_AUTHENTICATED](state: AuthState, action: AuthActions.UserAuthenticated): AuthState {
    return {
      ...state,
        status: action.payload!.authStatus,
        userProfile: action.payload!.userProfile,
    }
  },
  [AuthActions.USER_UNAUTHENTICATED](state: AuthState, action: AuthActions.UserUnauthenticated): AuthState {
    return {
      ...state,
        status: action.payload!.authStatus,
    }
  },
  [AuthActions.USER_AUTHENTICATING](state: AuthState, action: AuthActions.UserAuthenticating): AuthState {
    return {
      ...state,
        status: action.payload!.authStatus,
    }
  },
  [AuthActions.USER_UNAUTHORIZED](state: AuthState, action: AuthActions.UserUnauthorized): AuthState {
    return {
      ...state,
        status: action.payload!.authStatus,
        userProfile: action.payload!.userProfile,
    }
  },
  [AuthActions.AUTH_STATE_INITIALIZED](state: AuthState, action: AuthActions.AuthStateInitialized): AuthState {
    return {
      ...state,
        initialized: action.payload!.initialized,
    }
  },
  [AuthActions.SET_AUTHENTICATION_DISABLED](state: AuthState, action: AuthActions.SetAuthenticationDisabled): AuthState {
    return {
      ...state,
        status: AuthStatus.Authenticated,
        userProfile: {
          id: '',
          username: 'Local User',
          role: UserRoles.Producer,
        },
        initialized: true,
    }
  },
})