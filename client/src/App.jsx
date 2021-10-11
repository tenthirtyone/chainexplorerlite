import "./App.css";
import { Fragment, useState } from "react";

import AppBar from "./components/AppBar";
import Summary from "./components/Summary";
import Search from "./components/Search";
import Transactions from "./components/Transactions";
import Container from "@material-ui/core/Container";

function App() {
  const [appData, setAppData] = useState({
    summary: {},
    senders: {},
    receivers: {},
    contracts: {},
  });

  const [isSearching, setIsSearching] = useState(false);

  const { summary, senders, receivers, contracts } = appData;

  return (
    <div className="App">
      <Container maxWidth="lg">
        <AppBar />
        <Search setAppData={setAppData} setIsSearching={setIsSearching} />
        {isSearching ? (
          <div>Searching</div>
        ) : (
          <Fragment>
            <Summary summary={summary} />
            <Transactions
              senders={senders}
              receivers={receivers}
              contracts={contracts}
            />
          </Fragment>
        )}
      </Container>
    </div>
  );
}

export default App;
