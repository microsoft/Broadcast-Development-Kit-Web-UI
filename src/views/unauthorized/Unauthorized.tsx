// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { Button, Card } from 'antd';
import { LoginOutlined } from '@ant-design/icons';
import { AuthStatus } from '../../models/auth/types';
import IAppState from '../../services/store/IAppState';
import { signOut } from '../../stores/auth/asyncActions';

const Unauthorized: React.FC = () => {
  const dispatch = useDispatch();
  const { status: authStatus, userProfile } = useSelector((state: IAppState) => state.auth);
  const isUnauthorized = authStatus === AuthStatus.Unauthorized;

  const onClickSignOut = () => {
    const userName = userProfile?.username || '';
    dispatch(signOut(userName));
  };

  const { Meta } = Card;

  return isUnauthorized ? (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
      }}
    >
      <Card title="Unauthorized" bordered style={{ width: 600, textAlign: 'center' }}>
        <Meta
          description="You are not authorized to view this page. Please, 
          contact the administrator to grant access to this application"
        />
        <hr />
        <Button
          type="primary"
          icon={<LoginOutlined />}
          shape="round"
          onClick={onClickSignOut}
        >
          Log out
        </Button>
      </Card>
    </div>
  ) : (
    <Redirect to="/" />
  );
};

export default Unauthorized;
