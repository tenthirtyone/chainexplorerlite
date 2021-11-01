import React from "react";
import SummaryCard from "../SummaryCard";
import Grid from "@material-ui/core/Grid";

function capitalizeCamelCase(str) {
  return str.replace(/([A-Z])/g, " $1").replace(/^./, function (str) {
    return str.toUpperCase();
  });
}

export default function Summary({ summary }) {
  return summary ? (
    <Grid container spacing={4}>
      {Object.keys(summary).map((cardItem) => {
        return (
          <Grid item xs={12} md={4} key={cardItem}>
            <SummaryCard
              label={capitalizeCamelCase(cardItem)}
              heading={summary[cardItem]}
            />
          </Grid>
        );
      })}
    </Grid>
  ) : null;
}
