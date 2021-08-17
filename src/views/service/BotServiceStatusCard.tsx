// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import React from 'react';
import PowerOffIcon from '@material-ui/icons/PowerOff';
import CloseIcon from '@material-ui/icons/Close';
import './BotServiceStatusCard.css';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import StorageIcon from '@material-ui/icons/Storage';
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import StopRoundedIcon from '@material-ui/icons/StopRounded';
import PlayArrowRoundedIcon from '@material-ui/icons/PlayArrowRounded';
import HourglassEmptyIcon from '@material-ui/icons/HourglassEmpty';
import RecordVoiceOverIcon from '@material-ui/icons/RecordVoiceOver';
import PersonIcon from '@material-ui/icons/Person';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import { BotService, BotServiceStates, ProvisioningStateValues } from '../../models/service/types';

interface BotServiceStatusDataProps {
  name: string;
  botService: BotService;
  onStart: () => void;
  onStop: () => void;
}

const useStyles = makeStyles(() =>
  createStyles({
    rotateIcon: {
      animation: 'infiniteRotate 2s linear infinite',
    },
    avatarColor: {
      backgroundColor: 'lightgrey',
    }
  })
);

const BotServiceStatusCard: React.FC<BotServiceStatusDataProps> = (props) => {
  const classes = useStyles();

  const { botService, name, onStart, onStop } = props;

  const serviceState = BotServiceStates[botService.state];
  const { id: provisioningStateValue, name: provisioningStateDisplayName } =
    botService.infrastructure.provisioningDetails.state;
  const hasTransitioningState: boolean =
    provisioningStateValue === ProvisioningStateValues.Provisioning ||
    provisioningStateValue === ProvisioningStateValues.Deprovisioning;
  const stateDisplayName =
    provisioningStateValue === ProvisioningStateValues.Provisioned ? serviceState : provisioningStateDisplayName;

  const provisionedIcon = () => {
    switch(botService.state) {
      case BotServiceStates.Available: 
        return <PersonIcon style={{ color: 'limegreen' }} />;
      case BotServiceStates.Busy:
        return <RecordVoiceOverIcon style={{ color: 'coral' }} />;
      default:
        return <CloseIcon style={{ color: 'red' }} />;
    }
  }

  return (
    <Card id="BotServiceStatusCard" key={name}>
      <CardHeader
        id="CardHeader"
        avatar={
          <Avatar aria-label="vm">
            <StorageIcon />
          </Avatar>
        }
        title={<strong style={{ color: 'white' }}>{name}</strong> || ' [Bot Service] '}
        // subheader="teamstx-demo_group" // resourceGroup
      ></CardHeader>
      <CardContent>
        <List>
          <ListItem>
            <ListItemAvatar>
              <Avatar className={classes.avatarColor}>
                {provisioningStateValue === ProvisioningStateValues.Provisioned && (
                  provisionedIcon()
                )}
                {provisioningStateValue === ProvisioningStateValues.Deprovisioned && (
                  <PowerOffIcon style={{ color: 'red' }} />
                )}
                {hasTransitioningState && <HourglassEmptyIcon className={classes.rotateIcon} />}
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary={"Status"} secondary={stateDisplayName} />
          </ListItem>
          <ListItemSecondaryAction>
            {![ProvisioningStateValues.Provisioning, ProvisioningStateValues.Provisioned].includes(
              provisioningStateValue
            ) && (
              <IconButton aria-label="Start" onClick={onStart} disabled={hasTransitioningState}>
                <PlayArrowRoundedIcon fontSize="large" />
              </IconButton>
            )}
            {[ProvisioningStateValues.Provisioning, ProvisioningStateValues.Provisioned].includes(
              provisioningStateValue
            ) && (
              <IconButton aria-label="Stop" onClick={onStop} disabled={hasTransitioningState}>
                <StopRoundedIcon fontSize="large" />
              </IconButton>
            )}
          </ListItemSecondaryAction>
        </List>
      </CardContent>
    </Card>
  );
};

export default BotServiceStatusCard;
