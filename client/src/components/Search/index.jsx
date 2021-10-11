import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
    marginBottom: "1em",
  },
  textField: {
    margin: theme.spacing(1),

    width: "25ch",
  },
}));

export default function Search({ setAppData, setIsSearching }) {
  const classes = useStyles();
  const [startBlock, setStartBlock] = useState("");
  const [endBlock, setEndBlock] = useState("");

  async function getReportData() {
    setIsSearching(true);
    let res, data;
    try {
      res = await fetch(
        `api/report/${startBlock}/${endBlock ? endBlock : null}`
      );
      data = await res.json();
    } catch (e) {
      console.log(e);
      setIsSearching(false);
      return;
    }
    setAppData(data);
    setIsSearching(false);
  }

  function updateStartBlock(e) {
    setStartBlock(e.target.value);
  }
  function updateEndBlock(e) {
    setEndBlock(e.target.value);
  }

  return (
    <Grid container className={classes.root}>
      <Grid item xs={12}>
        <TextField
          className={classes.textField}
          label="Start Block"
          variant="outlined"
          margin="dense"
          value={startBlock}
          onChange={updateStartBlock}
        />
        <TextField
          className={classes.textField}
          label="End Block"
          variant="outlined"
          margin="dense"
          value={endBlock}
          onChange={updateEndBlock}
        />
      </Grid>
      <Grid item xs={12}>
        <Button variant="contained" color="primary" onClick={getReportData}>
          Search
        </Button>
      </Grid>
    </Grid>
  );
}
