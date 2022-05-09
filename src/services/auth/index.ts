// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import {
  AccountInfo,
  AuthenticationResult,
  Configuration,
  EndSessionRequest,
  PublicClientApplication,
  SilentRequest,
} from '@azure/msal-browser';
import jwtDecode from 'jwt-decode';
import { UserProfile, UserRoles } from '../../models/auth/types';
import { MsalConfig } from '../../stores/config/types';

interface DecodedToken {
  groups: string[];
}

export default class AuthService {
  private static msalClient: PublicClientApplication;
  private static appConfig: MsalConfig;
  public static configure(config: MsalConfig): void {
    
    AuthService.appConfig = config;
    const msalConfig: Configuration = {
      auth: {
        authority: config?.authority,
        clientId: config?.spaClientId || '',
        redirectUri: config?.redirectUrl,
      },
      cache: {
        cacheLocation: 'localStorage',
        storeAuthStateInCookie: false,
      },
    };

    AuthService.msalClient = new PublicClientApplication(msalConfig);
  }

  public static async signIn(apiClientId: string | undefined): Promise<AuthenticationResult> {
    const loginRequest = {
      scopes: ['openid', 'profile', 'offline_access', `api://${apiClientId}/.default`],
    };
    return await AuthService.msalClient.loginPopup(loginRequest);
  }

  public static async signOut(username: string): Promise<void> {
    const request: EndSessionRequest = {
      account: AuthService.msalClient.getAccountByUsername(username) || undefined,
    };

    await AuthService.msalClient.logout(request);
  }

  public static getAccounts(): AccountInfo[] {
    return AuthService.msalClient.getAllAccounts();
  }

  public static async requestSilentToken(account: AccountInfo, apiClientId: string): Promise<AuthenticationResult> {
    const request: SilentRequest = {
      account,
      scopes: ['openid', 'profile', 'offline_access', `api://${apiClientId}/.default`],
    };

    return await AuthService.msalClient.acquireTokenSilent(request);
  }

  public static getUserProfile(authResult: AuthenticationResult): UserProfile {
    const userRole = AuthService.getUserRole(authResult.accessToken);
    const userProfile: UserProfile = {
      id: authResult.account?.localAccountId || '',
      username: authResult.account?.username || '',
      role: userRole,
    };

    return userProfile;
  }

  private static getUserRole(jwtToken: string): UserRoles {
    const groupId = AuthService.appConfig.groupId;

    if(!groupId){
      return UserRoles.Producer;
    }

    const decodedToken = jwtDecode(jwtToken) as DecodedToken;
    // If users are in the RBAC group then they have the Producer/Broadcast role
    const role = decodedToken.groups && decodedToken.groups.includes(groupId) ? UserRoles.Producer: UserRoles.Attendee;

    return role;
  }
}
