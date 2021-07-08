// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import React from "react";
import { useSelector } from "react-redux";
import { Route, Redirect } from "react-router-dom";
import { AuthStatus } from "../../models/auth/types";
import IAppState from "../../services/store/IAppState";

interface PrivateRouteProps {
  component: React.ComponentType;
  path: string;
  exact?: boolean;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({
  component: Component,
  ...rest
}) => {
  const authStatus = useSelector((state: IAppState) => state.auth.status);
  const isAuthenticated =  authStatus === AuthStatus.Authenticated;
  
  return (
    <Route
      {...rest}
      render={() =>
        isAuthenticated ? <Component /> : <Redirect to="/login" />
      }
    />
  );
};

export default PrivateRoute;