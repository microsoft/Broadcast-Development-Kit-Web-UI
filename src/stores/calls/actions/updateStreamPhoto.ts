// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import BaseAction from '../../base/BaseAction';

export const UPDATE_STREAM_PHOTO = 'UPDATE_STREAM_PHOTO';

export interface UpdateStreamPhoto extends BaseAction<{streamId: string, photo: string, callId: string}> {}

export const updateStreamPhoto = (streamId: string, photo: string, callId: string): UpdateStreamPhoto => ({
  type: UPDATE_STREAM_PHOTO,
  payload: {streamId, photo, callId},
});