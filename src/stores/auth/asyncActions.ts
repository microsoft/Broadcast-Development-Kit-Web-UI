import { push } from 'connected-react-router';
import { AnyAction } from 'redux';
import { ThunkAction } from 'redux-thunk';
import { UserProfile, UserRoles } from '../../models/auth/types';
import AuthService from '../../services/auth';
import IAppState from '../../services/store/IAppState';
import { MsalConfig } from '../config/types';
import { authStateInitialized, userAuthenticated, userAuthenticating, userAuthenticationError, userUnauthenticated, userUnauthorized } from './actions';

const UNAUTHORIZE_ENDPOINT = "/login/unauthorized";

export const initilizeAuthentication =
  (config: MsalConfig): ThunkAction<void, IAppState, undefined, AnyAction> =>
  async (dispatch, getState) => {
    AuthService.configure(config);

    // Check for accounts in browser
    const accounts = AuthService.getAccounts();

    if (accounts && accounts.length > 0) {
      try {
        dispatch(userAuthenticating());
        const authResult = await AuthService.requestSilentToken(accounts[0], config.apiClientId);
        const userProfile = AuthService.getUserProfile(authResult);

        if (userIsProducer(userProfile)) {
          dispatch(userAuthenticated(userProfile));
        } else {
          dispatch(userUnauthorized(userProfile));
          dispatch(push(UNAUTHORIZE_ENDPOINT));
        }
      } catch (error) {
        dispatch(userAuthenticationError("Error has ocurred while trying to initilize authentication", error));
      }
    }
    // Dispatch MSAL config loaded
    dispatch(authStateInitialized());
  };

export const signIn = (): ThunkAction<void, IAppState, undefined, AnyAction> => async (dispatch, getState) => {
  const msalConfig = getState().config.app?.msalConfig;
  dispatch(userAuthenticating());

  try {
    const authResult = await AuthService.signIn(msalConfig?.apiClientId);
    const userProfile = AuthService.getUserProfile(authResult);
    
    if (userIsProducer(userProfile)) {
      dispatch(userAuthenticated(userProfile));
    } else {
      dispatch(userUnauthorized(userProfile));
      dispatch(push(UNAUTHORIZE_ENDPOINT));
    }
  } catch (error) {
    console.error(error);
    dispatch(userAuthenticationError("Error has ocurred while trying to sign in", error));
  }
}

export const signOut = (
  username: string
): ThunkAction<void, IAppState, undefined, AnyAction> => async (dispatch) => {
  try {
    await AuthService.signOut(username);
    // Dispatch sign-out action
    dispatch(userUnauthenticated());
  } catch (error) {
    console.error(error);

    // Dispatch error action
    dispatch(userAuthenticationError("Error has ocurred while trying to sign out", error));
  }
};

const userIsProducer = (userProfile: UserProfile): boolean => {
  return userProfile.role === UserRoles.Producer;
}