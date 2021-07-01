// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Row, Col, Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import NavBar from './NavBar';
import './Header.css';
import Logo from '../../images/logo.png';
import IAppState from '../../services/store/IAppState';
import { AuthStatus } from '../../models/auth/types';
import { signOut } from '../../stores/auth/asyncActions';
import { FEATUREFLAG_DISABLE_AUTHENTICATION } from '../../stores/config/constants';

const links = [
  {
    label: 'Join a Call',
    to: '/call/join',
  },
  {
    label: 'Calls',
    to: '/',
  },
  {
    label: 'Bot Service Status',
    to: '/botservice',
  },
];

const Header: React.FC = () => {
  const dispatch = useDispatch();
  const { status: authStatus, userProfile } = useSelector((state: IAppState) => state.auth);
  const { app: appConfig } = useSelector((state: IAppState) => state.config);
  const userName = userProfile?.username || '';
  const role = authStatus === AuthStatus.Authenticated ? 'Producer' : 'None';
  const disableAuthFlag = appConfig?.featureFlags && appConfig.featureFlags[FEATUREFLAG_DISABLE_AUTHENTICATION];

  const onClickSignOut = () => {
    dispatch(signOut(userName));
  };

  return (
    <div id="Header">
      <div id="HeaderInner">
        <Row>
          <Col span={6}>
            <h1>
              <Link to="/">
                <img src={Logo} alt="" />
              </Link>
            </h1>
          </Col>
          <Col span={12}>
            <NavBar links={links} />
          </Col>
          <Col span={6} className="profile">
            <Avatar size={48} icon={<UserOutlined />} />
            <span className="profileDetails">
              <strong>{userName}</strong>
              <br />
              {role}
              {!disableAuthFlag?.isActive && (
                <>
                  {' '}
                  |
                  {' '}
                  <a href="#" onClick={onClickSignOut}>
                    Logout
                  </a>
                </>
              )}
            </span>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default Header;
