import React, { Fragment, useState } from "react";
import Grid from "@material-ui/core/Grid";
import Card from "../Card";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";

function TransactionList({ txs, contractDictionary, heading }) {
  const defaultPageSize = 25;
  const [pageSize, setPageSize] = useState(defaultPageSize);

  function loadMore() {
    setPageSize(pageSize + defaultPageSize);
  }

  const data = Object.keys(txs);

  return (
    <Fragment>
      {data.length > 0 && <Typography variant="h4">{heading}</Typography>}
      {data.slice(0, pageSize).map((key) => {
        return (
          <Card
            key={key}
            label={key}
            heading={txs[key]}
            isContract={contractDictionary.indexOf(key)}
          />
        );
      })}
      {pageSize < data.length && (
        <Button variant="contained" onClick={loadMore}>
          Load More
        </Button>
      )}
    </Fragment>
  );
}

export default function Transaction({ senders, receivers, contracts }) {
  return (
    <Grid container spacing={4}>
      <Grid item xs={12} md={6}>
        <TransactionList
          heading={"Senders"}
          txs={senders}
          contractDictionary={contracts}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TransactionList
          heading={"Receivers"}
          txs={receivers}
          contractDictionary={contracts}
        />
      </Grid>
    </Grid>
  );
}
