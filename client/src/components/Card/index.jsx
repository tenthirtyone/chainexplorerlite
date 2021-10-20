import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import Chip from "@material-ui/core/Chip";

const useStyles = makeStyles({
  root: {
    minWidth: 175,
    minHeight: 155,
    margin: "1em",
  },
  title: {
    fontSize: 12,
  },
  pos: {
    marginBottom: 12,
  },
});

export default function SummaryCard({ label, heading, isContract }) {
  const classes = useStyles();

  return (
    <Card className={classes.root}>
      <CardContent>
        <Typography
          className={classes.title}
          color="textSecondary"
          gutterBottom
        >
          {label}
        </Typography>

        <Typography variant="h5" component="h2">
          {heading}
        </Typography>
        {isContract >= 0 ? <Chip label={"Contract"}></Chip> : null}
      </CardContent>
    </Card>
  );
}
