import React from "react";
import CircularProgress from "@material-ui/core/CircularProgress";
export default function SummaryCard() {
  return (
    <div>
      <div>Generating Report</div>
      <CircularProgress />
    </div>
  );
}
