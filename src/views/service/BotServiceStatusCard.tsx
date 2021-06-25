import React from "react";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import CancelIcon from "@material-ui/icons/Cancel";
import "./BotServiceStatusCard.css";
import Divider from "@material-ui/core/Divider";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Container from "@material-ui/core/Container";
import StorageIcon from "@material-ui/icons/Storage";
import Avatar from "@material-ui/core/Avatar";
import { Theme, withStyles } from "@material-ui/core/styles";
import IconButton from "@material-ui/core/IconButton";
import RefreshIcon from "@material-ui/icons/Refresh";
import red from "@material-ui/core/colors/red";
import { makeStyles, createStyles } from "@material-ui/core/styles";
import StopRoundedIcon from "@material-ui/icons/StopRounded";
import PlayArrowRoundedIcon from "@material-ui/icons/PlayArrowRounded";
import HourglassEmptyIcon from "@material-ui/icons/HourglassEmpty";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import { BotService, ProvisioningStateValues } from "../../models/service/types";

interface BotServiceStatusDataProps {
  name: string;
  botService: BotService;
  loading: boolean;
  onStart: () => void;
  onStop: () => void;
  onRefresh: () => void;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      maxWidth: 345,
    },
    media: {
      height: 0,
      paddingTop: "56.25%", // 16:9
    },
    expand: {
      transform: "rotate(0deg)",
      transition: theme.transitions.create("transform", {
        duration: theme.transitions.duration.shortest,
      }),
    },
    expandOpen: {
      transform: "rotate(0deg)",
    },
    avatar: {
      backgroundColor: red[500],
    },
  })
);

const BotServiceStatusCard: React.FC<BotServiceStatusDataProps> = (props) => {
  const classes = useStyles();

  const {botService, name, loading, onStart, onStop, onRefresh} = props;

  const {id: provisioningStateValue, name: provisioningStateDisplayName} = botService.infrastructure.provisioningDetails.state;
  const hasTransitioningState: boolean =
  provisioningStateValue === ProvisioningStateValues.Provisioning ||
  provisioningStateValue  === ProvisioningStateValues.Deprovisioning;

  return (
    <Card id="BotServiceStatusCard" key={name}>
      <CardHeader
        id="CardHeader"
        avatar={
          <Avatar aria-label="vm">
            <StorageIcon />
          </Avatar>
        }
        title={
          <strong style={{ color: "white" }}>{name}</strong> ||
          " [Bot Service] "
        }
        // subheader="teamstx-demo_group" // resourceGroup
      ></CardHeader>
      <Divider variant="middle" />
      <CardContent>
        <Container maxWidth="sm">
          <Divider variant="middle" />
          <List>
            <ListItem>
              <ListItemAvatar>
                <Avatar>
                  {provisioningStateValue === ProvisioningStateValues.Provisioned && (
                    <CheckCircleIcon style={{ color: "lightgreen" }} />
                  )}
                  {provisioningStateValue === ProvisioningStateValues.Deprovisioned && (
                    <CancelIcon style={{ color: "red" }} />
                  )}
                  {hasTransitioningState && <HourglassEmptyIcon />}
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary="Status" secondary={provisioningStateDisplayName} />
            </ListItem>
          </List>
          <Divider variant="middle" />
        </Container>
      </CardContent>

      <CardActions>
        <Container maxWidth="lg">
          {![ProvisioningStateValues.Provisioning , ProvisioningStateValues.Provisioned ].includes(
            provisioningStateValue
          ) && (
            <IconButton
              aria-label="Start"
              onClick={onStart}
              disabled={hasTransitioningState}
            >
              <PlayArrowRoundedIcon fontSize="large" />
            </IconButton>
          )}
          {[ProvisioningStateValues.Provisioning , ProvisioningStateValues.Provisioned].includes(
            provisioningStateValue
          ) && (
            <IconButton
              aria-label="Stop"
              onClick={onStop}
              disabled={hasTransitioningState}
            >
              <StopRoundedIcon fontSize="large" />
            </IconButton>
          )}

          <IconButton onClick={onRefresh} disabled={loading}>
            <RefreshIcon fontSize="large" />
          </IconButton>
        </Container>
      </CardActions>
    </Card>
  );
};

export default BotServiceStatusCard;
