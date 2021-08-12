// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
export enum BotServiceInfrastructureState {
  Running = "PowerState/running",
  Deallocating = "PowerState/deallocating",
  Deallocated = "PowerState/deallocated",
  Starting = "PowerState/starting",
  Stopped = "PowerState/stopped",
  Stopping = "PowerState/stopping",
  Unknown = "PowerState/unknown",
}

export interface BotService {
  id: string;
  name: string;
  callId: string;
  state: BotServiceStates;
  infrastructure: Infrastructure;
}

export interface Infrastructure {
    virtualMachineName: string;
    resourceGroup: string;
    subscriptionId: string;
    powerState: BotServiceInfrastructureState;
    provisioningDetails: ProvisioningDetails;
}

export interface ProvisioningDetails {
    state: ProvisioningState;
    message: string;
}

export interface ProvisioningState {
   id: ProvisioningStateValues;
   name: string;
}

export enum ProvisioningStateValues {
    Provisioning = 0,
    Provisioned = 1,
    Deprovisioning = 2,
    Deprovisioned = 3,
    Error = 4,
    Unknown = 5
}

export enum TeamsColors {
  Red = "#D74654",
  Purple = "#6264A7",
  Black = "#11100F",
  Green = "#7FBA00",
  Grey = "#BEBBB8",
  MiddleGrey = "#3B3A39",
  DarkGrey = "#201F1E",
  White = "white",
}

export enum TeamsMargins {
  micro = "4px",
  small = "8px",
  medium = "20px",
  large = "40px",
}

export enum BotServiceStates
{
    Unavailable = 0,
    Available = 1,
    Busy = 2,
}