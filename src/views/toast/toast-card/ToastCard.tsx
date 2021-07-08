// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import * as React from 'react';
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import Divider from "@material-ui/core/Divider";
import CardContent from "@material-ui/core/CardContent";
import { Typography } from 'antd';

import { IToastItem } from '../../../stores/toast/reducer';

const { Text } = Typography

interface ToastCardProps {
  item: IToastItem;
}

export const ToastCard: React.FC<ToastCardProps> = (props) => {
  return (
    <Card id="ToastCard">
      <CardHeader
        id="CardHeader"
        title={
          <strong style={{ color: "white" }}>{props.item.type}</strong> ||
          " Toast error "}
      ></CardHeader>
      <Divider variant="middle" />
      <CardContent>
        <Text>{props.item.message}</Text>
      </CardContent>

    </Card>

  );
}

