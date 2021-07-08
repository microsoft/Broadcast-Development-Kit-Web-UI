// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
export enum AuthStatus {
  Unauthenticated,
  Unauthorized,
  Authenticating,
  Authenticated,
}

export interface UserProfile {
  id: string;
  username: string;
  role: UserRoles
}

export enum UserRoles {
  Producer = "Producer",
  Attendee = "Attendee",
}
