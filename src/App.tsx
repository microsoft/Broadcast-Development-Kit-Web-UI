// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { Spin } from "antd";
import React, { Fragment, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Route, Switch } from "react-router-dom";
import { AuthStatus } from "./models/auth/types";
import IAppState from "./services/store/IAppState";
import { setAuthenticationDisabled } from "./stores/auth/actions";
import { initilizeAuthentication } from "./stores/auth/asyncActions";
import { FEATUREFLAG_DISABLE_AUTHENTICATION } from "./stores/config/constants";
import CallDetails from "./views/call-details/CallDetails";
import Footer from "./views/components/Footer";
import Header from "./views/components/Header";
import NotFound from "./views/components/NotFound";
import PrivateRoute from "./views/components/PrivateRoute";
import Home from "./views/home/Home";
import JoinCall from "./views/join-call/JoinCall";
import LoginPage from "./views/login/LoginPage";
import BotServiceStatus from "./views/service/BotServiceStatus";
import Unauthorized from "./views/unauthorized/Unauthorized";

const App: React.FC = () => {
  const dispatch = useDispatch();
  const { initialized: authInitialized, status: authStatus } = useSelector((state: IAppState) => state.auth);
  const { app: appConfig, initialized: configInitialized } = useSelector((state: IAppState) => state.config);
  const disableAuthFlag = appConfig?.featureFlags && appConfig.featureFlags[FEATUREFLAG_DISABLE_AUTHENTICATION];
  const isAuthenticated = authStatus === AuthStatus.Authenticated;

  useEffect(() => {
    if (appConfig) {
      disableAuthFlag?.isActive
        ? dispatch(setAuthenticationDisabled())
        : dispatch(initilizeAuthentication(appConfig.msalConfig));
    }
  }, [configInitialized]);

  if (!authInitialized) {
    return (
      <div id="app">
        <Spin tip="Loading..."></Spin>
      </div>
    );
  } else {
    return (
      <div id="app">
        {isAuthenticated && <Header />}
        <div id="main">
          <Switch>
            <Route exact path="/login" component={LoginPage} />
            <Route exact path="/login/unauthorized" component={Unauthorized} />
            <PrivateRoute exact path="/" component={Home} />
            <PrivateRoute path="/call/details/:id" component={CallDetails} />
            <PrivateRoute exact path="/call/join" component={JoinCall} />
            <PrivateRoute exact path="/botservice" component={BotServiceStatus} />
            <Route component={NotFound} />
          </Switch>
        </div>
        <Footer />
      </div>
    );
  }
};

export default App;
