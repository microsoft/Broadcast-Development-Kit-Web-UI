// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { Reducer } from 'redux';
import * as ToastsAction from './actions';
import baseReducer from '../base/BaseReducer';

export interface IToastItem {
    id?: string;
    type: string;
    message: string;
}

export interface IToastState{
    items: IToastItem[];
}

const INITIAL_STATE: IToastState = {
    items: [],
};

export const toastReducer: Reducer = baseReducer(INITIAL_STATE, {
  [ToastsAction.ADD_TOAST](state: IToastState, action: ToastsAction.AddToastMessage): IToastState {
    return {
      ...state,
      items: [...state.items, action.payload!],
    };
  },
  [ToastsAction.REMOVE_TOAST](state: IToastState, action: ToastsAction.RemoveToastMessage) {
    const toastId = action.payload;

    return {
      ...state,
      items: state.items.filter((model) => model.id !== toastId),
    };
  }
});
