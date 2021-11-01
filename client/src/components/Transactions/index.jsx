import React, { Fragment, useState } from "react";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import SummaryCard from "../SummaryCard";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import AddressFilter from "./AddressFilter";

function TransactionList({ txs, contractDictionary, heading }) {
  const defaultPageSize = 25;
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [filterAddresses, setFilterAddresses] = useState({});

  function loadMore() {
    setPageSize(pageSize + defaultPageSize);
  }

  let data = Object.keys(txs);

  if (data.length === 0) return null;

  let filter = [];

  for (const [key, data] of Object.entries(filterAddresses)) {
    if (data.tracked) {
      filter.push(data.address);
    }
  }

  if (filter.length > 0) {
    data = data.filter((address) => {
      return filter.indexOf(address) >= 0;
    });
  }

  return (
    <Fragment>
      <Card variant="outlined">
        <Typography variant="h4">{heading}</Typography>

        <AddressFilter
          heading={heading}
          filterAddresses={filterAddresses}
          setFilterAddresses={setFilterAddresses}
        />

        {data.slice(0, pageSize).map((key, index) => {
          return (
            <SummaryCard
              key={key}
              label={key}
              heading={txs[key]}
              isContract={contractDictionary.indexOf(key)}
              style={{
                backgroundColor: index % 2 === 0 ? "#ffffff" : "#dfdfdf",
              }}
            />
          );
        })}
        {pageSize < data.length && (
          <Button variant="contained" onClick={loadMore}>
            Load More
          </Button>
        )}
      </Card>
    </Fragment>
  );
}

export default function Transactions({ senders, receivers, contracts }) {
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
