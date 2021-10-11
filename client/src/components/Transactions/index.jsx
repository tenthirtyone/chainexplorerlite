import React from "react";
import Grid from "@material-ui/core/Grid";
import Card from "../Card";
import Typography from "@material-ui/core/Typography";

export default function Transaction({ senders, receivers, contracts }) {
  function formatEth(val) {
    if (val === 0) return val;

    return val / 1e18;
  }

  return (
    <Grid container spacing={4}>
      <Grid item xs={12} md={6}>
        <Typography variant="h4">Senders</Typography>
        {Object.keys(senders).map((key) => {
          return (
            <Card
              key={key}
              label={key}
              heading={formatEth(senders[key])}
              isContract={contracts.indexOf(key)}
            />
          );
        })}
      </Grid>
      <Grid item xs={12} md={6}>
        <Typography variant="h4">Receivers</Typography>
        {Object.keys(receivers).map((key) => {
          return (
            <Card
              key={key}
              label={key}
              heading={formatEth(receivers[key])}
              isContract={contracts.indexOf(key)}
            />
          );
        })}
      </Grid>
    </Grid>
  );
}
