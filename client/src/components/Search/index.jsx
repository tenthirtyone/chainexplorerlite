import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";

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
  padding10: {
    padding: 10,
  },
}));

export default function Search({ setAppData, setIsSearching }) {
  const classes = useStyles();
  const [startBlock, setStartBlock] = useState("");
  const [endBlock, setEndBlock] = useState("");
  const [lastNBlocks, setLastNBlocks] = useState("");

  async function getRangeReportData() {
    setIsSearching(true);
    let res, data;
    try {
      res = await fetch(
        `api/report/range/${startBlock ? startBlock : null}/${
          endBlock ? endBlock : null
        }`
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

  async function getLastNBlocks() {
    setIsSearching(true);
    let res, data;
    try {
      res = await fetch(`api/report/last/${lastNBlocks ? lastNBlocks : null}`);
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
  function updateLastNBlocks(e) {
    setLastNBlocks(e.target.value);
  }

  return (
    <Grid container className={classes.root} spacing={4}>
      <Grid item xs={12} md={6}>
        <Card className={classes.padding10}>
          <Grid container>
            <Grid item xs={12}>
              <Typography variant="h6" className={classes.title}>
                Search by Range
              </Typography>
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
              <Button
                variant="contained"
                color="primary"
                onClick={getRangeReportData}
              >
                Search
              </Button>
            </Grid>
          </Grid>
        </Card>
      </Grid>
      <Grid item xs={12} md={6}>
        <Card className={classes.padding10}>
          <Grid container>
            <Grid item xs={12}>
              <Typography variant="h6" className={classes.title}>
                Search by Last N Blocks
              </Typography>
              <TextField
                className={classes.textField}
                label="Blocks ago"
                variant="outlined"
                margin="dense"
                value={lastNBlocks}
                onChange={updateLastNBlocks}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                onClick={getLastNBlocks}
              >
                Search
              </Button>
            </Grid>
          </Grid>
        </Card>
      </Grid>
    </Grid>
  );
}
