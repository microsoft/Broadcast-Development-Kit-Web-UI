import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Card } from "antd";
import { LoginOutlined } from "@ant-design/icons";
import { Redirect } from "react-router-dom";
import { signIn } from "../../stores/auth/asyncActions";
import IAppState from "../../services/store/IAppState";
import { AuthStatus } from "../../models/auth/types";

const LoginPage: React.FC = () => {
  const dispatch = useDispatch();
  const authStatus = useSelector((state: IAppState) => state.auth.status);
  const isAuthenticated =  authStatus === AuthStatus.Authenticated;

  const { Meta } = Card;
  const onClickSignIn = () => {
    dispatch(signIn());
  }
  return isAuthenticated ? (
    <Redirect to="/" />
  ) : (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
      }}
    >
      <Card
        title="Login with your account"
        bordered
        style={{ width: 300, textAlign: "center" }}
        size="small"
      >
        <Meta description="You must log in with your microsoft account to continue." />
        <hr />
        <Button
          type="primary"
          icon={<LoginOutlined />}
          shape="round"
          onClick={onClickSignIn}
        >
          Login with your account
        </Button>
      </Card>
    </div>
  );
};

export default LoginPage;