import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    marginBottom: "1em",
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
}));

export default function ButtonAppBar({ startBlock, endBlock }) {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Toolbar>
          {startBlock ? (
            <Typography variant="h6" className={classes.title}>
              Reporting on {startBlock} - {endBlock}
            </Typography>
          ) : (
            <Typography variant="h6" className={classes.title}>
              Choose a range of blocks
            </Typography>
          )}
        </Toolbar>
      </AppBar>
    </div>
  );
}
